// ============================================
// components/layout/DashboardHeader.tsx
// UNIVERSAL DASHBOARD HEADER: Works for both ASCENT and RECOVERY modes
// UPDATED: CP16 - Mobile pill wrapping, overflow protection, touch targets
// ============================================

'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Flame } from 'lucide-react';
import { TokenBalancePill } from '@/components/tokens/TokenBalancePill';
import { ModeBadge } from '@/components/dashboard/ModeBadge';

interface DashboardHeaderProps {
  /** Main title (e.g., "Clear Sky, Victor" or "Recovery Mode") */
  title: string;
  /** Subtitle (e.g., "Week 12 of your ascent") */
  subtitle: string;
  /** User's token balance */
  tokenBalance: number;
  /** User's current streak */
  currentStreak: number;
  /** Current operating mode */
  mode: 'ASCENT' | 'RECOVERY';
  /** Optional: Custom icon (e.g., Shield for Recovery mode) */
  icon?: ReactNode;
}

export function DashboardHeader({
  title,
  subtitle,
  tokenBalance,
  currentStreak,
  mode,
  icon,
}: DashboardHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4 mb-6 md:mb-8">

      {/* ── TOP ROW: Title + subtitle ─────────────────── */}
      <div className="flex items-center gap-3">
        {icon && (
          <div className="shrink-0" aria-hidden="true">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          {/* min-w-0 lets the title truncate instead of overflowing */}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white leading-tight">
            {title}
          </h1>
          <p className="text-sm md:text-base text-gray-400 mt-1">
            {subtitle}
          </p>
        </div>
      </div>

      {/* ── BOTTOM ROW: Pills ─────────────────────────── */}
      {/* 
        flex-wrap: pills wrap to next line on narrow screens instead of overflowing.
        On md+ they sit in a single row aligned to the right.
        Each pill has a min touch target of 44px height (CP17 compliant).
      */}
      <div className="flex flex-wrap items-center gap-2 md:gap-3 md:justify-end">

        {/* Mode Badge */}
        <ModeBadge mode={mode} />

        {/* Token Balance — clickable, navigates to /tokens */}
        <div
          onClick={() => router.push('/tokens')}
          role="button"
          tabIndex={0}
          aria-label={`Token balance: ${tokenBalance} tokens. Click to view history.`}
          onKeyDown={(e) => e.key === 'Enter' && router.push('/tokens')}
          className="cursor-pointer"
        >
          <TokenBalancePill balance={tokenBalance} />
        </div>

        {/* Streak Pill */}
        <div
          className="
            px-3 py-2 rounded-lg min-h-[44px]
            bg-gradient-to-r from-orange-500/10 to-red-500/10
            border border-orange-500/20
            flex items-center gap-2
          "
          aria-label={`Current streak: ${currentStreak} weeks`}
        >
          <Flame
            className="w-4 h-4 text-orange-400 shrink-0"
            aria-hidden="true"
          />
          <div>
            <p className="text-[10px] text-orange-400/70 uppercase tracking-wide leading-none">
              Streak
            </p>
            <p className="text-xl font-bold text-orange-400 leading-tight">
              {currentStreak}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}