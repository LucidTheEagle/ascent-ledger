/* eslint-disable react-hooks/refs */
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

// Animated counter hook - FIXED REF PATTERN
function useAnimatedCounter(target: number, duration: number = 2) {
  const [count, setCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, target, duration]);

  return { count, containerRef };
}

export function FogDiagnosticCard() {
  const fogDensity = useAnimatedCounter(78, 2);
  const costCounter = useAnimatedCounter(73000, 2.5);
  const timeCounter = useAnimatedCounter(14, 1.8);
  const decisionsCounter = useAnimatedCounter(0, 1.5);

  return (
    <div 
      ref={fogDensity.containerRef}
      className={cn(
        "relative w-full max-w-lg h-[500px] md:h-[550px]",
        "rounded-2xl overflow-hidden",
        "bg-gradient-to-br from-ascent-red/10 via-ascent-obsidian to-ascent-amber/5",
        "border border-ascent-red/20",
        "shadow-[0_0_40px_rgba(239,68,68,0.15)]"
      )}
    >
      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
        }}
      />

      {/* Animated scan line */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ascent-red to-transparent"
        animate={{
          y: [0, 500, 0],
          opacity: [0, 0.6, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <div className="relative z-10 p-8 h-full flex flex-col">
        {/* Header */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-ascent-red mb-2 tracking-wide flex items-center gap-2">
            <AlertTriangle className="w-6 h-6" />
            THE FOG
          </h3>
          <p className="text-xs font-mono uppercase tracking-wider text-ascent-red/60">
            System Diagnostics
          </p>
        </div>

        {/* Metrics */}
        <div className="space-y-6 flex-1">
          
          {/* Fog Density */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ascent-gray font-mono">FOG DENSITY</span>
              <motion.span 
                className="text-ascent-red font-bold font-mono text-lg"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {fogDensity.count}%
              </motion.span>
            </div>
            <div className="h-2 bg-ascent-red/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-ascent-amber via-ascent-red to-ascent-red rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${fogDensity.count}%` }}
                transition={{ duration: 2, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Cost */}
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-wider text-ascent-red/60">
              COST
            </span>
            <div className="text-2xl font-bold text-ascent-red font-mono">
              ${costCounter.count.toLocaleString()}<span className="text-sm text-ascent-red/60">/year</span>
            </div>
            <p className="text-xs text-ascent-gray/70">
              Opportunity cost of drift
            </p>
          </div>

          {/* Time Lost */}
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-wider text-ascent-amber/60">
              TIME LOST
            </span>
            <div className="text-2xl font-bold text-ascent-amber font-mono">
              {timeCounter.count} <span className="text-sm text-ascent-amber/60">hrs/week</span>
            </div>
            <p className="text-xs text-ascent-gray/70">
              To distraction and context switch
            </p>
          </div>

          {/* Strategic Decisions */}
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-wider text-ascent-gray/60">
              STRATEGIC DECISIONS
            </span>
            <div className="text-2xl font-bold text-white font-mono">
              {decisionsCounter.count} <span className="text-sm text-ascent-gray/60">this month</span>
            </div>
            <p className="text-xs text-ascent-gray/70">
              High-leverage choices made
            </p>
          </div>

        </div>

        {/* Footer Status */}
        <div className="mt-auto pt-6 border-t border-ascent-red/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
            <span className="text-ascent-gray/60 font-mono">LAST LOG: 18 days ago</span>
            <motion.div
              className="flex items-center gap-2"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-2 h-2 rounded-full bg-ascent-red" />
              <span className="text-ascent-red font-semibold uppercase tracking-wider">Emergency Protocol Required</span>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}