"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { Illustration } from "@/components/ui/glowing-stars";
import { CardPattern } from "@/components/ui/evervault-card";
import { useMotionValue } from "framer-motion";
import { TrinityCarousel } from "@/components/ui/trinity-carousel";
import { COPY } from "@/lib/constants";
import { 
  fadeInVariants, 
  slideUpVariants,
  viewportConfig 
} from "@/lib/animations";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import Link from "next/link";
import { cn } from "@/lib/utils";

// --- COMPONENT: LIBRARY VS CAREER QUOTE ---
const LibraryCareerQuote = () => {
  const prefersReducedMotion = useReducedMotion();
  const [libraryColor, setLibraryColor] = useState(
    prefersReducedMotion ? "#EF4444" : "#000000"
  );
  const [careerRevealed, setCareerRevealed] = useState(
    prefersReducedMotion
  );

  useEffect(() => {
    if (prefersReducedMotion) return;
  
    const flicker1 = setTimeout(() => setLibraryColor("#EF4444"), 800);
    const flicker2 = setTimeout(() => setLibraryColor("#FFFFFF"), 1200);
    const flicker3 = setTimeout(() => setLibraryColor("#EF4444"), 1400);
    const flicker4 = setTimeout(() => setLibraryColor("#FFFFFF"), 1800);
    const careerTimer = setTimeout(() => setCareerRevealed(true), 2200);
  
    return () => {
      clearTimeout(flicker1);
      clearTimeout(flicker2);
      clearTimeout(flicker3);
      clearTimeout(flicker4);
      clearTimeout(careerTimer);
    };
  }, [prefersReducedMotion]);
  

  return (
    <div className="relative z-20 p-4 rounded-xl bg-ascent-obsidian/40 backdrop-blur-sm border border-white/5">
      <p className="text-xl md:text-2xl text-white leading-relaxed font-mono">
        You are building a{" "}
        <motion.span
          style={{ 
            color: libraryColor,
            willChange: prefersReducedMotion ? "auto" : "text-shadow"
          }}
          animate={prefersReducedMotion ? {} : {
            textShadow: libraryColor === "#EF4444" 
              ? "0 0 15px rgba(239, 68, 68, 0.6)"
              : "none",
          }}
          className="font-bold tracking-tight"
        >
          library
        </motion.span>
        , not a{" "}
        <motion.span
          initial={prefersReducedMotion ? { color: "#3B82F6" } : { opacity: 0, scale: 0.9, filter: "blur(4px)" }}
          animate={careerRevealed ? {
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
            color: "#3B82F6",
            textShadow: prefersReducedMotion ? "none" : "0 0 25px rgba(59, 130, 246, 0.6)",
          } : {}}
          transition={{ duration: prefersReducedMotion ? 0 : 0.6, type: "spring" }}
          style={{ willChange: prefersReducedMotion ? "auto" : "transform, filter" }}
          className="font-extrabold underline decoration-ascent-blue/30 underline-offset-4"
        >
          career
        </motion.span>
        .
      </p>
    </div>
  );
};

// --- COMPONENT: EVERVAULT BG ---
const EvervaultBackground = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const prefersReducedMotion = useReducedMotion();

  const randomString = useMemo(() => {
    const characters = "01010101 ASCENT CLARITY FOCUS 010101";
    let result = "";
    for (let i = 0; i < 1500; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }, []);

  function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    if (prefersReducedMotion) return; // Skip if reduced motion
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div 
      onMouseMove={onMouseMove}
      className="absolute inset-0 rounded-xl overflow-hidden opacity-50 mix-blend-screen"
    >
      <CardPattern mouseX={mouseX} mouseY={mouseY} randomString={randomString} />
    </div>
  );
};

// --- COMPONENT: CHAT BUBBLE (For Vision Canvas) ---
const ChatBubble = ({ role, text, delay }: { role: "system" | "user", text: string, delay: number }) => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
      whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      viewport={viewportConfig}
      transition={{ delay: prefersReducedMotion ? 0 : delay, duration: 0.5 }}
      style={{ willChange: prefersReducedMotion ? "auto" : "transform, opacity" }}
      className={cn(
        "max-w-[85%] p-4 rounded-2xl text-sm md:text-base leading-relaxed mb-4",
        role === "system" 
          ? "bg-white/5 text-ascent-gray self-start rounded-tl-none border border-white/5" 
          : "bg-ascent-blue/10 text-white self-end rounded-tr-none border border-ascent-blue/20"
      )}
    >
      <span className="text-xs font-bold uppercase tracking-wider opacity-50 block mb-1">
        {role === "system" ? "/// SYSTEM" : "USER"}
      </span>
      {text}
    </motion.div>
  );
};

