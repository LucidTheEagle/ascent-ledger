// ============================================
// components/dashboard/cards/FogForecastCard.tsx
// FOG FORECAST CARD: Pattern detection weather display
// Sprint 4 - Checkpoint 8
// ============================================

import { Cloud, CloudFog, Sun, TrendingDown, BookOpen, Target } from 'lucide-react';
import { BentoCardHeader, BentoCardContent } from '@/components/ui/bento-grid';
import type { PatternDetectionResult } from '@/lib/graph/patterns';

// ============================================
// TYPES
// ============================================

type WeatherState = 'CLEAR' | 'CLOUDS' | 'FOG';

interface FogForecast {
  status: WeatherState;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  title: string;
  description: string;
  patternIcon?: React.ReactNode;
}

interface FogForecastCardProps {
  patterns: PatternDetectionResult;
  isStreakBroken: boolean;
}

// ============================================
// FORECAST CALCULATION LOGIC
// ============================================

function calculateFogForecast(
  patterns: PatternDetectionResult,
  isStreakBroken: boolean
): FogForecast {
  
  // ============================================
  // LEVEL 1: DENSE FOG (Critical Patterns)
  // ============================================
  
  // Sliding Into Fog (Anti-Goal mentions)
  if (patterns.slidingIntoFog?.detected) {
    return {
      status: 'FOG',
      icon: <CloudFog className="w-6 h-6" />,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      title: 'Drifting Off Course',
      description: `Detected linguistic drift toward "${patterns.slidingIntoFog.fogName}". You're mentioning your anti-goal ${patterns.slidingIntoFog.mentionCount} time(s). This is what you're supposed to be leaving behind.`,
      patternIcon: <TrendingDown className="w-4 h-4" />,
    };
  }

  // Vision Misalignment
  if (patterns.visionMisalignment?.detected) {
    return {
      status: 'FOG',
      icon: <CloudFog className="w-6 h-6" />,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      title: 'Vision Misalignment',
      description: `Your recent logs diverge from your stated goal. Alignment score: ${Math.round(patterns.visionMisalignment.alignmentScore * 100)}%. You're staying in your comfort zone instead of vision work.`,
      patternIcon: <Target className="w-4 h-4" />,
    };
  }

  // ============================================
  // LEVEL 2: CLOUDS (Warning Signs)
  // ============================================
  
  // Learning Without Action
  if (patterns.learningWithoutAction?.detected) {
    return {
      status: 'CLOUDS',
      icon: <Cloud className="w-6 h-6" />,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      title: 'Analysis Paralysis',
      description: `${patterns.learningWithoutAction.streakWeeks} week(s) of high insight volume but low leverage action. You're building a library, not a career. Learning feels productive, but your vision requires movement.`,
      patternIcon: <BookOpen className="w-4 h-4" />,
    };
  }

  // Streak Broken
  if (isStreakBroken) {
    return {
      status: 'CLOUDS',
      icon: <Cloud className="w-6 h-6" />,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      title: 'Momentum Stalled',
      description: 'Streak is broken. Clouds are gathering. Log this week to clear the sky and rebuild your chain.',
    };
  }

  // ============================================
  // LEVEL 3: CLEAR SKY (All Systems Operational)
  // ============================================
  
  return {
    status: 'CLEAR',
    icon: <Sun className="w-6 h-6" />,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    title: 'Visibility Unlimited',
    description: 'No friction detected. You are operating with clarity and purpose. Vision and action are aligned.',
  };
}

// ============================================
// COMPONENT
// ============================================

export function FogForecastCard({ patterns, isStreakBroken }: FogForecastCardProps) {
  const forecast = calculateFogForecast(patterns, isStreakBroken);

  return (
    <>
      <BentoCardHeader
        icon={<div className={forecast.color}>{forecast.icon}</div>}
        title="Fog Forecast"
        action={
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${forecast.bgColor} border ${forecast.borderColor}`}>
            <span className={`text-xs font-semibold ${forecast.color} uppercase tracking-wide`}>
              {forecast.status === 'FOG' && '🌫️ Dense Fog'}
              {forecast.status === 'CLOUDS' && '☁️ Clouds'}
              {forecast.status === 'CLEAR' && '☀️ Clear'}
            </span>
          </div>
        }
      />
      <BentoCardContent>
        <div className="space-y-4">
          
          {/* Weather Status */}
          <div className={`p-4 rounded-lg border ${forecast.borderColor} ${forecast.bgColor}`}>
            <div className="flex items-start gap-3">
              <div className={`${forecast.color} shrink-0 mt-0.5`}>
                {forecast.icon}
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-semibold ${forecast.color} mb-1`}>
                  {forecast.title}
                </h3>
                <p className="text-gray-300 leading-relaxed text-sm">
                  {forecast.description}
                </p>
              </div>
            </div>
          </div>

          {/* Pattern Details (if any) */}
          {patterns.hasPatterns && (
            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">
                Detected Patterns
              </p>
              <div className="space-y-2">
                {patterns.slidingIntoFog?.detected && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                    <span>Sliding into &quot;{patterns.slidingIntoFog.fogName}&quot;</span>
                  </div>
                )}
                {patterns.visionMisalignment?.detected && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Target className="w-3.5 h-3.5 text-red-400" />
                    <span>Vision-Action misalignment detected</span>
                  </div>
                )}
                {patterns.learningWithoutAction?.detected && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                    <span>Learning loop without leverage</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Clear Sky Message */}
          {!patterns.hasPatterns && !isStreakBroken && (
            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-emerald-400">
                All systems operational. Keep the momentum.
              </p>
            </div>
          )}

        </div>
      </BentoCardContent>
    </>
  );
}