import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Zap } from "lucide-react";

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ days: 1, hours: 17, minutes: 45, seconds: 30 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, minutes, seconds } = prev;
        if (seconds > 0) seconds--;
        else if (minutes > 0) { minutes--; seconds = 59; }
        else if (hours > 0) { hours--; minutes = 59; seconds = 59; }
        else if (days > 0) { days--; hours = 23; minutes = 59; seconds = 59; }
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="bg-black text-white text-2xl md:text-4xl font-bold px-4 md:px-6 py-3 md:py-4 rounded-lg min-w-[60px] md:min-w-[80px] text-center shadow-lg">
        {value.toString().padStart(2, "0")}
      </div>
      <span className="text-gray-400 text-xs md:text-sm mt-2 uppercase tracking-wider">{label}</span>
    </div>
  );

  return (
    <Card className="mt-6 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-yellow-500/10 border-amber-500/30 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Zap className="h-10 w-10 text-amber-500 animate-pulse" />
            <div>
              <h3 className="text-2xl md:text-3xl font-black">
                <span className="text-white">Flash</span> <span className="text-amber-500">Sale</span>
              </h3>
              <p className="text-gray-400 text-sm">Limited time offers!</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <TimeBlock value={timeLeft.days} label="Days" />
            <span className="text-amber-500 text-3xl font-bold pb-6">:</span>
            <TimeBlock value={timeLeft.hours} label="Hours" />
            <span className="text-amber-500 text-3xl font-bold pb-6">:</span>
            <TimeBlock value={timeLeft.minutes} label="Minutes" />
            <span className="text-amber-500 text-3xl font-bold pb-6">:</span>
            <TimeBlock value={timeLeft.seconds} label="Seconds" />
          </div>
          <button className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-8 py-3 rounded-full transition-all hover:scale-105 shadow-lg shadow-amber-500/30">
            Shop Now →
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
