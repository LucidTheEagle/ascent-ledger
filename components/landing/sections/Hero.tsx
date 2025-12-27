"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { BackgroundLines } from "@/components/ui/background-lines";
import { Particles } from "@/components/ui/particle";
import { LayoutTextFlip } from "@/components/ui/layout-text-flip";
import { AuroraText } from "@/components/ui/aurora";
import { ShimmerButton } from "@/components/ui/shimmerBTN";
import { RippleButton } from "@/components/ui/rippleBTN";
import { COPY } from "@/lib/constants";
import { slideUpVariants, staggerContainerVariants } from "@/lib/animations";

export function Hero() {
  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden pt-20">
      {/* LAYERED BACKGROUNDS */}
      <BackgroundLines className="absolute inset-0 w-full h-full z-0">
        <div className="absolute inset-0 bg-ascent-black/70" />
      </BackgroundLines>
      
      <Particles
        className="absolute inset-0 z-[1]"
        quantity={80}
        ease={80}
        color="#3B82F6"
        size={0.5}
        staticity={50}
      />

      {/* HERO CONTENT */}
      <motion.div
        variants={staggerContainerVariants}
        initial="initial"
        animate="animate"
        className="relative z-10 flex flex-col items-center justify-center px-6 text-center max-w-5xl mx-auto space-y-8"
      >
        {/* H1 WITH FLIP WORDS - RESPONSIVE SIZING */}
        <motion.div variants={slideUpVariants}>
          <h1 
            className="font-bold text-white leading-tight"
            style={{
              fontSize: "clamp(32px, 10vw, 72px)", // Mobile: 32px min, Desktop: 72px max
            }}
          >
            {COPY.hero.h1.staticText}
            <br />
            <LayoutTextFlip 
              words={COPY.hero.h1.flipWords} 
              duration={3000}
              className="text-ascent-blue"
            />
          </h1>
        </motion.div>

        {/* SUBHEADING WITH AURORA HIGHLIGHT */}
        <motion.div 
          variants={slideUpVariants}
          className="max-w-3xl"
        >
          <p className="text-base md:text-xl text-ascent-gray">
            You are working hard. But are you{" "}
            <AuroraText
              colors={["#3B82F6", "#8B5CF6", "#3B82F6"]}
              className="font-semibold"
            >
              {COPY.hero.highlightWord}
            </AuroraText>
            ?
          </p>
        </motion.div>

        {/* CTAs - STACK VERTICALLY ON MOBILE */}
        <motion.div
          variants={slideUpVariants}
          className="flex flex-col w-full sm:flex-row sm:w-auto items-center gap-4 pt-4"
        >
          {/* PRIMARY CTA - SHIMMER BUTTON */}
          <ShimmerButton
            className="w-full sm:w-auto bg-ascent-blue hover:bg-ascent-blue/90 px-8 py-4 text-base font-semibold min-h-[44px]"
            shimmerColor="#ffffff"
            shimmerSize="0.1em"
            shimmerDuration="2s"
          >
            <span className="flex items-center justify-center gap-2">
              {COPY.hero.cta.primary}
              <ArrowRight className="w-5 h-5" />
            </span>
          </ShimmerButton>

          {/* SECONDARY CTA - RIPPLE BUTTON */}
          <RippleButton
            className="w-full sm:w-auto border-white/20 bg-transparent text-white hover:bg-white/5 px-8 py-4 text-base font-semibold min-h-[44px]"
            rippleColor="#3B82F6"
          >
            {COPY.hero.cta.secondary}
          </RippleButton>
        </motion.div>
      </motion.div>
    </section>
  );
}