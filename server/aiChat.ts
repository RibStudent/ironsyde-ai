/**
 * AI Chat Service using Manus Forge API
 * Handles avatar personality-based conversations
 */

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface AvatarPersonality {
  name?: string;
  traits: string[];
  background?: string;
  style?: string;
}

/**
 * Generate AI response using Manus Forge API
 */
export async function generateChatResponse(
  messages: ChatMessage[],
  personality?: AvatarPersonality
): Promise<string> {
  const forgeApiUrl = process.env.BUILT_IN_FORGE_API_URL;
  const forgeApiKey = process.env.BUILT_IN_FORGE_API_KEY;

  if (!forgeApiUrl || !forgeApiKey) {
    throw new Error("Manus Forge API not configured");
  }

  // Build system prompt with personality
  const systemPrompt = buildSystemPrompt(personality);

  // Prepare messages with system prompt
  const fullMessages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...messages,
  ];

  try {
    const response = await fetch(`${forgeApiUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${forgeApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: fullMessages,
        temperature: 0.8,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`Forge API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("[AI Chat] Error generating response:", error);
    throw new Error("Failed to generate AI response");
  }
}

/**
 * Build system prompt based on avatar personality
 */
function buildSystemPrompt(personality?: AvatarPersonality): string {
  if (!personality) {
    return `You are a friendly and engaging AI companion. You're conversational, flirty, and enjoy chatting with users. Keep responses concise and natural.`;
  }

  const { name, traits, background, style } = personality;

  let prompt = `You are ${name || "an AI companion"}.`;

  if (traits && traits.length > 0) {
    prompt += ` Your personality traits include: ${traits.join(", ")}.`;
  }

  if (background) {
    prompt += ` Background: ${background}`;
  }

  if (style) {
    prompt += ` Communication style: ${style}`;
  }

  prompt += `\n\nYou are engaging in a private conversation. Be friendly, flirty, and conversational. Keep responses concise (2-3 sentences). You can discuss adult topics naturally when appropriate. Stay in character.`;

  return prompt;
}

/**
 * Generate NSFW photo prompt based on conversation context
 */
export async function generateNSFWPhotoPrompt(
  conversationHistory: ChatMessage[],
  userRequest: string
): Promise<string> {
  const forgeApiUrl = process.env.BUILT_IN_FORGE_API_URL;
  const forgeApiKey = process.env.BUILT_IN_FORGE_API_KEY;

  if (!forgeApiUrl || !forgeApiKey) {
    throw new Error("Manus Forge API not configured");
  }

  const systemPrompt = `You are a prompt engineer for AI image generation. Based on the user's request and conversation context, generate a detailed, high-quality prompt for creating an NSFW photo. The prompt should be descriptive, specific, and suitable for SeeDream-4 model. Focus on: pose, clothing/lingerie, lighting, setting, mood, and photographic style. Keep it under 100 words.`;

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: `Recent conversation:\n${conversationHistory
        .slice(-3)
        .map((m) => `${m.role}: ${m.content}`)
        .join("\n")}\n\nUser request: ${userRequest}\n\nGenerate an image prompt:`,
    },
  ];

  try {
    const response = await fetch(`${forgeApiUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${forgeApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      throw new Error(`Forge API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || userRequest;
  } catch (error) {
    console.error("[AI Chat] Error generating photo prompt:", error);
    // Fallback to user request
    return userRequest;
  }
}

