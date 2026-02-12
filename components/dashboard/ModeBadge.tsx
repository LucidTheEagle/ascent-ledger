// ============================================
// components/dashboard/ModeBadge.tsx
// MODE BADGE - Status Indicator
// Clickable to open mode switch modal
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
      {/* Badge Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className={`
          group px-3 py-1.5 md:px-4 md:py-2 rounded-lg 
          border transition-all duration-300
          hover:scale-105 hover:shadow-lg
          ${isRecovery 
            ? 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50 hover:bg-amber-500/20' 
            : 'bg-blue-500/10 border-blue-500/30 hover:border-blue-500/50 hover:bg-blue-500/20'
          }
        `}
        title="Click to switch modes"
      >
        <div className="flex items-center gap-2">
          {/* Icon */}
          {isRecovery ? (
            <Shield className="w-4 h-4 text-amber-400 group-hover:text-amber-300 transition-colors" />
          ) : (
            <TrendingUp className="w-4 h-4 text-blue-400 group-hover:text-blue-300 transition-colors" />
          )}

          {/* Label */}
          <div className="text-left">
            <p className="text-[10px] md:text-xs uppercase tracking-wide font-semibold opacity-70 leading-none mb-0.5
              ${isRecovery ? 'text-amber-400/70' : 'text-blue-400/70'}">
              Mode
            </p>
            <p className={`
              text-xs md:text-sm font-bold leading-none
              ${isRecovery ? 'text-amber-400' : 'text-blue-400'}
            `}>
              {mode}
            </p>
          </div>
        </div>
      </button>

      {/* Modal */}
      <ModeSwitchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentMode={mode}
      />
    </>
  );
}