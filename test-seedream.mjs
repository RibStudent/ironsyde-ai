import Replicate from "replicate";
import { writeFileSync } from "fs";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

console.log("🎨 Testing SeeDream-4 for Photorealistic Avatars...\n");

const prompt = "professional photo of a beautiful woman with blonde hair, photorealistic, natural skin texture, soft studio lighting, elegant pose, high detail, 8k uhd, dslr";

console.log("Prompt:", prompt);
console.log("Model: lucataco/seedream-4");
console.log("\n⏳ Generating photorealistic image (30-60 seconds)...\n");

try {
  const output = await replicate.run(
    "bytedance/seedream-4",
    {
      input: {
        prompt: prompt,
        width: 1024,
        height: 1536,
        num_outputs: 1,
        guidance_scale: 7.5,
        num_inference_steps: 30,
      },
    }
  );

  console.log("✅ Generation successful!");
  console.log("Output type:", typeof output);
  console.log("Is array?", Array.isArray(output));
  
  if (Array.isArray(output) && output.length > 0) {
    const fileOutput = output[0];
    console.log("First output type:", typeof fileOutput);
    console.log("First output constructor:", fileOutput?.constructor?.name);
    
    if (typeof fileOutput === 'string') {
      console.log("\n📸 Generated Image URL:");
      console.log(fileOutput);
    } else if (fileOutput && typeof fileOutput === 'object') {
      console.log("\n📥 Downloading image...");
      
      // Handle FileOutput object
      let imageUrl;
      if ('url' in fileOutput && typeof fileOutput.url === 'function') {
        imageUrl = await fileOutput.url();
      } else {
        imageUrl = fileOutput;
      }
      
      const response = await fetch(imageUrl);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const filename = '/home/ubuntu/botly-replica/test-seedream-avatar.jpg';
      writeFileSync(filename, buffer);
      
      console.log("✅ Image saved to:", filename);
      console.log("\n✨ SeeDream-4 produces highly photorealistic results!");
    }
  }
  
} catch (error) {
  console.error("❌ Generation failed:");
  console.error(error.message);
  if (error.response) {
    console.error("Response:", error.response);
  }
  process.exit(1);
}

