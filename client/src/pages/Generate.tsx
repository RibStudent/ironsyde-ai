import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Loader2, Sparkles, Image as ImageIcon, Upload, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";
import { STYLE_PRESETS } from "@shared/presets";

export default function Generate() {
  const { user, isAuthenticated } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("low quality, blurry, distorted, deformed, ugly");
  const [model, setModel] = useState<"flux-pro" | "flux-dev" | "sdxl">("flux-dev");
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(1024);
  const [referenceImage, setReferenceImage] = useState<File | null>(null);
  const [referenceImageUrl, setReferenceImageUrl] = useState<string>("");
  const [strength, setStrength] = useState(0.8);
  const [selectedPreset, setSelectedPreset] = useState<string>("");

  const { data: credits } = trpc.avatars.credits.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const generateMutation = trpc.avatars.generate.useMutation({
    onSuccess: (data) => {
      toast.success("Avatar generated successfully!");
      setPrompt("");
      setReferenceImage(null);
      setReferenceImageUrl("");
      // Redirect to gallery
      window.location.href = "/gallery";
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate avatar");
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be less than 10MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    setReferenceImage(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setReferenceImageUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePresetSelect = (presetId: string) => {
    const preset = STYLE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setSelectedPreset(presetId);
    setPrompt(preset.prompt);
    setNegativePrompt(preset.negativePrompt);
    setModel(preset.model);
    toast.success(`Applied ${preset.name} preset`);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    // If there's a reference image, upload it to S3 first
    let uploadedImageUrl = "";
    if (referenceImage && referenceImageUrl) {
      try {
        // Convert base64 to blob
        const response = await fetch(referenceImageUrl);
        const blob = await response.blob();
        
        // Create form data
        const formData = new FormData();
        formData.append("file", blob, referenceImage.name);

        // Upload to a temporary endpoint (you'll need to create this)
        // For now, we'll use the data URL directly
        uploadedImageUrl = referenceImageUrl;
      } catch (error) {
        toast.error("Failed to upload reference image");
        return;
      }
    }

    generateMutation.mutate({
      prompt,
      negativePrompt: negativePrompt || undefined,
      model,
      width,
      height,
      referenceImageUrl: uploadedImageUrl || undefined,
      strength: referenceImage ? strength : undefined,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a14] text-white flex items-center justify-center">
        <Card className="bg-gradient-to-br from-pink-900/20 to-pink-900/20 border-pink-500/30 p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-4">Login Required</h2>
          <p className="text-gray-400 mb-6">Please log in to generate avatars.</p>
          <Button asChild className="w-full bg-gradient-to-r from-pink-600 to-pink-600">
            <Link href="/">Go to Home</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold">IronSyde</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-gray-400">Credits:</span>{" "}
              <span className="text-pink-400 font-bold">{credits ?? 0}</span>
            </div>
            <Button asChild variant="outline" className="border-white/20">
              <Link href="/gallery">Gallery</Link>
            </Button>
            <Button asChild variant="outline" className="border-white/20">
              <Link href="/profile">Profile</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent">
              Generate Avatar
            </h1>
            <p className="text-gray-400">
              Create stunning NSFW avatars with AI. Each generation costs 1 credit.
            </p>
          </div>

          <Tabs defaultValue="custom" className="mb-8">
            <TabsList className="bg-pink-900/20 border border-pink-500/30">
              <TabsTrigger value="presets" className="data-[state=active]:bg-pink-600">
                <Wand2 className="w-4 h-4 mr-2" />
                Style Presets
              </TabsTrigger>
              <TabsTrigger value="custom" className="data-[state=active]:bg-pink-600">
                Custom
              </TabsTrigger>
            </TabsList>

            <TabsContent value="presets" className="mt-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {STYLE_PRESETS.map((preset) => (
                  <Card
                    key={preset.id}
                    className={`bg-gradient-to-br from-pink-900/20 to-pink-900/20 border-pink-500/30 p-4 cursor-pointer transition-all hover:border-pink-400 ${
                      selectedPreset === preset.id ? "ring-2 ring-pink-400" : ""
                    }`}
                    onClick={() => handlePresetSelect(preset.id)}
                  >
                    <h3 className="font-bold text-lg mb-2">{preset.name}</h3>
                    <p className="text-sm text-gray-400 mb-3">{preset.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2 py-1 bg-pink-500/20 rounded">{preset.category}</span>
                      <span className="text-gray-500">{preset.model}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Form */}
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-pink-900/20 to-pink-900/20 border-pink-500/30 p-6">
                <div className="space-y-4">
                  {/* Reference Image Upload */}
                  <div>
                    <Label htmlFor="reference-image" className="text-white mb-2 block">
                      Reference Image (Optional)
                    </Label>
                    <div className="border-2 border-dashed border-pink-500/30 rounded-lg p-4 text-center">
                      {referenceImageUrl ? (
                        <div className="relative">
                          <img
                            src={referenceImageUrl}
                            alt="Reference"
                            className="max-h-48 mx-auto rounded"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2"
                            onClick={() => {
                              setReferenceImage(null);
                              setReferenceImageUrl("");
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <label htmlFor="reference-image" className="cursor-pointer">
                          <Upload className="w-12 h-12 mx-auto mb-2 text-pink-400" />
                          <p className="text-sm text-gray-400">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                          <input
                            id="reference-image"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                          />
                        </label>
                      )}
                    </div>
                    {referenceImage && (
                      <div className="mt-3">
                        <Label htmlFor="strength" className="text-white mb-2 block">
                          Transformation Strength: {strength.toFixed(2)}
                        </Label>
                        <Input
                          id="strength"
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={strength}
                          onChange={(e) => setStrength(parseFloat(e.target.value))}
                          className="bg-black/30 border-pink-500/30"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Lower = closer to reference, Higher = more creative
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="prompt" className="text-white mb-2 block">
                      Prompt *
                    </Label>
                    <Textarea
                      id="prompt"
                      placeholder="Describe your avatar... e.g., 'beautiful woman with long blonde hair, blue eyes, wearing lingerie, photorealistic'"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={4}
                      className="bg-black/30 border-pink-500/30 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="negativePrompt" className="text-white mb-2 block">
                      Negative Prompt
                    </Label>
                    <Textarea
                      id="negativePrompt"
                      placeholder="What to avoid..."
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                      rows={2}
                      className="bg-black/30 border-pink-500/30 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="model" className="text-white mb-2 block">
                      Model
                    </Label>
                    <Select value={model} onValueChange={(v: any) => setModel(v)}>
                      <SelectTrigger className="bg-black/30 border-pink-500/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flux-dev">Flux Dev (Recommended)</SelectItem>
                        <SelectItem value="flux-pro">Flux Pro (Highest Quality)</SelectItem>
                        <SelectItem value="sdxl">SDXL (Fast)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="width" className="text-white mb-2 block">
                        Width
                      </Label>
                      <Input
                        id="width"
                        type="number"
                        min={512}
                        max={2048}
                        step={64}
                        value={width}
                        onChange={(e) => setWidth(parseInt(e.target.value))}
                        className="bg-black/30 border-pink-500/30 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="height" className="text-white mb-2 block">
                        Height
                      </Label>
                      <Input
                        id="height"
                        type="number"
                        min={512}
                        max={2048}
                        step={64}
                        value={height}
                        onChange={(e) => setHeight(parseInt(e.target.value))}
                        className="bg-black/30 border-pink-500/30 text-white"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={generateMutation.isPending || !prompt.trim() || (credits ?? 0) < 1}
                    className="w-full bg-gradient-to-r from-pink-600 to-pink-600 hover:from-pink-700 hover:to-pink-700"
                  >
                    {generateMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Avatar (1 credit)
                      </>
                    )}
                  </Button>

                  {(credits ?? 0) < 1 && (
                    <p className="text-sm text-red-400 text-center">
                      Insufficient credits. Contact support to add more.
                    </p>
                  )}
                </div>
              </Card>
            </div>

            {/* Tips */}
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-pink-900/20 to-pink-900/20 border-pink-500/30 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <ImageIcon className="w-6 h-6 text-pink-400" />
                  <h3 className="text-xl font-bold">Tips for Better Results</h3>
                </div>
                <ul className="space-y-3 text-sm text-gray-300">
                  <li className="flex gap-2">
                    <span className="text-pink-400">•</span>
                    <span>Use style presets for quick, professional results</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-pink-400">•</span>
                    <span>Upload a reference image to create variations or enhance photos</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-pink-400">•</span>
                    <span>Be specific and detailed in your prompts</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-pink-400">•</span>
                    <span>Include style keywords: "photorealistic", "anime", "3D render"</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-pink-400">•</span>
                    <span>Describe physical features, clothing, pose, and setting</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-pink-400">•</span>
                    <span>Use negative prompts to avoid unwanted elements</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-pink-400">•</span>
                    <span>Lower strength = closer to reference image</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-pink-400">•</span>
                    <span>Generation typically takes 10-30 seconds</span>
                  </li>
                </ul>
              </Card>

              {generateMutation.isPending && (
                <Card className="bg-gradient-to-br from-pink-900/20 to-pink-900/20 border-pink-500/30 p-6">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-pink-400" />
                    <p className="text-gray-300">
                      Generating your avatar... This may take up to 30 seconds.
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

