import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, LogOut, CheckCircle2, Clock, XCircle, Heart, X } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import type { User, Ad } from "@shared/schema";

const ratingBgStyle = "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)";

type AdWithClick = Ad & { lastClickedAt: string | null };

export default function AdsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedAd, setSelectedAd] = useState<AdWithClick | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [showHeart, setShowHeart] = useState(false);
  const [heartClicked, setHeartClicked] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  const { data: currentUser, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  const { data: allAds, isLoading: adsLoading } = useQuery<AdWithClick[]>({
    queryKey: ["/api/ads"],
  });

  // Update current time every second for countdown timers
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const adClickMutation = useMutation({
    mutationFn: async (adId: number) => {
      return apiRequest("POST", "/api/ads/click", { adId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ads"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    toast({ title: "Logged out successfully" });
    setLocation("/");
  };

  // Auto-load progress when ad is selected
  useEffect(() => {
    if (!selectedAd) return;

    setLoading(true);
    setLoadProgress(0);
    setShowHeart(false);
    setHeartClicked(false);

    const interval = setInterval(() => {
      setLoadProgress((prev) => {
        const newProgress = prev + Math.random() * 25;
        if (newProgress >= 100) {
          clearInterval(interval);
          // Use setTimeout to ensure state updates happen after this render cycle
          setTimeout(() => {
            setLoading(false);
            setShowHeart(true);
          }, 100);
          return 100;
        }
        return newProgress;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [selectedAd]);

  if (userLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  if (!currentUser) {
    setLocation("/login");
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "frozen":
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" => {
    switch (status) {
      case "active":
        return "default";
      case "pending":
        return "secondary";
      case "frozen":
        return "destructive";
      default:
        return "secondary";
    }
  };

  // Calculate time until ad is available again (24 hours after last click)
  const getTimeUntilAvailable = (lastClickedAt: string | null) => {
    if (!lastClickedAt) return null;
    
    const clickTime = new Date(lastClickedAt).getTime();
    const availableTime = clickTime + (24 * 60 * 60 * 1000); // 24 hours
    const timeLeft = availableTime - currentTime;
    
    if (timeLeft <= 0) return null;
    
    const hours = Math.floor(timeLeft / (60 * 60 * 1000));
    const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000);
    
    return { hours, minutes, seconds, timeLeft };
  };

  const isAdAvailable = (ad: AdWithClick) => {
    const timeInfo = getTimeUntilAvailable(ad.lastClickedAt);
    return !timeInfo || timeInfo.timeLeft <= 0;
  };

  return (
    <div className="min-h-screen bg-background relative" style={{ background: ratingBgStyle }}>
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-black/50 pointer-events-none z-0" />
      
      {/* Navigation */}
      <nav className="border-b bg-black/85 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Star className="h-6 w-6 text-amber-500" />
              <span className="text-xl font-bold text-white">Rating - Ads</span>
            </div>
            <div className="flex items-center gap-8">
              <div className="flex gap-6">
                <a href="/dashboard" className="text-amber-500 hover:text-amber-400 font-bold text-sm uppercase transition-colors" data-testid="nav-home">HOME</a>
                <a href="#" className="text-amber-500 hover:text-amber-400 font-bold text-sm uppercase transition-colors">ROOMS</a>
                <a href="#" className="text-amber-500 hover:text-amber-400 font-bold text-sm uppercase transition-colors">EVENT SPACE</a>
                <a href="/features" className="text-amber-500 hover:text-amber-400 font-bold text-sm uppercase transition-colors">FEATURES</a>
                <a href="/rating" className="text-amber-500 hover:text-amber-400 font-bold text-sm uppercase transition-colors" data-testid="nav-rating">ADS</a>
                <a href="/points" className="text-amber-500 hover:text-amber-400 font-bold text-sm uppercase transition-colors" data-testid="nav-point">POINT</a>
                <a href="#" className="text-amber-500 hover:text-amber-400 font-bold text-sm uppercase transition-colors">CONTACT US</a>
              </div>
              <Button variant="ghost" onClick={handleLogout} className="text-amber-500 hover:text-amber-400" data-testid="button-logout">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Click Ads & Earn Money</h1>
            <p className="text-white/70">Watch ads and earn rewards instantly</p>
          </div>
          <Badge variant={getStatusVariant(currentUser.status)} className="gap-2 px-4 py-2 text-base" data-testid={`badge-status-${currentUser.status}`}>
            {getStatusIcon(currentUser.status)}
            {currentUser.status.charAt(0).toUpperCase() + currentUser.status.slice(1)}
          </Badge>
        </div>

        {/* Ads Grid */}
        {adsLoading ? (
          <div className="text-center py-12 text-white">Loading ads...</div>
        ) : !allAds || allAds.length === 0 ? (
          <div className="text-center py-16 text-white/70">
            <p className="text-xl">No ads available right now</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allAds.map((ad) => {
              const available = isAdAvailable(ad);
              const timeInfo = getTimeUntilAvailable(ad.lastClickedAt);
              
              return (
                <Card key={ad.id} className="border-none shadow-lg bg-gradient-to-br from-pink-200 via-pink-300 to-purple-300 hover:shadow-2xl hover:scale-105 transition-all duration-200 overflow-hidden" data-testid={`ad-card-${ad.id}`}>
                  <CardContent className="p-6 h-full flex flex-col justify-between">
                    <div>
                      <h3 className={`text-2xl font-bold mb-2 ${available ? 'text-blue-600' : 'text-gray-400'}`}>{ad.adCode}</h3>
                      {!available && timeInfo && (
                        <p className="text-gray-400 font-semibold text-sm mb-2" data-testid={`countdown-${ad.id}`}>
                          Ads Available: {timeInfo.hours}H {timeInfo.minutes}M {timeInfo.seconds}S
                        </p>
                      )}
                      <p className={`font-semibold text-sm mb-4 ${available ? 'text-gray-700' : 'text-gray-400'}`}>
                        Duration: {ad.duration} Seconds
                      </p>
                      <p className={`text-3xl font-bold mb-6 ${available ? 'text-green-600' : 'text-gray-400'}`}>
                        101.75 LKR
                      </p>
                    </div>
                    <div className="relative">
                      <div className="absolute -top-8 right-0 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">Link/URL</div>
                    </div>
                    <Button
                      onClick={() => available && setSelectedAd(ad)}
                      disabled={!available}
                      className={`w-full font-bold py-2 rounded-lg flex items-center justify-center gap-2 ${
                        available 
                          ? 'bg-black text-white hover:bg-gray-800' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      data-testid={`button-view-ads-${ad.id}`}
                    >
                      <Eye className="h-4 w-4" />
                      View Ads
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Ad Modal */}
      {selectedAd && (
        <div 
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => !loading && setSelectedAd(null)}
          data-testid="ad-modal-overlay"
        >
          <div 
            className="bg-white rounded-lg shadow-2xl max-w-2xl w-full relative"
            onClick={(e) => e.stopPropagation()}
            data-testid="ad-modal"
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedAd(null)}
              disabled={loading}
              className="absolute top-4 right-4 z-10 hover:bg-gray-100 p-2 rounded-full transition-colors disabled:opacity-50"
              data-testid="button-modal-close"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>

            <div className="p-8 space-y-6">
              {/* Loading Bar */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Loading...</span>
                  <span className="text-sm font-semibold text-green-600">{Math.min(Math.round(loadProgress), 100)}%</span>
                </div>
                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{ width: `${Math.min(loadProgress, 100)}%` }}
                    data-testid="progress-bar"
                  />
                </div>
              </div>

              {/* Product Image Area */}
              <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center overflow-hidden">
                {selectedAd.imageUrl ? (
                  <img 
                    src={`/${selectedAd.imageUrl}`} 
                    alt={selectedAd.adCode}
                    className="w-full h-full object-cover"
                    data-testid="ad-product-image"
                  />
                ) : (
                  <div className="text-center">
                    <p className="text-gray-600 font-semibold">{selectedAd.adCode}</p>
                    <p className="text-gray-500 text-sm">Product Image Placeholder</p>
                  </div>
                )}
              </div>

              {/* Heart Reaction */}
              {showHeart && !loading && (
                <div className="flex justify-center">
                  <button
                    onClick={() => setHeartClicked(true)}
                    className="transition-all hover:scale-125"
                    data-testid="button-heart-reaction"
                  >
                    <Heart
                      className={`h-16 w-16 transition-all ${
                        heartClicked
                          ? "fill-red-500 text-red-500 drop-shadow-lg"
                          : "text-red-400 hover:text-red-500"
                      }`}
                    />
                  </button>
                </div>
              )}

              {/* Confirm Earn Button */}
              {showHeart && heartClicked && (
                <Button
                  onClick={() => {
                    adClickMutation.mutate(selectedAd.id);
                    toast({
                      title: "Success!",
                      description: `You earned 101.75 LKR for this ad!`,
                    });
                    setSelectedAd(null);
                  }}
                  disabled={adClickMutation.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg text-base"
                  data-testid="button-confirm-earn"
                >
                  ✓ Confirm Earn 101.75 LKR
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Eye icon component
function Eye({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}
