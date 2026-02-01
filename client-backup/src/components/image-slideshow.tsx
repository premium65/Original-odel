import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const slideshowImages = [
  "/attached_assets/slideshow/55c5b5ccf3e219ddaccf1bb2e5b821b9.jpg",
  "/attached_assets/slideshow/2447cbc9cfa1044cd6fe9f2c7a7633e1.jpg",
  "/attached_assets/slideshow/bbaabefc301f744d336818359bde421e.jpg",
  "/attached_assets/slideshow/download.png",
];

export function ImageSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const nextSlide = () => {
    setFade(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % slideshowImages.length);
      setFade(true);
    }, 300);
  };

  const prevSlide = () => {
    setFade(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + slideshowImages.length) % slideshowImages.length);
      setFade(true);
    }, 300);
  };

  const goToSlide = (index: number) => {
    setFade(false);
    setTimeout(() => {
      setCurrentIndex(index);
      setFade(true);
    }, 300);
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="relative group">
          {/* Main Image */}
          <div className="relative h-96 bg-gray-100 overflow-hidden">
            <img
              src={slideshowImages[currentIndex]}
              alt={`Slide ${currentIndex + 1}`}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                fade ? "opacity-100" : "opacity-0"
              }`}
              data-testid={`slideshow-image-${currentIndex}`}
            />
            
            {/* Navigation Arrows */}
            <Button
              variant="ghost"
              size="icon"
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              data-testid="button-prev-slide"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              data-testid="button-next-slide"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>

          {/* Dot Indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {slideshowImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-3 rounded-full transition-all ${
                  index === currentIndex
                    ? "w-8 bg-amber-500"
                    : "w-3 bg-white/60 hover:bg-white/90"
                }`}
                data-testid={`slide-indicator-${index}`}
              />
            ))}
          </div>

          {/* Slide Counter */}
          <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium">
            {currentIndex + 1} / {slideshowImages.length}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
