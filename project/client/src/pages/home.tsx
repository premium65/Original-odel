import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Users, Shield, TrendingUp, ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { useState, useEffect } from "react";
import heroImage from "@assets/login-hero.png";

// Default slideshow if none set
const defaultSlides = [
  {
    id: 1,
    title: "Welcome to Rating-Ads",
    description: "Earn money by watching ads",
    imageUrl: heroImage,
    buttonText: "Get Started",
    linkUrl: "/register",
    isActive: true,
  },
];

// Slideshow component
function HeroSlideshow({ slides }: { slides: any[] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const items = slides.length > 0 ? slides : defaultSlides;

  useEffect(() => {
    if (!isPlaying || items.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying, items.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % items.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + items.length) % items.length);
  const currentItem = items[currentSlide];

  return (
    <section className="relative z-10 min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-500"
        style={{ backgroundImage: `url(${currentItem.imageUrl || heroImage})` }}
      />
      <div className="absolute inset-0 bg-black/55" />

      {/* Content */}
      <div className="relative text-center max-w-3xl mx-auto px-4 py-20">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4 text-white drop-shadow-lg">
          {currentItem.title || "Welcome to Rating - Ads"}
        </h1>
        {currentItem.description && (
          <p className="text-xl md:text-2xl text-white/80 mb-8">{currentItem.description}</p>
        )}
        {currentItem.buttonText && (
          <Link href={currentItem.linkUrl || "/register"}>
            <Button size="lg" className="bg-amber-500 text-black hover:bg-amber-600 text-lg px-8">
              {currentItem.buttonText}
            </Button>
          </Link>
        )}
      </div>

      {/* Navigation Arrows */}
      {items.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Play/Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          {/* Dots */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-3 rounded-full transition-all ${
                  index === currentSlide ? "w-8 bg-amber-500" : "w-3 bg-white/50"
                }`}
              />
            ))}
          </div>

          {/* Counter */}
          <div className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded-full text-white text-sm">
            {currentSlide + 1} / {items.length}
          </div>
        </>
      )}
    </section>
  );
}

export default function Home() {
  // Load settings from API
  const { data: settings } = useQuery({
    queryKey: ["/api/public/settings"],
    queryFn: async () => {
      const res = await fetch("/api/public/settings");
      if (!res.ok) return null;
      return res.json();
    },
    staleTime: 0, // Always fetch fresh
    refetchOnWindowFocus: true,
  });

  // Extract data from settings
  const slideshow = settings?.slideshow || [];
  const branding = settings?.branding?.find((b: any) => b.type === "branding")?.data || {};
  const content = settings?.content?.find((c: any) => c.type === "home")?.data || {};

  // Site name from branding or default
  const siteName = branding.siteName || "Rating - Ads";
  const heroTitle = content.heroTitle || `Welcome to ${siteName}`;
  const heroSubtitle = content.heroSubtitle || "";

  return (
    <div className="min-h-screen relative">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/85 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Star className="h-6 w-6 text-amber-500" />
              <span className="text-xl font-bold text-white">{siteName}</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#features" className="text-amber-500 hover:text-amber-400 font-bold text-sm uppercase transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-amber-500 hover:text-amber-400 font-bold text-sm uppercase transition-colors">
                How It Works
              </a>
              <Link href="/login">
                <Button variant="ghost" className="text-amber-500 hover:text-amber-400">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-amber-500 text-black hover:bg-amber-600">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Slideshow */}
      <HeroSlideshow slides={slideshow} />

      {/* Features Section */}
      <section id="features" className="relative z-20 py-16 bg-black/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-amber-500">
            {content.featuresTitle || `Why Choose ${siteName}?`}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-[#1a1a2e] border-gray-700">
              <CardHeader>
                <Users className="h-12 w-12 text-amber-500 mb-4" />
                <CardTitle className="text-white">{content.feature1Title || "Trusted Community"}</CardTitle>
                <CardDescription className="text-gray-400">
                  {content.feature1Desc || "All accounts are verified and approved to ensure a safe and trustworthy environment"}
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-[#1a1a2e] border-gray-700">
              <CardHeader>
                <Shield className="h-12 w-12 text-amber-500 mb-4" />
                <CardTitle className="text-white">{content.feature2Title || "Secure Platform"}</CardTitle>
                <CardDescription className="text-gray-400">
                  {content.feature2Desc || "Your data is protected with industry-standard security measures and admin oversight"}
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-[#1a1a2e] border-gray-700">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-amber-500 mb-4" />
                <CardTitle className="text-white">{content.feature3Title || "Build Reputation"}</CardTitle>
                <CardDescription className="text-gray-400">
                  {content.feature3Desc || "Earn ratings and reviews to establish credibility within the community"}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-20 py-16 bg-black/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-amber-500">
            {content.howItWorksTitle || "How It Works"}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-500 text-black rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">{content.step1Title || "Register"}</h3>
              <p className="text-gray-400">
                {content.step1Desc || "Create your account with basic information. Your account will be reviewed for approval."}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-500 text-black rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">{content.step2Title || "Get Approved"}</h3>
              <p className="text-gray-400">
                {content.step2Desc || "Admin reviews your registration to ensure platform safety and quality."}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-500 text-black rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">{content.step3Title || "Start Earning"}</h3>
              <p className="text-gray-400">
                {content.step3Desc || "Once approved, start watching ads and earning rewards with the community."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-20 border-t border-white/10 py-8 mt-16 bg-black/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white/60">
            <p>&copy; {new Date().getFullYear()} {siteName}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
