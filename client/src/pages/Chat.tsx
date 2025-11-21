import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Send, Image as ImageIcon, Phone, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { canAccessFeature } from "../../../shared/subscriptionTiers";

export default function Chat() {
  const params = useParams();
  const avatarId = params.id as string;
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [message, setMessage] = useState("");
  const [isGeneratingPhoto, setIsGeneratingPhoto] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const createConversationMutation = trpc.chat.createConversation.useMutation({
    onSuccess: (data) => {
      setConversationId(data.conversationId);
    },
  });

  useEffect(() => {
    if (isAuthenticated && avatarId && !conversationId) {
      createConversationMutation.mutate({
        avatarId,
        personality: {
          name: "Your Avatar",
          traits: ["flirty", "playful", "engaging"],
          style: "casual and friendly",
        },
      });
    }
  }, [isAuthenticated, avatarId, conversationId]);

  const { data: conversation } = trpc.chat.getMessages.useQuery(
    { conversationId: conversationId! },
    { enabled: !!conversationId && isAuthenticated, refetchInterval: 3000 }
  );

  const sendMessageMutation = trpc.chat.sendMessage.useMutation({
    onSuccess: () => {
      setMessage("");
      setIsGeneratingPhoto(false);
    },
    onError: (error) => {
      toast.error(error.message);
      setIsGeneratingPhoto(false);
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Login Required</h2>
          <p className="text-muted-foreground mb-6">Please log in to access chat.</p>
          <Button onClick={() => (window.location.href = "/api/auth/login")}>Log In</Button>
        </Card>
      </div>
    );
  }

  const handleSendMessage = async (requestPhoto: boolean = false) => {
    if (!conversationId) return;
    if (!message.trim() && !requestPhoto) return;

    if (requestPhoto) {
      setIsGeneratingPhoto(true);
    }

    await sendMessageMutation.mutateAsync({
      conversationId,
      content: message || "Send me a photo",
      requestPhoto,
    });
  };

  const handleRequestPhoto = () => {
    if (!user) return;
    
    const canRequest = canAccessFeature(user.tier, "nsfwPhotoRequests");
    if (!canRequest) {
      toast.error("Upgrade to Standard or Premium to request photos");
      return;
    }

    handleSendMessage(true);
  };

  const messages = conversation || [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/gallery">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold">Chat with Avatar</h1>
              <p className="text-sm text-muted-foreground">
                {user?.tier === "free" && "Upgrade to request photos"}
                {user?.tier === "standard" && "Standard - Photo requests enabled"}
                {user?.tier === "premium" && "Premium - All features enabled"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {user && canAccessFeature(user.tier, "voiceChat") && (
              <Button variant="outline" size="sm">
                <Phone className="h-4 w-4 mr-2" />
                Voice Call
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-12">
                <p>Start a conversation with your avatar!</p>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white"
                      : "bg-card border border-border"
                  }`}
                >
                  {msg.imageUrl && (
                    <img
                      src={msg.imageUrl}
                      alt="Generated photo"
                      className="rounded-lg mb-2 max-w-full"
                    />
                  )}
                  <p className="text-sm">{msg.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(msg.createdAt!).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}

            {sendMessageMutation.isPending && (
              <div className="flex justify-start">
                <div className="bg-card border border-border rounded-2xl px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card/50 backdrop-blur-sm sticky bottom-0">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRequestPhoto}
              disabled={isGeneratingPhoto || sendMessageMutation.isPending}
            >
              {isGeneratingPhoto ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImageIcon className="h-4 w-4" />
              )}
            </Button>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(false);
                }
              }}
              disabled={sendMessageMutation.isPending || isGeneratingPhoto}
            />
            <Button
              onClick={() => handleSendMessage(false)}
              disabled={!message.trim() || sendMessageMutation.isPending || isGeneratingPhoto}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {user?.tier === "free" && "Upgrade to Standard to request NSFW photos"}
            {user?.tier === "standard" && "Click the image icon to request a photo"}
            {user?.tier === "premium" && "Click the phone icon for voice chat or image icon for photos"}
          </p>
        </div>
      </div>
    </div>
  );
}

