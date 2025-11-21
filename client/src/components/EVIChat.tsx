/**
 * EVI Chat Component
 * Real-time emotionally intelligent voice chat using Hume EVI
 */

import { useState, useEffect } from "react";
import { VoiceProvider, useVoice, VoiceReadyState } from "@humeai/voice-react";
import { trpc } from "@/lib/trpc";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Mic, MicOff, Phone, PhoneOff } from "lucide-react";

interface EVIChatProps {
  avatarId: string;
  avatarName: string;
  personality?: string;
}

function EVIChatInner({ avatarId, avatarName, personality }: EVIChatProps) {
  const { connect, disconnect, readyState, messages } = useVoice();
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Fetch access token
  const { data: tokenData } = trpc.evi.getAccessToken.useQuery();

  const isConnected = readyState === VoiceReadyState.OPEN;
  const isConnectingState = readyState === VoiceReadyState.CONNECTING;

  const handleConnect = async () => {
    if (!tokenData?.accessToken) {
      alert("Access token not ready. Please try again in a moment.");
      return;
    }

    setIsConnecting(true);
    try {
      await connect({
        auth: { type: "accessToken", value: tokenData.accessToken },
        // Configure EVI with avatar personality
        configId: undefined, // You can create custom configs in Hume portal
      });
    } catch (error) {
      console.error("[EVI] Connection error:", error);
      alert("Failed to start voice chat. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Voice Chat with {avatarName}</h3>
          <p className="text-sm text-muted-foreground">
            {isConnected
              ? "Connected - Speak naturally!"
              : "Start a voice conversation"}
          </p>
        </div>

        {isConnected ? (
          <Button
            onClick={handleDisconnect}
            variant="destructive"
            size="lg"
            className="gap-2"
          >
            <PhoneOff className="h-5 w-5" />
            End Call
          </Button>
        ) : (
          <Button
            onClick={handleConnect}
            disabled={isConnecting || isConnectingState}
            size="lg"
            className="gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          >
            <Phone className="h-5 w-5" />
            {isConnecting || isConnectingState ? "Connecting..." : "Start Call"}
          </Button>
        )}
      </div>

      {/* Connection status indicator */}
      {isConnected && (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
          <div className="h-2 w-2 rounded-full bg-green-600 animate-pulse" />
          <span>Live - {avatarName} is listening</span>
        </div>
      )}

      {/* Message display */}
      {messages.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {messages.map((msg, index) => {
            if (msg.type === "user_message") {
              return (
                <div key={index} className="flex justify-end">
                  <div className="bg-primary text-primary-foreground rounded-lg px-4 py-2 max-w-[80%]">
                    <p className="text-sm">{msg.message.content}</p>
                  </div>
                </div>
              );
            }

            if (msg.type === "assistant_message") {
              return (
                <div key={index} className="flex justify-start">
                  <div className="bg-muted rounded-lg px-4 py-2 max-w-[80%]">
                    <p className="text-sm font-medium text-pink-600 dark:text-pink-400 mb-1">
                      {avatarName}
                    </p>
                    <p className="text-sm">{msg.message.content}</p>
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>
      )}

      {/* Instructions */}
      {!isConnected && (
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Click "Start Call" to begin voice conversation</p>
          <p>• Speak naturally - {avatarName} will respond with empathy</p>
          <p>• You can interrupt at any time</p>
          <p>• {avatarName} understands your tone and emotion</p>
        </div>
      )}
    </Card>
  );
}

export default function EVIChat(props: EVIChatProps) {
  try {
    return (
      <VoiceProvider>
        <EVIChatInner {...props} />
      </VoiceProvider>
    );
  } catch (error) {
    console.error("[EVI] Failed to initialize:", error);
    return (
      <Card className="p-4">
        <div className="text-center text-muted-foreground">
          <p>Voice chat is temporarily unavailable.</p>
          <p className="text-sm mt-2">Please try refreshing the page.</p>
        </div>
      </Card>
    );
  }
}

