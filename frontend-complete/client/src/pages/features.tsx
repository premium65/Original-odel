import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import type { User } from "@shared/schema";
import { Star, LogOut, TrendingUp, Target, Award, Clock, Lock, CheckCircle2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function FeaturesPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Fetch current user to get financial data
  const { data: currentUser, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    toast({ title: "Logged out successfully" });
    setLocation("/");
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading financial data...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Please log in to view features</p>
      </div>
    );
  }

  const destinationAmount = parseFloat(currentUser.destinationAmount || "0");
  const milestoneAmount = parseFloat(currentUser.milestoneAmount || "0");
  const milestoneReward = parseFloat(currentUser.milestoneReward || "0");
  const ongoingMilestone = parseFloat(currentUser.ongoingMilestone || "0");
  const points = currentUser.points || 0;
  const adsCompleted = currentUser?.totalAdsCompleted || 0;
  const hasCompletedMinimumAds = adsCompleted >= 28;

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
        <div className="flex items-center gap-4 mb-8 bg-card border rounded-lg p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/dashboard')}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold" style={{ color: '#f7931e' }}>
            Features
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
                {adsCompleted}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Total ads clicked (need 28 to unlock withdrawal)
              </p>
              <div className="w-full bg-muted rounded-full h-2 mt-4">
                <div 
                  className="h-2 rounded-full transition-all"
                  style={{ 
                    width: `${Math.min(100, (adsCompleted / 28) * 100)}%`,
                    backgroundColor: '#06b6d4'
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Withdrawal Feature */}
          <Card className="border-2 lg:col-span-3" style={{ borderColor: hasCompletedMinimumAds ? '#f7931e' : '#666' }}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div 
                  className="p-3 rounded-full"
                  style={{ backgroundColor: hasCompletedMinimumAds ? '#f7931e' : '#444' }}
                >
                  <Award className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Withdrawal</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {!hasCompletedMinimumAds && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-3">
                    <Lock className="h-4 w-4" />
                    <span>{28 - adsCompleted} more ads needed to unlock</span>
                  </div>
                )}

                {hasCompletedMinimumAds && (
                  <div className="flex items-center gap-2 text-sm mt-3" style={{ color: '#f7931e' }}>
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="font-semibold">Withdrawal Available!</span>
                  </div>
                )}
              </div>

              <Button
                className="w-full"
                style={{ 
                  backgroundColor: hasCompletedMinimumAds ? '#f7931e' : '#666',
                  color: 'white'
                }}
                disabled={!hasCompletedMinimumAds}
                onClick={() => setLocation('/withdraw')}
                data-testid="button-withdraw"
              >
                {hasCompletedMinimumAds ? 'Withdraw Funds' : 'Locked'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
