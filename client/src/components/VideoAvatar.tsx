import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Loader2, Play, Volume2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface VideoAvatarProps {
  avatarId: string;
  text: string;
  voiceId?: string;
  onVideoReady?: (videoUrl: string) => void;
}

export function VideoAvatar({ avatarId, text, voiceId, onVideoReady }: VideoAvatarProps) {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "generating" | "ready" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const generateVideoMutation = trpc.video.generateTalkingVideo.useMutation();

  const handleGenerate = async () => {
    try {
      setStatus("generating");
      setError(null);
      
      const result = await generateVideoMutation.mutateAsync({
        avatarId,
        text,
        voiceId,
      });

      setVideoId(result.videoId);
      
      // Start polling for video status
      pollVideoStatus(result.videoId);
    } catch (err: any) {
      setStatus("error");
      setError(err.message || "Failed to generate video");
    }
  };

  const pollVideoStatus = async (vId: string) => {
    const maxAttempts = 60; // Poll for up to 5 minutes
    let attempts = 0;

    const poll = async () => {
      try {
        const result = await trpc.video.getVideoStatus.query({ videoId: vId });

        if (result.status === "completed" && result.videoUrl) {
          setVideoUrl(result.videoUrl);
          setStatus("ready");
          onVideoReady?.(result.videoUrl);
          return;
        }

        if (result.status === "failed") {
          setStatus("error");
          setError(result.error || "Video generation failed");
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000); // Poll every 5 seconds
        } else {
          setStatus("error");
          setError("Video generation timed out");
        }
      } catch (err: any) {
        setStatus("error");
        setError(err.message || "Failed to check video status");
      }
    };

    poll();
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-pink-500" />
          <h3 className="font-semibold">Talking Avatar</h3>
        </div>
        
        {status === "idle" && (
          <Button
            onClick={handleGenerate}
            disabled={generateVideoMutation.isPending}
            size="sm"
            className="bg-gradient-to-r from-pink-500 to-purple-600"
          >
            <Play className="w-4 h-4 mr-2" />
            Generate Video
          </Button>
        )}
      </div>

      {status === "generating" && (
        <div className="flex flex-col items-center justify-center py-8 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
          <p className="text-sm text-muted-foreground">
            Creating your talking avatar...
          </p>
          <p className="text-xs text-muted-foreground">
            This may take 1-3 minutes
          </p>
        </div>
      )}

      {status === "ready" && videoUrl && (
        <div className="space-y-3">
          <video
            src={videoUrl}
            controls
            autoPlay
            className="w-full rounded-lg"
            style={{ maxHeight: "500px" }}
          />
          <p className="text-xs text-muted-foreground text-center">
            Your avatar is speaking: "{text.substring(0, 50)}{text.length > 50 ? "..." : ""}"
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">
            {error || "Failed to generate video"}
          </p>
          <Button
            onClick={handleGenerate}
            variant="outline"
            size="sm"
            className="mt-2"
          >
            Try Again
          </Button>
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        <p className="font-medium mb-1">Message:</p>
        <p className="italic">"{text}"</p>
      </div>
    </Card>
  );
}

