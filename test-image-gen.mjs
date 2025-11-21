import Replicate from "replicate";
import { writeFileSync } from "fs";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

console.log("🎨 Testing IronSyde Avatar Generation...\n");

const prompt = "A beautiful woman with blonde hair, professional glamour photography, soft lighting, elegant pose, high quality, detailed";

console.log("Prompt:", prompt);
console.log("Model: black-forest-labs/flux-dev");
console.log("\n⏳ Generating image (this may take 30-60 seconds)...\n");

try {
  const output = await replicate.run(
    "black-forest-labs/flux-dev",
    {
      input: {
        prompt: prompt,
        num_outputs: 1,
        aspect_ratio: "3:4",
        output_format: "jpg",
        output_quality: 90,
      },
    }
  );

  console.log("✅ Generation successful!");
  console.log("\n📸 Output received");
  
  // Flux-dev returns an array with a FileOutput object
  if (Array.isArray(output) && output.length > 0) {
    const fileOutput = output[0];
    console.log("Output type:", typeof fileOutput);
    console.log("Output constructor:", fileOutput?.constructor?.name);
    
    // If it's a URL string
    if (typeof fileOutput === 'string') {
      console.log("\n📸 Generated Image URL:");
      console.log(fileOutput);
      console.log("\n✨ You can open this URL in your browser to view the image!");
    } 
    // If it's a File or Blob object, we need to download it
    else if (fileOutput && typeof fileOutput === 'object') {
      console.log("\n📥 Downloading image...");
      
      // Fetch the image data
      const response = await fetch(fileOutput);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Save to file
      const filename = '/home/ubuntu/botly-replica/test-generated-avatar.jpg';
      writeFileSync(filename, buffer);
      
      console.log("✅ Image saved to:", filename);
      console.log("\n✨ You can view the image at this path!");
    }
  } else {
    console.log("Unexpected output format:");
    console.log(JSON.stringify(output, null, 2));
  }
  
} catch (error) {
  console.error("❌ Generation failed:");
  console.error(error.message);
  if (error.response) {
    console.error("Response:", JSON.stringify(error.response, null, 2));
  }
  process.exit(1);
}

