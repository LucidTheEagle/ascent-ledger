"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, TrendingUp, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

// Fog symptoms with severity levels
const FOG_SYMPTOMS = [
  { label: "I scroll LinkedIn for 2+ hours daily", severity: 85 },
  { label: "I say yes to every opportunity", severity: 70 },
  { label: "I have 5+ side projects, 0 launched", severity: 80 },
  { label: "I can't remember my last strategic decision", severity: 75 },
  { label: "I'm busy but not productive", severity: 65 },
  { label: "I'm clear and focused", severity: 20 },
];

// Dynamic quotes based on fog level
const getFogQuote = (level: number) => {
  if (level < 30) {
    return "Vision is clear. You're ascending. Keep logging.";
  } else if (level < 60) {
    return "Drift detected. Course correction recommended.";
  } else {
    return "You are not lost. You are in the fog. There's a difference.";
  }
};

export function FogDensityMeter() {
  const [selectedSymptom, setSelectedSymptom] = useState<number | null>(null);
  const [fogLevel, setFogLevel] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSymptomSelect = (index: number) => {
    setSelectedSymptom(index);
    setIsAnalyzing(true);
    setFogLevel(0);

    setTimeout(() => {
      setFogLevel(FOG_SYMPTOMS[index].severity);
      setIsAnalyzing(false);
    }, 800);
  };

  const getFogColor = (level: number) => {
    if (level < 30) return { 
      bg: "bg-ascent-green", 
      text: "text-ascent-green", 
      glow: "shadow-[0_0_20px_rgba(16,185,129,0.6)]" 
    };
    if (level < 60) return { 
      bg: "bg-ascent-amber", 
      text: "text-ascent-amber", 
      glow: "shadow-[0_0_20px_rgba(245,158,11,0.6)]" 
    };
    return { 
      bg: "bg-ascent-red", 
      text: "text-ascent-red", 
      glow: "shadow-[0_0_20px_rgba(239,68,68,0.6)]" 
    };
  };

  const fogColor = getFogColor(fogLevel);

  return (
    <div className={cn(
      "relative p-8 md:p-10 rounded-2xl max-w-4xl mx-auto",
      "bg-ascent-obsidian/60 backdrop-blur-xl",
      "border border-white/10",
      "shadow-card"
    )}>
      
      {/* Header */}
      <div className="text-center mb-8">
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Fog Density Scan
        </h3>
        <p className="text-sm text-ascent-gray font-mono uppercase tracking-wider">
          Select your primary symptom for diagnosis
        </p>
      </div>

      {/* Symptom Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        {FOG_SYMPTOMS.map((symptom, index) => (
          <button
            key={index}
            onClick={() => handleSymptomSelect(index)}
            className={cn(
              "p-4 rounded-xl text-left transition-all duration-300",
              "border text-sm md:text-base",
              "min-h-[60px]",
              selectedSymptom === index
                ? "bg-ascent-blue/20 border-ascent-blue text-white font-medium"
                : "bg-ascent-card/40 border-white/5 text-ascent-gray hover:border-white/20 hover:bg-ascent-card/60"
            )}
          >
            {symptom.label}
          </button>
        ))}
      </div>

      {/* Fog Gauge */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm font-mono">
          <span className="text-ascent-gray">FOG DENSITY</span>
          <AnimatePresence mode="wait">
            {selectedSymptom !== null && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className={cn("font-semibold", fogColor.text)}
              >
                {isAnalyzing ? "ANALYZING..." : `${fogLevel}%`}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Gauge Bar */}
        <div className="relative h-4 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className={cn(
              "absolute inset-y-0 left-0 rounded-full",
              fogColor.bg
            )}
            initial={{ width: 0 }}
            animate={{ 
              width: selectedSymptom !== null ? `${fogLevel}%` : 0,
            }}
            transition={{ 
              duration: 1.2, 
              ease: "easeOut",
            }}
          />
          {/* Pulse effect for high fog */}
          {fogLevel >= 60 && (
            <motion.div
              className={cn(
                "absolute inset-y-0 left-0 rounded-full",
                fogColor.bg,
                "opacity-50"
              )}
              animate={{
                width: [`${fogLevel}%`, `${fogLevel + 5}%`, `${fogLevel}%`],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}
        </div>

        {/* Status Labels */}
        <div className="flex justify-between text-xs font-mono text-ascent-gray/60">
          <span>0% CLEAR</span>
          <span>100% CRITICAL</span>
        </div>
      </div>

      {/* Dynamic Diagnosis */}
      <AnimatePresence mode="wait">
        {selectedSymptom !== null && !isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-8 pt-8 border-t border-white/10"
          >
            <div className="flex items-start gap-4">
              {/* Icon based on fog level */}
              {fogLevel < 30 ? (
                <TrendingUp className="w-6 h-6 text-ascent-green shrink-0 mt-1" />
              ) : fogLevel < 60 ? (
                <Activity className="w-6 h-6 text-ascent-amber shrink-0 mt-1" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-ascent-red shrink-0 mt-1" />
              )}
              
              {/* Diagnostic Text */}
              <div className="flex-1">
                <h4 className={cn(
                  "text-lg font-semibold mb-2",
                  fogColor.text
                )}>
                  {fogLevel < 30 ? "Low Fog - Clear Vision" : 
                   fogLevel < 60 ? "Medium Fog - Drift Detected" : 
                   "High Fog - Emergency Protocol"}
                </h4>
                <p className="text-sm text-ascent-gray leading-relaxed mb-4">
                  {getFogQuote(fogLevel)}
                </p>
                
                {/* CTA based on fog level */}
                <button
                  className={cn(
                    "px-6 py-3 rounded-lg font-semibold text-sm",
                    "transition-all duration-300",
                    "border",
                    fogLevel >= 60 
                      ? "bg-ascent-red text-white border-ascent-red hover:bg-ascent-red/90"
                      : fogLevel >= 30
                      ? "bg-ascent-amber text-ascent-obsidian border-ascent-amber hover:bg-ascent-amber/90"
                      : "bg-ascent-green text-ascent-obsidian border-ascent-green hover:bg-ascent-green/90",
                    fogColor.glow
                  )}
                >
                  {fogLevel >= 60 ? "Start Recovery Protocol →" :
                   fogLevel >= 30 ? "Begin Strategic Log →" :
                   "Maintain Momentum →"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}