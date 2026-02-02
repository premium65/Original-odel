import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, Crown, Star, Gift, Trophy, Lock, Check, Sparkles, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface VIPTier {
  id: string;
  name: string;
  minPoints: number;
  maxPoints: number;
  icon: any;
  color: string;
  bgGradient: string;
  rewards: string[];
  bonusPercent: number;
}

const VIP_TIERS: VIPTier[] = [
  {
    id: "bronze",
    name: "Bronze",
    minPoints: 0,
    maxPoints: 19,
    icon: Star,
    color: "#cd7f32",
    bgGradient: "from-[#cd7f32] to-[#8b5e3c]",
    rewards: ["Basic Access", "1% Commission Bonus"],
    bonusPercent: 1
  },
  {
    id: "silver",
    name: "Silver",
    minPoints: 20,
    maxPoints: 39,
    icon: Star,
    color: "#c0c0c0",
    bgGradient: "from-[#c0c0c0] to-[#808080]",
    rewards: ["Priority Support", "2% Commission Bonus", "Weekly Bonus"],
    bonusPercent: 2
  },
  {
    id: "gold",
    name: "Gold",
    minPoints: 40,
    maxPoints: 59,
    icon: Crown,
    color: "#ffd700",
    bgGradient: "from-[#ffd700] to-[#b8860b]",
    rewards: ["VIP Support", "5% Commission Bonus", "Daily Bonus", "Exclusive Events"],
    bonusPercent: 5
  },
  {
    id: "platinum",
    name: "Platinum",
    minPoints: 60,
    maxPoints: 79,
    icon: Trophy,
    color: "#e5e4e2",
    bgGradient: "from-[#e5e4e2] to-[#a9a9a9]",
    rewards: ["Priority Withdrawals", "8% Commission Bonus", "Daily Bonus x2", "VIP Events", "Special Gifts"],
    bonusPercent: 8
  },
  {
    id: "diamond",
    name: "Diamond",
    minPoints: 80,
    maxPoints: 100,
    icon: Gift,
    color: "#b9f2ff",
    bgGradient: "from-[#b9f2ff] to-[#00bfff]",
    rewards: ["Instant Withdrawals", "10% Commission Bonus", "Mega Daily Bonus", "Premium Events", "Luxury Gifts", "Personal Manager"],
    bonusPercent: 10
  }
];

