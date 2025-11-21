import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { nanoid } from "nanoid";
import { generateAvatar } from "./replicate";
import { storagePut } from "./storage";
import * as avatarDb from "./avatarDb";

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
});

export type AppRouter = typeof appRouter;
