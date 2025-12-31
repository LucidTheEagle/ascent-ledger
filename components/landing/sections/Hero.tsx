"use client";

import React from "react";
import dynamic from 'next/dynamic'; // Import Dynamic
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { LayoutTextFlip } from "@/components/ui/layout-text-flip";
import { AuroraText } from "@/components/ui/aurora";
import { ShimmerButton } from "@/components/ui/shimmerBTN";
import { RippleButton } from "@/components/ui/rippleBTN";
import { COPY } from "@/lib/constants";
import { slideUpVariants, staggerContainerVariants } from "@/lib/animations";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// DYNAMIC IMPORT: Loads particles separately from the main thread
const HeroParticles = dynamic(
  () => import('./HeroParticles').then((mod) => mod.HeroParticles),
  { 
    ssr: false, // Particles are visual-only, no need for server rendering
    loading: () => <div className="absolute inset-0 bg-ascent-black/90" /> // Simple dark placeholder
  }
);

export function Hero() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden pt-20">
      
      {/* 1. HEAVY VISUALS (Background Layer) */}
      <HeroParticles />

      {/* 2. MAIN CONTENT (Foreground Layer - LCP Priority) */}
      <motion.div
        variants={prefersReducedMotion ? undefined : staggerContainerVariants}
        initial="initial"
        animate="animate"
        className="relative z-10 flex flex-col items-center justify-center px-6 text-center max-w-5xl mx-auto space-y-8"
      >
        {/* H1 WITH FLIP WORDS */}
        <motion.div variants={prefersReducedMotion ? undefined : slideUpVariants}>
          <h1 
            className="font-bold text-white leading-tight"
            style={{
              fontSize: "clamp(32px, 10vw, 72px)",
              willChange: "transform, opacity",
            }}
          >
            {COPY.hero.h1.staticText}
            <br />
            {prefersReducedMotion ? (
              <span className="text-ascent-blue">{COPY.hero.h1.flipWords[0]}</span>
            ) : (
              <LayoutTextFlip 
                words={COPY.hero.h1.flipWords} 
                duration={3000}
                className="text-ascent-blue"
              />
            )}
          </h1>
        </motion.div>

        {/* SUBHEADING */}
        <motion.div 
          variants={prefersReducedMotion ? undefined : slideUpVariants}
          className="max-w-3xl"
        >
          <p className="text-base md:text-xl text-ascent-gray">
            You are working hard. But are you{" "}
            {prefersReducedMotion ? (
              <span className="text-ascent-blue font-semibold">{COPY.hero.highlightWord}</span>
            ) : (
              <AuroraText
                colors={["#3B82F6", "#8B5CF6", "#3B82F6"]}
                className="font-semibold"
              >
                {COPY.hero.highlightWord}
              </AuroraText>
            )}
            ?
          </p>
        </motion.div>

        {/* CTAs */}
        <motion.div
          variants={prefersReducedMotion ? undefined : slideUpVariants}
          className="flex flex-col w-full sm:flex-row sm:w-auto items-center gap-4 pt-4"
        >
          {/* PRIMARY CTA */}
          <ShimmerButton
            className="w-full sm:w-auto bg-ascent-blue hover:bg-ascent-blue/90 px-8 py-4 text-base font-semibold min-h-[44px]"
            shimmerColor="#ffffff"
            shimmerSize="0.1em"
            shimmerDuration={prefersReducedMotion ? "0s" : "2s"}
          >
            <span className="flex items-center justify-center gap-2">
              {COPY.hero.cta.primary}
              <ArrowRight className="w-5 h-5" />
            </span>
          </ShimmerButton>

          {/* SECONDARY CTA */}
          <RippleButton
            className="w-full sm:w-auto border-white/20 bg-transparent text-white hover:bg-white/5 px-8 py-4 text-base font-semibold min-h-[44px]"
            rippleColor={prefersReducedMotion ? "transparent" : "#3B82F6"}
          >
            {COPY.hero.cta.secondary}
          </RippleButton>
        </motion.div>
      </motion.div>
    </section>
  );
}