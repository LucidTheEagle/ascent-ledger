// ============================================
// components/dashboard/OxygenGauge.tsx
// OXYGEN GAUGE: Circular visual gauge for Recovery oxygen level
// Enhancement: Recovery Dashboard Upgrade
// ============================================

'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface OxygenGaugeProps {
  level: number | null;
  startLevel?: number | null;
}

// ─────────────────────────────────────────────────────────
// Derived state from oxygen level
// ─────────────────────────────────────────────────────────
function getGaugeConfig(level: number | null) {
  if (level === null) {
    return {
      color: '#6B7280',
      glowColor: 'rgba(107, 114, 128, 0.3)',
      trackColor: 'rgba(107, 114, 128, 0.1)',
      label: 'Not assessed',
      sublabel: 'Log your check-in',
      shouldPulse: false,
      severity: 'none' as const,
    };
  }
  if (level <= 4) {
    return {
      color: '#EF4444',
      glowColor: 'rgba(239, 68, 68, 0.4)',
      trackColor: 'rgba(239, 68, 68, 0.1)',
      label: 'Critical',
      sublabel: 'Immediate action needed',
      shouldPulse: true,
      severity: 'critical' as const,
    };
  }
  if (level <= 7) {
    return {
      color: '#F59E0B',
      glowColor: 'rgba(245, 158, 11, 0.3)',
      trackColor: 'rgba(245, 158, 11, 0.1)',
      label: 'Stabilizing',
      sublabel: 'Progress being made',
      shouldPulse: false,
      severity: 'warning' as const,
    };
  }
  return {
    color: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    trackColor: 'rgba(16, 185, 129, 0.1)',
    label: 'Breathing Clearly',
    sublabel: 'Stability achieved',
    shouldPulse: false,
    severity: 'good' as const,
  };
}

// ─────────────────────────────────────────────────────────
// SVG circular gauge math
// radius=54, circumference = 2π×54 ≈ 339.3
// ─────────────────────────────────────────────────────────
const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function levelToOffset(level: number | null, max = 10): number {
  if (level === null) return CIRCUMFERENCE;
  const pct = Math.min(level / max, 1);
  return CIRCUMFERENCE * (1 - pct);
}

export function OxygenGauge({ level, startLevel }: OxygenGaugeProps) {
  const prefersReducedMotion = useReducedMotion();
  const config = getGaugeConfig(level);
  const offset = levelToOffset(level);

  const improvement =
    level !== null && startLevel !== null && startLevel !== undefined
      ? level - startLevel
      : null;

  return (
    <div className="flex flex-col items-center gap-4">

      {/* ── Gauge ─────────────────────────────────────── */}
      <div className="relative">
        {/* Outer glow ring — pulses on critical */}
        {config.shouldPulse && !prefersReducedMotion && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ boxShadow: `0 0 40px ${config.glowColor}` }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {/* Main gauge container */}
        <motion.div
          animate={
            config.shouldPulse && !prefersReducedMotion
              ? { scale: [1, 1.04, 1] }
              : { scale: 1 }
          }
          transition={
            config.shouldPulse && !prefersReducedMotion
              ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
              : {}
          }
          className="relative"
        >
          <svg
            width="148"
            height="148"
            viewBox="0 0 148 148"
            aria-label={`Oxygen level: ${level !== null ? `${level} out of 10` : 'not assessed'}`}
            role="img"
          >
            {/* Background track */}
            <circle
              cx="74"
              cy="74"
              r={RADIUS}
              fill="none"
              stroke={config.trackColor}
              strokeWidth="10"
            />

            {/* Progress arc */}
            <motion.circle
              cx="74"
              cy="74"
              r={RADIUS}
              fill="none"
              stroke={config.color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              // Start at 12 o'clock (rotate -90deg)
              transform="rotate(-90 74 74)"
              initial={{ strokeDashoffset: CIRCUMFERENCE }}
              animate={{ strokeDashoffset: offset }}
              transition={{
                duration: prefersReducedMotion ? 0 : 1.2,
                ease: 'easeOut',
                delay: prefersReducedMotion ? 0 : 0.3,
              }}
              style={{
                filter: `drop-shadow(0 0 6px ${config.color})`,
              }}
            />
          </svg>

          {/* Center text overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="text-3xl font-bold tabular-nums"
              style={{ color: config.color }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: prefersReducedMotion ? 0 : 0.8 }}
            >
              {level !== null ? level : '–'}
            </motion.span>
            <span className="text-xs text-gray-500 font-mono">/10</span>
          </div>
        </motion.div>
      </div>

      {/* ── Status labels ──────────────────────────────── */}
      <div className="text-center space-y-1">
        <p className="text-sm font-semibold" style={{ color: config.color }}>
          {config.label}
        </p>
        <p className="text-xs text-gray-500">{config.sublabel}</p>

        {/* Improvement delta — show only when meaningful */}
        {improvement !== null && improvement !== 0 && (
          <p
            className={`text-xs font-mono font-bold ${
              improvement > 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {improvement > 0 ? `↑ +${improvement}` : `↓ ${improvement}`} since start
          </p>
        )}
      </div>
    </div>
  );
}