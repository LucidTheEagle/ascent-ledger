// components/landing/SectionTransition.tsx

"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

/**
 * CHECKPOINT 12: Section Transition Component
 * 
 * Creates smooth visual bridges between sections with gradient overlays.
 * Prevents jarring background color changes.
 */

type TransitionType = 
  | "obsidian-to-black"    // Fog → Problem
  | "black-to-black"       // Problem → Solution (same bg, just spacing)
  | "black-to-obsidian"    // Solution → Trinity (Aurora bg)
  | "aurora-to-black"      // Trinity → Social Proof
  | "black-to-black-footer" // Social Proof → Footer
  | "none";                // No transition needed

interface SectionTransitionProps {
  type: TransitionType;
  className?: string;
}

export function SectionTransition({ type, className }: SectionTransitionProps) {
  const prefersReducedMotion = useReducedMotion();

  // No transition needed
  if (type === "none") return null;

  // Get gradient config based on transition type
  const getGradient = () => {
    switch (type) {
      case "obsidian-to-black":
        return "bg-gradient-to-b from-ascent-obsidian via-ascent-obsidian/50 to-ascent-black";
      case "black-to-obsidian":
        return "bg-gradient-to-b from-ascent-black via-ascent-black/50 to-transparent";
      case "aurora-to-black":
        return "bg-gradient-to-b from-transparent via-ascent-black/50 to-ascent-black";
      case "black-to-black-footer":
        return "bg-gradient-to-b from-ascent-black to-ascent-black";
      default:
        return "bg-transparent";
    }
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
      whileInView={prefersReducedMotion ? {} : { opacity: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: prefersReducedMotion ? 0 : 1, ease: "easeInOut" }}
      className={cn(
        "w-full h-24 md:h-32 pointer-events-none",
        getGradient(),
        className
      )}
      aria-hidden="true"
    />
  );
}

/**
 * USAGE EXAMPLE:
 * 
 * <section><Fog /></section>
 * <SectionTransition type="obsidian-to-black" />
 * <section><ProblemSection /></section>
 */