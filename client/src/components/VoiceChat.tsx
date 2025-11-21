import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface VoiceChatProps {
  conversationId: string;
  avatarId?: string;
}

type VoicePersonality = "seductive" | "playful" | "professional" | "sweet" | "dominant";

const VOICE_PERSONALITIES = [
  { id: "seductive", name: "Seductive", description: "Sultry, alluring voice with a teasing tone" },
  { id: "playful", name: "Playful", description: "Fun, energetic voice with a cheerful attitude" },
  { id: "professional", name: "Professional", description: "Polished, confident voice with clear articulation" },
  { id: "sweet", name: "Sweet", description: "Warm, gentle voice with a caring tone" },
  { id: "dominant", name: "Dominant", description: "Commanding, assertive voice with authority" },
];

export default function VoiceChat({ conversationId, avatarId }: VoiceChatProps) {
  const [isListening, setIsListening] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedPersonality, setSelectedPersonality] = useState<VoicePersonality>("seductive");
  const [transcript, setTranscript] = useState("");
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);

  const sendMessageMutation = trpc.chat.sendMessage.useMutation();
  const generateVoiceMutation = trpc.voice.generateVoice.useMutation();

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const userTranscript = event.results[0][0].transcript;
        setTranscript(userTranscript);
        handleUserSpeech(userTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        toast.error("Speech recognition error. Please try again.");
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
      toast.error("Speech recognition not supported. Please use Chrome or Edge browser.");
      return;
    }

    try {
      recognitionRef.current.start();
      setIsListening(true);
      toast.info("Listening... Speak now!");
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

  const handleUserSpeech = async (userText: string) => {
    console.log("User said:", userText);
    setIsGenerating(true);
    
    try {
      // Send user message to chat and get AI response
      const response = await sendMessageMutation.mutateAsync({
        conversationId,
        content: userText,
        requestPhoto: false,
      });

      // Get the AI's text response (last message)
      const aiResponse = response.content || "I'm here to chat with you!";

      // Generate voice for the AI response
      await generateVoiceResponse(aiResponse);
    } catch (error: any) {
      console.error("Chat error:", error);
      toast.error("Failed to process your message");
      setIsGenerating(false);
    }
  };

  const generateVoiceResponse = async (text: string) => {
    try {
      const result = await generateVoiceMutation.mutateAsync({
        text,
        personality: selectedPersonality,
      });

      // Play the audio
      if (result.audioUrl && audioRef.current) {
        audioRef.current.src = result.audioUrl;
        await audioRef.current.play();
        setIsSpeaking(true);
      }

      toast.success("Avatar responded!");
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
    <Card className="p-6 bg-gradient-to-br from-pink-900/30 to-pink-900/20 border-pink-500/20">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            🎤 Voice Chat
          </h3>
          <span className="text-xs text-pink-300 bg-pink-500/20 px-3 py-1 rounded-full">
            AI Powered
          </span>
        </div>

        {/* Voice Personality Selector */}
        <div>
          <label className="text-sm text-gray-300 mb-2 block font-medium">Voice Personality</label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {VOICE_PERSONALITIES.map((profile) => (
              <button
                key={profile.id}
                onClick={() => setSelectedPersonality(profile.id as VoicePersonality)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedPersonality === profile.id
                    ? "bg-gradient-to-r from-pink-600 to-pink-600 text-white shadow-lg"
                    : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700"
                }`}
              >
                {profile.name}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {VOICE_PERSONALITIES.find((p) => p.id === selectedPersonality)?.description}
          </p>
        </div>

        {/* Transcript Display */}
        {transcript && (
          <div className="bg-black/30 rounded-lg p-3 border border-pink-500/20">
            <p className="text-sm text-gray-300">
              <span className="text-pink-400 font-semibold">You said:</span> {transcript}
            </p>
          </div>
        )}

        {/* Voice Controls */}
        <div className="flex gap-3">
          {/* Microphone Button */}
          <Button
            onClick={isListening ? stopListening : startListening}
            disabled={isGenerating || isSpeaking}
            size="lg"
            className={`flex-1 text-base font-semibold ${
              isListening
                ? "bg-red-500 hover:bg-red-600 animate-pulse"
                : "bg-gradient-to-r from-pink-600 to-pink-600 hover:from-pink-700 hover:to-pink-700"
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
          {isSpeaking && (
            <Button
              onClick={stopSpeaking}
              variant="outline"
              size="lg"
              className="px-6 border-pink-500/30 hover:bg-pink-500/10"
            >
              <VolumeX className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Status Indicator */}
        {(isListening || isGenerating || isSpeaking) && (
          <div className="flex items-center justify-center gap-2 text-sm py-2 bg-black/20 rounded-lg">
            {isListening && (
              <>
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-white font-medium">Listening to you...</span>
              </>
            )}
            {isGenerating && (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-pink-400" />
                <span className="text-white font-medium">Generating voice response...</span>
              </>
            )}
            {isSpeaking && (
              <>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-white font-medium">Avatar speaking...</span>
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
        <div className="bg-pink-500/10 rounded-lg p-3 border border-pink-500/20">
          <p className="text-xs text-gray-300 text-center">
            💡 <strong>Tip:</strong> Click "Start Talking", speak your message, and your avatar will respond with voice!
          </p>
        </div>
      </div>
    </Card>
  );
}

