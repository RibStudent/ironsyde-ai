import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { 
  Sparkles, 
  User, 
  CreditCard, 
  History, 
  TrendingUp,
  Calendar,
  Image as ImageIcon
} from "lucide-react";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";

export default function Profile() {
  const { user, isAuthenticated, logout } = useAuth();

  const { data: credits } = trpc.avatars.credits.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: avatars } = trpc.avatars.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: history } = trpc.avatars.history.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a14] text-white flex items-center justify-center">
        <Card className="bg-gradient-to-br from-pink-900/20 to-pink-900/20 border-pink-500/30 p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-4">Login Required</h2>
          <p className="text-gray-400 mb-6">Please log in to view your profile.</p>
          <Button 
            onClick={() => window.location.href = getLoginUrl()}
            className="w-full bg-gradient-to-r from-pink-600 to-pink-600"
          >
            Log In
          </Button>
        </Card>
      </div>
    );
  }

  // Calculate statistics
  const totalGenerations = avatars?.length ?? 0;
  const creditsUsed = (history?.filter(h => h.status === 'completed').length ?? 0);
  const successRate = history && history.length > 0
    ? ((history.filter(h => h.status === 'completed').length / history.length) * 100).toFixed(1)
    : '0';

  // Group history by date
  const recentHistory = history?.slice(0, 10) ?? [];

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
            <Button asChild variant="outline" className="border-white/20">
              <Link href="/generate">Generate</Link>
            </Button>
            <Button asChild variant="outline" className="border-white/20">
              <Link href="/gallery">Gallery</Link>
            </Button>
            <Button 
              variant="outline" 
              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
              onClick={() => logout()}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent">
              My Profile
            </h1>
            <p className="text-gray-400">Manage your account and view your generation history</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Account Info Card */}
            <Card className="bg-gradient-to-br from-pink-900/20 to-pink-900/20 border-pink-500/30 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-pink-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Account</h3>
                  <p className="text-sm text-gray-400">User Information</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="text-sm font-medium">{user?.name || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">User ID</p>
                  <p className="text-sm font-mono text-gray-400">{user?.id.slice(0, 16)}...</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Member Since</p>
                  <p className="text-sm">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </Card>

            {/* Credits Card */}
            <Card className="bg-gradient-to-br from-pink-900/20 to-pink-900/20 border-pink-500/30 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-pink-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Credits</h3>
                  <p className="text-sm text-gray-400">Available Balance</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-3xl font-bold text-pink-400">{credits ?? 0}</p>
                  <p className="text-xs text-gray-500">Available credits</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Used: {creditsUsed} credits</p>
                </div>
                <Button 
                  size="sm" 
                  className="w-full bg-gradient-to-r from-pink-600 to-pink-600 mt-2"
                  disabled
                >
                  Buy More Credits
                </Button>
                <p className="text-xs text-gray-500 text-center">Contact support to add credits</p>
              </div>
            </Card>

            {/* Statistics Card */}
            <Card className="bg-gradient-to-br from-pink-900/20 to-pink-900/20 border-pink-500/30 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-pink-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Statistics</h3>
                  <p className="text-sm text-gray-400">Your Activity</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Total Generations</span>
                  <span className="font-bold text-pink-400">{totalGenerations}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Success Rate</span>
                  <span className="font-bold text-green-400">{successRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Credits Used</span>
                  <span className="font-bold">{creditsUsed}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Generation History */}
          <Card className="bg-gradient-to-br from-pink-900/20 to-pink-900/20 border-pink-500/30 p-6">
            <div className="flex items-center gap-3 mb-6">
              <History className="w-6 h-6 text-pink-400" />
              <h3 className="text-2xl font-bold">Generation History</h3>
            </div>

            {recentHistory.length > 0 ? (
              <div className="space-y-3">
                {recentHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/5 hover:border-pink-500/30 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-pink-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium line-clamp-1">{item.prompt}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-gray-500">{item.model}</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            item.status === 'completed' 
                              ? 'bg-green-500/20 text-green-400' 
                              : item.status === 'failed'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-pink-400">{item.creditsUsed} credit{item.creditsUsed !== 1 ? 's' : ''}</p>
                      <p className="text-xs text-gray-500">{(item.duration / 1000).toFixed(1)}s</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <History className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400 mb-4">No generation history yet</p>
                <Button asChild className="bg-gradient-to-r from-pink-600 to-pink-600">
                  <Link href="/generate">Generate Your First Avatar</Link>
                </Button>
              </div>
            )}

            {recentHistory.length > 0 && history && history.length > 10 && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Showing 10 of {history.length} generations
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

