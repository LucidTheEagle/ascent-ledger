"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BackgroundBeams } from "@/components/ui/background-beams"; 
import { EncryptedText } from "@/components/ui/encrypted-text";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { GlareCard } from "@/components/ui/glare-card";
import { COPY } from "@/lib/constants";
import { 
  slideInLeftVariants, 
  slideInRightVariants, 
  fadeInVariants,
  viewportConfig 
} from "@/lib/animations";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// Custom typing effect that actually works
const TypingText = ({ text, delay = 0, speed = 40 }: { text: string; delay?: number; speed?: number }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    
    let i = 0;
    const typing = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typing);
      }
    }, speed);
    
    return () => clearInterval(typing);
  }, [started, text, speed]);

  return <span>{displayedText}</span>;
};

// Glitch effect for "0 clarity"
const GlitchText = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.span
      className="relative inline-block text-ascent-red font-bold"
      style={{ willChange: "transform" }} // GPU hint
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
      {/* Glitch clone */}
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

export function Fog() {
  const prefersReducedMotion = useReducedMotion();
  
  // Split the text properly
  const fullText = COPY.fog.subheading;
  const parts = fullText.split("0 clarity");
  const beforeZero = parts[0];
  const afterZero = parts[1] || ".";

  return (
    <section className="relative w-full py-20 md:py-32 flex flex-col items-center justify-center bg-ascent-obsidian overflow-hidden">
      
      {/* BACKGROUND LAYERS */}
      {/* 1. Radar Grid */}
      <div className="absolute inset-0 w-full h-full bg-ascent-obsidian bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.15] z-0 pointer-events-none">
          <div className="absolute inset-0 bg-ascent-obsidian [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      </div>

      {/* 2. Background Beams - Skip if reduced motion */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <BackgroundBeams />
        </div>
      )}

      {/* CONTENT CONTAINER */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-6">
        
        {/* H2 HEADER */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={viewportConfig}
          variants={prefersReducedMotion ? undefined : fadeInVariants}
          className="text-center mb-16 md:mb-24"
        >
          <h2 
            id="fog-heading"
            className="text-3xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight px-2"
            style={{ willChange: "transform, opacity" }}
          >
            {prefersReducedMotion ? (
              COPY.fog.h2
            ) : (
              <EncryptedText 
                text={COPY.fog.h2}
                revealDelayMs={50}
                flipDelayMs={30}
                className="text-white drop-shadow-xl"
              />
            )}
          </h2>
        </motion.div>

        {/* DICHOTOMY GRID - Stack on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-20">
          
          {/* LEFT CARD - THE FOG */}
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={viewportConfig}
            variants={prefersReducedMotion ? fadeInVariants : slideInLeftVariants}
            style={{ willChange: "transform, opacity" }}
            className="w-full flex justify-center"
          >
            <CardSpotlight className="w-full max-w-lg min-h-[400px] md:h-[450px] p-8 border border-white/5 bg-ascent-obsidian/80 backdrop-blur-sm">
              <div className="relative z-10 flex flex-col justify-center h-full">
                <h3 className="text-2xl font-bold text-ascent-gray mb-8 tracking-wide">
                  {COPY.fog.leftCard.title}
                </h3>
                
                <ul className="space-y-6">
                  {COPY.fog.leftCard.bullets.map((bullet, index) => (
                    <motion.li
                      key={index}
                      className="text-lg text-white/50 flex items-start gap-4 font-mono"
                      style={{ 
                        filter: prefersReducedMotion ? "none" : "blur(0.8px)",
                        willChange: prefersReducedMotion ? "auto" : "opacity"
                      }}
                      animate={prefersReducedMotion ? {} : { opacity: [0.3, 0.7, 0.3] }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        delay: index * 0.7,
                      }}
                    >
                      <span className="text-ascent-amber/50 mt-1 text-sm shrink-0">✕</span>
                      <span>{bullet}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </CardSpotlight>
          </motion.div>

          {/* RIGHT CARD - THE ASCENT */}
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={viewportConfig}
            variants={prefersReducedMotion ? fadeInVariants : slideInRightVariants}
            style={{ willChange: "transform, opacity" }}
            className="w-full flex justify-center"
          >
             <div className="w-full max-w-lg h-[400px] md:h-[450px]">
                <GlareCard className="flex flex-col items-start justify-center p-8 w-full h-full">
                    <h3 className="text-2xl font-bold text-white mb-8 tracking-wide">
                      {COPY.fog.rightCard.title}
                    </h3>
                    
                    <ul className="space-y-6">
                      {COPY.fog.rightCard.bullets.map((bullet, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={viewportConfig}
                          transition={{ delay: 0.4 + (index * 0.2) }}
                          style={{ willChange: "transform, opacity" }}
                          className="text-lg text-white flex items-start gap-4"
                        >
                          {/* Crisp, glowing bullet */}
                          <span className="text-ascent-blue mt-1.5 h-2 w-2 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)] bg-ascent-blue shrink-0" />
                          <span className="font-medium tracking-wide leading-snug">{bullet}</span>
                        </motion.li>
                      ))}
                    </ul>
                </GlareCard>
             </div>
          </motion.div>
        </div>

        {/* PUNCHLINE - FIXED */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={viewportConfig}
          variants={prefersReducedMotion ? undefined : fadeInVariants}
          transition={{ delay: 0.4 }}
          className="text-center max-w-3xl mx-auto px-4"
        >
          {/* The full statement with typing effect */}
          <p className="text-xl md:text-2xl text-ascent-gray font-light leading-relaxed mb-6">
            {prefersReducedMotion ? (
              <>
                {beforeZero}
                <span className="text-ascent-red font-bold">0 clarity</span>
                {afterZero}
              </>
            ) : (
              <>
                <TypingText 
                  text={beforeZero}
                  delay={300}
                  speed={30}
                />
                <GlitchText>0 clarity</GlitchText>
                <TypingText 
                  text={afterZero}
                  delay={300 + (beforeZero.length * 30) + 500}
                  speed={30}
                />
              </>
            )}
          </p>

          {/* Visual emphasis - Pulsing warning icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={viewportConfig}
            transition={{ delay: 1.5 }}
            className="flex justify-center mt-8"
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
        </motion.div>

      </div>
    </section>
  );
}