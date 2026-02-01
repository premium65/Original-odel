import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const odelImages = [
  "/attached_assets/odel/55c5b5ccf3e219ddaccf1bb2e5b821b9.jpg",
  "/attached_assets/odel/2447cbc9cfa1044cd6fe9f2c7a7633e1.jpg",
  "/attached_assets/odel/bbaabefc301f744d336818359bde421e.jpg",
  "/attached_assets/odel/download.png",
];

export function OdelSlideshow() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentImageIndex((prev) => (prev + 1) % odelImages.length);
        setFade(true);
      }, 300);
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 shadow-2xl" data-testid="odel-slideshow">
      <Card className="overflow-hidden border-2 border-amber-500/50">
        <CardHeader className="pb-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-bold text-amber-600 dark:text-amber-400">
              About ODEL
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsVisible(false)}
              data-testid="button-close-odel"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {/* Image Slideshow */}
          <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={odelImages[currentImageIndex]}
              alt={`ODEL ${currentImageIndex + 1}`}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                fade ? "opacity-100" : "opacity-0"
              }`}
              data-testid={`odel-image-${currentImageIndex}`}
            />
            {/* Slide indicators */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1.5">
              {odelImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentImageIndex
                      ? "w-6 bg-amber-500"
                      : "w-2 bg-white/50 hover:bg-white/80"
                  }`}
                  data-testid={`odel-indicator-${index}`}
                />
              ))}
            </div>
          </div>

          {/* ODEL Information */}
          <div className="text-sm space-y-2">
            <p className="text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">ODEL</span> can refer to two things.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              It may mean <span className="font-semibold text-foreground">Open Distance and e-Learning</span>, 
              a modern education model that allows students to learn remotely using digital platforms.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              It can also refer to <span className="font-semibold text-foreground">ODEL Sri Lanka</span>, 
              a leading fashion and lifestyle retailer.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
