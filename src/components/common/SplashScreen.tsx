import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 1000); // Wait for exit animation
    }, 2500);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#ff5200] overflow-hidden"
        >
          {/* Animated Background Elements */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 180, 270, 360],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-24 -left-24 w-96 h-96 bg-[#ff7300] rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          />
          <motion.div
            animate={{
              scale: [1, 1.4, 1],
              rotate: [360, 270, 180, 90, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#ff9100] rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          />

          <div className="relative">
            {/* 3D Animated Logo Container */}
            <motion.div
              initial={{ scale: 0, rotateY: 0 }}
              animate={{ 
                scale: [0, 1.2, 1],
                rotateY: [0, 1080],
              }}
              transition={{ 
                scale: { duration: 1, ease: "backOut" },
                rotateY: { duration: 2, ease: "easeInOut", delay: 0.5 }
              }}
              style={{ perspective: 1000 }}
              className="mb-8"
            >
              <div className="w-28 h-28 bg-white rounded-3xl shadow-2xl flex items-center justify-center transform-gpu ring-4 ring-white/20">
                <motion.div 
                  animate={{ 
                    rotateZ: [0, 15, -15, 0],
                    y: [0, -10, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="text-5xl font-black text-[#ff5200]">G</span>
                </motion.div>
              </div>
            </motion.div>

            {/* Title with staggered letter animation */}
            <div className="flex justify-center">
              {"Geekhoot".split("").map((letter, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ 
                    delay: 0.8 + i * 0.1,
                    type: "spring",
                    stiffness: 100
                  }}
                  className="text-6xl md:text-8xl font-black text-white tracking-tighter drop-shadow-2xl"
                >
                  {letter}
                </motion.span>
              ))}
            </div>

            {/* Subtitle */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.8, duration: 0.5 }}
              className="mt-6 flex flex-col items-center"
            >
              <p className="text-white/90 text-center font-bold tracking-[0.25em] uppercase text-sm mb-2">
                Premium Custom Merch
              </p>
              <div className="h-0.5 w-12 bg-white/40 rounded-full" />
            </motion.div>
          </div>

          {/* Progress Bar Container */}
          <div className="absolute bottom-20 left-12 right-12 h-1.5 bg-black/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.4, ease: "linear" }}
            />
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute bottom-8 text-white/40 text-[10px] uppercase tracking-widest font-medium"
          >
            Built by WEBSINARO WB
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
