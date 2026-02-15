"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import { Particles } from "@/components/ui/particle";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { Button as MovingButton } from "@/components/ui/moving-border";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import { ArrowRight } from "lucide-react";
import { COPY } from "@/lib/constants";
import { 
  viewportConfig 
} from "@/lib/animations";
import { useReducedMotion, getParticleCount } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

// Roster data - Real metrics (anonymized)
const ROSTER_DATA = [
  {
    username: "@alex_chen",
    week: 12,
    metric: "87% fog cleared",
    highlight: "3 patterns caught",
    status: "active" as const,
  },
  {
    username: "@sarah_kim",
    week: 8,
    metric: "Vision revised 2x",
    highlight: "Crisis recovery",
    status: "recovery" as const,
  },
  {
    username: "@james_rivera",
    week: 24,
    metric: "Longest streak: 16 weeks",
    highlight: "Flight Ready",
    status: "active" as const,
  },
  {
    username: "@taylor_nguyen",
    week: 6,
    metric: "Blind spot detected",
    highlight: "Course corrected",
    status: "pattern" as const,
  },
  {
    username: "@morgan_silva",
    week: 15,
    metric: "92% vision clarity",
    highlight: "Momentum building",
    status: "active" as const,
  },
];

// Status badge component
const StatusBadge = ({ status }: { status: "active" | "recovery" | "pattern" }) => {
  const config = {
    active: { color: "bg-ascent-green", label: "Active Ascent" },
    recovery: { color: "bg-ascent-amber", label: "Recovery Mode" },
    pattern: { color: "bg-ascent-blue", label: "Pattern Detected" },
  };

  const { color, label } = config[status];

  return (
    <div className="flex items-center gap-2">
      <div className={cn("w-2 h-2 rounded-full", color)} />
      <span className="text-xs font-mono text-ascent-gray/60 uppercase">{label}</span>
    </div>
  );
};

// Roster item component
const RosterItem = ({ user, index }: { user: typeof ROSTER_DATA[0]; index: number }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, x: -20 }}
      whileInView={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
      viewport={viewportConfig}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className={cn(
        "p-4 md:p-5 rounded-xl",
        "bg-ascent-obsidian/40 backdrop-blur-sm",
        "border border-white/5",
        "hover:border-white/10 transition-all duration-300",
        "group"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Eagle Icon */}
        <div className="shrink-0 w-10 h-10 rounded-full bg-ascent-blue/10 border border-ascent-blue/20 flex items-center justify-center group-hover:bg-ascent-blue/20 transition-colors">
          <span className="text-lg">🦅</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm md:text-base font-mono text-white font-semibold">
              {user.username}
            </span>
            <span className="text-xs font-mono text-ascent-gray">
              Week {user.week}
            </span>
          </div>

          <div className="flex flex-col gap-1 text-xs md:text-sm text-ascent-gray">
            <span>{user.metric}</span>
            <span className="text-ascent-blue">{user.highlight}</span>
          </div>

          <div className="mt-3">
            <StatusBadge status={user.status} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Cohort scarcity card
const CohortCard = () => {
  const prefersReducedMotion = useReducedMotion();
  const [slotsRemaining, setSlotsRemaining] = useState(153);
  const totalSlots = 1000;
  const fillPercentage = ((totalSlots - slotsRemaining) / totalSlots) * 100;

  // Simulate slots filling (optional - remove if you want static)
  useEffect(() => {
    if (prefersReducedMotion) return;

    const interval = setInterval(() => {
      setSlotsRemaining(prev => {
        if (prev <= 100) return prev; // Stop at 100 remaining
        return prev - 1;
      });
    }, 8000); // One slot fills every 8 seconds

    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
      whileInView={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
      viewport={viewportConfig}
      transition={{ delay: 0.6, duration: 0.5 }}
      className={cn(
        "relative p-6 md:p-8 rounded-2xl",
        "bg-gradient-to-br from-ascent-blue/10 via-ascent-obsidian to-ascent-purple/5",
        "border border-ascent-blue/20",
        "shadow-[0_8px_32px_rgba(59,130,246,0.15)]",
        "max-w-2xl mx-auto"
      )}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-ascent-blue/5 to-transparent rounded-2xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h3 className="text-2xl md:text-3xl font-bold text-white">
            Claim Your Slot
          </h3>
          <p className="text-sm md:text-base font-mono text-ascent-blue">
            Cohort 4 • March 2026
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-3">
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-ascent-blue via-ascent-purple to-ascent-blue rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${fillPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between text-xs font-mono">
            <span className="text-ascent-gray">{Math.round(fillPercentage)}% full</span>
            <motion.span 
              className="text-ascent-blue font-semibold"
              animate={prefersReducedMotion ? {} : {
                opacity: [1, 0.6, 1],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {slotsRemaining} / {totalSlots} slots remaining
            </motion.span>
          </div>
        </div>

        {/* CTA Button */}
        <MovingButton
          borderRadius="1.5rem"
          duration={prefersReducedMotion ? 0 : 3500}
          containerClassName="h-14 md:h-16 w-full"
          className="bg-ascent-blue/10 hover:bg-ascent-blue/20 text-white font-semibold text-base md:text-lg transition-all duration-300"
        >
          <span className="flex items-center justify-center gap-2 w-full">
            Reserve Your Ascent Slot
            <ArrowRight className="w-5 h-5" />
          </span>
        </MovingButton>

        {/* Bonus Badge */}
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="pt-4 border-t border-white/10 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ascent-amber/10 border border-ascent-amber/20">
            <span className="text-lg">⚡</span>
            <span className="text-xs md:text-sm font-semibold text-ascent-amber">
              First 100: Lifetime Pro access
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export function SocialProof() {
  const prefersReducedMotion = useReducedMotion();
  const particleCount = getParticleCount(prefersReducedMotion);
  
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
      
      {/* LAYER 2: PARTICLES */}
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

        {/* THE ASCENT ROSTER - Enhanced Leaderboard */}
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
          whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          viewport={viewportConfig}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="w-full max-w-4xl mb-12 md:mb-16"
        >
          {/* Roster Header */}
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
              The Ascent Roster
            </h3>
            <div className="flex items-center justify-center gap-2 text-xs md:text-sm font-mono text-ascent-gray/60">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/20 max-w-[100px]" />
              <span className="uppercase tracking-wider">Active Climbers</span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/20 max-w-[100px]" />
            </div>
          </div>

          {/* Roster Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {ROSTER_DATA.map((user, index) => (
              <RosterItem key={user.username} user={user} index={index} />
            ))}
          </div>

          {/* Roster Stats */}
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            whileInView={prefersReducedMotion ? {} : { opacity: 1 }}
            viewport={viewportConfig}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="p-4 rounded-xl bg-ascent-obsidian/40 border border-white/5 backdrop-blur-sm"
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-xs md:text-sm font-mono">
              <div className="flex items-center gap-2">
                <span className="text-ascent-gray">CURRENT COHORT:</span>
                <span className="text-ascent-blue font-semibold">847 active climbers</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-white/10" />
              <div className="flex items-center gap-2">
                <span className="text-ascent-gray">NEXT OPENS:</span>
                <span className="text-white font-semibold">March 1, 2026</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* COHORT SCARCITY CARD */}
        <div className="w-full mb-12 md:mb-16">
          <CohortCard />
        </div>

      </div>
    </section>
  );
}