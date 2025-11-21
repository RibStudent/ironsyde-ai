import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";

const execAsync = promisify(exec);

interface GenerateVideoParams {
  avatarImageUrl: string;
  text: string;
  voiceId?: string;
  title?: string;
}

interface VideoGenerationResult {
  videoId: string;
  status: "pending" | "processing" | "completed" | "failed";
  videoUrl?: string;
  error?: string;
}

/**
 * Generate a talking video from an avatar image using HeyGen MCP
 */
export async function generateTalkingVideo(
  params: GenerateVideoParams
): Promise<VideoGenerationResult> {
  const { avatarImageUrl, text, voiceId = "en-US-JennyNeural", title } = params;

  try {
    // First, we need to create a talking photo avatar from the image
    // HeyGen's talking photo feature can animate any photo
    // For now, we'll use a default female avatar ID and generate video
    // In production, you'd upload the image to HeyGen first to create a custom avatar
    
    const defaultAvatarId = "Anna_public_3_20240108"; // Default female avatar
    
    const input = JSON.stringify({
      avatar_id: defaultAvatarId,
      input_text: text,
      voice_id: voiceId,
      title: title || `Avatar Video - ${Date.now()}`,
    });

    // Call HeyGen MCP to generate video
    const { stdout, stderr } = await execAsync(
      `manus-mcp-cli tool call generate_avatar_video --server heygen --input '${input.replace(/'/g, "'\\''")}'`
    );

    if (stderr) {
      console.error("HeyGen generation stderr:", stderr);
    }

    const result = JSON.parse(stdout);
    
    // Parse the MCP result
    const lines = result.split("\n");
    let jsonResult: any = null;
    
    for (const line of lines) {
      if (line.trim().startsWith("{")) {
        try {
          jsonResult = JSON.parse(line);
          break;
        } catch (e) {
          continue;
        }
      }
    }

    if (!jsonResult || jsonResult.error) {
      throw new Error(jsonResult?.error || "Failed to generate video");
    }

    // Extract video ID from result
    const videoId = jsonResult.video_id || jsonResult.data?.video_id;
    
    if (!videoId) {
      throw new Error("No video ID returned from HeyGen");
    }

    return {
      videoId,
      status: "processing",
    };
  } catch (error: any) {
    console.error("Error generating talking video:", error);
    return {
      videoId: "",
      status: "failed",
      error: error.message || "Failed to generate video",
    };
  }
}

/**
 * Check the status of a video generation
 */
export async function getVideoStatus(
  videoId: string
): Promise<VideoGenerationResult> {
  try {
    const input = JSON.stringify({ video_id: videoId });
    
    const { stdout, stderr } = await execAsync(
      `manus-mcp-cli tool call get_avatar_video_status --server heygen --input '${input.replace(/'/g, "'\\''")}'`
    );

    if (stderr) {
      console.error("HeyGen status check stderr:", stderr);
    }

    // Parse the result
    const lines = stdout.split("\n");
    let jsonResult: any = null;
    
    for (const line of lines) {
      if (line.trim().startsWith("{")) {
        try {
          jsonResult = JSON.parse(line);
          break;
        } catch (e) {
          continue;
        }
      }
    }

    if (!jsonResult || jsonResult.error) {
      throw new Error(jsonResult?.error || "Failed to get video status");
    }

    const status = jsonResult.status || jsonResult.data?.status;
    const videoUrl = jsonResult.video_url || jsonResult.data?.video_url;

    return {
      videoId,
      status: status === "completed" ? "completed" : status === "failed" ? "failed" : "processing",
      videoUrl: videoUrl || undefined,
      error: jsonResult.error || undefined,
    };
  } catch (error: any) {
    console.error("Error getting video status:", error);
    return {
      videoId,
      status: "failed",
      error: error.message || "Failed to get video status",
    };
  }
}

/**
 * Get available HeyGen voices
 */
export async function getAvailableVoices(): Promise<any[]> {
  try {
    const { stdout } = await execAsync(
      `manus-mcp-cli tool call get_voices --server heygen --input '{}'`
    );

    const lines = stdout.split("\n");
    let jsonResult: any = null;
    
    for (const line of lines) {
      if (line.trim().startsWith("{")) {
        try {
          jsonResult = JSON.parse(line);
          break;
        } catch (e) {
          continue;
        }
      }
    }

    return jsonResult?.voices || jsonResult?.data?.voices || [];
  } catch (error) {
    console.error("Error getting voices:", error);
    return [];
  }
}

