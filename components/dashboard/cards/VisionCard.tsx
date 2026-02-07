// ============================================
// components/dashboard/cards/VisionCard.tsx
// VISION CARD: Displays active vision with "Altitude to Summit" progress
// Sprint 4 - Checkpoint 6
// ============================================

import { Sparkles, Mountain, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { BentoCardHeader, BentoCardContent } from '@/components/ui/bento-grid';

interface VisionCardProps {
  vision: {
    id: string;
    aiSynthesis: string | null;
    desiredState: string;
    antiGoal: string;
  } | null;
  totalLogsCount: number;
  visionHorizonWeeks?: number; // Default 78 weeks (18 months)
}

export function VisionCard({
  vision,
  totalLogsCount,
  visionHorizonWeeks = 78,
}: VisionCardProps) {
  // ============================================
  // EMPTY STATE: No Vision Yet
  // ============================================
  if (!vision) {
    return (
      <>
        <BentoCardHeader
          icon={<Sparkles className="w-5 h-5 text-gray-500" />}
          title="Your Vision"
        />
        <BentoCardContent className="justify-center items-center text-center">
          <div className="py-8 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-blue-500/10 flex items-center justify-center">
              <Mountain className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <p className="text-gray-300 text-lg font-medium">
                No Vision Yet
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Define your 18-month summit to begin your ascent.
              </p>
            </div>
            <Link
              href="/vision-canvas"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg font-semibold transition-all min-h-[44px] flex items-center justify-center"
            >
              Create Vision →
            </Link>
          </div>
        </BentoCardContent>
      </>
    );
  }

  // ============================================
  // CALCULATE ALTITUDE PROGRESS
  // ============================================
  const altitudePercentage = Math.min(
    Math.round((totalLogsCount / visionHorizonWeeks) * 100),
    100
  );

  // Visual: Progress bar color based on altitude
  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return 'from-green-500 to-emerald-500';
    if (percentage >= 50) return 'from-blue-500 to-cyan-500';
    if (percentage >= 25) return 'from-amber-500 to-yellow-500';
    return 'from-purple-500 to-pink-500';
  };

  const progressColor = getProgressColor(altitudePercentage);

  // ============================================
  // ACTIVE VISION DISPLAY
  // ============================================
  return (
    <>
      <BentoCardHeader
        icon={<Sparkles className="w-5 h-5" />}
        title="Your Vision"
        action={
          <Link
            href="/vision-canvas"
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Edit →
          </Link>
        }
      />
      <BentoCardContent>
        <div className="space-y-6">
          
          {/* Vision Statement - "The Heaven" */}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
              The Summit
            </p>
            <p className="text-gray-300 leading-relaxed">
              {vision.aiSynthesis}
            </p>
          </div>

          {/* Altitude Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Mountain className="w-4 h-4 text-blue-400" />
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
                  Altitude to Summit
                </p>
              </div>
              <p className="text-sm font-bold text-white">
                {totalLogsCount}/{visionHorizonWeeks}
              </p>
            </div>

            {/* Progress Bar Container */}
            <div className="relative w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
              {/* Progress Bar Fill */}
              <div
                className={`absolute top-0 left-0 h-full bg-gradient-to-r ${progressColor} transition-all duration-500 ease-out`}
                style={{ width: `${altitudePercentage}%` }}
              >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </div>
            </div>

            {/* Progress Label */}
            <p className="text-xs text-gray-500 mt-1">
              {altitudePercentage}% of vision horizon • {visionHorizonWeeks - totalLogsCount} weeks remaining
            </p>
          </div>

          {/* Anti-Goal - "The Hell" (Subtle Reminder) */}
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500/60 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-amber-500/60 uppercase tracking-wide mb-1">
                  Escaping From
                </p>
                <p className="text-sm text-gray-400 italic">
                  {vision.antiGoal}
                </p>
              </div>
            </div>
          </div>

        </div>
      </BentoCardContent>
    </>
  );
}