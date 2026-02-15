"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// System scan metrics - VISCERAL SPECIFICS
const SCAN_METRICS = [
  { label: "47 tabs open", subtext: "0 closed this week", severity: "high" },
  { label: '12 "urgent" tasks', subtext: "3 actually urgent", severity: "medium" },
  { label: "5 side projects", subtext: "0 shipped", severity: "high" },
  { label: "18 days", subtext: "since last strategic decision", severity: "critical" },
];

// Glitch effect for "0 clarity"
const GlitchText = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.span
      className="relative inline-block text-ascent-red font-bold text-3xl md:text-4xl"
      style={{ willChange: "transform" }}
      animate={{
        textShadow: [
          "0 0 25px rgba(239, 68, 68, 0.6)",
          "0 0 35px rgba(239, 68, 68, 0.8), 2px 2px 0px rgba(239, 68, 68, 0.3)",
          "0 0 25px rgba(239, 68, 68, 0.6)",
        ],
      }}
      transition={{
        duration: 0.8,
        repeat: Infinity,
        repeatDelay: 3,
      }}
    >
      {children}
      <motion.span
        className="absolute top-0 left-0 text-ascent-red/30"
        style={{ willChange: "transform" }}
        animate={{
          x: [0, -2, 2, 0],
          y: [0, 2, -2, 0],
        }}
        transition={{
          duration: 0.2,
          repeat: Infinity,
          repeatDelay: 4,
        }}
      >
        {children}
      </motion.span>
    </motion.span>
  );
};

// Typing effect for terminal lines
const TerminalLine = ({ 
  children, 
  delay = 0 
}: { 
  children: React.ReactNode; 
  delay?: number;
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

export function FogPunchline() {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const [scanProgress, setScanProgress] = useState(0);
  const [scanComplete, setScanComplete] = useState(false);

  // Progress bar animation
  useEffect(() => {
    if (!isInView || prefersReducedMotion) {
      // Avoid setting state synchronously in the effect body
      // Instead, schedule it after mount via setTimeout to prevent cascading renders
      const timeout = setTimeout(() => {
        setScanProgress(100);
        setScanComplete(true);
      }, 0);
      return () => clearTimeout(timeout);
    }

    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      setScanProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => setScanComplete(true), 300);
      }
    }, 30); // 1.5s total to reach 100%

    return () => clearInterval(interval);
  }, [isInView, prefersReducedMotion]);

  return (
    <div ref={containerRef} className="text-center max-w-3xl mx-auto px-4">
      
      {/* Terminal Diagnostic Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.4 }}
        className="relative p-8 md:p-10 rounded-2xl bg-ascent-obsidian/80 backdrop-blur-xl border border-white/10 shadow-card mb-8"
      >
        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-mono uppercase tracking-wider text-ascent-gray/60 mb-2">
            System Scan Results
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-ascent-blue via-ascent-purple to-ascent-blue rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${scanProgress}%` }}
              transition={{ duration: 0.05, ease: "linear" }}
            />
          </div>
          <div className="mt-2 text-right">
            <span className="text-xs font-mono text-ascent-gray">{scanProgress}%</span>
          </div>
        </div>

        {/* Scan Results */}
        {scanComplete && (
          <div className="space-y-4 text-left">
            {SCAN_METRICS.map((metric, index) => (
              <TerminalLine key={index} delay={index * 200}>
                <div className="flex items-start gap-3 text-sm font-mono">
                  <span className="text-ascent-blue">→</span>
                  <div className="flex-1">
                    <span className="text-white">{metric.label}.</span>{" "}
                    <span className="text-ascent-gray/70">{metric.subtext}.</span>
                  </div>
                </div>
              </TerminalLine>
            ))}
          </div>
        )}

        {/* Divider */}
        {scanComplete && (
          <TerminalLine delay={1000}>
            <div className="my-6 border-t border-white/10" />
          </TerminalLine>
        )}

        {/* Diagnosis */}
        {scanComplete && (
          <TerminalLine delay={1200}>
            <div className="text-center">
              <p className="text-sm font-mono uppercase tracking-wider text-ascent-gray/60 mb-3">
                Diagnosis:
              </p>
              {prefersReducedMotion ? (
                <span className="text-ascent-red font-bold text-3xl md:text-4xl">
                  0 clarity
                </span>
              ) : (
                <GlitchText>0 clarity</GlitchText>
              )}
            </div>
          </TerminalLine>
        )}

        {/* Leakage Warning */}
        {scanComplete && (
          <TerminalLine delay={1500}>
            <motion.div
              className="mt-6 pt-6 border-t border-ascent-red/20"
              animate={prefersReducedMotion ? {} : {
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              <div className="flex items-center justify-center gap-3 text-ascent-red">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-sm font-mono font-semibold uppercase tracking-wider">
                  Leakage Detected
                </span>
              </div>
            </motion.div>
          </TerminalLine>
        )}
      </motion.div>

      {/* Pulsing Warning Icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ delay: 2, duration: 0.4 }}
        className="flex justify-center"
      >
        <motion.div
          style={{ willChange: prefersReducedMotion ? "auto" : "box-shadow" }}
          animate={prefersReducedMotion ? {} : {
            boxShadow: [
              "0 0 0px rgba(239, 68, 68, 0.4)",
              "0 0 30px rgba(239, 68, 68, 0.6)",
              "0 0 0px rgba(239, 68, 68, 0.4)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-16 rounded-full border-2 border-ascent-red flex items-center justify-center"
        >
          <span className="text-ascent-red text-3xl font-bold">!</span>
        </motion.div>
      </motion.div>

    </div>
  );
}