import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Sparkles, Trash2, Download, Plus, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Gallery() {
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const { data: avatars, isLoading } = trpc.avatars.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: credits } = trpc.avatars.credits.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const deleteMutation = trpc.avatars.delete.useMutation({
    onSuccess: () => {
      toast.success("Avatar deleted");
      utils.avatars.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete avatar");
    },
  });

  const handleDownload = async (imageUrl: string, id: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `avatar-${id}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Download started");
    } catch (error) {
      toast.error("Failed to download image");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a14] text-white flex items-center justify-center">
        <Card className="bg-gradient-to-br from-pink-900/20 to-pink-900/20 border-pink-500/30 p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-4">Login Required</h2>
          <p className="text-gray-400 mb-6">Please log in to view your gallery.</p>
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
              <Link href="/profile">Profile</Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-pink-600 to-pink-600">
              <Link href="/generate">
                <Plus className="w-4 h-4 mr-2" />
                Generate New
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent">
            Your Avatar Gallery
          </h1>
          <p className="text-gray-400">
            {avatars?.length ?? 0} avatar{avatars?.length !== 1 ? "s" : ""} generated
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 mt-4">Loading your avatars...</p>
          </div>
        ) : avatars && avatars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {avatars.map((avatar) => (
              <Card
                key={avatar.id}
                className="bg-gradient-to-br from-pink-900/20 to-pink-900/20 border-pink-500/30 overflow-hidden group"
              >
                <div className="relative aspect-square">
                  <img
                    src={avatar.imageUrl}
                    alt={avatar.prompt}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Link href={`/chat/${avatar.id}`}>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-pink-600 to-pink-600"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/20"
                      onClick={() => handleDownload(avatar.imageUrl, avatar.id)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="border-red-500/50 text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-[#0a0a14] border-pink-500/30">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">Delete Avatar?</AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-400">
                            This action cannot be undone. This will permanently delete your avatar.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-transparent border-white/20 text-white">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => deleteMutation.mutate({ id: avatar.id })}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-300 line-clamp-2 mb-2">{avatar.prompt}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{avatar.model}</span>
                    <span>
                      {avatar.width}×{avatar.height}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-gradient-to-br from-pink-900/20 to-pink-900/20 border-pink-500/30 p-12 text-center">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-pink-400" />
            <h3 className="text-2xl font-bold mb-2">No Avatars Yet</h3>
            <p className="text-gray-400 mb-6">
              Start creating stunning AI-generated avatars now!
            </p>
            <Button asChild className="bg-gradient-to-r from-pink-600 to-pink-600">
              <Link href="/generate">
                <Plus className="w-4 h-4 mr-2" />
                Generate Your First Avatar
              </Link>
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}

