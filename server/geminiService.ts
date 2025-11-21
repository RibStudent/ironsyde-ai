/**
 * Google Gemini AI Service
 * Handles complex AI tasks like personality-based conversations,
 * backstory generation, and intelligent content creation
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { PersonalityProfile } from "../drizzle/schema";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

/**
 * Generate personality-based chat response
 */
export async function generatePersonalityResponse(
  message: string,
  personality: PersonalityProfile,
  conversationHistory: Array<{ role: string; content: string }> = []
): Promise<string> {
  const systemPrompt = buildPersonalityPrompt(personality);
  
  const history = conversationHistory
    .map((msg) => `${msg.role === "user" ? "Fan" : "You"}: ${msg.content}`)
    .join("\n");

  const prompt = `${systemPrompt}

Conversation History:
${history}

Fan: ${message}

You:`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text();
}

/**
 * Generate backstory for a personality
 */
export async function generateBackstory(params: {
  name: string;
  traits: string[];
  occupation?: string;
  age?: number;
  interests?: string[];
}): Promise<string> {
  const prompt = `Create a compelling, detailed backstory for an adult content creator with these characteristics:

Name: ${params.name}
Personality Traits: ${params.traits.join(", ")}
${params.occupation ? `Occupation: ${params.occupation}` : ""}
${params.age ? `Age: ${params.age}` : ""}
${params.interests ? `Interests: ${params.interests.join(", ")}` : ""}

Write a 2-3 paragraph backstory that:
- Explains how they got into adult content creation
- Highlights their personality traits naturally
- Makes them feel like a real, relatable person
- Is engaging and memorable
- Appropriate for adult content context

Backstory:`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

/**
 * Enhance image generation prompt based on personality
 */
export async function enhanceImagePrompt(
  basePrompt: string,
  personality: PersonalityProfile
): Promise<string> {
  const prompt = `You are an expert at creating detailed, high-quality prompts for AI image generation.

Base prompt: "${basePrompt}"

Personality context:
- Traits: ${personality.traits.join(", ")}
- Style: ${personality.conversationStyle}
${personality.backstory ? `- Background: ${personality.backstory.substring(0, 200)}...` : ""}

Enhance this prompt to:
1. Include specific visual details that match the personality
2. Add professional photography terms
3. Specify lighting, pose, and mood
4. Keep it under 200 words
5. Make it suitable for photorealistic generation

Enhanced prompt:`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

/**
 * Generate OnlyFans message suggestion
 */
export async function generateOnlyFansResponse(
  fanMessage: string,
  personality: PersonalityProfile,
  context?: {
    fanName?: string;
    previousMessages?: Array<{ role: string; content: string }>;
    requestType?: "general" | "photo_request" | "custom_content";
  }
): Promise<{ message: string; suggestedAction?: string }> {
  const systemPrompt = buildPersonalityPrompt(personality);
  
  const contextInfo = context?.previousMessages
    ? `\n\nPrevious conversation:\n${context.previousMessages.map((m) => `${m.role}: ${m.content}`).join("\n")}`
    : "";

  const prompt = `${systemPrompt}

You are responding to a fan on OnlyFans. ${context?.fanName ? `Their name is ${context.fanName}.` : ""}
${contextInfo}

Fan's message: "${fanMessage}"

Generate a response that:
1. Matches your personality perfectly
2. Is engaging and keeps the conversation going
3. ${personality.nsfwWillingness && personality.nsfwWillingness > 5 ? "Can be flirty and suggestive" : "Is friendly but professional"}
4. ${context?.requestType === "photo_request" ? "Acknowledges their photo request and offers to create custom content" : ""}
5. Is ${personality.responseLength === "short" ? "brief (1-2 sentences)" : personality.responseLength === "long" ? "detailed (3-4 sentences)" : "moderate (2-3 sentences)"}
6. Uses emojis ${personality.emojiUsage === "none" ? "not at all" : personality.emojiUsage === "minimal" ? "sparingly" : personality.emojiUsage === "frequent" ? "frequently" : "moderately"}

Response:`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();

  // Detect if action is needed
  let suggestedAction: string | undefined;
  if (fanMessage.toLowerCase().includes("photo") || fanMessage.toLowerCase().includes("pic")) {
    suggestedAction = "generate_photo";
  } else if (fanMessage.toLowerCase().includes("video") || fanMessage.toLowerCase().includes("call")) {
    suggestedAction = "voice_call";
  }

  return {
    message: responseText,
    suggestedAction,
  };
}

/**
 * Analyze personality traits from description
 */
export async function analyzePersonalityTraits(description: string): Promise<string[]> {
  const prompt = `Analyze this personality description and extract 5-8 key personality traits:

"${description}"

Return only a comma-separated list of traits (e.g., "confident, playful, intelligent, seductive, caring")

Traits:`;

  const result = await model.generateContent(prompt);
  const traits = result.response
    .text()
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  return traits;
}

/**
 * Generate personality name suggestions
 */
export async function generatePersonalityNames(traits: string[], count: number = 5): Promise<string[]> {
  const prompt = `Generate ${count} creative, memorable names for an adult content creator persona with these traits: ${traits.join(", ")}

Names should be:
- Alluring and memorable
- Not too explicit
- Easy to pronounce
- Unique

Return only the names, one per line.

Names:`;

  const result = await model.generateContent(prompt);
  const names = result.response
    .text()
    .split("\n")
    .map((n) => n.trim())
    .filter((n) => n.length > 0 && n.length < 50);

  return names.slice(0, count);
}

/**
 * Build personality system prompt
 */
function buildPersonalityPrompt(personality: PersonalityProfile): string {
  return `You are ${personality.name}${personality.age ? `, a ${personality.age}-year-old` : ""} ${
    personality.occupation || "content creator"
  }.

Personality Traits: ${personality.traits.join(", ")}

${personality.backstory ? `Background: ${personality.backstory}\n` : ""}
${personality.location ? `Location: ${personality.location}\n` : ""}
${personality.interests ? `Interests: ${personality.interests.join(", ")}\n` : ""}

Conversation Style: ${personality.conversationStyle}
Language Style: ${personality.languageStyle || "casual and friendly"}
Flirt Level: ${personality.flirtLevel || 5}/10
NSFW Willingness: ${personality.nsfwWillingness || 5}/10

You are chatting with fans who subscribe to your adult content. Stay in character at all times.`;
}

