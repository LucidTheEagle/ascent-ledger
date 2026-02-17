"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { XCircle, AlertOctagon, RefreshCw, ZapOff } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import { viewportConfig } from "@/lib/animations";

// The "Noise" elements that clog the founder's mind
const NOISE_ITEMS = [
  { text: "Slack: 4 Unread", x: "10%", y: "20%", delay: 0, mobile: { x: "5%", y: "15%" } },
  { text: "Email: 'Urgent'", x: "80%", y: "15%", delay: 2, mobile: { x: "75%", y: "10%" } },
  { text: "Fix Typo in UI", x: "30%", y: "60%", delay: 4, mobile: { x: "15%", y: "55%" } },
  { text: "Competitor Update", x: "70%", y: "70%", delay: 1, mobile: { x: "80%", y: "65%" } },
  { text: "Imposter Syndrome", x: "20%", y: "40%", delay: 3, mobile: { x: "10%", y: "35%" } },
  { text: "Server Alert", x: "85%", y: "40%", delay: 5, mobile: { x: "85%", y: "45%" } },
  { text: "New Framework?", x: "50%", y: "10%", delay: 0.5, mobile: { x: "45%", y: "8%" } },
  { text: "Dopamine Hit", x: "60%", y: "85%", delay: 2.5, mobile: { x: "65%", y: "80%" } },
  { text: "Where is the vision?", x: "40%", y: "50%", delay: 1.5, isCore: true, mobile: { x: "35%", y: "45%" } },
];

// Noise item component with hover-to-clarify effect
const NoiseItem = ({ 
  item, 
  isMobile,
  prefersReducedMotion 
}: { 
  item: typeof NOISE_ITEMS[0]; 
  isMobile: boolean;
  prefersReducedMotion: boolean;
}) => {
  const position = isMobile ? item.mobile : { x: item.x, y: item.y };

  return (
    <motion.div
      className={cn(
        "absolute px-3 py-2 rounded-lg border backdrop-blur-sm text-xs md:text-sm font-mono whitespace-nowrap",
        "transition-all duration-300 cursor-default group",
        item.isCore 
          ? "bg-ascent-obsidian/80 border-ascent-gray/30 text-ascent-gray z-10" 
          : "bg-ascent-red/20 border-ascent-red/10 text-ascent-red/40 z-0",
        // Hover clarifies the text
        item.isCore 
          ? "hover:bg-ascent-obsidian/90 hover:border-ascent-blue/50 hover:text-white hover:scale-105" 
          : "hover:bg-ascent-red/30 hover:border-ascent-red/30 hover:text-ascent-red hover:scale-105"
      )}
      style={{ 
        left: position.x, 
        top: position.y,
        willChange: prefersReducedMotion ? "auto" : "transform, opacity",
      }}
      animate={prefersReducedMotion ? {} : {
        y: ["-10%", "10%"],
        x: ["-5%", "5%"],
        opacity: item.isCore ? [0.6, 1, 0.6] : [0.3, 0.5, 0.3],
        scale: item.isCore ? 1 : 0.9,
      }}
      transition={prefersReducedMotion ? {} : {
        duration: 5 + item.delay,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
        delay: item.delay,
      }}
    >
      {item.text}
    </motion.div>
  );
};

export function ProblemSection() {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(
    scrollYProgress, 
    [0, 0.2, 0.8, 1], 
    [0, 1, 1, 0]
  );
  const scale = useTransform(
    scrollYProgress, 
    [0, 0.5], 
    [0.8, 1]
  );

  // Detect mobile for positioning
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <section 
      ref={containerRef} 
      className="relative min-h-[80vh] w-full bg-ascent-black overflow-hidden flex items-center justify-center py-20"
    >
      
      {/* Background Noise Texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
          }}
        />
      </div>
      
      {/* The Central Thesis */}
      <motion.div 
        style={{ 
          opacity: prefersReducedMotion ? 1 : opacity, 
          scale: prefersReducedMotion ? 1 : scale,
          willChange: prefersReducedMotion ? "auto" : "transform, opacity",
        }}
        className="relative z-20 text-center max-w-4xl px-4 md:px-6"
      >
        {/* Status Badge */}
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
          whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          viewport={viewportConfig}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ascent-red/10 border border-ascent-red/20 text-ascent-red text-xs md:text-sm font-mono mb-8 uppercase tracking-widest"
        >
          <AlertOctagon className="w-3 h-3 md:w-4 md:h-4" />
          System Diagnosis: High Entropy
        </motion.div>
        
        {/* H2 */}
        <motion.h2 
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
          whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          viewport={viewportConfig}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
        >
          Movement is not{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-ascent-red via-ascent-amber to-ascent-red">
            Progress.
          </span>
        </motion.h2>
        
        {/* Subheading */}
        <motion.p 
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
          whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          viewport={viewportConfig}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-base md:text-lg lg:text-xl text-ascent-gray leading-relaxed max-w-2xl mx-auto"
        >
          You are pushing in 47 directions at once. The result isn&apos;t speed.
          <br />
          <strong className="text-white">The result is zero displacement.</strong>
        </motion.p>

        {/* The Pain Points Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
          
          {/* Card 1: Context Switching */}
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
            whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            viewport={viewportConfig}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="p-5 md:p-6 bg-ascent-red/5 border border-ascent-red/20 rounded-xl backdrop-blur-sm text-left hover:bg-ascent-red/10 hover:border-ascent-red/30 transition-all duration-300 group"
          >
            <RefreshCw className="w-6 h-6 text-ascent-red mb-4 group-hover:rotate-180 transition-transform duration-500" />
            <h3 className="text-white font-semibold mb-2 text-base md:text-lg">Context Switching</h3>
            <p className="text-sm text-ascent-gray/70">
              23 minutes lost every time you check a notification.
            </p>
          </motion.div>

          {/* Card 2: Energy Leakage */}
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
            whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            viewport={viewportConfig}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="p-5 md:p-6 bg-ascent-red/5 border border-ascent-red/20 rounded-xl backdrop-blur-sm text-left hover:bg-ascent-red/10 hover:border-ascent-red/30 transition-all duration-300 group"
          >
            <ZapOff className="w-6 h-6 text-ascent-red mb-4" />
            <h3 className="text-white font-semibold mb-2 text-base md:text-lg">Energy Leakage</h3>
            <p className="text-sm text-ascent-gray/70">
              High effort, low impact. The &quot;busy trap&quot; creates exhaustion, not equity.
            </p>
          </motion.div>

          {/* Card 3: Vision Decay */}
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
            whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            viewport={viewportConfig}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="p-5 md:p-6 bg-ascent-red/5 border border-ascent-red/20 rounded-xl backdrop-blur-sm text-left hover:bg-ascent-red/10 hover:border-ascent-red/30 transition-all duration-300 group"
          >
            <XCircle className="w-6 h-6 text-ascent-red mb-4 group-hover:scale-110 transition-transform duration-300" />
            <h3 className="text-white font-semibold mb-2 text-base md:text-lg">Vision Decay</h3>
            <p className="text-sm text-ascent-gray/70">
              The daily grind erodes the 5-year goal until it disappears.
            </p>
          </motion.div>

        </div>
      </motion.div>

      {/* The Distraction Field Animation */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {NOISE_ITEMS.map((item, i) => (
          <NoiseItem 
            key={i} 
            item={item} 
            isMobile={isMobile}
            prefersReducedMotion={prefersReducedMotion}
          />
        ))}
      </div>
      
      {/* Vignette to focus attention */}
      <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(10,10,15,0.8)_100%)] pointer-events-none" />
    </section>
  );
}