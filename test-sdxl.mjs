import Replicate from "replicate";
import { writeFileSync } from "fs";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

console.log("🎨 Testing SDXL for More Realistic Avatars...\n");

const prompt = "professional photo of a beautiful woman with blonde hair, photorealistic, natural skin texture, soft studio lighting, elegant pose, high detail, 8k uhd, dslr, film grain, Fujifilm XT3";
const negativePrompt = "cartoon, anime, illustration, painting, drawing, art, sketch, rendered, cgi, 3d, airbrushed, plastic skin, deformed, blurry, bad anatomy";

console.log("Prompt:", prompt);
console.log("Negative:", negativePrompt);
console.log("Model: stability-ai/sdxl");
console.log("\n⏳ Generating photorealistic image (30-60 seconds)...\n");

try {
  const output = await replicate.run(
    "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
    {
      input: {
        prompt: prompt,
        negative_prompt: negativePrompt,
        width: 768,
        height: 1024,
        num_outputs: 1,
        guidance_scale: 7.5,
        num_inference_steps: 40,
        scheduler: "DPMSolverMultistep",
      },
    }
  );

  console.log("✅ Generation successful!");
  
  if (Array.isArray(output) && output.length > 0) {
    const fileOutput = output[0];
    
    if (typeof fileOutput === 'string') {
      console.log("\n📸 Generated Image URL:");
      console.log(fileOutput);
    } else if (fileOutput && typeof fileOutput === 'object') {
      console.log("\n📥 Downloading image...");
      
      const response = await fetch(fileOutput);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const filename = '/home/ubuntu/botly-replica/test-sdxl-avatar.jpg';
      writeFileSync(filename, buffer);
      
      console.log("✅ Image saved to:", filename);
      console.log("\n✨ More realistic result with SDXL!");
    }
  }
  
} catch (error) {
  console.error("❌ Generation failed:");
  console.error(error.message);
  process.exit(1);
}

