"use client";

import { motion } from "framer-motion";
import { BackgroundBeams } from "@/components/ui/background-beams"; 
import { EncryptedText } from "@/components/ui/encrypted-text";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { GlareCard } from "@/components/ui/glare-card";
import { COPY } from "@/lib/constants";
import { 
  slideInLeftVariants, 
  slideInRightVariants, 
  fadeInVariants,
  viewportConfig 
} from "@/lib/animations";

export function Fog() {
  const introText = COPY.fog.subheading.split("You have 0 clarity")[0];

  return (
    <section className="relative w-full py-20 md:py-32 flex flex-col items-center justify-center bg-ascent-obsidian overflow-x-hidden">
      
      {/* 1. THE RADAR GRID (Technical, Clean, Map-like) */}
      <div className="absolute inset-0 w-full h-full bg-ascent-obsidian bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.15] z-0 pointer-events-none">
          <div className="absolute inset-0 bg-ascent-obsidian [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      </div>

      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none"><BackgroundBeams /></div>

      {/* CONTENT CONTAINER */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-6">
        
        {/* H2 HEADER */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={viewportConfig}
          variants={fadeInVariants}
          className="text-center mb-16 md:mb-24"
        >
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight px-2">
            <EncryptedText 
              text={COPY.fog.h2}
              revealDelayMs={50} // Slightly faster reveal
              flipDelayMs={30}
              className="text-white drop-shadow-xl"
            />
          </h2>
        </motion.div>

        {/* DICHOTOMY GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-20">
          
          {/* LEFT CARD - THE FOG */}
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={viewportConfig}
            variants={slideInLeftVariants}
            className="w-full flex justify-center"
          >
            <CardSpotlight className="w-full max-w-lg min-h-[400px] md:h-[450px] p-8 border border-white/5 bg-ascent-obsidian/80 backdrop-blur-sm">
              <div className="relative z-10 flex flex-col justify-center h-full">
                <h3 className="text-2xl font-bold text-ascent-muted mb-8 tracking-wide">
                  {COPY.fog.leftCard.title}
                </h3>
                
                <ul className="space-y-6">
                  {COPY.fog.leftCard.bullets.map((bullet, index) => (
                    <motion.li
                      key={index}
                      className="text-lg text-white/50 flex items-start gap-4 font-mono"
                      // The Blur Effect: Visualizing "Lack of Focus"
                      style={{ filter: "blur(0.8px)" }}
                      animate={{ opacity: [0.3, 0.7, 0.3] }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        delay: index * 0.7,
                      }}
                    >
                      <span className="text-ascent-warning/50 mt-1 text-sm shrink-0">✕</span>
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
            variants={slideInRightVariants}
            className="w-full flex justify-center"
          >
             {/* GlareCard Container */}
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
                          className="text-lg text-white flex items-start gap-4"
                        >
                          {/* Crisp, glowing bullet point */}
                          <span className="text-ascent-blue mt-1.5 h-2 w-2 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)] bg-ascent-blue shrink-0" />
                          <span className="font-medium tracking-wide leading-snug">{bullet}</span>
                        </motion.li>
                      ))}
                    </ul>
                </GlareCard>
             </div>
          </motion.div>
        </div>

        {/* PUNCHLINE */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={viewportConfig}
          variants={fadeInVariants}
          transition={{ delay: 0.4 }}
          className="text-center max-w-2xl mx-auto px-4"
        >
          {/* Part 1: The Setup */}
          <div className="mb-4">
            <TextGenerateEffect
                words={introText}
                className="text-xl md:text-2xl text-ascent-muted font-light leading-relaxed"
                filter={false}
                duration={0.04}
            />
          </div>
          
          {/* Part 2: The Punchline */}
          <motion.div
            className="relative inline-block"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
             <p className="text-2xl md:text-4xl font-bold text-white">
                You have <span className="text-ascent-warning drop-shadow-[0_0_25px_rgba(239,68,68,0.4)] underline decoration-ascent-warning/30 underline-offset-8">{COPY.fog.painPoint}</span>.
             </p>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}