/**
 * Hume AI Voice Chat Service
 * Integrates Hume AI TTS for avatar voice conversations
 */

import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";

const execAsync = promisify(exec);

const HUME_API_KEY = process.env.HUME_API_KEY;
const HUME_SECRET_KEY = process.env.HUME_SECRET_KEY;

if (!HUME_API_KEY || !HUME_SECRET_KEY) {
  console.warn("[Hume] API credentials not configured");
}

export interface VoiceGenerationOptions {
  text: string;
  voiceName?: string;
  description?: string;
  speed?: number;
  continuationOf?: string;
  quiet?: boolean;
}

export interface VoiceGenerationResult {
  generationId: string;
  audioPath: string;
  audioUrl?: string;
}

/**
 * Generate speech from text using Hume AI
 */
export async function generateVoice(
  options: VoiceGenerationOptions
): Promise<VoiceGenerationResult> {
  const {
    text,
    voiceName,
    description,
    speed,
    continuationOf,
    quiet = true, // Always quiet in server environment
  } = options;

  // Build MCP CLI command
  const utterances = [
    {
      text,
      ...(description && { description }),
      ...(speed && { speed }),
    },
  ];

  const input = {
    utterances,
    ...(voiceName && { voiceName }),
    ...(continuationOf && { continuationOf }),
    quiet,
  };

  try {
    const { stdout } = await execAsync(
      `manus-mcp-cli tool call tts --server hume --input '${JSON.stringify(input)}'`
    );

    // Parse the output to get generationId and audio path
    const result = JSON.parse(stdout);
    
    if (!result.content || result.content.length === 0) {
      throw new Error("No audio generated");
    }

    const content = result.content[0];
    const generationId = content.generationId || `gen_${Date.now()}`;
    const audioPath = content.audioPath || content.path;

    console.log(`[Hume] Voice generated: ${generationId}`);

    return {
      generationId,
      audioPath,
    };
  } catch (error) {
    console.error("[Hume] Voice generation error:", error);
    throw new Error(`Failed to generate voice: ${error}`);
  }
}

/**
 * Generate avatar voice with personality
 */
export async function generateAvatarVoice(
  text: string,
  avatarPersonality: {
    name: string;
    voiceDescription: string;
    voiceName?: string;
  },
  continuationOf?: string
): Promise<VoiceGenerationResult> {
  return generateVoice({
    text,
    voiceName: avatarPersonality.voiceName,
    description: avatarPersonality.voiceDescription,
    continuationOf,
    quiet: true,
  });
}

/**
 * List available Hume voices
 */
export async function listHumeVoices(): Promise<any[]> {
  try {
    const { stdout } = await execAsync(
      `manus-mcp-cli tool call list_voices --server hume --input '{"provider":"HUME_AI"}'`
    );

    const result = JSON.parse(stdout);
    return result.content?.[0]?.voices || [];
  } catch (error) {
    console.error("[Hume] Error listing voices:", error);
    return [];
  }
}

/**
 * Save a custom voice to library
 */
export async function saveCustomVoice(
  name: string,
  generationId: string
): Promise<boolean> {
  try {
    await execAsync(
      `manus-mcp-cli tool call save_voice --server hume --input '{"name":"${name}","generationId":"${generationId}"}'`
    );

    console.log(`[Hume] Voice saved: ${name}`);
    return true;
  } catch (error) {
    console.error("[Hume] Error saving voice:", error);
    return false;
  }
}

/**
 * Create avatar voice profiles
 */
export const AVATAR_VOICE_PROFILES = {
  seductive: {
    name: "Seductive",
    voiceDescription:
      "A sultry, seductive female voice with a breathy quality, slow pacing, and intimate tone. Warm and alluring.",
  },
  playful: {
    name: "Playful",
    voiceDescription:
      "A playful, flirty female voice with an upbeat tone, slightly higher pitch, and energetic delivery. Fun and engaging.",
  },
  professional: {
    name: "Professional",
    voiceDescription:
      "A confident, professional female voice with clear articulation, moderate pacing, and friendly warmth. Polished and approachable.",
  },
  sweet: {
    name: "Sweet",
    voiceDescription:
      "A sweet, gentle female voice with soft tones, caring warmth, and soothing delivery. Kind and nurturing.",
  },
  dominant: {
    name: "Dominant",
    voiceDescription:
      "A commanding, dominant female voice with firm tone, confident delivery, and authoritative presence. Strong and assertive.",
  },
};

/**
 * Get voice profile by personality type
 */
export function getVoiceProfile(personality: keyof typeof AVATAR_VOICE_PROFILES) {
  return AVATAR_VOICE_PROFILES[personality] || AVATAR_VOICE_PROFILES.seductive;
}