export default function RewardsPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [claimingReward, setClaimingReward] = useState<string | null>(null);

  const userPoints = (user as any)?.points || 0;

  // Get user's current tier
  const getCurrentTier = () => {
    for (let i = VIP_TIERS.length - 1; i >= 0; i--) {
      if (userPoints >= VIP_TIERS[i].minPoints) {
        return VIP_TIERS[i];
      }
    }
    return VIP_TIERS[0];
  };

  const currentTier = getCurrentTier();
  const currentTierIndex = VIP_TIERS.findIndex(t => t.id === currentTier.id);

  // Calculate progress to next tier
  const getProgressToNextTier = () => {
    if (currentTierIndex >= VIP_TIERS.length - 1) return 100;
    const nextTier = VIP_TIERS[currentTierIndex + 1];
    const progressRange = nextTier.minPoints - currentTier.minPoints;
    const currentProgress = userPoints - currentTier.minPoints;
    return Math.min(100, (currentProgress / progressRange) * 100);
  };

  const handleClaimReward = async (tierId: string) => {
    const tier = VIP_TIERS.find(t => t.id === tierId);
    if (!tier) return;

    if (userPoints < tier.minPoints) {
      toast({
        title: "Not Eligible",
        description: `You need ${tier.minPoints} points to unlock ${tier.name} rewards.`,
        variant: "destructive"
      });
      return;
    }

    setClaimingReward(tierId);
    // Simulate claim process
    await new Promise(resolve => setTimeout(resolve, 1500));
    setClaimingReward(null);

    toast({
      title: "Rewards Claimed!",
      description: `You've claimed your ${tier.name} VIP rewards!`
    });
  };

  return (
    <div className="min-h-screen bg-[#0f1419] pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#0f1419]/95 backdrop-blur-sm border-b border-[#2a3a4d]">
        <div className="flex items-center justify-between px-4 py-4">
          <button onClick={() => setLocation("/dashboard")} className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1a2332]">
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <h1 className="text-lg font-bold text-white">VIP Rewards</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Points Display */}
      <div className="px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${currentTier.bgGradient}`}
        >
          <Sparkles className="absolute top-4 right-4 h-6 w-6 text-white/30" />
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <currentTier.icon className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-white/70 text-sm">Your VIP Status</p>
              <h2 className="text-2xl font-bold text-white">{currentTier.name}</h2>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between text-sm text-white/80 mb-2">
              <span>Points: {userPoints}/100</span>
              <span>{currentTier.bonusPercent}% Bonus Active</span>
            </div>
            <div className="h-3 bg-black/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${getProgressToNextTier()}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-white/80 rounded-full"
              />
            </div>
            {currentTierIndex < VIP_TIERS.length - 1 && (
              <p className="text-xs text-white/60 mt-2">
                {VIP_TIERS[currentTierIndex + 1].minPoints - userPoints} points to {VIP_TIERS[currentTierIndex + 1].name}
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* VIP Tiers */}
      <div className="px-4 space-y-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Crown className="h-5 w-5 text-[#f59e0b]" /> VIP Tiers
        </h3>

        {VIP_TIERS.map((tier, index) => {
          const isUnlocked = userPoints >= tier.minPoints;
          const isCurrent = tier.id === currentTier.id;

          return (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-2xl border overflow-hidden ${
                isCurrent
                  ? "border-[#f59e0b] bg-[#f59e0b]/10"
                  : isUnlocked
                  ? "border-[#2a3a4d] bg-[#1a2332]"
                  : "border-[#2a3a4d] bg-[#1a2332]/50"
              }`}
            >
              {isCurrent && (
                <div className="absolute top-0 right-0 bg-[#f59e0b] text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
                  CURRENT
                </div>
              )}

              <div className="p-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isUnlocked ? `bg-gradient-to-br ${tier.bgGradient}` : "bg-[#2a3a4d]"
                    }`}
                  >
                    {isUnlocked ? (
                      <tier.icon className="h-6 w-6 text-white" />
                    ) : (
                      <Lock className="h-5 w-5 text-[#6b7280]" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-semibold ${isUnlocked ? "text-white" : "text-[#6b7280]"}`}>
                        {tier.name}
                      </h4>
                      <span className={`text-sm ${isUnlocked ? "text-[#10b981]" : "text-[#6b7280]"}`}>
                        {tier.minPoints}+ pts
                      </span>
                    </div>

                    <p className={`text-sm ${isUnlocked ? "text-[#f59e0b]" : "text-[#6b7280]"}`}>
                      {tier.bonusPercent}% Commission Bonus
                    </p>

                    {/* Rewards List */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {tier.rewards.map((reward, i) => (
                        <span
                          key={i}
                          className={`text-xs px-2 py-1 rounded-full ${
                            isUnlocked
                              ? "bg-[#10b981]/20 text-[#10b981]"
                              : "bg-[#2a3a4d] text-[#6b7280]"
                          }`}
                        >
                          {isUnlocked ? <Check className="inline h-3 w-3 mr-1" /> : null}
                          {reward}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Claim Button */}
                {isUnlocked && (
                  <button
                    onClick={() => handleClaimReward(tier.id)}
                    disabled={claimingReward === tier.id}
                    className={`w-full mt-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                      isCurrent
                        ? "bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-black"
                        : "bg-[#2a3a4d] text-white hover:bg-[#374151]"
                    }`}
                  >
                    {claimingReward === tier.id ? (
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Gift className="h-4 w-4" />
                        Claim Rewards
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Info Section */}
      <div className="px-4 mt-8">
        <div className="bg-[#1a2332] rounded-2xl p-4 border border-[#2a3a4d]">
          <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#f59e0b]" /> How to Earn Points
          </h4>
          <ul className="text-sm text-[#9ca3af] space-y-2">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-[#10b981]" />
              Complete daily ad tasks
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-[#10b981]" />
              Refer friends to earn bonus points
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-[#10b981]" />
              Participate in special events
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-[#10b981]" />
              Admin can boost your points (up to 100)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
