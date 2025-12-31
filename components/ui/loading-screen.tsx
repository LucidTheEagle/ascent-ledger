"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function LoadingScreen() {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    // FIX: z-[100] ensures it sits above everything, including floating navs
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ascent-black text-white">
      {/* RADAR CONTAINER */}
      <div className="relative h-32 w-32 md:h-48 md:w-48">
        
        {/* Radar Circles (Static Grid) */}
        <div className="absolute inset-0 rounded-full border border-ascent-blue/30" />
        <div className="absolute inset-4 rounded-full border border-ascent-blue/20" />
        <div className="absolute inset-10 rounded-full border border-ascent-blue/10" />
        
        {/* Crosshairs */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-full w-px bg-ascent-blue/20" />
          <div className="w-full h-px absolute bg-ascent-blue/20" />
        </div>

        {/* THE SWEEP (Scanning Animation) */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(59, 130, 246, 0.4) 360deg)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 2, ease: "linear", repeat: Infinity }}
        />

        {/* Blip (Found Clarity) */}
        <motion.div
          className="absolute top-8 right-8 h-2 w-2 rounded-full bg-ascent-red shadow-[0_0_10px_#ef4444]"
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, times: [0, 0.1, 1], repeat: Infinity }}
        />
      </div>

      {/* TEXT */}
      <div className="mt-8 font-mono text-ascent-gray text-sm tracking-widest uppercase">
        System Ascent{dots}
      </div>
    </div>
  );
}