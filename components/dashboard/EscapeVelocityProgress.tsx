// ============================================
// components/dashboard/EscapeVelocityProgress.tsx
// ESCAPE VELOCITY: Visual progress toward leaving Recovery mode
// Enhancement: Recovery Dashboard Upgrade
// ============================================

'use client';

import { motion } from 'framer-motion';
import { Rocket, Lock, CheckCircle2 } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface EscapeVelocityProgressProps {
  weeksStable: number;       // Weeks at oxygen 6+ (max 3 for eligibility)
  daysInRecovery: number;    // Days since recovery start (max 14 for eligibility)
  has14DaysPassed: boolean;
  isEligible: boolean;
  blockers: string[];
}

// ─────────────────────────────────────────────────────────
// Constants from transition-service.ts
// ─────────────────────────────────────────────────────────
const WEEKS_REQUIRED = 3;
const DAYS_REQUIRED = 14;

function ProgressBar({
  value,
  max,
  color,
  complete,
  reducedMotion,
}: {
  value: number;
  max: number;
  color: string;
  complete: boolean;
  reducedMotion: boolean;
}) {
  const pct = Math.min((value / max) * 100, 100);

  return (
    <div className="relative h-2 rounded-full bg-white/5 overflow-hidden">
      <motion.div
        className="absolute top-0 left-0 h-full rounded-full"
        style={{
          background: complete
            ? 'linear-gradient(90deg, #10B981, #34D399)'
            : color,
          boxShadow: complete ? '0 0 8px rgba(16,185,129,0.5)' : 'none',
        }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{
          duration: reducedMotion ? 0 : 1,
          ease: 'easeOut',
          delay: reducedMotion ? 0 : 0.2,
        }}
      />
    </div>
  );
}

export function EscapeVelocityProgress({
  weeksStable,
  daysInRecovery,
  has14DaysPassed,
  isEligible,
  blockers,
}: EscapeVelocityProgressProps) {
  const prefersReducedMotion = useReducedMotion();

  // Overall progress: 50% weight on weeks, 50% on days
  const weeksPct = Math.min(weeksStable / WEEKS_REQUIRED, 1) * 50;
  const daysPct = Math.min(daysInRecovery / DAYS_REQUIRED, 1) * 50;
  const totalPct = Math.round(weeksPct + daysPct);

  const weeksComplete = weeksStable >= WEEKS_REQUIRED;
  const daysComplete = has14DaysPassed;

  return (
    <div className="space-y-5">

      {/* ── Header ────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Rocket
            className={`w-5 h-5 ${isEligible ? 'text-green-400' : 'text-blue-400'}`}
            aria-hidden="true"
          />
          <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
            Escape Velocity
          </h3>
        </div>
        <span
          className={`text-sm font-bold tabular-nums font-mono ${
            isEligible ? 'text-green-400' : 'text-blue-400'
          }`}
          aria-label={`Overall progress: ${totalPct}%`}
        >
          {totalPct}%
        </span>
      </div>

      {/* ── Overall bar ───────────────────────────────── */}
      <ProgressBar
        value={totalPct}
        max={100}
        color="linear-gradient(90deg, #3B82F6, #8B5CF6)"
        complete={isEligible}
        reducedMotion={prefersReducedMotion}
      />

      {/* ── Two criteria ──────────────────────────────── */}
      <div className="space-y-4">

        {/* Stability weeks */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              {weeksComplete
                ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" aria-hidden="true" />
                : <Lock className="w-3.5 h-3.5 text-gray-500" aria-hidden="true" />
              }
              <span className={weeksComplete ? 'text-green-400' : 'text-gray-400'}>
                Stability weeks
              </span>
            </div>
            <span className={`font-mono font-bold ${weeksComplete ? 'text-green-400' : 'text-white'}`}>
              {Math.min(weeksStable, WEEKS_REQUIRED)}/{WEEKS_REQUIRED}
            </span>
          </div>
          <ProgressBar
            value={weeksStable}
            max={WEEKS_REQUIRED}
            color="#8B5CF6"
            complete={weeksComplete}
            reducedMotion={prefersReducedMotion}
          />
          <p className="text-[10px] text-gray-600">
            Weeks with oxygen level 6 or above
          </p>
        </div>

        {/* Days in recovery */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              {daysComplete
                ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" aria-hidden="true" />
                : <Lock className="w-3.5 h-3.5 text-gray-500" aria-hidden="true" />
              }
              <span className={daysComplete ? 'text-green-400' : 'text-gray-400'}>
                Minimum commitment
              </span>
            </div>
            <span className={`font-mono font-bold ${daysComplete ? 'text-green-400' : 'text-white'}`}>
              {daysInRecovery >= 999
                ? '14/14'
                : `${Math.min(daysInRecovery, DAYS_REQUIRED)}/${DAYS_REQUIRED}`}
            </span>
          </div>
          <ProgressBar
            value={daysInRecovery >= 999 ? DAYS_REQUIRED : daysInRecovery}
            max={DAYS_REQUIRED}
            color="#3B82F6"
            complete={daysComplete}
            reducedMotion={prefersReducedMotion}
          />
          <p className="text-[10px] text-gray-600">
            14-day minimum before transition is unlocked
          </p>
        </div>

      </div>

      {/* ── Eligible celebration ──────────────────────── */}
      {isEligible && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-center"
        >
          <p className="text-xs text-green-400 font-semibold">
            🚀 All criteria met — you&apos;re ready to ascend
          </p>
        </motion.div>
      )}

      {/* ── Active blockers ───────────────────────────── */}
      {!isEligible && blockers.length > 0 && (
        <div className="space-y-1.5">
          {blockers.map((blocker, i) => (
            <p key={i} className="text-[10px] text-gray-600 flex items-start gap-1.5">
              <span className="text-gray-700 mt-0.5 shrink-0">•</span>
              {blocker}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}