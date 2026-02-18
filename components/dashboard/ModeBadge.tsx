// ============================================
// components/dashboard/ModeBadge.tsx
// MODE BADGE - Status Indicator
// FIX: Broken template literal on Mode label (was rendering as literal string)
// ============================================

'use client';

import { useState } from 'react';
import { TrendingUp, Shield } from 'lucide-react';
import { ModeSwitchModal } from './ModeSwitchModal';

interface ModeBadgeProps {
  mode: 'ASCENT' | 'RECOVERY';
}

export function ModeBadge({ mode }: ModeBadgeProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isRecovery = mode === 'RECOVERY';

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        aria-label={`Current mode: ${mode}. Click to switch modes.`}
        aria-haspopup="dialog"
        className={`
          group min-h-[44px] px-3 py-1.5 md:px-4 md:py-2 rounded-lg
          border transition-all duration-300
          hover:scale-105 hover:shadow-lg
          ${isRecovery
            ? 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50 hover:bg-amber-500/20'
            : 'bg-blue-500/10 border-blue-500/30 hover:border-blue-500/50 hover:bg-blue-500/20'
          }
        `}
      >
        <div className="flex items-center gap-2">
          {isRecovery ? (
            <Shield className="w-4 h-4 text-amber-400 group-hover:text-amber-300 transition-colors shrink-0" aria-hidden="true" />
          ) : (
            <TrendingUp className="w-4 h-4 text-blue-400 group-hover:text-blue-300 transition-colors shrink-0" aria-hidden="true" />
          )}

          <div className="text-left">
            {/* FIX: was inside a regular string — ${} never evaluated.
                Now using a real ternary outside the className string. */}
            <p className={`text-[10px] md:text-xs uppercase tracking-wide font-semibold leading-none mb-0.5 ${
              isRecovery ? 'text-amber-400/70' : 'text-blue-400/70'
            }`}>
              Mode
            </p>
            <p className={`text-xs md:text-sm font-bold leading-none ${
              isRecovery ? 'text-amber-400' : 'text-blue-400'
            }`}>
              {mode}
            </p>
          </div>
        </div>
      </button>

      <ModeSwitchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentMode={mode}
      />
    </>
  );
}