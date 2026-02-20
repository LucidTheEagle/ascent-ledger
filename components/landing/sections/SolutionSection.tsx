/* eslint-disable react-hooks/refs */
"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Target, Filter, Compass, ArrowRight, CheckCircle2, X } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { viewportConfig } from "@/lib/animations";
import type { ElementType } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type AlignmentPhase = "capture" | "filter" | "align";

interface NoiseItem {
  id: number;
  text: string;
  isSignal: boolean; // signal = keeps | noise = filtered
  gridCol: number;
  gridRow: number;
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const NOISE_ITEMS: NoiseItem[] = [
  { id: 0,  text: "Slack: 4 Unread",       isSignal: false, gridCol: 1, gridRow: 1 },
  { id: 1,  text: "Vision: Series B",       isSignal: true,  gridCol: 2, gridRow: 1 },
  { id: 2,  text: "Email: 'Urgent'",        isSignal: false, gridCol: 3, gridRow: 1 },
  { id: 3,  text: "Week 3 Log",             isSignal: true,  gridCol: 1, gridRow: 2 },
  { id: 4,  text: "Imposter Syndrome",      isSignal: false, gridCol: 2, gridRow: 2 },
  { id: 5,  text: "Pattern: Risk Aversion", isSignal: true,  gridCol: 3, gridRow: 2 },
  { id: 6,  text: "New Framework?",         isSignal: false, gridCol: 1, gridRow: 3 },
  { id: 7,  text: "Dopamine Hit",           isSignal: false, gridCol: 2, gridRow: 3 },
  { id: 8,  text: "Strategic Decision",     isSignal: true,  gridCol: 3, gridRow: 3 },
];

const PHASE_TIMING = {
  capture: {
    label: "01 — CAPTURE",
    description: "System catches all inputs. Nothing escapes.",
    icon: Target,
    color: "text-ascent-blue",
  },
  filter: {
    label: "02 — FILTER",
    description: "Noise is identified and eliminated.",
    icon: Filter,
    color: "text-ascent-amber",
  },
  align: {
    label: "03 — ALIGN",
    description: "Signals align toward the North Star.",
    icon: Compass,
    color: "text-ascent-green",
  },
} as const satisfies Record<AlignmentPhase, { label: string; description: string; icon: ElementType; color: string }>;

// ─── ANIMATED GRID ITEM ───────────────────────────────────────────────────────

const GridItem = ({
  item,
  phase,
  index,
  prefersReducedMotion,
}: {
  item: NoiseItem;
  phase: AlignmentPhase;
  index: number;
  prefersReducedMotion: boolean;
}) => {
  const isFiltered = phase === "filter" && !item.isSignal;
  const isAligned  = phase === "align";
  const isCaptured = phase === "capture";

  // Visual state per phase
  const getItemStyle = () => {
    if (isFiltered) return "border-ascent-red/40 bg-ascent-red/5 opacity-50";
    if (isAligned && item.isSignal) return "border-ascent-green/60 bg-ascent-green/10 shadow-[0_0_20px_rgba(16,185,129,0.2)]";
    if (isAligned && !item.isSignal) return "border-white/0 bg-transparent opacity-0";
    if (isCaptured) return "border-ascent-blue/30 bg-ascent-blue/5";
    return "border-white/10 bg-ascent-obsidian/40";
  };

  return (
    <motion.div
      layout
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.8 }}
      animate={{
        opacity: isAligned && !item.isSignal ? 0 : 1,
        scale: isAligned && item.isSignal ? 1.02 : 1,
      }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.5,
        delay: prefersReducedMotion ? 0 : index * 0.06,
        ease: "easeOut",
      }}
      className={cn(
        "relative px-3 py-3 md:px-4 md:py-3 rounded-xl border",
        "backdrop-blur-sm font-mono text-xs md:text-sm",
        "transition-all duration-500 ease-out",
        "flex items-center justify-between gap-2",
        getItemStyle()
      )}
    >
      <span className={cn(
        "truncate transition-colors duration-300",
        isAligned && item.isSignal ? "text-white font-semibold" : "text-ascent-gray"
      )}>
        {item.text}
      </span>

      {/* Filter phase — noise shows X, phase just transitions */}
      <AnimatePresence mode="wait">
        {isFiltered && (
          <motion.div
            key="x"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
          >
            <X className="w-3 h-3 text-ascent-red shrink-0" />
          </motion.div>
        )}
        {isAligned && item.isSignal && (
          <motion.div
            key="check"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: prefersReducedMotion ? 0 : 0.3 }}
          >
            <CheckCircle2 className="w-3 h-3 text-ascent-green shrink-0" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── PHASE STEPPER ─────────────────────────────────────────────────────────────

