"use client";

import { motion } from "framer-motion";
import { BackgroundBeams } from "@/components/ui/background-beams"; 
import { EncryptedText } from "@/components/ui/encrypted-text";
import { FogDiagnosticCard } from "@/components/landing/sections/fog/FogDiagnosticCard";
import { AscentDiagnosticCard } from "@/components/landing/sections/fog/AscentDiagnosticCard";
import { FogDensityMeter } from "@/components/landing/sections/fog/FogDensityMeter";
import { FogPunchline } from "@/components/landing/sections/fog/FogPunchline";
import { COPY } from "@/lib/constants";
import { fadeInVariants, viewportConfig } from "@/lib/animations";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function Fog() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative w-full py-20 md:py-32 flex flex-col items-center justify-center bg-ascent-obsidian overflow-hidden">
      
      {/* BACKGROUND LAYERS */}
      <div className="absolute inset-0 w-full h-full bg-ascent-obsidian bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] opacity-[0.15] z-0 pointer-events-none">
          <div className="absolute inset-0 bg-ascent-obsidian mask-[radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      </div>

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

        {/* SYSTEM DIAGNOSTIC CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-20">
          
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={viewportConfig}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full flex justify-center"
          >
            <FogDiagnosticCard />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={viewportConfig}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full flex justify-center"
          >
            <AscentDiagnosticCard />
          </motion.div>
        </div>

        {/* INTERACTIVE FOG DENSITY METER */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={viewportConfig}
          variants={prefersReducedMotion ? undefined : fadeInVariants}
          className="mb-16 md:mb-24"
        >
          <FogDensityMeter />
        </motion.div>

        {/* ENHANCED PUNCHLINE - TERMINAL DIAGNOSTIC */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={viewportConfig}
          variants={prefersReducedMotion ? undefined : fadeInVariants}
          transition={{ delay: 0.4 }}
        >
          <FogPunchline />
        </motion.div>

      </div>
    </section>
  );
}