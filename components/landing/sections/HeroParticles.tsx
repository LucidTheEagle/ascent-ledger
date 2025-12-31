"use client";

import React, { useEffect, useState } from "react";
import { BackgroundLines } from "@/components/ui/background-lines";
import { Particles } from "@/components/ui/particle";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function HeroParticles() {
  const prefersReducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  // Handle Resize Logic for Particle Count
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobile();

    // Listener
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Determine count: 0 if reduced motion, 40 if mobile, 80 if desktop
  const particleCount = prefersReducedMotion ? 0 : isMobile ? 40 : 80;

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* LAYERED BACKGROUNDS */}
      <BackgroundLines className="absolute inset-0 w-full h-full">
        <div className="absolute inset-0 bg-ascent-black/70" />
      </BackgroundLines>
      
      {/* PARTICLES */}
      {!prefersReducedMotion && (
        <Particles
          className="absolute inset-0 z-[1]"
          quantity={particleCount}
          ease={80}
          color="#3B82F6"
          size={0.5}
          staticity={50}
        />
      )}
    </div>
  );
}