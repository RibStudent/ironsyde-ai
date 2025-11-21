import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface VoiceChatProps {
  conversationId: string;
  onVoiceMessage?: (text: string, audioUrl: string) => void;
}

type VoicePersonality = "seductive" | "playful" | "professional" | "sweet" | "dominant";

export default function VoiceChat({ conversationId, onVoiceMessage }: VoiceChatProps) {
  const [isListening, setIsListening] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedPersonality, setSelectedPersonality] = useState<VoicePersonality>("seductive");
  const [lastGenerationId, setLastGenerationId] = useState<string | undefined>();
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);

  const { data: voiceProfiles } = trpc.voice.getProfiles.useQuery();
  const generateVoiceMutation = trpc.voice.generateVoice.useMutation();

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleUserSpeech(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        toast.error("Speech recognition error");
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition not supported in this browser");
      return;
    }

    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      toast.error("Failed to start listening");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const handleUserSpeech = async (transcript: string) => {
    console.log("User said:", transcript);
    
    // TODO: Send message to chat API and get response
    // For now, we'll just generate a voice response
    await generateVoiceResponse("Thank you for your message. I'm here to chat with you.");
  };

  const generateVoiceResponse = async (text: string) => {
    setIsGenerating(true);

    try {
      const result = await generateVoiceMutation.mutateAsync({
        text,
        personality: selectedPersonality,
        continuationOf: lastGenerationId,
      });

      setLastGenerationId(result.generationId);

      // Play the audio
      if (audioRef.current) {
        audioRef.current.src = result.audioUrl;
        audioRef.current.play();
        setIsSpeaking(true);
      }

      if (onVoiceMessage) {
        onVoiceMessage(text, result.audioUrl);
      }

      toast.success("Voice generated!");
    } catch (error: any) {
      console.error("Voice generation error:", error);
      toast.error(error.message || "Failed to generate voice");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAudioEnded = () => {
    setIsSpeaking(false);
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsSpeaking(false);
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-pink-500/10 to-purple-500/10 border-pink-500/20">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Voice Chat</h3>
          <span className="text-xs text-gray-400 bg-purple-500/20 px-2 py-1 rounded">
            Premium Feature
          </span>
        </div>

        {/* Voice Personality Selector */}
        <div>
          <label className="text-sm text-gray-300 mb-2 block">Voice Personality</label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {voiceProfiles?.map((profile) => (
              <button
                key={profile.id}
                onClick={() => setSelectedPersonality(profile.id as VoicePersonality)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedPersonality === profile.id
                    ? "bg-pink-500 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {profile.name}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {voiceProfiles?.find((p) => p.id === selectedPersonality)?.description}
          </p>
        </div>

        {/* Voice Controls */}
        <div className="flex gap-3">
          {/* Microphone Button */}
          <Button
            onClick={isListening ? stopListening : startListening}
            disabled={isGenerating || isSpeaking}
            className={`flex-1 ${
              isListening
                ? "bg-red-500 hover:bg-red-600"
                : "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-5 h-5 mr-2" />
                Stop Listening
              </>
            ) : (
              <>
                <Mic className="w-5 h-5 mr-2" />
                Start Talking
              </>
            )}
          </Button>

          {/* Speaker Button */}
          <Button
            onClick={stopSpeaking}
            disabled={!isSpeaking}
            variant="outline"
            className="px-4"
          >
            {isSpeaking ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Status Indicator */}
        {(isListening || isGenerating || isSpeaking) && (
          <div className="flex items-center justify-center gap-2 text-sm">
            {isListening && (
              <>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-gray-300">Listening...</span>
              </>
            )}
            {isGenerating && (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-pink-500" />
                <span className="text-gray-300">Generating voice...</span>
              </>
            )}
            {isSpeaking && (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-gray-300">Avatar speaking...</span>
              </>
            )}
          </div>
        )}

        {/* Hidden Audio Element */}
        <audio
          ref={audioRef}
          onEnded={handleAudioEnded}
          className="hidden"
        />

        {/* Info */}
        <p className="text-xs text-gray-400 text-center">
          Click the microphone to speak, and your avatar will respond with voice
        </p>
      </div>
    </Card>
  );
}

