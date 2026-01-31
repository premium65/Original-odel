import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import type { User } from "@shared/schema";
import { Star, LogOut, TrendingUp, Target, Award, Clock, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function WalletPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: currentUser, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    toast({ title: "Logged out successfully" });
    setLocation("/");
  };

  if (userLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  if (!currentUser) {
    setLocation("/login");
    return null;
  }

  const destinationAmount = parseFloat(currentUser.destinationAmount || "0");
  const milestoneAmount = parseFloat(currentUser.milestoneAmount || "0");
  const milestoneReward = parseFloat(currentUser.milestoneReward || "0");
  const ongoingMilestone = parseFloat(currentUser.ongoingMilestone || "0");
  const points = currentUser.points || 0;

  return (
    <div className="min-h-screen bg-background">
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
                <a href="#" className="text-amber-500 hover:text-amber-400 font-bold text-sm uppercase transition-colors" data-testid="nav-rooms">ROOMS</a>
                <a href="#" className="text-amber-500 hover:text-amber-400 font-bold text-sm uppercase transition-colors" data-testid="nav-event">EVENT SPACE</a>
                <a href="/features" className="text-amber-500 hover:text-amber-400 font-bold text-sm uppercase transition-colors" data-testid="nav-features">FEATURES</a>
                <a href="/rating" className="text-amber-500 hover:text-amber-400 font-bold text-sm uppercase transition-colors" data-testid="nav-rating">ADS</a>
                <a href="/withdraw" className="text-amber-500 hover:text-amber-400 font-bold text-sm uppercase transition-colors" data-testid="nav-withdraw">WITHDRAW</a>
                <a href="/wallet" className="text-amber-500 hover:text-amber-400 font-bold text-sm uppercase transition-colors" data-testid="nav-wallet">WALLET</a>
                <a href="/points" className="text-amber-500 hover:text-amber-400 font-bold text-sm uppercase transition-colors" data-testid="nav-point">POINT</a>
                <a href="#" className="text-amber-500 hover:text-amber-400 font-bold text-sm uppercase transition-colors" data-testid="nav-contact">CONTACT US</a>
              </div>
              <Button variant="ghost" onClick={handleLogout} className="text-amber-500 hover:text-amber-400" data-testid="button-logout">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-3xl font-bold" style={{ color: '#f7931e' }}>
            Wallet & Financial Tracking
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Destination Amount */}
          <Card className="border-2" style={{ borderColor: '#f7931e' }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Destination Amount</CardTitle>
                <div className="p-2 rounded-full" style={{ backgroundColor: '#f7931e' }}>
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" style={{ color: '#f7931e' }}>
                LKR {destinationAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Total earnings from ad clicks with 25,000 first-day bonus
              </p>
            </CardContent>
          </Card>

          {/* Milestone Amount */}
          <Card className="border-2" style={{ borderColor: '#22c55e' }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Milestone Amount</CardTitle>
                <div className="p-2 rounded-full" style={{ backgroundColor: '#22c55e' }}>
                  <Target className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" style={{ color: '#22c55e' }}>
                LKR {milestoneAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Available balance for withdrawal
              </p>
            </CardContent>
          </Card>

          {/* Milestone Reward */}
          <Card className="border-2" style={{ borderColor: '#3b82f6' }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Milestone Reward</CardTitle>
                <div className="p-2 rounded-full" style={{ backgroundColor: '#3b82f6' }}>
                  <Award className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" style={{ color: '#3b82f6' }}>
                LKR {milestoneReward.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Bonus rewards earned from milestones
              </p>
            </CardContent>
          </Card>

          {/* Ongoing Milestone */}
          <Card className="border-2" style={{ borderColor: '#ec4899' }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Ongoing Milestone</CardTitle>
                <div className="p-2 rounded-full" style={{ backgroundColor: '#ec4899' }}>
                  <Clock className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" style={{ color: '#ec4899' }}>
                LKR {ongoingMilestone.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Current progress towards next milestone
              </p>
            </CardContent>
          </Card>

          {/* Points */}
          <Card className="border-2" style={{ borderColor: '#a78bfa' }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Points</CardTitle>
                <div className="p-2 rounded-full" style={{ backgroundColor: '#a78bfa' }}>
                  <Star className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" style={{ color: '#a78bfa' }}>
                {points}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Loyalty points (max 100)
              </p>
              <Button 
                variant="outline"
                className="w-full mt-4"
                onClick={() => setLocation('/points')}
                data-testid="button-view-points"
              >
                View Points Details
              </Button>
            </CardContent>
          </Card>

          {/* Ads Completed */}
          <Card className="border-2" style={{ borderColor: '#06b6d4' }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Ads Completed</CardTitle>
                <div className="p-2 rounded-full" style={{ backgroundColor: '#06b6d4' }}>
                  <Award className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" style={{ color: '#06b6d4' }}>
                {currentUser.totalAdsCompleted || 0}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Total ads clicked (need 28 to unlock withdrawal)
              </p>
              <div className="w-full bg-muted rounded-full h-2 mt-4">
                <div 
                  className="h-2 rounded-full transition-all"
                  style={{ 
                    width: `${Math.min(100, ((currentUser.totalAdsCompleted || 0) / 28) * 100)}%`,
                    backgroundColor: '#06b6d4'
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Card */}
        <Card className="mt-6 border-2" style={{ borderColor: '#f7931e' }}>
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-muted-foreground">Total Earned:</span>
              <span className="font-semibold text-lg" style={{ color: '#f7931e' }}>
                LKR {(destinationAmount + milestoneAmount + milestoneReward + ongoingMilestone).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-muted-foreground">Available for Withdrawal:</span>
              <span className="font-semibold text-lg" style={{ color: '#22c55e' }}>
                LKR {milestoneAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Withdrawal Status:</span>
              <span className="font-semibold text-lg">
                {(currentUser.totalAdsCompleted || 0) >= 28 ? (
                  <span style={{ color: '#22c55e' }}>✓ Unlocked</span>
                ) : (
                  <span style={{ color: '#ef4444' }}>Locked ({28 - (currentUser.totalAdsCompleted || 0)} ads needed)</span>
                )}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
