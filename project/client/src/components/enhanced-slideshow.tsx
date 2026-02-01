import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";

const slideshowItems = [
  { src: "/attached_assets/slideshow/a_stylish_fashion_ad.png", title: "RATING ADS", subtitle: "THE STAGE IS SET" },
  { src: "/attached_assets/slideshow/a_stylish_fashion_hh.png", title: "RATING ADS", subtitle: "THE STAGE IS SET" },
  { src: "/attached_assets/slideshow/photo_1_2025-11-22_17-56-03.jpg", title: "FASHION", subtitle: "Save the Date" },
  { src: "/attached_assets/slideshow/photo_2_2025-11-22_17-56-03.jpg", title: "NEW COLLECTION", subtitle: "Shop Now" },
  { src: "/attached_assets/slideshow/photo_3_2025-11-22_17-56-03.jpg", title: "DENIM", subtitle: "BE COOL BE AWESOME" },
  { src: "/attached_assets/slideshow/photo_4_2025-11-22_17-56-03.jpg", title: "FASHION WEEK", subtitle: "SPECIAL COLLECTION" },
  { src: "/attached_assets/slideshow/photo_5_2025-11-22_17-56-24.jpg", title: "LA CONIC", subtitle: "NEW COLLECTION" },
];

export function EnhancedSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => nextSlide(), 5000);
    return () => clearInterval(interval);
  }, [currentIndex, isPlaying]);

  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % slideshowItems.length);
      setIsTransitioning(false);
    }, 500);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + slideshowItems.length) % slideshowItems.length);
      setIsTransitioning(false);
    }, 500);
  };

  const currentSlide = slideshowItems[currentIndex];

  return (
    <Card className="overflow-hidden bg-transparent border-0 shadow-2xl shadow-amber-500/10">
      <CardContent className="p-0">
        <div className="relative group">
          <div className="relative h-[450px] md:h-[500px] overflow-hidden rounded-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60 z-10"></div>
            
            <img
              src={currentSlide.src}
              alt={currentSlide.title}
              className={`w-full h-full object-cover transition-all duration-500 ${
                isTransitioning ? "scale-110 opacity-0" : "scale-100 opacity-100"
              }`}
            />

            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <div className={`text-center transition-all duration-700 ${isTransitioning ? 'opacity-0 translate-y-10' : 'opacity-100 translate-y-0'}`}>
                <h2 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-lg">{currentSlide.title}</h2>
                <p className="text-xl md:text-3xl text-amber-400 font-bold">{currentSlide.subtitle}</p>
                <Button className="mt-6 bg-amber-500 hover:bg-amber-600 text-black font-bold px-8 py-3 text-lg rounded-full shadow-lg hover:scale-105 transition-transform">
                  Shop Now
                </Button>
              </div>
            </div>

            <Button variant="ghost" size="icon" onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-amber-500 text-white h-12 w-12 rounded-full opacity-0 group-hover:opacity-100 transition-all">
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="icon" onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-amber-500 text-white h-12 w-12 rounded-full opacity-0 group-hover:opacity-100 transition-all">
              <ChevronRight className="h-6 w-6" />
            </Button>

            <div className="absolute top-4 right-4 z-30 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" onClick={() => setIsPlaying(!isPlaying)}
                className="bg-black/50 hover:bg-black/70 text-white h-10 w-10 rounded-full">
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            </div>

            <div className="absolute top-4 left-4 z-30 bg-amber-500 text-black px-4 py-2 rounded-full text-sm font-bold">
              {currentIndex + 1} / {slideshowItems.length}
            </div>
          </div>

          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 z-30">
            {slideshowItems.map((_, index) => (
              <button key={index} onClick={() => setCurrentIndex(index)}
                className={`h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "w-10 bg-amber-500 shadow-lg" : "w-3 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
