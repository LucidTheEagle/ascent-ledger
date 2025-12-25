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

export function SocialProof() {
  
  // Configure the words for the typewriter effect
  const subheadingWords = [
    { text: "The", className: "text-white" },
    { text: "airspace", className: "text-white" },
    { text: "is", className: "text-white" },
    { text: "limited.", className: "text-ascent-amber" },
  ];

  return (
    <section className="relative min-h-[90vh] w-full flex items-center justify-center overflow-hidden py-20 bg-ascent-black">
      
      {/* LAYER 1: DEPTH BACKGROUND */}
      <div className="absolute inset-0 z-0 opacity-40">
        <BackgroundRippleEffect />
      </div>
      
      {/* LAYER 2: PARTICLES */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Particles quantity={100} staticity={50} ease={80} color="#ffffff" />
      </div>

      {/* CONTENT CONTAINER */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full flex flex-col items-center">
        
        {/* HEADER SECTION */}
        <div className="relative w-full flex flex-col items-center mb-12">
          
          {/* H2 - TEXT HOVER EFFECT */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            // FIXED: Valid Tailwind height classes
            className="h-16 md:h-32 w-full flex items-center justify-center relative z-20"
          >
             <TextHoverEffect text={COPY.socialProof.h2} />
          </motion.div>

          {/* SUBHEADING - TYPEWRITER */}
          <div className="relative z-20 -mt-4 md:-mt-8 flex flex-col items-center gap-4">
            <p className="text-lg md:text-2xl text-ascent-gray font-light text-center">
              {COPY.socialProof.subheading.line1}
            </p>

            <TypewriterEffectSmooth 
              words={subheadingWords} 
              className="text-2xl md:text-4xl font-bold"
              cursorClassName="bg-ascent-amber"
            />
          </div>
        </div>

        {/* TERMINAL TICKER */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={viewportConfig}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="w-full max-w-4xl mb-16"
        >
          <div className="relative overflow-hidden rounded-xl border border-white/10 bg-ascent-obsidian/50 backdrop-blur-md">
            {/* Top glowing line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            
            {/* ADJUSTED: Speed to "slow" as per master doc (50px/s desktop, 40px/s mobile) */}
            <TerminalTicker
              items={COPY.socialProof.ticker}
              speed="slow"
              direction="left"
              pauseOnHover={true}
              className="py-6"
            />
            
            {/* Gradient fade masks */}
            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-ascent-black/80 to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-ascent-black/80 to-transparent pointer-events-none" />
          </div>
        </motion.div>

        {/* CTA BUTTON WITH SHAKE HOVER */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={viewportConfig}
          variants={fadeInVariants}
          transition={{ delay: 1.2 }}
          // ADDED: Shake animation on hover
          whileHover={{
            x: [0, -2, 2, -2, 0],
          }}
          style={{ display: "inline-block" }}
        >
          <MovingButton
            borderRadius="1.75rem"
            duration={3500}
            containerClassName="h-14 w-60 md:w-72" 
            className="bg-transparent text-white font-semibold text-lg shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-shadow duration-300"
          >
            <span className="flex items-center gap-2">
              {COPY.socialProof.cta}
              <ArrowRight className="w-4 h-4" />
            </span>
          </MovingButton>
        </motion.div>

      </div>
    </section>
  );
}