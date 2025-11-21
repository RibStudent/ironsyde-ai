import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export interface GenerateAvatarOptions {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  numOutputs?: number;
  seed?: number;
  guidanceScale?: number;
  numInferenceSteps?: number;
  model?: "flux-pro" | "flux-dev" | "sdxl";
  imageUrl?: string; // For image-to-image generation
  strength?: number; // How much to transform the input image (0-1)
}

export interface GenerateAvatarResult {
  imageUrl: string;
  seed?: number;
  model: string;
}

/**
 * Generate an NSFW-capable avatar using Replicate's Flux or SDXL models
 */
export async function generateAvatar(
  options: GenerateAvatarOptions
): Promise<GenerateAvatarResult> {
  const {
    prompt,
    negativePrompt = "low quality, blurry, distorted, deformed",
    width = 1024,
    height = 1024,
    numOutputs = 1,
    seed,
    guidanceScale = 7.5,
    numInferenceSteps = 30,
    model = "flux-dev",
    imageUrl,
    strength = 0.8,
  } = options;

  try {
    let output;
    let modelVersion: string;

    if (model === "flux-pro") {
      // Flux Pro - highest quality, best for NSFW
      modelVersion = "black-forest-labs/flux-pro";
      output = await replicate.run(modelVersion, {
        input: {
          prompt,
          width,
          height,
          num_outputs: numOutputs,
          guidance_scale: guidanceScale,
          num_inference_steps: numInferenceSteps,
          ...(seed && { seed }),
          ...(imageUrl && { image: imageUrl, prompt_strength: strength }),
        },
      });
    } else if (model === "flux-dev") {
      // Flux Dev - good balance of quality and speed
      modelVersion = "black-forest-labs/flux-dev";
      output = await replicate.run(modelVersion, {
        input: {
          prompt,
          width,
          height,
          num_outputs: numOutputs,
          guidance_scale: guidanceScale,
          num_inference_steps: numInferenceSteps,
          ...(seed && { seed }),
          ...(imageUrl && { image: imageUrl, prompt_strength: strength }),
        },
      });
    } else {
      // SDXL - fallback, also NSFW-capable
      if (imageUrl) {
        // Use SDXL img2img for image-to-image
        modelVersion = "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b";
        output = await replicate.run(modelVersion, {
          input: {
            image: imageUrl,
            prompt,
            negative_prompt: negativePrompt,
            num_outputs: numOutputs,
            guidance_scale: guidanceScale,
            num_inference_steps: numInferenceSteps,
            prompt_strength: strength,
            ...(seed && { seed }),
          },
        });
      } else {
        // Text-to-image
        modelVersion = "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b";
        output = await replicate.run(modelVersion, {
          input: {
            prompt,
            negative_prompt: negativePrompt,
            width,
            height,
            num_outputs: numOutputs,
            guidance_scale: guidanceScale,
            num_inference_steps: numInferenceSteps,
            ...(seed && { seed }),
          },
        });
      }
    }

    // Replicate returns an array of URLs
    const imageUrl = Array.isArray(output) ? output[0] : output;

    if (typeof imageUrl !== "string") {
      throw new Error("Unexpected output format from Replicate");
    }

    return {
      imageUrl,
      seed,
      model: modelVersion,
    };
  } catch (error) {
    console.error("[Replicate] Avatar generation failed:", error);
    throw new Error(
      `Avatar generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Test the Replicate API connection
 */
export async function testReplicateConnection(): Promise<boolean> {
  try {
    // Simple test - list models or run a minimal prediction
    await replicate.models.list();
    return true;
  } catch (error) {
    console.error("[Replicate] Connection test failed:", error);
    return false;
  }
}

