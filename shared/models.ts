/**
 * AI Model configurations for avatar generation and editing
 */

export type ModelCategory = "generation" | "editing" | "enhancement";

export interface AIModel {
  id: string;
  name: string;
  provider: "replicate";
  modelPath: string;
  category: ModelCategory;
  description: string;
  strengths: string[];
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
  supportsImageInput: boolean;
  estimatedTime: string; // e.g., "30-60s"
  costPerImage: number; // in credits
}

export const AI_MODELS: Record<string, AIModel> = {
  // Primary generation model - most photorealistic
  "seedream-4": {
    id: "seedream-4",
    name: "SeeDream-4",
    provider: "replicate",
    modelPath: "bytedance/seedream-4",
    category: "generation",
    description: "Ultra-photorealistic AI generation with natural skin texture and lighting",
    strengths: ["Photorealism", "Natural lighting", "Skin texture", "Portrait quality"],
    minWidth: 1024,
    minHeight: 1024,
    maxWidth: 2048,
    maxHeight: 2048,
    supportsImageInput: true,
    estimatedTime: "45-90s",
    costPerImage: 100,
  },

  // High quality generation
  "flux-dev": {
    id: "flux-dev",
    name: "Flux Dev",
    provider: "replicate",
    modelPath: "black-forest-labs/flux-dev",
    category: "generation",
    description: "High-quality image generation with excellent prompt following",
    strengths: ["Prompt accuracy", "Detail", "Versatility", "Style range"],
    minWidth: 256,
    minHeight: 256,
    maxWidth: 1440,
    maxHeight: 1440,
    supportsImageInput: true,
    estimatedTime: "30-60s",
    costPerImage: 80,
  },

  // Fast generation
  "flux-schnell": {
    id: "flux-schnell",
    name: "Flux Schnell",
    provider: "replicate",
    modelPath: "black-forest-labs/flux-schnell",
    category: "generation",
    description: "Fast image generation with good quality",
    strengths: ["Speed", "Efficiency", "Good quality", "Low cost"],
    minWidth: 256,
    minHeight: 256,
    maxWidth: 1440,
    maxHeight: 1440,
    supportsImageInput: false,
    estimatedTime: "10-20s",
    costPerImage: 40,
  },

  // Photorealistic generation
  "sdxl": {
    id: "sdxl",
    name: "Stable Diffusion XL",
    provider: "replicate",
    modelPath: "stability-ai/sdxl",
    category: "generation",
    description: "Stable and reliable photorealistic generation",
    strengths: ["Stability", "Photorealism", "Consistency", "Mature model"],
    minWidth: 512,
    minHeight: 512,
    maxWidth: 1024,
    maxHeight: 1024,
    supportsImageInput: true,
    estimatedTime: "20-40s",
    costPerImage: 60,
  },

  // Image editing specialist
  "qwen-image-edit": {
    id: "qwen-image-edit",
    name: "Qwen Image Edit",
    provider: "replicate",
    modelPath: "qwen/qwen-image-edit",
    category: "editing",
    description: "Advanced image editing with natural language - perfect for modifications and enhancements",
    strengths: ["Text editing", "Object manipulation", "Style transfer", "Precise edits"],
    minWidth: 512,
    minHeight: 512,
    maxWidth: 2048,
    maxHeight: 2048,
    supportsImageInput: true,
    estimatedTime: "60-150s",
    costPerImage: 120,
  },
};

export const DEFAULT_MODEL = "seedream-4";

export function getModelById(id: string): AIModel | undefined {
  return AI_MODELS[id];
}

export function getModelsByCategory(category: ModelCategory): AIModel[] {
  return Object.values(AI_MODELS).filter((model) => model.category === category);
}

export function getGenerationModels(): AIModel[] {
  return getModelsByCategory("generation");
}

export function getEditingModels(): AIModel[] {
  return getModelsByCategory("editing");
}

