/* eslint-disable react-hooks/refs */
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { TrendingUp } from "lucide-react";
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

export function AscentDiagnosticCard() {
  const visionClarity = useAnimatedCounter(89, 2);
  const timeReclaimed = useAnimatedCounter(6, 1.8);
  const blindSpots = useAnimatedCounter(3, 1.5);
  const weeksToFlight = useAnimatedCounter(8, 2.2);

  return (
    <div 
      ref={visionClarity.containerRef}
      className={cn(
        "relative w-full max-w-lg h-[500px] md:h-[550px]",
        "rounded-2xl overflow-hidden",
        "bg-gradient-to-br from-ascent-green/10 via-ascent-obsidian to-ascent-blue/5",
        "border border-ascent-green/20",
        "shadow-[0_0_40px_rgba(16,185,129,0.15)]"
      )}
    >
      {/* Grid texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(16,185,129,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(16,185,129,0.1) 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Animated scan line */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ascent-green to-transparent"
        animate={{
          y: [0, 550, 0],
          opacity: [0, 0.6, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <div className="relative z-10 p-8 h-full flex flex-col">
        {/* Header */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-ascent-green mb-2 tracking-wide flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            THE ASCENT
          </h3>
          <p className="text-xs font-mono uppercase tracking-wider text-ascent-green/60">
            System Performance
          </p>
        </div>

        {/* Metrics */}
        <div className="space-y-6 flex-1">
          
          {/* Vision Clarity */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ascent-gray font-mono">VISION CLARITY</span>
              <motion.span 
                className="text-ascent-green font-bold font-mono text-lg"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {visionClarity.count}%
              </motion.span>
            </div>
            <div className="h-2 bg-ascent-green/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-ascent-blue via-ascent-green to-ascent-green rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${visionClarity.count}%` }}
                transition={{ duration: 2, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Time Reclaimed */}
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-wider text-ascent-green/60">
              TIME RECLAIMED
            </span>
            <div className="text-2xl font-bold text-ascent-green font-mono">
              {timeReclaimed.count}+ <span className="text-sm text-ascent-green/60">hrs/week</span>
            </div>
            <p className="text-xs text-ascent-gray/70">
              From fog to focused execution
            </p>
          </div>

          {/* Blind Spots Caught */}
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-wider text-ascent-blue/60">
              BLIND SPOTS CAUGHT
            </span>
            <div className="text-2xl font-bold text-ascent-blue font-mono">
              {blindSpots.count} <span className="text-sm text-ascent-blue/60">this month</span>
            </div>
            <p className="text-xs text-ascent-gray/70">
              Before they became crises
            </p>
          </div>

          {/* Trajectory */}
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-wider text-ascent-gray/60">
              TRAJECTORY
            </span>
            <div className="text-2xl font-bold text-white font-mono">
              12-week <span className="text-sm text-ascent-gray/60">ascent</span>
            </div>
            <p className="text-xs text-ascent-green/90 font-semibold">
              Flight Ready: {weeksToFlight.count} weeks
            </p>
          </div>

        </div>

        {/* Footer Status */}
        <div className="mt-auto pt-6 border-t border-ascent-green/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
            <span className="text-ascent-gray/60 font-mono">LAST LOG: 2 days ago</span>
            <motion.div
              className="flex items-center gap-2"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-2 h-2 rounded-full bg-ascent-green" />
              <span className="text-ascent-green font-semibold uppercase tracking-wider">On Track, Momentum Building</span>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}