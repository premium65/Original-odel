import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Star, LogOut, Clock, CheckCircle2, XCircle, ChevronUp, ChevronLeft, ChevronRight, Play, Pause, Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useEffect, useRef } from "react";
import type { User, Rating } from "@shared/schema";

// Custom hook for scroll animations
function useScrollAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

// Animated section wrapper component
function AnimatedSection({ children, className = "", animation = "fade-up", delay = 0 }: {
  children: React.ReactNode;
  className?: string;
  animation?: "fade-up" | "fade-left" | "fade-right" | "zoom-in" | "fade";
  delay?: number;
}) {
  const { ref, isVisible } = useScrollAnimation();

  const animationClasses = {
    "fade-up": "translate-y-10 opacity-0",
    "fade-left": "translate-x-10 opacity-0",
    "fade-right": "-translate-x-10 opacity-0",
    "zoom-in": "scale-95 opacity-0",
    "fade": "opacity-0"
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className} ${
        isVisible ? "translate-y-0 translate-x-0 scale-100 opacity-100" : animationClasses[animation]
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// Interface for slideshow items from API
interface SlideshowItem {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  linkUrl: string | null;
  buttonText: string | null;
  order: number;
  isActive: boolean;
}

// Interface for site settings
interface SiteColors {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  text_color: string;
  nav_bg_color: string;
  footer_bg_color: string;
  card_bg_color: string;
  button_color: string;
  button_hover_color: string;
  marquee_bg_color: string;
  marquee_text_color: string;
}

const defaultColors: SiteColors = {
  primary_color: "#f59e0b",
  secondary_color: "#1a1a2e",
  accent_color: "#16213e",
  text_color: "#ffffff",
  nav_bg_color: "#000000",
  footer_bg_color: "#111827",
  card_bg_color: "#1f2937",
  button_color: "#f59e0b",
  button_hover_color: "#d97706",
  marquee_bg_color: "#f59e0b",
  marquee_text_color: "#000000",
};

// Default slideshow items (fallback if no items in database)
const defaultSlideshowItems = [
  {
    id: "1",
    title: "WELCOME TO RATING-ADS",
    description: "Earn money by watching ads",
    imageUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200",
    buttonText: "START EARNING",
    linkUrl: "/rating",
    order: 1,
    isActive: true,
  },
];

// Scrolling Marquee Banner Component
function MarqueeBanner({ colors }: { colors: SiteColors }) {
  return (
    <div className="overflow-hidden py-2" style={{ backgroundColor: colors.marquee_bg_color }}>
      <div className="animate-marquee whitespace-nowrap flex">
        {[...Array(10)].map((_, i) => (
          <span key={i} className="mx-4 font-bold text-sm flex items-center" style={{ color: colors.marquee_text_color }}>
            🔥 EARN MORE TODAY <ChevronRight className="w-4 h-4 mx-1" /><ChevronRight className="w-4 h-4 -ml-2" />
            💰 CLICK ADS & WIN <ChevronRight className="w-4 h-4 mx-1" /><ChevronRight className="w-4 h-4 -ml-2" />
            ⭐ RATING ADS PRO <ChevronRight className="w-4 h-4 mx-1" /><ChevronRight className="w-4 h-4 -ml-2" />
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
}

// Countdown Timer Component
function CountdownTimer({ colors }: { colors: SiteColors }) {
  const [timeLeft, setTimeLeft] = useState({ days: 1, hours: 23, minutes: 59, seconds: 59 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { days, hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              hours = 23;
              if (days > 0) {
                days--;
              }
            }
          }
        }
        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const TimeBox = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="px-3 py-2 rounded font-bold text-2xl min-w-[60px] text-center" style={{ backgroundColor: colors.nav_bg_color, color: colors.primary_color }}>
        {String(value).padStart(2, '0')}
      </div>
      <span className="text-xs mt-1 uppercase" style={{ color: colors.text_color, opacity: 0.6 }}>{label}</span>
    </div>
  );

  return (
    <div className="flex items-center gap-2">
      <TimeBox value={timeLeft.days} label="Days" />
      <span className="text-2xl font-bold" style={{ color: colors.primary_color }}>:</span>
      <TimeBox value={timeLeft.hours} label="Hours" />
      <span className="text-2xl font-bold" style={{ color: colors.primary_color }}>:</span>
      <TimeBox value={timeLeft.minutes} label="Minutes" />
      <span className="text-2xl font-bold" style={{ color: colors.primary_color }}>:</span>
      <TimeBox value={timeLeft.seconds} label="Seconds" />
    </div>
  );
}

// Media Slideshow Component
function MediaSlideshow({ slideshowItems, colors }: { slideshowItems: SlideshowItem[]; colors: SiteColors }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const items = slideshowItems.length > 0 ? slideshowItems : defaultSlideshowItems;

  useEffect(() => {
    if (!isPlaying || items.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % items.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying, items.length]);

  const goToSlide = (index: number) => setCurrentSlide(index);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % items.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + items.length) % items.length);

  const currentItem = items[currentSlide];

  return (
    <Card className="overflow-hidden" style={{ backgroundColor: colors.card_bg_color }}>
      <div className="relative h-[400px]" style={{ backgroundColor: colors.secondary_color }}>
        <div className="absolute inset-0">
          <img
            src={currentItem.imageUrl}
            alt={currentItem.title}
            className="w-full h-full object-cover transition-opacity duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200";
            }}
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6" style={{ color: colors.text_color }}>
          <h3 className="text-2xl font-bold mb-2">{currentItem.title}</h3>
          <p style={{ opacity: 0.8 }}>{currentItem.description}</p>
          {currentItem.buttonText && (
            <Button className="mt-4 font-bold" style={{ backgroundColor: colors.button_color, color: colors.marquee_text_color }}>
              {currentItem.buttonText}
            </Button>
          )}
        </div>

        {items.length > 1 && (
          <>
            <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110" style={{ color: colors.text_color }}>
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110" style={{ color: colors.text_color }}>
              <ChevronRight className="w-6 h-6" />
            </button>

            <div className="absolute top-4 right-4 bg-black/50 px-3 py-1 rounded-full text-sm" style={{ color: colors.text_color }}>
              {currentSlide + 1} / {items.length}
            </div>

            <button onClick={() => setIsPlaying(!isPlaying)} className="absolute top-4 left-4 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors" style={{ color: colors.text_color }}>
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2">
              {items.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className="h-3 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: index === currentSlide ? colors.primary_color : "rgba(255,255,255,0.5)",
                    width: index === currentSlide ? "2rem" : "0.75rem",
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

// Footer Component
function Footer({ colors }: { colors: SiteColors }) {
  return (
    <footer style={{ backgroundColor: colors.footer_bg_color }}>
      <div className="py-8" style={{ backgroundColor: colors.primary_color }}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-xl" style={{ color: colors.marquee_text_color }}>Sign up for Newsletter</h3>
            <p className="text-sm" style={{ color: colors.marquee_text_color, opacity: 0.7 }}>Get the latest updates and offers</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Input type="email" placeholder="Enter your email address" className="bg-white border-none min-w-[300px]" />
            <Button style={{ backgroundColor: colors.nav_bg_color, color: colors.text_color }}>Subscribe</Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-bold text-lg mb-4" style={{ color: colors.text_color }}>Customer Care</h4>
            <ul className="space-y-2">
              {["Return & Refund", "Contact Us", "Service Payment", "FAQs"].map((item) => (
                <li key={item}>
                  <a href="#" className="transition-colors hover:opacity-80" style={{ color: colors.text_color, opacity: 0.6 }}>{item}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4" style={{ color: colors.text_color }}>Get To Know Us</h4>
            <ul className="space-y-2">
              {["About Us", "Careers", "Blog"].map((item) => (
                <li key={item}>
                  <a href="#" className="transition-colors hover:opacity-80" style={{ color: colors.text_color, opacity: 0.6 }}>{item}</a>
                </li>
              ))}
            </ul>
            <div className="flex gap-3 mt-4">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110" style={{ backgroundColor: colors.card_bg_color, color: colors.text_color }}>
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4" style={{ color: colors.text_color }}>Let Us Help You</h4>
            <ul className="space-y-2">
              {["My Account", "My Orders", "Terms Of Use", "Privacy Policy"].map((item) => (
                <li key={item}>
                  <a href="#" className="transition-colors hover:opacity-80" style={{ color: colors.text_color, opacity: 0.6 }}>{item}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4" style={{ color: colors.text_color }}>Contact Info</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2" style={{ color: colors.text_color, opacity: 0.6 }}>
                <Phone className="w-4 h-4" style={{ color: colors.primary_color }} />
                <span>+94 11 123 4567</span>
              </li>
              <li className="flex items-center gap-2" style={{ color: colors.text_color, opacity: 0.6 }}>
                <Mail className="w-4 h-4" style={{ color: colors.primary_color }} />
                <span>support@ratingads.com</span>
              </li>
              <li className="flex items-start gap-2" style={{ color: colors.text_color, opacity: 0.6 }}>
                <MapPin className="w-4 h-4 mt-1" style={{ color: colors.primary_color }} />
                <span>123 Business Street, Colombo, Sri Lanka</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t" style={{ borderColor: colors.card_bg_color }}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm" style={{ color: colors.text_color, opacity: 0.6 }}>We Accept:</span>
              <div className="flex gap-2">
                {["VISA", "MC", "AMEX"].map((card) => (
                  <div key={card} className="bg-white rounded px-2 py-1">
                    <span className="font-bold text-sm" style={{ color: card === "VISA" ? "#1a1f71" : card === "MC" ? "#eb001b" : "#006fcf" }}>{card}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-sm" style={{ color: colors.text_color, opacity: 0.6 }}>
              Copyright ©{new Date().getFullYear()} Rating-Ads. All rights reserved
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch current user
  const { data: currentUser, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  // Fetch user ratings
  const { data: myRatings, isLoading: ratingsLoading } = useQuery<Rating[]>({
    queryKey: ["/api/ratings/my"],
  });

  // FIXED: Fetch slideshow items from API with fresh data
  const { data: slideshowItems } = useQuery<SlideshowItem[]>({
    queryKey: ["/api/slideshow"],
    queryFn: async () => {
      const res = await fetch("/api/slideshow", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 0, // Always fetch fresh
    refetchOnWindowFocus: true,
  });

  // FIXED: Fetch site settings (colors) with fresh data
  const { data: siteSettings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings", { credentials: "include" });
      if (!res.ok) return {};
      return res.json();
    },
    staleTime: 0, // Always fetch fresh
    refetchOnWindowFocus: true,
  });

  // Merge settings with defaults
  const colors: SiteColors = {
    ...defaultColors,
    ...(siteSettings || {}),
  } as SiteColors;

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    toast({ title: "Logged out successfully" });
    setLocation("/");
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${colors.secondary_color} 0%, ${colors.accent_color} 100%)` }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: colors.primary_color }}></div>
      </div>
    );
  }

  if (!currentUser) {
    setLocation("/login");
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle2 className="h-4 w-4" />;
      case "pending": return <Clock className="h-4 w-4" />;
      case "frozen": return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" => {
    switch (status) {
      case "active": return "default";
      case "pending": return "secondary";
      case "frozen": return "destructive";
      default: return "secondary";
    }
  };

  const dashboardBgStyle = `linear-gradient(135deg, ${colors.secondary_color} 0%, ${colors.accent_color} 100%)`;

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: dashboardBgStyle }}>
      <div className="fixed inset-0 bg-black/50 pointer-events-none z-0" />

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "shadow-lg" : ""}`} style={{ backgroundColor: scrolled ? colors.nav_bg_color : `${colors.nav_bg_color}dd` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 group">
              <Star className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" style={{ color: colors.primary_color }} />
              <span className="text-xl font-bold" style={{ color: colors.text_color }}>Rating - Ads</span>
            </div>
            <div className="flex items-center gap-8">
              <div className="hidden md:flex gap-6">
                {[
                  { href: "/dashboard", label: "HOME" },
                  { href: "/features", label: "FEATURES" },
                  { href: "/rating", label: "ADS" },
                  { href: "/withdraw", label: "WITHDRAW" },
                  { href: "/points", label: "POINT" },
                  { href: "#event-space", label: "EVENT SPACE" },
                  { href: "#contact", label: "CONTACT US" },
                ].map((item) => (
                  <a key={item.label} href={item.href} className="font-bold text-sm uppercase transition-all duration-300 hover:scale-105" style={{ color: colors.primary_color }}>
                    {item.label}
                  </a>
                ))}
              </div>
              <Button variant="ghost" onClick={handleLogout} className="transition-all duration-300" style={{ color: colors.primary_color }}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Marquee Banner */}
      <div className="pt-16">
        <MarqueeBanner colors={colors} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Welcome Card with Countdown */}
        <AnimatedSection animation="fade-up">
          <Card className="mb-6" style={{ backgroundColor: colors.card_bg_color }}>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl" style={{ color: colors.text_color }}>Welcome, {currentUser.fullName}</CardTitle>
                  <CardDescription style={{ color: colors.text_color, opacity: 0.6 }}>@{currentUser.username}</CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={getStatusVariant(currentUser.status)} className="gap-1 px-4 py-2 text-sm animate-pulse">
                    {getStatusIcon(currentUser.status)}
                    {currentUser.status.charAt(0).toUpperCase() + currentUser.status.slice(1)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
          </Card>
        </AnimatedSection>

        {/* Flash Sale Section */}
        <AnimatedSection animation="fade-up" delay={100}>
          <Card className="mb-6 border" style={{ backgroundColor: colors.card_bg_color, borderColor: `${colors.primary_color}50` }}>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold">
                    <span style={{ color: colors.text_color }}>Flash</span>{" "}
                    <span style={{ color: colors.primary_color }}>Sale</span>
                  </h2>
                  <p className="mt-1" style={{ color: colors.text_color, opacity: 0.6 }}>Limited time offer - Don't miss out!</p>
                </div>
                <CountdownTimer colors={colors} />
              </div>
            </CardHeader>
          </Card>
        </AnimatedSection>

        {/* Media Slideshow - LOADS FROM API */}
        <AnimatedSection animation="zoom-in" delay={200}>
          <MediaSlideshow slideshowItems={slideshowItems || []} colors={colors} />
        </AnimatedSection>

        {/* Stats Section */}
        <AnimatedSection animation="fade-up" delay={300}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group" style={{ backgroundColor: colors.card_bg_color }}>
              <CardHeader className="pb-2">
                <CardDescription style={{ color: colors.text_color, opacity: 0.6 }}>Total Ratings</CardDescription>
                <CardTitle className="text-3xl group-hover:scale-105 transition-transform" style={{ color: colors.primary_color }}>
                  {myRatings?.length || 0}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group" style={{ backgroundColor: colors.card_bg_color }}>
              <CardHeader className="pb-2">
                <CardDescription style={{ color: colors.text_color, opacity: 0.6 }}>Account Status</CardDescription>
                <CardTitle className="text-3xl group-hover:scale-105 transition-transform capitalize" style={{ color: "#22c55e" }}>
                  {currentUser.status}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group" style={{ backgroundColor: colors.card_bg_color }}>
              <CardHeader className="pb-2">
                <CardDescription style={{ color: colors.text_color, opacity: 0.6 }}>Member Since</CardDescription>
                <CardTitle className="text-xl group-hover:scale-105 transition-transform" style={{ color: "#3b82f6" }}>
                  {new Date(currentUser.createdAt).toLocaleDateString()}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        </AnimatedSection>

        {/* My Ratings */}
        <AnimatedSection animation="fade-up" delay={400}>
          <Card className="mt-6" style={{ backgroundColor: colors.card_bg_color }}>
            <CardHeader>
              <CardTitle style={{ color: colors.text_color }}>My Ratings</CardTitle>
              <CardDescription style={{ color: colors.text_color, opacity: 0.6 }}>Ratings you've submitted</CardDescription>
            </CardHeader>
            <CardContent>
              {ratingsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2" style={{ borderColor: colors.primary_color }}></div>
                </div>
              ) : !myRatings || myRatings.length === 0 ? (
                <div className="text-center py-8" style={{ color: colors.text_color, opacity: 0.6 }}>
                  <Star className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="text-sm">You haven't submitted any ratings yet.</p>
                  <Button className="mt-4" style={{ backgroundColor: colors.button_color, color: colors.marquee_text_color }} onClick={() => setLocation("/rating")}>
                    Start Rating
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {myRatings.map((rating, index) => (
                    <AnimatedSection key={rating.id} animation="fade-left" delay={index * 100}>
                      <div className="p-4 border rounded-md hover:shadow-md transition-all duration-300" style={{ borderColor: colors.card_bg_color }}>
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium" style={{ color: colors.text_color }}>@{rating.targetUsername}</span>
                          <div className="flex">
                            {Array.from({ length: rating.rating }).map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
                            ))}
                          </div>
                        </div>
                        {rating.comment && (
                          <p className="text-sm" style={{ color: colors.text_color, opacity: 0.6 }}>{rating.comment}</p>
                        )}
                        <p className="text-xs mt-2" style={{ color: colors.text_color, opacity: 0.4 }}>
                          {new Date(rating.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </AnimatedSection>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </AnimatedSection>

        {/* Event Space Section */}
        <section id="event-space" className="mt-12 scroll-mt-20">
          <AnimatedSection animation="fade-up" delay={500}>
            <Card className="overflow-hidden" style={{ backgroundColor: colors.card_bg_color }}>
              <div className="h-64 bg-cover bg-center relative" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')" }}>
                <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${colors.nav_bg_color}cc, transparent)` }} />
                <div className="absolute inset-0 flex items-center p-8">
                  <div style={{ color: colors.text_color }}>
                    <h2 className="text-3xl font-bold mb-2">Event Space</h2>
                    <p style={{ opacity: 0.8, maxWidth: "400px" }}>
                      Join exclusive events, webinars, and community gatherings.
                    </p>
                    <Button className="mt-4 transition-all duration-300 hover:scale-105" style={{ backgroundColor: colors.button_color, color: colors.marquee_text_color }}>
                      Explore Events
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </AnimatedSection>
        </section>
      </div>

      {/* Footer */}
      <Footer colors={colors} />

      {/* Scroll to top button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-8 right-8 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 z-50 ${
          scrolled ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        }`}
        style={{ backgroundColor: colors.button_color, color: colors.text_color }}
      >
        <ChevronUp className="w-6 h-6" />
      </button>
    </div>
  );
}