const PhaseStepper = ({
  phase,
  onPhaseChange,
}: {
  phase: AlignmentPhase;
  onPhaseChange: (p: AlignmentPhase) => void;
}) => {
  const phases: AlignmentPhase[] = ["capture", "filter", "align"];

  return (
    <div className="flex items-center justify-center gap-2 md:gap-4">
      {phases.map((p, i) => {
        const config = PHASE_TIMING[p];
        const Icon = config.icon;
        const isActive = phase === p;
        const isPast = phases.indexOf(phase) > i;

        return (
          <button
            key={p}
            onClick={() => onPhaseChange(p)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-xl",
              "border font-mono text-xs md:text-sm transition-all duration-300",
              "min-h-[44px]", // Accessibility: 44px tap target
              isActive
                ? cn("border-white/20 bg-white/10 text-white", config.color)
                : isPast
                ? "border-white/10 bg-white/5 text-ascent-gray/60"
                : "border-white/5 bg-transparent text-ascent-gray/40"
            )}
          >
            <Icon className={cn("w-3 h-3 md:w-4 md:h-4 shrink-0", isActive ? config.color : "")} />
            <span className="hidden sm:inline">{config.label}</span>
            <span className="sm:hidden">{`0${i + 1}`}</span>
          </button>
        );
      })}
    </div>
  );
};

// ─── AUTO-PLAY HOOK ────────────────────────────────────────────────────────────

function useAutoPlay(
  isInView: boolean,
  prefersReducedMotion: boolean,
  setPhase: (p: AlignmentPhase) => void
) {
  const hasPlayed = useRef(false);

  // Auto-advance through phases when section enters view
  if (isInView && !hasPlayed.current && !prefersReducedMotion) {
    hasPlayed.current = true;
    setTimeout(() => setPhase("filter"), 1400);
    setTimeout(() => setPhase("align"),  2800);
  }
  if (isInView && !hasPlayed.current && prefersReducedMotion) {
    hasPlayed.current = true;
    setPhase("align");
  }
}

// ─── SOLUTION PILLARS ─────────────────────────────────────────────────────────

