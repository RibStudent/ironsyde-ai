import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { nanoid } from "nanoid";
import { generateAvatar } from "./replicate";
import { storagePut } from "./storage";
import * as avatarDb from "./avatarDb";
import * as chatDb from "./chatDb";
import * as personalityDb from "./personalityDb";
import { generateChatResponse, generateNSFWPhotoPrompt } from "./aiChat";
import { canAccessFeature } from "../shared/subscriptionTiers";
import { generateAvatarVoice, listHumeVoices, getVoiceProfile } from "./humeVoice";
import fs from "fs/promises";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  avatars: router({
    // Get user's avatars
    list: protectedProcedure.query(async ({ ctx }) => {
      return await avatarDb.getUserAvatars(ctx.user.id);
    }),

    // Get user credits
    credits: protectedProcedure.query(async ({ ctx }) => {
      return await avatarDb.getUserCredits(ctx.user.id);
    }),

    // Generate a new avatar
    generate: protectedProcedure
      .input(
        z.object({
          prompt: z.string().min(1),
          negativePrompt: z.string().optional(),
          width: z.number().min(512).max(2048).optional(),
          height: z.number().min(512).max(2048).optional(),
          model: z.enum(["flux-pro", "flux-dev", "sdxl", "seedream-4"]).optional(),
          seed: z.number().optional(),
          referenceImageUrl: z.string().url().optional(), // For image-to-image
          strength: z.number().min(0).max(1).optional(), // Transformation strength
        })
      )
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user.id;
        const historyId = nanoid();
        const startTime = Date.now();

        // Check credits
        const credits = await avatarDb.getUserCredits(userId);
        if (credits < 1) {
          throw new Error("Insufficient credits");
        }

        // Create history record
        await avatarDb.createGenerationHistory({
          id: historyId,
          userId,
          prompt: input.prompt,
          model: input.model || "seedream-4",
          status: "processing",
          creditsUsed: 1,
        });

        try {
          // Generate avatar using Replicate
          const result = await generateAvatar({
            prompt: input.prompt,
            negativePrompt: input.negativePrompt,
            width: input.width,
            height: input.height,
            model: input.model,
            seed: input.seed,
            imageUrl: input.referenceImageUrl,
            strength: input.strength,
          });

          // Download and upload to S3
          const imageResponse = await fetch(result.imageUrl);
          const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
          const imageKey = `avatars/${userId}/${nanoid()}.png`;
          const { url: imageUrl } = await storagePut(imageKey, imageBuffer, "image/png");

          // Create avatar record
          const avatarId = nanoid();
          await avatarDb.createAvatar({
            id: avatarId,
            userId,
            prompt: input.prompt,
            negativePrompt: input.negativePrompt || null,
            imageUrl,
            model: result.model,
            isNsfw: true,
            width: input.width || 1024,
            height: input.height || 1024,
            seed: result.seed || null,
          });

          // Update history
          const processingTime = Math.floor((Date.now() - startTime) / 1000);
          await avatarDb.updateGenerationHistory(historyId, {
            status: "completed",
            avatarId,
            completedAt: new Date(),
            processingTime,
          });

          // Deduct credits
          await avatarDb.deductCredits(userId, 1);

          return {
            success: true,
            avatar: await avatarDb.getAvatarById(avatarId),
          };
        } catch (error) {
          // Update history with error
          await avatarDb.updateGenerationHistory(historyId, {
            status: "failed",
            errorMessage: error instanceof Error ? error.message : "Unknown error",
            completedAt: new Date(),
          });
          throw error;
        }
      }),

    // Delete an avatar
    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        await avatarDb.deleteAvatar(input.id, ctx.user.id);
        return { success: true };
      }),

    // Get generation history
    history: protectedProcedure.query(async ({ ctx }) => {
      return await avatarDb.getUserGenerationHistory(ctx.user.id);
    }),
  }),

  chat: router({
    // Create a new conversation
    createConversation: protectedProcedure
      .input(
        z.object({
          avatarId: z.string(),
          personality: z.object({
            name: z.string().optional(),
            traits: z.array(z.string()),
            background: z.string().optional(),
            style: z.string().optional(),
          }).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const conversationId = nanoid();
        const avatar = await avatarDb.getAvatarById(input.avatarId);
        
        if (!avatar || avatar.userId !== ctx.user.id) {
          throw new Error("Avatar not found");
        }

        await chatDb.createConversation({
          id: conversationId,
          userId: ctx.user.id,
          avatarId: input.avatarId,
          title: `Chat with ${input.personality?.name || "Avatar"}`,
          avatarPersonality: input.personality ? JSON.stringify(input.personality) : null,
        });

        return { conversationId };
      }),

    // Get user's conversations
    listConversations: protectedProcedure.query(async ({ ctx }) => {
      return await chatDb.getUserConversations(ctx.user.id);
    }),

    // Get conversation messages
    getMessages: protectedProcedure
      .input(z.object({ conversationId: z.string() }))
      .query(async ({ ctx, input }) => {
        const conversation = await chatDb.getConversationById(input.conversationId);
        if (!conversation || conversation.userId !== ctx.user.id) {
          throw new Error("Conversation not found");
        }
        return await chatDb.getConversationMessages(input.conversationId);
      }),

    // Send a message
    sendMessage: protectedProcedure
      .input(
        z.object({
          conversationId: z.string(),
          content: z.string().min(1),
          requestPhoto: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const conversation = await chatDb.getConversationById(input.conversationId);
        if (!conversation || conversation.userId !== ctx.user.id) {
          throw new Error("Conversation not found");
        }

        // Create user message
        const userMessageId = nanoid();
        await chatDb.createMessage({
          id: userMessageId,
          conversationId: input.conversationId,
          role: "user",
          content: input.content,
        });

        // Handle NSFW photo request
        if (input.requestPhoto) {
          const canRequestPhotos = canAccessFeature(ctx.user.tier, "nsfwPhotoRequests");
          if (!canRequestPhotos) {
            throw new Error("Upgrade to Standard or Premium to request photos");
          }

          // Check credits
          const credits = await avatarDb.getUserCredits(ctx.user.id);
          if (credits < 1) {
            throw new Error("Insufficient credits");
          }

          // Get conversation history
          const messages = await chatDb.getConversationMessages(input.conversationId, 10);
          const chatHistory = messages.reverse().map((m) => ({
            role: m.role,
            content: m.content,
          }));

          // Generate photo prompt
          const photoPrompt = await generateNSFWPhotoPrompt(chatHistory, input.content);

          // Generate image
          const result = await generateAvatar({
            prompt: photoPrompt,
            model: "seedream-4",
            width: 1024,
            height: 1536,
          });

          // Download and upload to S3
          const imageResponse = await fetch(result.imageUrl);
          const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
          const imageKey = `chat/${ctx.user.id}/${nanoid()}.png`;
          const { url: imageUrl } = await storagePut(imageKey, imageBuffer, "image/png");

          // Deduct credits
          await avatarDb.deductCredits(ctx.user.id, 1);

          // Create assistant message with photo
          const assistantMessageId = nanoid();
          await chatDb.createMessage({
            id: assistantMessageId,
            conversationId: input.conversationId,
            role: "assistant",
            content: "Here's a photo for you 😘",
            imageUrl,
          });

          return {
            success: true,
            messageId: assistantMessageId,
            imageUrl,
          };
        }

        // Generate AI text response
        const messages = await chatDb.getConversationMessages(input.conversationId, 20);
        const chatHistory = messages.reverse().map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const personality = conversation.avatarPersonality
          ? JSON.parse(conversation.avatarPersonality)
          : undefined;

        const aiResponse = await generateChatResponse(chatHistory, personality);

        // Create assistant message
        const assistantMessageId = nanoid();
        await chatDb.createMessage({
          id: assistantMessageId,
          conversationId: input.conversationId,
          role: "assistant",
          content: aiResponse,
        });

        return {
          success: true,
          messageId: assistantMessageId,
          content: aiResponse,
        };
      }),

    // Delete conversation
    deleteConversation: protectedProcedure
      .input(z.object({ conversationId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        await chatDb.deleteConversation(input.conversationId, ctx.user.id);
        return { success: true };
      }),
  }),

  voice: router({
    // Generate voice for avatar message
    generateVoice: protectedProcedure
      .input(
        z.object({
          text: z.string().min(1),
          personality: z.enum(["seductive", "playful", "professional", "sweet", "dominant"]).optional(),
          continuationOf: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Check if user has premium tier for voice chat
        const canUseVoice = canAccessFeature(ctx.user.tier, "voiceChat");
        if (!canUseVoice) {
          throw new Error("Upgrade to Premium to use voice chat");
        }

        const voiceProfile = getVoiceProfile(input.personality || "seductive");

        const result = await generateAvatarVoice(
          input.text,
          voiceProfile,
          input.continuationOf
        );

        // Upload audio to S3
        const audioBuffer = await fs.readFile(result.audioPath);
        const audioKey = `voice/${ctx.user.id}/${nanoid()}.wav`;
        const { url: audioUrl } = await storagePut(audioKey, audioBuffer, "audio/wav");

        return {
          generationId: result.generationId,
          audioUrl,
        };
      }),

    // List available voices
    listVoices: protectedProcedure.query(async () => {
      return await listHumeVoices();
    }),

    // Get voice profiles
    getProfiles: protectedProcedure.query(() => {
      return [
        { id: "seductive", name: "Seductive", description: "Sultry and alluring" },
        { id: "playful", name: "Playful", description: "Fun and flirty" },
        { id: "professional", name: "Professional", description: "Confident and polished" },
        { id: "sweet", name: "Sweet", description: "Gentle and caring" },
        { id: "dominant", name: "Dominant", description: "Commanding and assertive" },
      ];
    }),
  }),

  personality: router({
    // Create personality profile
    create: protectedProcedure
      .input(
        z.object({
          avatarId: z.string().optional(),
          name: z.string().min(1).max(255),
          description: z.string().optional(),
          traits: z.array(z.string()),
          backstory: z.string().optional(),
          occupation: z.string().optional(),
          age: z.number().optional(),
          location: z.string().optional(),
          interests: z.array(z.string()).optional(),
          conversationStyle: z.string(),
          responseLength: z.enum(["short", "medium", "long"]).optional(),
          emojiUsage: z.enum(["none", "minimal", "moderate", "frequent"]).optional(),
          languageStyle: z.string().optional(),
          voicePersonality: z.enum(["seductive", "playful", "professional", "sweet", "dominant"]).optional(),
          voiceName: z.string().optional(),
          flirtLevel: z.number().min(1).max(10).optional(),
          nsfwWillingness: z.number().min(1).max(10).optional(),
          responseSpeed: z.enum(["instant", "realistic", "slow"]).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const profileId = nanoid();
        const profile = await personalityDb.createPersonalityProfile({
          id: profileId,
          userId: ctx.user.id,
          ...input,
        });
        return profile;
      }),

    // Get user's personality profiles
    list: protectedProcedure.query(async ({ ctx }) => {
      return await personalityDb.getUserPersonalityProfiles(ctx.user.id);
    }),

    // Get personality profile by ID
    get: protectedProcedure
      .input(z.object({ profileId: z.string() }))
      .query(async ({ ctx, input }) => {
        const profile = await personalityDb.getPersonalityProfileById(input.profileId);
        if (!profile || profile.userId !== ctx.user.id) {
          throw new Error("Profile not found");
        }
        return profile;
      }),

    // Get profiles for specific avatar
    getByAvatar: protectedProcedure
      .input(z.object({ avatarId: z.string() }))
      .query(async ({ ctx, input }) => {
        return await personalityDb.getAvatarPersonalityProfiles(input.avatarId, ctx.user.id);
      }),

    // Update personality profile
    update: protectedProcedure
      .input(
        z.object({
          profileId: z.string(),
          data: z.object({
            name: z.string().min(1).max(255).optional(),
            description: z.string().optional(),
            traits: z.array(z.string()).optional(),
            backstory: z.string().optional(),
            occupation: z.string().optional(),
            age: z.number().optional(),
            location: z.string().optional(),
            interests: z.array(z.string()).optional(),
            conversationStyle: z.string().optional(),
            responseLength: z.enum(["short", "medium", "long"]).optional(),
            emojiUsage: z.enum(["none", "minimal", "moderate", "frequent"]).optional(),
            languageStyle: z.string().optional(),
            voicePersonality: z.enum(["seductive", "playful", "professional", "sweet", "dominant"]).optional(),
            voiceName: z.string().optional(),
            flirtLevel: z.number().min(1).max(10).optional(),
            nsfwWillingness: z.number().min(1).max(10).optional(),
            responseSpeed: z.enum(["instant", "realistic", "slow"]).optional(),
          }),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await personalityDb.updatePersonalityProfile(
          input.profileId,
          ctx.user.id,
          input.data
        );
      }),

    // Delete personality profile
    delete: protectedProcedure
      .input(z.object({ profileId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const success = await personalityDb.deletePersonalityProfile(input.profileId, ctx.user.id);
        return { success };
      }),

    // Get public templates
    templates: protectedProcedure.query(async () => {
      return await personalityDb.getPublicPersonalityTemplates();
    }),

    // Clone a template
    cloneTemplate: protectedProcedure
      .input(
        z.object({
          templateId: z.string(),
          avatarId: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await personalityDb.clonePersonalityProfile(
          input.templateId,
          ctx.user.id,
          input.avatarId
        );
      }),
  }),
});

export type AppRouter = typeof appRouter;
