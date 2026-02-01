import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, TrendingUp, Target, Gift, Clock, CheckCircle, Lock
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useLocation } from "wouter";

export default function ExclusivesPage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 p-6">
        <Skeleton className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const userData = user as any || {};
  const destinationAmount = Number(userData.destinationAmount || 0).toFixed(2);
  const milestoneAmount = Number(userData.milestoneAmount || 0).toFixed(2);
  const milestoneReward = Number(userData.milestoneReward || 0).toFixed(2);
  const ongoingMilestone = Number(userData.ongoingMilestone || 0).toFixed(2);
  const totalAds = userData.totalAdsCompleted || 0;
  
  const PAYOUT_UNLOCK_ADS = 28;
  const adsUntilPayout = Math.max(0, PAYOUT_UNLOCK_ADS - totalAds);
  const canWithdraw = totalAds >= PAYOUT_UNLOCK_ADS;
  const progressPercent = Math.min(100, (totalAds / PAYOUT_UNLOCK_ADS) * 100);

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900 rounded-xl p-4 mb-6 flex items-center gap-3 shadow-sm"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/dashboard")}
            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-orange-500">Features</h1>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-2 border-orange-400 bg-white dark:bg-zinc-900 h-full">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-zinc-700 dark:text-zinc-300">Destination Amount</h3>
                  <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-orange-500" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-orange-500 mb-1">LKR {destinationAmount}</p>
                <p className="text-xs text-zinc-500">Total earnings from ad clicks with 25,000 first-day bonus</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="border-2 border-green-400 bg-white dark:bg-zinc-900 h-full">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-zinc-700 dark:text-zinc-300">Milestone Amount</h3>
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                    <Target className="w-4 h-4 text-green-500" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-green-500 mb-1">LKR {milestoneAmount}</p>
                <p className="text-xs text-zinc-500">Available balance for withdrawal</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-2 border-blue-400 bg-white dark:bg-zinc-900 h-full">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="px-2 py-1 bg-blue-100 dark:bg-blue-500/20 rounded text-blue-600 dark:text-blue-400 text-sm font-medium">
                    Milestone Reward
                  </div>
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                    <Gift className="w-4 h-4 text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-zinc-800 dark:text-white mb-1">LKR {milestoneReward}</p>
                <p className="text-xs text-zinc-500">Bonus rewards earned from milestones</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="border-2 border-pink-400 bg-white dark:bg-zinc-900 h-full">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-zinc-700 dark:text-zinc-300">Ongoing Milestone</h3>
                  <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-500/20 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-pink-500" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-pink-500 mb-1">LKR {ongoingMilestone}</p>
                <p className="text-xs text-zinc-500">Current progress towards next milestone</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card className="border-2 border-cyan-400 bg-white dark:bg-zinc-900 h-full">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-zinc-700 dark:text-zinc-300">Ads Completed</h3>
                  <div className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-500/20 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-cyan-500" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mb-1">{totalAds}</p>
                <p className="text-xs text-zinc-500">Total ads clicked (need 28 to unlock withdrawal)</p>
                <div className="mt-2 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white dark:bg-zinc-900 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-zinc-500" />
                </div>
                <h3 className="font-bold text-zinc-800 dark:text-white text-lg">Withdrawal</h3>
              </div>

              <div className="flex items-center gap-2 text-zinc-500 text-sm mb-4">
                <Lock className="w-4 h-4" />
                <span>{adsUntilPayout} more ads needed to unlock</span>
              </div>

              <div className="relative h-10 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg overflow-hidden">
                <div 
                  className="absolute inset-0 bg-zinc-400 dark:bg-zinc-600 transition-all duration-500"
                  style={{ left: `${progressPercent}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {canWithdraw ? "Unlocked" : "Locked"}
                  </span>
                </div>
              </div>

              {canWithdraw && (
                <Button
                  className="w-full mt-4 bg-green-500 hover:bg-green-600"
                  onClick={() => setLocation("/withdraw")}
                  data-testid="button-withdraw"
                >
                  Request Withdrawal
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
