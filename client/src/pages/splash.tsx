import { motion } from "framer-motion";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function SplashPage() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLocation("/welcome");
    }, 3000);
    return () => clearTimeout(timer);
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden">
      <div className="relative">
        {/* Animated rings */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.5, 1.2], opacity: [0, 0.3, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-40 h-40 rounded-full border-2 border-orange-500/30" />
        </motion.div>
        
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.8, 1.5], opacity: [0, 0.2, 0] }}
          transition={{ duration: 2, delay: 0.3, repeat: Infinity, repeatDelay: 1 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-48 h-48 rounded-full border border-orange-500/20" />
        </motion.div>

        {/* Logo container */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          className="relative z-10"
        >
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-2xl shadow-orange-500/30">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-white text-5xl font-bold"
            >
              O
            </motion.span>
          </div>
        </motion.div>

        {/* Brand name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8"
        >
          <h1 className="text-white text-3xl font-bold tracking-wider">ODEL</h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-orange-500 text-sm font-medium mt-1"
          >
            ADS
          </motion.p>
        </motion.div>

        {/* Loading indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="flex justify-center mt-12"
        >
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                className="w-2 h-2 rounded-full bg-orange-500"
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
