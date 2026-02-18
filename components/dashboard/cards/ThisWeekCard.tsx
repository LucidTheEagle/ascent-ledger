// ============================================
// components/dashboard/cards/ThisWeekCard.tsx
// THIS WEEK'S ALTITUDE CARD: Weekly log status and preview
// UPDATED: CP17 - Touch target compliance on Fog Check link (min 44px)
// ============================================

import { Target, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BentoCardHeader, BentoCardContent } from '@/components/ui/bento-grid';

interface ThisWeekCardProps {
  thisWeeksLog: {
    id: string;
    leverageBuilt: string;
    learnedInsight: string;
    opportunitiesCreated: string;
    createdAt: Date;
    fogCheck: {
      id: string;
      observation: string;
      strategicQuestion: string;
    } | null;
  } | null;
  currentWeek: number;
}

export function ThisWeekCard({ thisWeeksLog, currentWeek }: ThisWeekCardProps) {
  // ============================================
  // HELPER: Format logged date
  // ============================================
  const formatLoggedDate = (date: Date): string => {
    const now = new Date();
    const logDate = new Date(date);
    const daysDiff = Math.floor(
      (now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const weekday = logDate.toLocaleDateString('en-US', { weekday: 'long' });

    if (daysDiff === 0) return 'Logged today';
    if (daysDiff === 1) return 'Logged yesterday';
    if (daysDiff < 7) return `Logged this ${weekday}`;
    return `Logged ${logDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })}`;
  };

  // ============================================
  // EMPTY STATE
  // ============================================
  if (!thisWeeksLog) {
    return (
      <>
        <BentoCardHeader
          icon={<Target className="w-5 h-5 text-purple-400" />}
          title="This Week's Altitude"
          action={
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wide">
                Pending
              </span>
            </div>
          }
        />
        <BentoCardContent className="justify-center items-center text-center">
          <div className="flex-1 flex flex-col items-center justify-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Target className="w-8 h-8 text-purple-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-gray-300 text-lg font-medium">
                You haven&apos;t logged yet this week.
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Week {currentWeek} • Your vision is waiting.
              </p>
            </div>
            <Link href="/log/new" className="w-full sm:w-auto" aria-label="Log this week's progress">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-6 text-lg min-h-[44px]">
                Log This Week →
              </Button>
            </Link>
          </div>
        </BentoCardContent>
      </>
    );
  }

  // ============================================
  // ACTIVE STATE
  // ============================================
  return (
    <>
      <BentoCardHeader
        icon={<Target className="w-5 h-5 text-purple-400" />}
        title="This Week's Altitude"
        action={
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
            <CheckCircle className="w-3.5 h-3.5 text-green-400" aria-hidden="true" />
            <span className="text-xs font-semibold text-green-400 uppercase tracking-wide">
              Logged
            </span>
          </div>
        }
      />
      <BentoCardContent>
        <div className="space-y-6">

          {/* Log Preview */}
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" aria-hidden="true" />
                Leverage Built
              </p>
              <p className="text-gray-300 leading-relaxed line-clamp-2">
                {thisWeeksLog.leverageBuilt}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" aria-hidden="true" />
                Learned Insight
              </p>
              <p className="text-gray-300 leading-relaxed line-clamp-2">
                {thisWeeksLog.learnedInsight}
              </p>
            </div>
          </div>

          {/* Fog Check Preview */}
          {thisWeeksLog.fogCheck && (
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" aria-hidden="true" />
                <p className="text-sm text-purple-400 font-semibold uppercase tracking-wide">
                  Your Fog Check
                </p>
              </div>

              <p className="text-gray-400 italic leading-relaxed line-clamp-3 mb-1">
                &quot;{thisWeeksLog.fogCheck.observation}&quot;
              </p>

              {/* CP17: Fog Check link now has min-h-[44px] and full-width
                  tap area on mobile — no more tiny inline text target */}
              <Link
                href={`/log/fog-check/${thisWeeksLog.id}/result`}
                className="
                  inline-flex items-center gap-1
                  min-h-[44px] py-2
                  text-sm text-purple-400 hover:text-purple-300
                  transition-colors group
                "
                aria-label="View full Fog Check analysis"
              >
                <span>View full Fog Check</span>
                <ChevronRight
                  className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                  aria-hidden="true"
                />
              </Link>
            </div>
          )}

          {/* Timestamp */}
          <div className="pt-4 border-t border-white/10">
            <p className="text-xs text-gray-600">
              {formatLoggedDate(thisWeeksLog.createdAt)} • Week {currentWeek}
            </p>
          </div>

        </div>
      </BentoCardContent>
    </>
  );
}