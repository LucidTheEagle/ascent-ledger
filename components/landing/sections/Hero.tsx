"use client";

import React from "react";
import dynamic from 'next/dynamic';
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { LayoutTextFlip } from "@/components/ui/layout-text-flip";
import { ShimmerButton } from "@/components/ui/shimmerBTN";
import { RippleButton } from "@/components/ui/rippleBTN";
import { COPY } from "@/lib/constants";
import { slideUpVariants, staggerContainerVariants } from "@/lib/animations";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

// DYNAMIC IMPORT: Loads particles separately from the main thread
const HeroParticles = dynamic(
  () => import('./HeroParticles').then((mod) => mod.HeroParticles),
  { 
    ssr: false,
    loading: () => <div className="absolute inset-0 bg-ascent-black/90" />
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
        className="relative z-10 flex flex-col items-center justify-center px-6 text-center max-w-6xl mx-auto space-y-8"
      >
        {/* H1 WITH FLIP WORDS */}
        <motion.div variants={prefersReducedMotion ? undefined : slideUpVariants}>
          <h1 
            id="hero-heading"
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

        {/* ENHANCED SUBHEADING - Visceral Recognition */}
        <motion.div 
          variants={prefersReducedMotion ? undefined : slideUpVariants}
          className="max-w-3xl"
        >
          <p className="text-base md:text-xl text-ascent-gray leading-relaxed">
            You&apos;ve been promoted twice. Changed companies. Hit every milestone.
            <br />
            <span className="text-white font-semibold">
              So why does it still feel like you&apos;re running in place?
            </span>
          </p>
        </motion.div>

        {/* THE RECOGNITION CARD - The Mirror */}
        <motion.div
          variants={prefersReducedMotion ? undefined : slideUpVariants}
          className="w-full max-w-4xl"
        >
          <div className={cn(
            "relative p-6 md:p-8 rounded-2xl",
            "bg-ascent-obsidian/60 backdrop-blur-xl",
            "border border-white/10",
            "shadow-card",
            "overflow-hidden"
          )}>
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-ascent-blue/5 via-transparent to-ascent-purple/5 pointer-events-none" />
            
            {/* Content */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              
              {/* LEFT: CURRENT STATE (The Fog) */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-ascent-amber" />
                  <h3 className="text-sm font-mono uppercase tracking-wider text-ascent-amber">
                    Current State
                  </h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-left">
                    <XCircle className="w-5 h-5 text-ascent-red/70 shrink-0 mt-0.5" />
                    <span className="text-sm text-ascent-gray">
                      47 browser tabs open, lost in research
                    </span>
                  </div>
                  <div className="flex items-start gap-3 text-left">
                    <XCircle className="w-5 h-5 text-ascent-red/70 shrink-0 mt-0.5" />
                    <span className="text-sm text-ascent-gray">
                      &quot;Networking&quot; with no clear strategy
                    </span>
                  </div>
                  <div className="flex items-start gap-3 text-left">
                    <XCircle className="w-5 h-5 text-ascent-red/70 shrink-0 mt-0.5" />
                    <span className="text-sm text-ascent-gray">
                      LinkedIn scroll addiction disguised as work
                    </span>
                  </div>
                </div>
              </div>

              {/* DIVIDER (Desktop only) */}
              <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[80%]">
                <div className="w-px h-full bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                <motion.div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  animate={{
                    x: [0, 10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <ArrowRight className="w-5 h-5 text-ascent-blue" />
                </motion.div>
              </div>

              {/* Mobile Divider */}
              <div className="md:hidden flex items-center justify-center py-2">
                <motion.div
                  animate={{
                    y: [0, 8, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <ArrowRight className="w-5 h-5 text-ascent-blue rotate-90" />
                </motion.div>
              </div>

              {/* RIGHT: TARGET STATE (The Clarity) */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-ascent-green" />
                  <h3 className="text-sm font-mono uppercase tracking-wider text-ascent-green">
                    Target State
                  </h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-left">
                    <CheckCircle2 className="w-5 h-5 text-ascent-green/70 shrink-0 mt-0.5" />
                    <span className="text-sm text-white">
                      Vision-driven decisions with clarity
                    </span>
                  </div>
                  <div className="flex items-start gap-3 text-left">
                    <CheckCircle2 className="w-5 h-5 text-ascent-green/70 shrink-0 mt-0.5" />
                    <span className="text-sm text-white">
                      Weekly strategic logs showing progress
                    </span>
                  </div>
                  <div className="flex items-start gap-3 text-left">
                    <CheckCircle2 className="w-5 h-5 text-ascent-green/70 shrink-0 mt-0.5" />
                    <span className="text-sm text-white">
                      AI pattern detection catching blind spots
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Diagnostic Hint */}
            <div className="mt-6 pt-6 border-t border-white/5">
              <div className="flex items-center justify-center gap-2 text-xs font-mono text-ascent-gray/60">
                <div className="w-2 h-2 rounded-full bg-ascent-amber animate-pulse" />
                <span>DIAGNOSTIC: Motion detected, clarity uncertain</span>
              </div>
            </div>

          </div>
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