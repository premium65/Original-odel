import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { User } from "@shared/schema";
import { Star, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import backgroundImage from "@assets/image_1763836186015.png";

export default function PointsPage() {
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

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* Dark overlay for better text visibility */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Navigation */}
      <nav className="border-b bg-black/30 relative z-10">
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
                <a href="/withdraw" className="text-amber-500 hover:text-amber-400 font-bold text-sm uppercase transition-colors" data-testid="nav-withdraw">WITHDRAW</a>
                <a href="/wallet" className="text-amber-500 hover:text-amber-400 font-bold text-sm uppercase transition-colors" data-testid="nav-wallet">WALLET</a>
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

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4">
        {/* Points Title */}
        <div className="mb-16">
          <h1 className="text-9xl font-black text-white tracking-wider" style={{ textShadow: '3px 3px 8px rgba(0,0,0,0.8), 0 0 30px rgba(247,147,30,0.3)' }}>
            POINTS
          </h1>
        </div>

        {/* Decorative pattern/logo area */}
        <div className="mb-12">
          <div className="w-80 h-20 bg-white/5 rounded-lg flex items-center justify-center backdrop-blur-md border-2 border-amber-500/30">
            <div className="text-amber-500/90 text-xl font-mono tracking-widest">
              ╔══════════════╗
            </div>
          </div>
        </div>

        {/* Points Display - Center focal point */}
        <div className="relative">
          {/* Decorative rocks/pedestals */}
          <div className="flex items-end justify-center gap-8 mb-8">
            <div className="w-32 h-40 bg-gradient-to-b from-amber-600/20 to-amber-800/30 clip-polygon backdrop-blur-sm border border-amber-500/20" 
                 style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)' }}></div>
            
            {/* Center pedestal with points value */}
            <div className="relative">
              <div className="w-48 h-32 bg-gradient-to-b from-amber-900/40 to-amber-950/60 rounded-t-full flex items-center justify-center backdrop-blur-md border-2 border-amber-500/40">
                <div className="text-8xl font-black text-amber-400" data-testid="text-points-value" style={{ textShadow: '0 0 20px rgba(247,147,30,0.8), 3px 3px 6px rgba(0,0,0,0.9)' }}>
                  {currentUser.points}
                </div>
              </div>
            </div>
            
            <div className="w-32 h-40 bg-gradient-to-b from-amber-600/20 to-amber-800/30 clip-polygon backdrop-blur-sm border border-amber-500/20" 
                 style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)' }}></div>
          </div>
        </div>

        {/* Odel branding in corner */}
        <div className="absolute top-24 right-8">
          <div className="text-right">
            <div className="text-4xl font-black text-white mb-2" style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.7)' }}>Odel</div>
            <div className="h-16 w-48 bg-white/5 backdrop-blur-md border-2 border-amber-500/30 rounded flex items-center justify-center">
              <div className="text-amber-500/70 text-sm font-mono">
                |||||||||||||||||||||||||||
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
