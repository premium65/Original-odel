import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PartyPopper, Calendar, Gift, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useLocation } from "wouter";

export default function EventsPage() {
  const { isLoading } = useAuth();
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
          <h1 className="text-xl font-bold text-orange-500">Events</h1>
        </div>

        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 border-0 mb-6">
          <CardContent className="p-4 text-center">
            <PartyPopper className="w-8 h-8 text-white mx-auto mb-2" />
            <p className="text-white font-bold text-lg">Special Events & Promotions</p>
            <p className="text-white/80 text-sm">Don't miss out on exciting rewards!</p>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-2 border-purple-400 bg-white dark:bg-zinc-900">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                    <Gift className="w-6 h-6 text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-zinc-800 dark:text-zinc-100">
                      Welcome Bonus
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      Get LKR 25,000 bonus on your first day!
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 text-xs font-semibold rounded-full">
                    Active
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="border-2 border-orange-400 bg-white dark:bg-zinc-900">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-zinc-800 dark:text-zinc-100">
                      Daily Rewards
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      Complete ads daily to earn milestone rewards
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 text-xs font-semibold rounded-full">
                    Active
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-2 border-blue-400 bg-white dark:bg-zinc-900">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-zinc-800 dark:text-zinc-100">
                      Weekly Bonus
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      Extra rewards for active users every week
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-xs font-semibold rounded-full">
                    Coming Soon
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