export function Trinity() {
  const prefersReducedMotion = useReducedMotion();
  const [h2Phase, setH2Phase] = useState<"gray" | "white" | "gradient">(
    prefersReducedMotion ? "gradient" : "gray"
  );

  // Simulated Log Data
  const logs = [
    { text: "Identity Verified", status: "complete" },
    { text: "Fog Density: 12% (Clearing)", status: "active" },
    { text: "Ascent Protocol Initiated", status: "pending" }
  ];

  useEffect(() => {
    if (prefersReducedMotion) return;

    const p1 = setTimeout(() => setH2Phase("white"), 500);
    const p2 = setTimeout(() => setH2Phase("gradient"), 1000);
    return () => { clearTimeout(p1); clearTimeout(p2); };
  }, [prefersReducedMotion]);

  // Define cards for mobile carousel
  const carouselCards = [
    {
      id: "vision",
      content: (
        <CardSpotlight className="h-[500px] border border-white/10 bg-ascent-obsidian/60">
          <div className="relative z-20 flex flex-col h-full p-6">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-ascent-blue animate-pulse shadow-[0_0_8px_#3B82F6]" />
                <span className="text-sm font-mono text-ascent-blue uppercase tracking-widest">Vision Canvas</span>
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-center w-full">
              <ChatBubble role="system" delay={0.2} text="Where are you in your career right now?" />
              <ChatBubble role="user" delay={0.4} text="I'm 3 years into account management. Hitting quota, but I feel like a cog in the machine." />
              <ChatBubble role="system" delay={0.6} text="Acknowledged. What is the target coordinate?" />
              <ChatBubble role="user" delay={0.8} text="Leading a sales team at a Series B startup." />
            </div>
          </div>
        </CardSpotlight>
      ),
    },
    {
      id: "log",
      content: (
        <div className="relative h-[500px] w-full rounded-2xl overflow-hidden border border-white/10 bg-ascent-obsidian/80 backdrop-blur-md">
          <div className="absolute inset-0 z-0 opacity-40"><Illustration mouseEnter={false} /></div>
          <div className="relative z-10 p-6 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-ascent-green shadow-[0_0_8px_#10B981]" />
                <span className="text-xs font-mono text-ascent-green uppercase">System Log</span>
              </div>
            </div>
            <div className="space-y-3 flex-1 overflow-hidden">
              {logs.map((log, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className={cn("text-[10px]", log.status === "complete" ? "text-ascent-green" : "text-ascent-gray")}>
                    {log.status === "complete" ? "✓" : ">"}
                  </span>
                  <span className="text-white/80 font-mono text-xs truncate">{log.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "fog",
      content: (
        <div className="relative h-[500px] w-full rounded-2xl overflow-hidden border border-white/10 bg-ascent-obsidian/80">
          <EvervaultBackground />
          <div className="relative z-10 p-6 flex flex-col h-full justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-ascent-purple animate-pulse" />
              <span className="text-xs font-mono text-ascent-purple uppercase">Fog Check</span>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <LibraryCareerQuote />
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <AuroraBackground className="bg-ascent-black">
      <section className="relative w-full py-20 px-4 md:px-6 flex flex-col items-center">
        
        {/* HEADER */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={viewportConfig}
          variants={prefersReducedMotion ? undefined : fadeInVariants}
          className="text-center mb-16 relative z-10"
        >
          <h2 
            id="trinity-heading"
            className={cn(
              "text-4xl md:text-6xl font-bold transition-all duration-700 tracking-tight",
              h2Phase === "gray" ? "text-ascent-gray" : 
              h2Phase === "white" ? "text-white" : 
              "bg-gradient-to-r from-white via-ascent-blue to-ascent-purple bg-clip-text text-transparent"
            )}
            style={{ willChange: prefersReducedMotion ? "auto" : "color" }}
          >
            {COPY.trinity.h2}
          </h2>
        </motion.div>

        {/* MOBILE: CAROUSEL */}
        <div className="block lg:hidden w-full relative z-10">
          <TrinityCarousel cards={carouselCards} />
        </div>

        {/* DESKTOP: BENTO GRID */}
        <div className="hidden lg:grid relative z-10 w-full max-w-7xl grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
          
          {/* Vision Canvas */}
          <motion.div
            variants={prefersReducedMotion ? undefined : slideUpVariants}
            initial="initial"
            whileInView="animate"
            viewport={viewportConfig}
            style={{ willChange: prefersReducedMotion ? "auto" : "transform, opacity" }}
            className="lg:row-span-2 h-full"
          >
            <CardSpotlight className="h-full min-h-[500px] border border-white/10 bg-ascent-obsidian/60">
              <div className="relative z-20 flex flex-col h-full p-6 md:p-8">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-ascent-blue animate-pulse shadow-[0_0_8px_#3B82F6]" />
                    <span className="text-sm font-mono text-ascent-blue uppercase tracking-widest">Vision Canvas</span>
                  </div>
                  <span className="text-xs text-ascent-gray font-mono">v1.0.4 ACTIVE</span>
                </div>
                <div className="flex-1 flex flex-col justify-center w-full">
                   <ChatBubble role="system" delay={0.2} text="Where are you in your career right now?" />
                   <ChatBubble role="user" delay={0.4} text="I'm 3 years into account management. Hitting quota, but I feel like a cog in the machine." />
                   <ChatBubble role="system" delay={0.6} text="Acknowledged. What is the target coordinate?" />
                   <ChatBubble role="user" delay={0.8} text="Leading a sales team at a Series B startup." />
                </div>
                <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
                  <span className="text-xs text-ascent-gray font-mono">INPUT REQUIRED</span>
                  <Link href="/login" className="group flex items-center gap-2 text-ascent-blue text-sm font-semibold hover:text-white transition-colors">
                    {COPY.trinity.visionCard.cta}
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </div>
              </div>
            </CardSpotlight>
          </motion.div>

          {/* Strategic Log */}
          <motion.div
            variants={prefersReducedMotion ? undefined : slideUpVariants}
            initial="initial"
            whileInView="animate"
            viewport={viewportConfig}
            transition={{ delay: 0.2 }}
            style={{ willChange: prefersReducedMotion ? "auto" : "transform, opacity" }}
            className="relative h-[280px]"
          >
             <div className="relative h-full w-full rounded-2xl overflow-hidden border border-white/10 bg-ascent-obsidian/80 backdrop-blur-md">
                <div className="absolute inset-0 z-0 opacity-40"><Illustration mouseEnter={false} /></div>
                <div className="relative z-10 p-6 flex flex-col h-full">
                   <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-ascent-green shadow-[0_0_8px_#10B981]" />
                        <span className="text-xs font-mono text-ascent-green uppercase">System Log</span>
                      </div>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                   </div>
                   <div className="space-y-3 flex-1 overflow-hidden">
                      {logs.map((log, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + (i * 0.2) }}
                          className="flex items-center gap-3 text-sm"
                        >
                           <span className={cn("text-[10px]", log.status === "complete" ? "text-ascent-green" : "text-ascent-gray")}>
                             {log.status === "complete" ? "✓" : ">"}
                           </span>
                           <span className="text-white/80 font-mono text-xs md:text-sm truncate">{log.text}</span>
                        </motion.div>
                      ))}
                   </div>
                   <Link href="#" className="mt-auto self-end text-xs font-mono text-ascent-green/70 hover:text-ascent-green flex items-center gap-1 transition-colors">
                      FULL LOG ACCESS <span className="text-[10px]">↗</span>
                   </Link>
                </div>
             </div>
          </motion.div>

          {/* Fog Check */}
          <motion.div
            variants={prefersReducedMotion ? undefined : slideUpVariants}
            initial="initial"
            whileInView="animate"
            viewport={viewportConfig}
            transition={{ delay: 0.4 }}
            style={{ willChange: prefersReducedMotion ? "auto" : "transform, opacity" }}
            className="relative h-[280px]"
          >
             <div className="relative h-full w-full rounded-2xl overflow-hidden border border-white/10 bg-ascent-obsidian/80">
                <EvervaultBackground />
                <div className="relative z-10 p-6 flex flex-col h-full justify-between">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-ascent-purple animate-pulse" />
                      <span className="text-xs font-mono text-ascent-purple uppercase">Fog Check</span>
                   </div>
                   <div className="flex-1 flex items-center justify-center">
                      <LibraryCareerQuote />
                   </div>
                   <div className="text-right">
                      <span className="text-xs font-mono text-ascent-purple/70">
                         {COPY.trinity.fogCheckCard.cta}
                      </span>
                   </div>
                </div>
             </div>
          </motion.div>

        </div>
      </section>
    </AuroraBackground>
  );
}