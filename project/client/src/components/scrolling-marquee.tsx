export function ScrollingMarquee() {
    const text = "🔥 FLASH SALE HERE";
    const repeatedText = Array(20).fill(text).join("   >>>   ");

  return (
        <div className="relative z-10 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 py-3 overflow-hidden">
              <div className="flex animate-marquee whitespace-nowrap">
                      <span className="text-black font-bold text-sm md:text-base tracking-wide mx-4">
                        {repeatedText}
                      </span>span>
                      <span className="text-black font-bold text-sm md:text-base tracking-wide mx-4">
                        {repeatedText}
                      </span>span>
              </div>div>
              
              <style>{`
                      @keyframes marquee {
                                0% { transform: translateX(0); }
                                          100% { transform: translateX(-50%); }
                                                  }
                                                          .animate-marquee {
                                                                    animation: marquee 30s linear infinite;
                                                                            }
                                                                                    .animate-marquee:hover {
                                                                                              animation-play-state: paused;
                                                                                                      }
                                                                                                            `}</style>style>
        </div>div>
      );
}</div>
