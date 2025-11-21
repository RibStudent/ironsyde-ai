export interface StylePreset {
  id: string;
  name: string;
  description: string;
  prompt: string;
  negativePrompt: string;
  model: "flux-pro" | "flux-dev" | "sdxl" | "seedream-4";
  category: "realistic" | "artistic" | "professional";
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: "instagram-model",
    name: "Instagram Model",
    description: "Glamorous, influencer-style photos perfect for social media",
    prompt: "professional photoshoot, beautiful instagram model, perfect makeup, trendy outfit, studio lighting, high fashion, glamorous, photorealistic, 8k uhd, dslr, soft lighting, high quality",
    negativePrompt: "low quality, blurry, distorted, deformed, ugly, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, mutated hands, fused fingers, too many fingers",
    model: "seedream-4",
    category: "realistic",
  },
  {
    id: "anime-character",
    name: "Anime Character",
    description: "Stunning anime-style artwork with vibrant colors",
    prompt: "anime style, beautiful anime character, detailed eyes, colorful hair, expressive face, high quality anime art, vibrant colors, detailed shading, masterpiece, best quality",
    negativePrompt: "low quality, blurry, distorted, bad anatomy, poorly drawn, ugly, deformed, mutation, extra limbs, bad proportions, western cartoon style",
    model: "seedream-4",
    category: "artistic",
  },
  {
    id: "professional-headshot",
    name: "Professional Headshot",
    description: "Clean, professional portrait for business use",
    prompt: "professional headshot, business portrait, confident expression, professional attire, clean background, studio lighting, sharp focus, high quality, photorealistic",
    negativePrompt: "low quality, blurry, distorted, casual clothing, messy background, poor lighting, unprofessional, bad anatomy",
    model: "seedream-4",
    category: "professional",
  },
  {
    id: "fantasy-portrait",
    name: "Fantasy Portrait",
    description: "Magical, otherworldly character with fantasy elements",
    prompt: "fantasy portrait, magical character, ethereal beauty, fantasy makeup, mystical atmosphere, detailed costume, dramatic lighting, high quality, photorealistic fantasy art",
    negativePrompt: "low quality, blurry, distorted, modern clothing, realistic setting, bad anatomy, deformed",
    model: "seedream-4",
    category: "artistic",
  },
  {
    id: "fitness-model",
    name: "Fitness Model",
    description: "Athletic, toned physique in fitness/activewear",
    prompt: "fitness model, athletic body, toned physique, gym outfit, activewear, confident pose, professional fitness photography, high quality, photorealistic, 8k",
    negativePrompt: "low quality, blurry, distorted, out of shape, bad anatomy, deformed, poor proportions",
    model: "seedream-4",
    category: "realistic",
  },
  {
    id: "pin-up-style",
    name: "Pin-Up Style",
    description: "Classic vintage pin-up aesthetic",
    prompt: "vintage pin-up style, retro fashion, classic pin-up pose, 1950s aesthetic, vintage makeup, classic beauty, high quality, photorealistic",
    negativePrompt: "low quality, blurry, distorted, modern style, bad anatomy, deformed, poor quality",
    model: "seedream-4",
    category: "artistic",
  },
  {
    id: "editorial-fashion",
    name: "Editorial Fashion",
    description: "High-fashion editorial magazine style",
    prompt: "editorial fashion photography, high fashion model, designer outfit, vogue style, dramatic pose, professional lighting, magazine quality, photorealistic, 8k uhd",
    negativePrompt: "low quality, blurry, distorted, casual clothing, amateur photography, bad anatomy, deformed",
    model: "seedream-4",
    category: "professional",
  },
  {
    id: "boudoir-photography",
    name: "Boudoir Photography",
    description: "Intimate, sensual boudoir-style photos",
    prompt: "boudoir photography, intimate portrait, sensual pose, elegant lingerie, soft lighting, bedroom setting, professional boudoir photo, high quality, photorealistic",
    negativePrompt: "low quality, blurry, distorted, harsh lighting, bad anatomy, deformed, poor quality",
    model: "seedream-4",
    category: "realistic",
  },
  {
    id: "cosplay-character",
    name: "Cosplay Character",
    description: "Detailed cosplay costume and character",
    prompt: "cosplay photography, detailed costume, character cosplay, professional cosplay photo, accurate costume details, convention quality, high quality, photorealistic",
    negativePrompt: "low quality, blurry, distorted, poor costume quality, bad anatomy, deformed",
    model: "seedream-4",
    category: "artistic",
  },
  {
    id: "glamour-portrait",
    name: "Glamour Portrait",
    description: "Sophisticated glamour photography",
    prompt: "glamour photography, sophisticated beauty, elegant pose, professional makeup, luxurious setting, high-end photography, photorealistic, 8k uhd, soft focus",
    negativePrompt: "low quality, blurry, distorted, amateur, poor lighting, bad anatomy, deformed",
    model: "seedream-4",
    category: "realistic",
  },
];