const PILLARS = [
  {
    title: "Vision Canvas",
    description: "Define your North Star. Every decision checks against it.",
    icon: Compass,
    color: "text-ascent-blue",
    border: "border-ascent-blue/20",
    bg: "bg-ascent-blue/5",
    glow: "hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]",
  },
  {
    title: "Strategic Log",
    description: "Weekly pattern detection. AI catches what you miss.",
    icon: Filter,
    color: "text-ascent-green",
    border: "border-ascent-green/20",
    bg: "bg-ascent-green/5",
    glow: "hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]",
  },
  {
    title: "Fog Check",
    description: "Blind spot radar. System identifies drift before crisis.",
    icon: Target,
    color: "text-ascent-purple",
    border: "border-ascent-purple/20",
    bg: "bg-ascent-purple/5",
    glow: "hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]",
  },
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export function SolutionSection() {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef  = useRef<HTMLDivElement>(null);
  const gridRef     = useRef<HTMLDivElement>(null);
  const isInView    = useInView(gridRef, { once: true, margin: "-100px" });

  const [phase, setPhase] = useState<AlignmentPhase>("capture");

  // Auto-play through phases on scroll into view
  useAutoPlay(isInView, prefersReducedMotion, setPhase);

  const currentConfig = PHASE_TIMING[phase];
  const Icon = currentConfig.icon;

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-ascent-black py-20 md:py-28 overflow-hidden"
    >
      {/* ── Background ── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Grid lines (engineering feel) */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59,130,246,0.4) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59,130,246,0.4) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
        {/* Radial glow center */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,rgba(59,130,246,0.05),transparent)]" />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 md:px-6">

        {/* ── Header ── */}
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
          whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          viewport={viewportConfig}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ascent-green/10 border border-ascent-green/20 text-ascent-green text-xs font-mono mb-6 uppercase tracking-widest">
            <CheckCircle2 className="w-3 h-3" />
            System Solution: Vector Alignment
          </div>

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            Chaos doesn&apos;t need{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-ascent-blue via-ascent-purple to-ascent-green">
              more effort.
            </span>
          </h2>

          <p className="text-base md:text-lg text-ascent-gray max-w-2xl mx-auto leading-relaxed">
            It needs a system that separates signal from noise.
            <br className="hidden md:block" />
            <strong className="text-white">One direction. Maximum displacement.</strong>
          </p>
        </motion.div>

        {/* ── Vector Alignment Demo ── */}
        <motion.div
          ref={gridRef}
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 32 }}
          whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          viewport={viewportConfig}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          className={cn(
            "relative p-6 md:p-10 rounded-2xl mb-12 md:mb-16",
            "bg-ascent-obsidian/60 backdrop-blur-xl",
            "border border-white/10",
            "shadow-[0_8px_48px_rgba(0,0,0,0.4)]"
          )}
        >
          {/* Active phase label */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <motion.div
                key={phase}
                initial={prefersReducedMotion ? {} : { scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <Icon className={cn("w-5 h-5 md:w-6 md:h-6", currentConfig.color)} />
              </motion.div>
              <div>
                <p className={cn("text-xs font-mono uppercase tracking-wider", currentConfig.color)}>
                  {currentConfig.label}
                </p>
                <motion.p
                  key={phase + "_desc"}
                  initial={prefersReducedMotion ? {} : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="text-sm text-ascent-gray mt-0.5"
                >
                  {currentConfig.description}
                </motion.p>
              </div>
            </div>

            {/* Phase stepper */}
            <PhaseStepper
              phase={phase}
              onPhaseChange={setPhase}
            />
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
            {NOISE_ITEMS.map((item, index) => (
              <GridItem
                key={item.id}
                item={item}
                phase={phase}
                index={index}
                prefersReducedMotion={prefersReducedMotion}
              />
            ))}
          </div>

          {/* North Star emergence on align phase */}
          <AnimatePresence>
            {phase === "align" && (
              <motion.div
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.6, delay: prefersReducedMotion ? 0 : 0.4, ease: "easeOut" }}
                className={cn(
                  "mt-6 p-4 md:p-5 rounded-xl",
                  "border border-ascent-green/30 bg-ascent-green/5",
                  "flex items-center justify-between gap-4"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-ascent-green shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  <span className="text-sm md:text-base font-mono text-white font-semibold">
                    North Star: Aligned
                  </span>
                </div>
                <span className="text-xs font-mono text-ascent-green">
                  4 SIGNALS ACTIVE
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Solution Pillars ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12 md:mb-16">
          {PILLARS.map((pillar, index) => {
            const PillarIcon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
                whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                viewport={viewportConfig}
                transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                className={cn(
                  "p-5 md:p-6 rounded-xl border backdrop-blur-sm",
                  "transition-all duration-300 cursor-default",
                  pillar.border, pillar.bg, pillar.glow
                )}
              >
                <PillarIcon className={cn("w-6 h-6 mb-4", pillar.color)} />
                <h3 className="text-white font-semibold mb-2 text-base md:text-lg">
                  {pillar.title}
                </h3>
                <p className="text-sm text-ascent-gray/80 leading-relaxed">
                  {pillar.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* ── CTA ── */}
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
          whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          viewport={viewportConfig}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="text-center"
        >
          <Link
            href="/login"
            className={cn(
              "group inline-flex items-center gap-3 px-8 py-4 rounded-2xl",
              "bg-gradient-to-r from-ascent-blue to-ascent-purple",
              "text-white font-semibold text-base md:text-lg",
              "transition-all duration-300",
              "hover:shadow-[0_0_40px_rgba(59,130,246,0.4)]",
              "hover:scale-[1.02]",
              "min-h-[56px]"
            )}
          >
            Begin Vector Alignment
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>

          <p className="mt-4 text-xs md:text-sm font-mono text-ascent-gray/50 uppercase tracking-wider">
            No credit card. Cohort 4 · March 2026.
          </p>
        </motion.div>

      </div>
    </section>
  );
}