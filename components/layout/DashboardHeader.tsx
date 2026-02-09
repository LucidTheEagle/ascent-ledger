// ============================================
// components/layout/DashboardHeader.tsx
// UNIVERSAL DASHBOARD HEADER: Works for both ASCENT and RECOVERY modes
// Props-based design for maximum flexibility
// ============================================

import { ReactNode } from 'react';
import { Flame } from 'lucide-react';
import { TokenBalancePill } from '@/components/tokens/TokenBalancePill';

interface DashboardHeaderProps {
  /** Main title (e.g., "Clear Sky, Victor" or "Recovery Mode") */
  title: string;
  /** Subtitle (e.g., "Week 12 of your ascent" or "Mission: Conservation") */
  subtitle: string;
  /** User's token balance */
  tokenBalance: number;
  /** User's current streak */
  currentStreak: number;
  /** Optional: Custom icon (e.g., Shield for Recovery mode) */
  icon?: ReactNode;
  /** Optional: Click handler for token balance (future: link to token history) */
  onTokenClick?: () => void;
}

export function DashboardHeader({
  title,
  subtitle,
  tokenBalance,
  currentStreak,
  icon,
  onTokenClick,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 mb-6 md:mb-8 md:flex-row md:items-center md:justify-between">
      
      {/* ============================================
          LEFT SIDE: Title + Subtitle + Optional Icon
      ============================================ */}
      <div className="flex items-center gap-3">
        {/* Optional Icon (e.g., Shield for Recovery) */}
        {icon && (
          <div className="shrink-0">
            {icon}
          </div>
        )}
        
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
            {title}
          </h1>
          <p className="text-sm md:text-base text-gray-400 mt-1">
            {subtitle}
          </p>
        </div>
      </div>

      {/* ============================================
          RIGHT SIDE: Token Balance + Streak Pills
      ============================================ */}
      <div className="flex items-center gap-3 md:gap-4">
        
        {/* Token Balance Pill */}
        <TokenBalancePill 
          balance={tokenBalance}
          onClick={onTokenClick}
        />

        {/* Streak Pill */}
        <div className="px-3 py-2 md:px-4 md:py-3 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 flex-1 md:flex-initial">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 md:w-5 md:h-5 text-orange-400" />
            <div>
              <p className="text-[10px] md:text-xs text-orange-400/70 uppercase tracking-wide">
                Streak
              </p>
              <p className="text-xl md:text-2xl font-bold text-orange-400">
                {currentStreak}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}