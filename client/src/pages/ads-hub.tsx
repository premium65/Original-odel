import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, Target, CheckCircle, Check, ShoppingCart, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import type { Ad } from "@shared/schema";

type AdState = "ready" | "viewing" | "added" | "confirm" | "completing";

export default function AdsHubPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [adState, setAdState] = useState<AdState>("ready");

  const { data: ads = [], isLoading: adsLoading } = useQuery<Ad[]>({
    queryKey: ["/api/ads"],
  });

  const clickAdMutation = useMutation({
    mutationFn: async (adId: number) => {
      const res = await apiRequest("POST", `/api/ads/${adId}/click`);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Ad Completed!",
        description: `You earned LKR ${data.earned?.toFixed(2) || "0.00"}`,
      });
      setAdState("ready");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process ad click",
        variant: "destructive",
      });
      setAdState("ready");
    },
  });

  useEffect(() => {
    if (adState === "added") {
      const timer = setTimeout(() => {
        setAdState("confirm");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [adState]);

  if (authLoading || adsLoading) {
    return (
      <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 p-6">
        <Skeleton className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 mb-6" />
        <Skeleton className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
      </div>
    );
  }

  const userData = user as any || {};
  const totalAdsCompleted = userData.totalAdsCompleted || 0;
  const TOTAL_ADS_REQUIRED = 28;
  const milestoneAmount = parseFloat(userData.milestoneAmount || "0");
  const hasDeposit = userData.hasDeposit || false;

  // Deposit blocking - if negative balance and no deposit, block ad clicking
  const isDepositBlocked = milestoneAmount < 0 && !hasDeposit;

  const activeAds = ads.filter((ad: Ad) => ad.isActive);

  // Cycle through ads using modulo to allow continuous earning
  // If no ads are active, index is 0 (safe check below)
  const currentAdIndex = activeAds.length > 0 ? totalAdsCompleted % activeAds.length : 0;

  const currentAd = activeAds[currentAdIndex];

  // Only show "All Ads Completed" if there are genuinely NO active ads in the system
  const allAdsCompleted = activeAds.length === 0;

  const handleViewAd = () => {
    if (!currentAd || adState !== "ready") return;
    setAdState("viewing");
  };

  const handleAddToCart = () => {
    setAdState("added");
  };

  const handleCloseViewing = () => {
    setAdState("ready");
  };

  const handleConfirm = () => {
    if (!currentAd) return;
    setAdState("completing");
    clickAdMutation.mutate(currentAd.id);
  };

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/dashboard")}
            className="text-zinc-600 dark:text-zinc-400"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-orange-500">Ad's Hub</h1>
        </div>

        <Card className="bg-gradient-to-r from-orange-500 to-pink-500 border-0 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target className="w-5 h-5 text-white" />
              <span className="text-white font-bold text-lg">Click Ads to Earn Money</span>
            </div>
            <div className="flex justify-center gap-8 text-white/90">
              <div className="text-center">
                <p className="text-2xl font-bold">{totalAdsCompleted}</p>
                <p className="text-xs">Ads Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{Math.max(0, TOTAL_ADS_REQUIRED - totalAdsCompleted)}</p>
                <p className="text-xs">Remaining</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {isDepositBlocked ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-2 border-red-500 bg-white dark:bg-zinc-900">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-red-500 mb-2">Deposit Required</h2>
                <p className="text-zinc-500 dark:text-zinc-400 mb-4">
                  You must deposit to start clicking ads.<br />
                  Contact admin to make your deposit.
                </p>
                <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 mb-4">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Your Balance</p>
                  <p className="text-2xl font-bold text-red-500">{milestoneAmount.toLocaleString()} LKR</p>
                </div>
                <Button
                  onClick={() => setLocation("/contact")}
                  className="bg-orange-500 hover:bg-orange-600"
                  data-testid="button-contact-admin"
                >
                  Contact Admin
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : allAdsCompleted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-2 border-green-400 bg-white dark:bg-zinc-900">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-xl font-bold text-green-500 mb-2">All Ads Completed!</h2>
                <p className="text-zinc-500 dark:text-zinc-400">
                  You have completed all available ads. Check back later for more.
                </p>
                <Button
                  onClick={() => setLocation("/withdraw")}
                  className="mt-4 bg-green-500 hover:bg-green-600"
                  data-testid="button-go-withdraw"
                >
                  Go to Payouts
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : currentAd ? (
          <motion.div
            key={currentAd.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-pink-200 via-orange-100 to-yellow-100 dark:from-pink-900/40 dark:via-orange-900/30 dark:to-yellow-900/20 border-2 border-pink-300 dark:border-pink-700 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {String(currentAdIndex + 1).padStart(2, "0")}
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Duration: 10 Seconds
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {Number(currentAd.price).toFixed(2)} LKR
                  </p>
                  <span className="px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
                    Link/URL
                  </span>
                </div>

                {adState === "ready" && (
                  <Button
                    onClick={handleViewAd}
                    className="w-full bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white py-6"
                    data-testid="button-view-ad"
                  >
                    <Eye className="w-5 h-5 mr-2" />
                    View Ads
                  </Button>
                )}

                {adState === "added" && (
                  <div className="flex flex-col items-center justify-center py-6">
                    <div className="relative w-12 h-12">
                      <div className="absolute inset-0 border-4 border-zinc-300 dark:border-zinc-600 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                    <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
                      Verifying ad view...
                    </p>
                  </div>
                )}

                {adState === "confirm" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Button
                      onClick={handleConfirm}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6"
                      data-testid="button-confirm-ad"
                    >
                      <Check className="w-5 h-5 mr-2" />
                      Confirm
                    </Button>
                  </motion.div>
                )}

                {adState === "completing" && (
                  <div className="flex flex-col items-center justify-center py-6">
                    <div className="relative w-12 h-12">
                      <div className="absolute inset-0 border-4 border-zinc-300 dark:border-zinc-600 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-t-green-500 rounded-full animate-spin"></div>
                    </div>
                    <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
                      Completing ad...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="mt-4 text-center text-zinc-500 dark:text-zinc-400 text-sm">
              <p>Ad {currentAdIndex + 1} of {Math.min(activeAds.length, TOTAL_ADS_REQUIRED)}</p>
              <div className="mt-2 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden max-w-xs mx-auto">
                <div
                  className="h-full bg-gradient-to-r from-orange-400 to-pink-500 transition-all duration-500"
                  style={{ width: `${(totalAdsCompleted / TOTAL_ADS_REQUIRED) * 100}%` }}
                />
              </div>
            </div>
          </motion.div>
        ) : (
          <Card className="border-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-zinc-400" />
              </div>
              <h2 className="text-xl font-bold text-zinc-600 dark:text-zinc-300 mb-2">No Ads Available</h2>
              <p className="text-zinc-500 dark:text-zinc-400">
                There are no ads available at the moment. Please check back later.
              </p>
            </CardContent>
          </Card>
        )}
      </motion.div>

      <AnimatePresence>
        {adState === "viewing" && currentAd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={handleCloseViewing}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 z-10 bg-white/80 dark:bg-zinc-800/80"
                  onClick={handleCloseViewing}
                  data-testid="button-close-ad"
                >
                  <X className="w-5 h-5" />
                </Button>

                {currentAd.imageUrl && (
                  <div className="w-full h-64 bg-zinc-100 dark:bg-zinc-800">
                    <img
                      src={currentAd.imageUrl}
                      alt={currentAd.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="p-5">
                <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 mb-2">
                  {currentAd.title}
                </h2>

                {currentAd.description && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                    {currentAd.description}
                  </p>
                )}

                <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Cash on Delivery</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Easy Exchange & Refund Policy</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Island Wide Delivery</span>
                </div>

                <p className="text-2xl font-bold text-orange-500 mb-6">
                  LKR {(Number(currentAd.price) * 82.5).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>

                <Button
                  onClick={handleAddToCart}
                  className="w-full bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white py-6"
                  data-testid="button-add-to-cart"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
