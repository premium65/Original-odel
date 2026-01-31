import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, Star, Crown, CheckCircle, Clock, Shield, TrendingUp
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useLocation } from "wouter";

export default function StatusPage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 p-6">
        <Skeleton className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const userData = user as any || {};
  const points = userData.points || 0;
  const totalAds = userData.totalAdsCompleted || 0;
  const status = userData.status || "pending";
  const firstName = userData.firstName || "User";
  
  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    active: { bg: "bg-green-100 dark:bg-green-500/20", text: "text-green-600 dark:text-green-400", border: "border-green-400" },
    pending: { bg: "bg-yellow-100 dark:bg-yellow-500/20", text: "text-yellow-600 dark:text-yellow-400", border: "border-yellow-400" },
    frozen: { bg: "bg-red-100 dark:bg-red-500/20", text: "text-red-600 dark:text-red-400", border: "border-red-400" },
  };

  const currentStatus = statusColors[status] || statusColors.pending;

  const getStatusIcon = () => {
    switch (status) {
      case "active": return <CheckCircle className="w-6 h-6" />;
      case "frozen": return <Shield className="w-6 h-6" />;
      default: return <Clock className="w-6 h-6" />;
    }
  };

  const pointsLevel = points >= 80 ? "Gold" : points >= 50 ? "Silver" : points >= 20 ? "Bronze" : "Starter";
  const pointsProgress = Math.min(100, points);

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
          <h1 className="text-xl font-bold text-orange-500">Status</h1>
        </motion.div>

        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className={`border-2 ${currentStatus.border} bg-white dark:bg-zinc-900`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-zinc-700 dark:text-zinc-300 text-lg">Account Status</h3>
                  <div className={`w-12 h-12 rounded-full ${currentStatus.bg} flex items-center justify-center ${currentStatus.text}`}>
                    {getStatusIcon()}
                  </div>
                </div>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${currentStatus.bg} ${currentStatus.text} font-bold text-lg capitalize`}>
                  {status}
                </div>
                <p className="text-sm text-zinc-500 mt-3">
                  {status === "active" && "Your account is active. You can watch ads and earn money."}
                  {status === "pending" && "Your account is pending activation. Please wait for approval."}
                  {status === "frozen" && "Your account is frozen. Please contact support."}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-2 border-amber-400 bg-white dark:bg-zinc-900">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-zinc-700 dark:text-zinc-300 text-lg">Loyalty Points</h3>
                  <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                    <Star className="w-6 h-6 text-amber-500" />
                  </div>
                </div>
                
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold text-amber-500">{points}</span>
                  <span className="text-zinc-500">/ 100 points</span>
                </div>
                
                <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden mb-3">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${pointsProgress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-600"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-500" />
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">{pointsLevel} Level</span>
                  </div>
                  <span className="text-sm text-zinc-500">{100 - points} points to max</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-2 border-purple-400 bg-white dark:bg-zinc-900">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-zinc-700 dark:text-zinc-300 text-lg">Activity Stats</h3>
                  <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-500" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4">
                    <p className="text-2xl font-bold text-purple-500">{totalAds}</p>
                    <p className="text-sm text-zinc-500">Ads Completed</p>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4">
                    <p className="text-2xl font-bold text-purple-500">{Math.floor(totalAds / 7)}</p>
                    <p className="text-sm text-zinc-500">Weeks Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
