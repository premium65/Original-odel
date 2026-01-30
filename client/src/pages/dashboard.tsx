import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, LogOut, Clock, CheckCircle2, XCircle, ChevronUp, ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useEffect, useRef } from "react";
import type { User, Rating } from "@shared/schema";

const dashboardBgStyle = "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)";

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
function AnimatedSection({ 
  children, 
  className = "", 
  animation = "fade-up",
  delay = 0 
}: { 
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

// Media Slideshow Component with Images and Videos
function MediaSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Slideshow media items with fashion images
  const mediaItems = [
    {
      type: "image",
      src: "https://raw.githubusercontent.com/premium65/GameSitePro/main/client/public/slide-fashion-male.png",
      title: "RATING ADS",
      description: "The Stage Is Set - Start Earning Today"
    },
    {
      type: "image",
      src: "https://raw.githubusercontent.com/premium65/GameSitePro/main/client/public/slide-fashion-female.png",
      title: "RATING ADS",
      description: "The Stage Is Set - Join Our Community"
    },
    {
      type: "image",
      src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      title: "Track Your Progress",
      description: "Monitor your earnings in real-time"
    },
    {
      type: "image",
      src: "https://images.unsplash.com/photo-1553729459-efe14b2e940e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      title: "Withdraw Easily",
      description: "Fast and secure withdrawals to your bank"
    }
  ];

  useEffect(() => {
    if (!isPlaying || mediaItems[currentSlide].type === "video" && isVideoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % mediaItems.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlaying, currentSlide, isVideoPlaying, mediaItems.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    if (videoRef.current) {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % mediaItems.length);
    if (videoRef.current) {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    }
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
    if (videoRef.current) {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    }
  };

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const currentMedia = mediaItems[currentSlide];

  return (
    <Card className="overflow-hidden">
      <div className="relative h-[400px] bg-gray-900">
        {/* Media Content */}
        <div className="absolute inset-0">
          {currentMedia.type === "image" ? (
            <img
              src={currentMedia.src}
              alt={currentMedia.title}
              className="w-full h-full object-cover transition-opacity duration-500"
            />
          ) : (
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                src={currentMedia.src}
                poster={currentMedia.poster}
                className="w-full h-full object-cover"
                onEnded={() => {
                  setIsVideoPlaying(false);
                  nextSlide();
                }}
              />
              <button
                onClick={toggleVideo}
                className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
              >
                {isVideoPlaying ? (
                  <Pause className="w-16 h-16 text-white opacity-80" />
                ) : (
                  <Play className="w-16 h-16 text-white opacity-80" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Overlay with text */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h3 className="text-2xl font-bold mb-2 animate-fade-in-up">{currentMedia.title}</h3>
          <p className="text-white/80">{currentMedia.description}</p>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Slide Counter */}
        <div className="absolute top-4 right-4 bg-black/50 px-3 py-1 rounded-full text-white text-sm">
          {currentSlide + 1} / {mediaItems.length}
        </div>

        {/* Play/Pause Button */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="absolute top-4 left-4 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        {/* Dots Navigation */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2">
          {mediaItems.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? "bg-amber-500 w-8" 
                  : "bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [scrolled, setScrolled] = useState(false);

  // Handle navbar scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { data: currentUser, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  const { data: myRatings, isLoading: ratingsLoading } = useQuery<Rating[]>({
    queryKey: ["/api/ratings/my"],
  });

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    toast({ title: "Logged out successfully" });
    setLocation("/");
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!currentUser) {
    setLocation("/login");
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "frozen":
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" => {
    switch (status) {
      case "active":
        return "default";
      case "pending":
        return "secondary";
      case "frozen":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden" style={{ background: dashboardBgStyle }}>
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-black/50 pointer-events-none z-0" />

      {/* Navigation - Fixed with scroll effect */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-black/95 backdrop-blur-md shadow-lg" : "bg-black/85"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 group">
              <Star className="h-6 w-6 text-amber-500 group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-xl font-bold text-white">Rating - Ads</span>
            </div>
            <div className="flex items-center gap-8">
              <div className="hidden md:flex gap-6">
                <a href="/dashboard" className="text-amber-500 hover:text-amber-400 font-bold text-sm uppercase transition-all duration-300 hover:scale-105" data-testid="nav-home">HOME</a>
                <a href="/features" className="text-amber-500 hover:text-amber-400 font-bold text-sm uppercase transition-all duration-300 hover:scale-105" data-testid="nav-features">FEATURES</a>
                <a href="/rating" className="text-amber-500 hover:text-amber-400 font-bold text-sm uppercase transition-all duration-300 hover:scale-105" data-testid="nav-rating">ADS</a>
                <a href="/withdraw" className="text-amber-500 hover:text-amber-400 font-bold text-sm uppercase transition-all duration-300 hover:scale-105" data-testid="nav-withdraw">WITHDRAW</a>
                <a href="/points" className="text-amber-500 hover:text-amber-400 font-bold text-sm uppercase transition-all duration-300 hover:scale-105" data-testid="nav-point">POINT</a>
                <a href="#event-space" className="text-amber-500 hover:text-amber-400 font-bold text-sm uppercase transition-all duration-300 hover:scale-105" data-testid="nav-event">EVENT SPACE</a>
                <a href="#" className="text-amber-500 hover:text-amber-400 font-bold text-sm uppercase transition-all duration-300 hover:scale-105" data-testid="nav-contact">CONTACT US</a>
              </div>
              <Button 
                variant="ghost" 
                onClick={handleLogout} 
                className="text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 transition-all duration-300"
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 relative z-10">
        {/* Account Status Banner */}
        <AnimatedSection animation="fade-up">
          <Card className="mb-6 hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">Welcome, {currentUser.fullName}</CardTitle>
                  <CardDescription>@{currentUser.username}</CardDescription>
                </div>
                <Badge 
                  variant={getStatusVariant(currentUser.status)} 
                  className="gap-1 px-4 py-2 text-sm animate-pulse"
                  data-testid={`badge-status-${currentUser.status}`}
                >
                  {getStatusIcon(currentUser.status)}
                  {currentUser.status.charAt(0).toUpperCase() + currentUser.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            {currentUser.status === "pending" && (
              <CardContent>
                <div className="bg-muted p-4 rounded-md">
                  <p className="text-sm text-muted-foreground">
                    Your account is pending admin approval. You'll be able to submit ratings once your account is activated.
                  </p>
                </div>
              </CardContent>
            )}
            {currentUser.status === "frozen" && (
              <CardContent>
                <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-md">
                  <p className="text-sm text-destructive">
                    Your account has been frozen. Please contact support for more information.
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </AnimatedSection>

        {/* Media Slideshow */}
        <AnimatedSection animation="zoom-in" delay={200}>
          <MediaSlideshow />
        </AnimatedSection>

        {/* Stats Section */}
        <AnimatedSection animation="fade-up" delay={300}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
              <CardHeader className="pb-2">
                <CardDescription>Total Ratings</CardDescription>
                <CardTitle className="text-3xl text-amber-500 group-hover:scale-105 transition-transform">
                  {myRatings?.length || 0}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
              <CardHeader className="pb-2">
                <CardDescription>Account Status</CardDescription>
                <CardTitle className="text-3xl text-green-500 group-hover:scale-105 transition-transform capitalize">
                  {currentUser.status}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
              <CardHeader className="pb-2">
                <CardDescription>Member Since</CardDescription>
                <CardTitle className="text-xl text-blue-500 group-hover:scale-105 transition-transform">
                  {new Date(currentUser.createdAt).toLocaleDateString()}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        </AnimatedSection>

        {/* My Ratings */}
        <AnimatedSection animation="fade-up" delay={400}>
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>My Ratings</CardTitle>
              <CardDescription>Ratings you've submitted</CardDescription>
            </CardHeader>
            <CardContent>
              {ratingsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
                </div>
              ) : !myRatings || myRatings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Star className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="text-sm">You haven't submitted any ratings yet.</p>
                  <Button className="mt-4 bg-amber-500 hover:bg-amber-600" onClick={() => setLocation("/rating")}>
                    Start Rating
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {myRatings.map((rating, index) => (
                    <AnimatedSection key={rating.id} animation="fade-left" delay={index * 100}>
                      <div 
                        className="p-4 border rounded-md hover:bg-muted/50 transition-all duration-300 hover:shadow-md"
                        data-testid={`rating-${rating.id}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium" data-testid={`text-rated-user-${rating.id}`}>
                            @{rating.targetUsername}
                          </span>
                          <div className="flex">
                            {Array.from({ length: rating.rating }).map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
                            ))}
                          </div>
                        </div>
                        {rating.comment && (
                          <p className="text-sm text-muted-foreground">{rating.comment}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
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
            <Card className="overflow-hidden">
              <div 
                className="h-64 bg-cover bg-center relative"
                style={{
                  backgroundImage: "url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')"
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
                <div className="absolute inset-0 flex items-center p-8">
                  <div className="text-white">
                    <h2 className="text-3xl font-bold mb-2">Event Space</h2>
                    <p className="text-white/80 max-w-md">
                      Join exclusive events, webinars, and community gatherings. Stay connected with our growing community.
                    </p>
                    <Button className="mt-4 bg-amber-500 hover:bg-amber-600 transition-all duration-300 hover:scale-105">
                      Explore Events
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </AnimatedSection>
        </section>

        {/* Footer */}
        <AnimatedSection animation="fade-up" delay={600}>
          <div className="mt-12 text-center text-white/60 text-sm pb-8">
            <p>© 2024 Rating-Ads. All rights reserved.</p>
          </div>
        </AnimatedSection>
      </div>

      {/* Scroll to top button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-8 right-8 w-12 h-12 bg-amber-500 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:bg-amber-600 hover:scale-110 z-50 ${
          scrolled ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        }`}
      >
        <ChevronUp className="w-6 h-6" />
      </button>
    </div>
  );
}
