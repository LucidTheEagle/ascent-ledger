"use client";

import { motion } from "framer-motion";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import { Particles } from "@/components/ui/particle";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { TerminalTicker } from "@/components/ui/terminal-ticker";
import { Button as MovingButton } from "@/components/ui/moving-border";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import { ArrowRight } from "lucide-react";
import { COPY } from "@/lib/constants";
import { 
  fadeInVariants, 
  viewportConfig 
} from "@/lib/animations";
import { useReducedMotion, getParticleCount } from "@/hooks/useReducedMotion";

export function SocialProof() {
  const prefersReducedMotion = useReducedMotion();
  const particleCount = getParticleCount(prefersReducedMotion);
  
  // Configure the words for the typewriter effect
  const subheadingWords = [
    { text: "The", className: "text-white" },
    { text: "airspace", className: "text-white" },
    { text: "is", className: "text-white" },
    { text: "limited.", className: "text-ascent-amber" },
  ];

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden py-16 md:py-20 bg-ascent-black">
      
      {/* LAYER 1: DEPTH BACKGROUND */}
      <div className="absolute inset-0 z-0 opacity-40">
        <BackgroundRippleEffect />
      </div>
      
      {/* LAYER 2: PARTICLES - Reduced on mobile/reduced motion */}
      {particleCount > 0 && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Particles quantity={particleCount} staticity={50} ease={80} color="#ffffff" />
        </div>
      )}

      {/* CONTENT CONTAINER */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full flex flex-col items-center">
        
        {/* HEADER SECTION */}
        <div className="relative w-full flex flex-col items-center mb-8 md:mb-12">
          
          {/* H2 - TEXT HOVER EFFECT */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            style={{ willChange: "opacity" }}
            className="h-20 md:h-32 w-full flex items-center justify-center relative z-20"
          >
             {prefersReducedMotion ? (
               <h2 id="social-proof-heading" className="text-4xl md:text-6xl font-bold text-white">{COPY.socialProof.h2}</h2>
             ) : (
               <TextHoverEffect text={COPY.socialProof.h2} />
             )}
          </motion.div>

          {/* SUBHEADING - TYPEWRITER */}
          <div className="relative z-20 -mt-2 md:-mt-8 flex flex-col items-center gap-3 md:gap-4">
            <p className="text-base md:text-xl lg:text-2xl text-ascent-gray font-light text-center px-4">
              {COPY.socialProof.subheading.line1}
            </p>

            {prefersReducedMotion ? (
              <p className="text-xl md:text-3xl lg:text-4xl font-bold">
                {subheadingWords.map((word, i) => (
                  <span key={i} className={word.className}>{word.text} </span>
                ))}
              </p>
            ) : (
              <TypewriterEffectSmooth 
                words={subheadingWords} 
                className="text-xl md:text-3xl lg:text-4xl font-bold"
                cursorClassName="bg-ascent-amber"
              />
            )}
          </div>
        </div>

        {/* TERMINAL TICKER */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={viewportConfig}
          transition={{ delay: 0.5, duration: 0.8 }}
          style={{ willChange: "transform, opacity" }}
          className="w-full max-w-6xl mb-12 md:mb-16 px-2"
        >
          <div className="relative overflow-hidden rounded-lg md:rounded-xl border border-white/10 bg-ascent-obsidian/50 backdrop-blur-md">
            {/* Top glowing line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            
            {/* TERMINAL TICKER */}
            <TerminalTicker
              items={COPY.socialProof.ticker}
              speed="slow"
              direction="left"
              pauseOnHover={true}
              className="py-4 md:py-6"
            />
            
            {/* Gradient fade masks */}
            <div className="absolute inset-y-0 left-0 w-12 md:w-20 bg-gradient-to-r from-ascent-black/80 to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-12 md:w-20 bg-gradient-to-l from-ascent-black/80 to-transparent pointer-events-none" />
          </div>
        </motion.div>

        {/* CTA BUTTON - FULLY RESPONSIVE */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={viewportConfig}
          variants={fadeInVariants}
          transition={{ delay: 1.2 }}
          whileHover={prefersReducedMotion ? {} : {
            x: [0, -2, 2, -2, 0],
          }}
          style={{ willChange: prefersReducedMotion ? "auto" : "transform" }}
          className="w-full max-w-md px-4"
        >
          <MovingButton
            borderRadius="1.75rem"
            duration={prefersReducedMotion ? 0 : 3500}
            containerClassName="h-14 md:h-16 w-full" 
            className="bg-transparent text-white font-semibold text-base md:text-lg shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-shadow duration-300"
          >
            <span className="flex items-center justify-center gap-2 w-full px-4">
              <span className="truncate">{COPY.socialProof.cta}</span>
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
            </span>
          </MovingButton>
        </motion.div>

      </div>
    </section>
  );
}