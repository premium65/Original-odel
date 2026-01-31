import { useAuth } from "@/hooks/use-auth";
import { useAds, useClickAd } from "@/hooks/use-ads";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Wallet, TrendingUp, CheckCircle, Clock, Play, Home, Settings, 
  LayoutGrid, CreditCard, HelpCircle, LogOut, ChevronRight, Zap,
  DollarSign, Eye, Gift, Star, ArrowRight, Gem, Target, CircleDollarSign, 
  Crown, Phone, PartyPopper, LucideIcon, Mail, MapPin, ChevronUp,
  Facebook, Twitter, Instagram, Youtube
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

const sidebarItems = [
  { icon: LayoutGrid, label: "Dashboard", path: "/" },
  { icon: Gem, label: "Exclusives", path: "/exclusives" },
  { icon: Target, label: "Ad's Hub", path: "/ads-hub" },
  { icon: Wallet, label: "Payouts", path: "/withdrawals" },
  { icon: Crown, label: "Status", path: "/status" },
  { icon: PartyPopper, label: "Events", path: "/events" },
  { icon: Phone, label: "Contact", path: "/contact" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export default function Dashboard() {
  const { user, isLoading: isUserLoading } = useAuth();
  const { data: ads, isLoading: isAdsLoading } = useAds();
  const { mutate: clickAd, isPending: isClicking } = useClickAd();
  const [activeSidebar, setActiveSidebar] = useState("/");
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Fetch site settings
  const { data: settings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
  });

  // Fetch slides
  const { data: slides } = useQuery<any[]>({
    queryKey: ["/api/slides"],
  });

  // Countdown timer state
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 1);
    endDate.setHours(23, 59, 59, 999);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endDate.getTime() - now;

      if (distance > 0) {
        setCountdown({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Slide rotation
  useEffect(() => {
    if (slides && slides.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [slides]);

  // Scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isUserLoading || isAdsLoading) {
    return (
      <div className="min-h-screen bg-black flex">
        <div className="hidden md:block w-20 bg-zinc-900" />
        <div className="flex-1 p-4 md:p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48 bg-zinc-800" />
            <Skeleton className="h-32 bg-zinc-800 rounded-2xl" />
            <Skeleton className="h-64 bg-zinc-800 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const userData = user as any || {};
  const firstName = userData.firstName || "User";
  const username = userData.username || userData.email?.split('@')[0] || "user";
  const status = userData.status || "active";
  const totalAds = userData.totalAdsCompleted || 0;
  const PAYOUT_UNLOCK_ADS = 28;
  const canRequestPayout = totalAds >= PAYOUT_UNLOCK_ADS;

  const marqueeText = settings?.marqueeText || "EARN MORE TODAY >>> CLICK ADS & WIN >>> RATING ADS >>> EARN MORE TODAY >>> CLICK ADS & WIN";
  const flashSaleTitle = settings?.flashSaleTitle || "Flash";
  const flashSaleSubtitle = settings?.flashSaleSubtitle || "Sale";
  const flashSaleDescription = settings?.flashSaleDescription || "Limited time offer - Don't miss out!";
  const eventTitle = settings?.eventTitle || "Event Space";
  const eventDescription = settings?.eventDescription || "Join exclusive events, webinars, and community gatherings.";
  const eventImage = settings?.eventImage || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800";
  const contactPhone = settings?.contactPhone || "+94 11 123 4567";
  const contactEmail = settings?.contactEmail || "support@odelads.com";
  const contactAddress = settings?.contactAddress || "123 Business Street, Colombo, Sri Lanka";
  const copyrightText = settings?.copyrightText || "Copyright 2026 ODEL-ADS. All rights reserved.";

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-xl border-t border-zinc-800/50 z-50 safe-area-pb">
        <nav className="flex justify-around items-center py-2 px-2">
          {sidebarItems.slice(0, 5)
            .filter(item => item.label !== "Payouts" || canRequestPayout)
            .map((item) => (
            <button
              key={item.label}
              onClick={() => {
                setActiveSidebar(item.path);
                setLocation(item.path);
              }}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                activeSidebar === item.path 
                  ? "text-orange-500" 
                  : "text-zinc-400"
              }`}
              data-testid={`nav-mobile-${item.label.toLowerCase().replace(' ', '-')}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Sidebar - Desktop Only */}
      <motion.aside 
        initial={{ width: 80 }}
        animate={{ width: sidebarExpanded ? 200 : 80 }}
        transition={{ duration: 0.3 }}
        className="hidden md:flex bg-zinc-900/50 backdrop-blur-xl border-r border-zinc-800/50 flex-col py-6 fixed h-full z-50"
      >
        <motion.button 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          onClick={() => setSidebarExpanded(!sidebarExpanded)}
          className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center mb-8 mx-auto cursor-pointer"
        >
          <span className="text-white font-bold text-lg">O</span>
        </motion.button>

        <nav className="flex-1 flex flex-col gap-2 px-3">
          {sidebarItems
            .filter(item => item.label !== "Payouts" || canRequestPayout)
            .map((item, i) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setActiveSidebar(item.path);
                setLocation(item.path);
              }}
              className={`h-12 rounded-xl flex items-center gap-3 transition-all ${
                sidebarExpanded ? "px-4" : "justify-center"
              } ${
                activeSidebar === item.path 
                  ? "bg-orange-500 text-white" 
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
              data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarExpanded && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm font-medium whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
            </motion.button>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-2 px-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className={`h-12 rounded-xl flex items-center gap-3 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-all ${
              sidebarExpanded ? "px-4" : "justify-center"
            }`}
            data-testid="button-logout"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarExpanded && (
              <span className="text-sm font-medium whitespace-nowrap">Sign Out</span>
            )}
          </motion.button>
          <div className={`flex items-center gap-3 ${sidebarExpanded ? "px-2" : "justify-center"}`}>
            <Avatar className="w-10 h-10 border-2 border-orange-500 flex-shrink-0">
              <AvatarImage src={userData.profileImageUrl} />
              <AvatarFallback className="bg-zinc-700 text-white text-sm">
                {firstName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {sidebarExpanded && (
              <span className="text-sm font-medium text-white truncate">{firstName}</span>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content - Scrollable */}
      <div className="min-h-screen pb-20 md:pb-0 ml-0 md:ml-20 transition-all duration-300"
        style={{ marginLeft: sidebarExpanded ? 200 : undefined }}
      >
        {/* Marquee Banner */}
        <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 py-2 overflow-hidden">
          <motion.div 
            animate={{ x: [0, -1000] }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            className="flex whitespace-nowrap"
          >
            <span className="text-white font-bold text-sm flex items-center gap-2">
              {marqueeText.split('>>>').map((text, i) => (
                <span key={i} className="flex items-center gap-2">
                  {text.trim()}
                  {i < marqueeText.split('>>>').length - 1 && (
                    <>
                      <span className="text-amber-200">&gt;&gt;&gt;</span>
                      <DollarSign className="w-4 h-4 text-yellow-300" />
                    </>
                  )}
                </span>
              ))}
              <span className="ml-8">{marqueeText}</span>
            </span>
          </motion.div>
        </div>

        <div className="p-4 md:p-6 space-y-6">
          {/* Header with Greeting and Category Pills */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-3xl md:text-4xl font-bold text-white" data-testid="text-welcome">
              Hi {firstName}!
            </h1>
            <div className="flex flex-wrap gap-2">
              {["Exclusives", "Ads Hub", "Rewards", "Events", "Promos", "Status"].map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => {
                    if (tab === "Exclusives") setLocation("/exclusives");
                    else if (tab === "Ads Hub") setLocation("/ads-hub");
                    else if (tab === "Events") setLocation("/events");
                    else if (tab === "Status") setLocation("/status");
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    i === 0 
                      ? "bg-zinc-800 text-white border border-zinc-600" 
                      : "bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-800"
                  }`}
                  data-testid={`tab-${tab.toLowerCase().replace(' ', '-')}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Two Column Layout - Stats + Video */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Left Column - Stats Cards */}
            <div className="space-y-4">
              {/* Balance Card */}
              <Card className="bg-zinc-800/50 border-zinc-700 rounded-2xl">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-orange-400" />
                    </div>
                    <span className="text-zinc-400 text-sm">Balance</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    LKR {parseFloat(userData.milestoneAmount || "0").toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-green-400">+{userData.milestoneReward || "0"}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Ads Progress Card */}
              <Card className="bg-zinc-800/50 border-zinc-700 rounded-2xl">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <Target className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-zinc-400 text-sm">Ads Progress</span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {totalAds}/{PAYOUT_UNLOCK_ADS}
                  </div>
                  <div className="w-full bg-zinc-700 rounded-full h-2 mt-3">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((totalAds / PAYOUT_UNLOCK_ADS) * 100, 100)}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Status Card */}
              <Card className="bg-zinc-800/50 border-zinc-700 rounded-2xl">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-zinc-400 text-sm block mb-1">Account Status</span>
                      <span className={`text-lg font-bold capitalize ${
                        status === 'active' ? 'text-green-400' : 
                        status === 'frozen' ? 'text-red-400' : 'text-yellow-400'
                      }`} data-testid="text-status">
                        {status}
                      </span>
                    </div>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      status === 'active' ? 'bg-green-500/20' : 
                      status === 'frozen' ? 'bg-red-500/20' : 'bg-yellow-500/20'
                    }`}>
                      <CheckCircle className={`w-6 h-6 ${
                        status === 'active' ? 'text-green-400' : 
                        status === 'frozen' ? 'text-red-400' : 'text-yellow-400'
                      }`} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Link href="/ads-hub">
                <Button className="w-full bg-orange-500 hover:bg-orange-600 h-12 text-base font-semibold rounded-xl" data-testid="button-see-all">
                  See all
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Right Column - Main Video */}
            <div className="md:col-span-2 relative">
              <Card className="bg-zinc-900 border-zinc-700 rounded-2xl overflow-hidden h-full">
                <CardContent className="p-0 relative h-full min-h-[320px]">
                  {/* LIVE Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <div className="bg-red-500 px-3 py-1 rounded-full flex items-center gap-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      <span className="text-white text-sm font-bold">LIVE</span>
                    </div>
                  </div>

                  {/* Stats Overlay - Top Right */}
                  <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <div className="bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-orange-400" />
                      <span className="text-white text-sm">{userData.points || 0}</span>
                    </div>
                    <div className="bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-400" />
                      <span className="text-white text-sm">{totalAds}</span>
                    </div>
                    <div className="bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="text-white text-sm">{userData.destinationAmount || 0}</span>
                    </div>
                  </div>

                  {/* Video */}
                  <video 
                    src={settings?.promoVideoUrl || "/videos/promo-video.mp4"}
                    autoPlay 
                    muted 
                    loop 
                    playsInline
                    className="w-full h-full min-h-[320px] object-cover"
                    data-testid="video-promo"
                  />

                  {/* Bottom Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                        <Play className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{settings?.promoTitle || "Watch & Earn"}</p>
                        <p className="text-zinc-400 text-sm">{settings?.promoSubtitle || "ODELADS"}</p>
                      </div>
                      <div className="text-zinc-400 text-sm">
                        {Math.floor(Math.random() * 3) + 1}:{Math.floor(Math.random() * 60).toString().padStart(2, '0')} / 3:02
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-zinc-700 rounded-full h-1 mt-3">
                      <div className="bg-orange-500 h-1 rounded-full" style={{ width: '45%' }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Featured Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: "Daily Rewards", image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400", badge: "Active" },
              { title: "Bonus Zone", image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=400", badge: "Hot" },
              { title: "VIP Promos", image: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400", badge: "New" },
              { title: "Exclusive Ads", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400", badge: "Premium" },
            ].map((card, i) => (
              <Card key={i} className="bg-zinc-900 border-zinc-700 rounded-2xl overflow-hidden group cursor-pointer hover:border-orange-500/50 transition-all">
                <CardContent className="p-0 relative">
                  <img 
                    src={card.image} 
                    alt={card.title}
                    className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <h4 className="text-white font-medium text-sm">{card.title}</h4>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">{card.badge}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Flash Sale Countdown */}
          <Card className="bg-zinc-900 border-orange-500/50 border-2 rounded-2xl">
            <CardContent className="p-6">
              <h2 className="text-3xl font-bold mb-2">
                <span className="text-white">{flashSaleTitle} </span>
                <span className="text-orange-500">{flashSaleSubtitle}</span>
              </h2>
              <p className="text-zinc-400 mb-6">{flashSaleDescription}</p>
              
              <div className="grid grid-cols-4 gap-4">
                {[
                  { value: countdown.days.toString().padStart(2, '0'), label: 'DAYS' },
                  { value: countdown.hours.toString().padStart(2, '0'), label: 'HOURS' },
                  { value: countdown.minutes.toString().padStart(2, '0'), label: 'MINUTES' },
                  { value: countdown.seconds.toString().padStart(2, '0'), label: 'SECONDS' },
                ].map((item, i) => (
                  <div key={i} className="text-center">
                    <div className="bg-zinc-800 rounded-lg py-4 px-2">
                      <span className="text-2xl md:text-4xl font-bold text-orange-500" data-testid={`countdown-${item.label.toLowerCase()}`}>
                        {item.value}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-2">{item.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Slides */}
          {slides && slides.length > 0 && (
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative rounded-2xl overflow-hidden"
                >
                  <img 
                    src={slides[currentSlide]?.imageUrl || eventImage} 
                    alt={slides[currentSlide]?.title || "Slide"}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
                  <div className="absolute bottom-6 left-6">
                    <h3 className="text-2xl font-bold text-white">{slides[currentSlide]?.title}</h3>
                    <p className="text-zinc-300">{slides[currentSlide]?.description}</p>
                    {slides[currentSlide]?.buttonText && (
                      <Button className="mt-4 bg-orange-500 hover:bg-orange-600" data-testid="button-slide-action">
                        {slides[currentSlide]?.buttonText}
                      </Button>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
              
              {slides.length > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        i === currentSlide ? "w-6 bg-orange-500" : "bg-zinc-600"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Event Space */}
          <Card className="bg-zinc-900 border-zinc-700 border-2 rounded-2xl overflow-hidden">
            <div className="relative h-64">
              <img 
                src={eventImage} 
                alt="Event Space"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
              <div className="absolute inset-0 p-6 flex flex-col justify-center">
                <h3 className="text-2xl font-bold text-white mb-2">{eventTitle}</h3>
                <p className="text-zinc-300 mb-4">{eventDescription}</p>
                <Button 
                  className="w-fit bg-orange-500 hover:bg-orange-600"
                  onClick={() => setLocation('/events')}
                  data-testid="button-explore-events"
                >
                  Explore Events
                </Button>
              </div>
            </div>
          </Card>

          {/* Newsletter Signup */}
          <Card className="bg-zinc-900 border-zinc-700 border-2 rounded-2xl">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-bold text-white mb-2">Sign up for Newsletter</h3>
              <p className="text-zinc-400 mb-4">Get the latest updates and offers</p>
              <div className="flex gap-2 max-w-md mx-auto">
                <Input 
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  data-testid="input-newsletter-email"
                />
                <Button className="bg-zinc-700 hover:bg-zinc-600 text-white" data-testid="button-subscribe">
                  Subscribe
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <footer className="pt-8 border-t border-zinc-800">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              {/* Customer Care */}
              <div>
                <h4 className="text-orange-500 font-bold mb-4">Customer Care</h4>
                <ul className="space-y-2 text-zinc-400">
                  <li><Link href="/refund" className="hover:text-white">Return & Refund</Link></li>
                  <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
                  <li><Link href="/payment" className="hover:text-white">Service Payment</Link></li>
                  <li><Link href="/faq" className="hover:text-white">FAQs</Link></li>
                </ul>
              </div>

              {/* Get To Know Us */}
              <div>
                <h4 className="text-orange-500 font-bold mb-4">Get To Know Us</h4>
                <ul className="space-y-2 text-zinc-400">
                  <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                  <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
                  <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                </ul>
                <div className="flex gap-3 mt-4">
                  <a href="#" className="w-8 h-8 rounded-full border border-zinc-600 flex items-center justify-center hover:border-white">
                    <Facebook className="w-4 h-4" />
                  </a>
                  <a href="#" className="w-8 h-8 rounded-full border border-zinc-600 flex items-center justify-center hover:border-white">
                    <Twitter className="w-4 h-4" />
                  </a>
                  <a href="#" className="w-8 h-8 rounded-full border border-zinc-600 flex items-center justify-center hover:border-white">
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a href="#" className="w-8 h-8 rounded-full border border-zinc-600 flex items-center justify-center hover:border-white">
                    <Youtube className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Let Us Help You */}
              <div>
                <h4 className="text-orange-500 font-bold mb-4">Let Us Help You</h4>
                <ul className="space-y-2 text-zinc-400">
                  <li><Link href="/settings" className="hover:text-white">My Account</Link></li>
                  <li><Link href="/withdrawals" className="hover:text-white">My Orders</Link></li>
                  <li><Link href="/terms" className="hover:text-white">Terms Of Use</Link></li>
                  <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                </ul>
              </div>

              {/* Contact Info */}
              <div>
                <h4 className="text-orange-500 font-bold mb-4">Contact Info</h4>
                <ul className="space-y-3 text-zinc-400">
                  <li className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-orange-500" />
                    <span>{contactPhone}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-orange-500" />
                    <span>{contactEmail}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-orange-500 mt-1" />
                    <span>{contactAddress}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="flex flex-wrap items-center justify-center gap-4 py-4 border-t border-zinc-800">
              <span className="text-zinc-400 text-sm">We Accept:</span>
              <div className="flex gap-2">
                <span className="bg-white text-black px-3 py-1 rounded text-sm font-bold">VISA</span>
                <span className="bg-white text-black px-3 py-1 rounded text-sm font-bold">MC</span>
                <span className="bg-white text-black px-3 py-1 rounded text-sm font-bold">AMEX</span>
              </div>
            </div>

            {/* Copyright */}
            <div className="text-center py-4 text-zinc-500 text-sm">
              {copyrightText}
            </div>
          </footer>
        </div>

        {/* Scroll to Top Button */}
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              onClick={scrollToTop}
              className="fixed bottom-6 right-6 w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center shadow-lg hover:bg-orange-600 z-50"
              data-testid="button-scroll-top"
            >
              <ChevronUp className="w-6 h-6 text-white" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
