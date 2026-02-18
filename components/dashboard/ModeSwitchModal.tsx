// ============================================
// components/dashboard/ModeSwitchModal.tsx
// MODE SWITCH MODAL - The Bridge
// FIX: Responsive — max-h + overflow scroll, close button clearance,
//      mobile padding, proper dialog ARIA
// ============================================

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Shield, TrendingUp, AlertCircle,
  Loader2, CheckCircle2, XCircle, Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ModeSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: 'ASCENT' | 'RECOVERY';
}

interface EligibilityData {
  isEligible: boolean;
  weeksStable: number;
  currentOxygenLevel: number;
  daysInRecovery: number;
  has14DaysPassed: boolean;
  message: string;
  blockers: string[];
}

export function ModeSwitchModal({ isOpen, onClose, currentMode }: ModeSwitchModalProps) {
  const router = useRouter();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eligibility, setEligibility] = useState<EligibilityData | null>(null);
  const [isFetchingEligibility, setIsFetchingEligibility] = useState(false);

  // Focus close button when modal opens — accessibility
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => closeButtonRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Trap Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Fetch eligibility when opening Recovery → Ascent flow
  useEffect(() => {
    if (isOpen && currentMode === 'RECOVERY') {
      fetchEligibility();
    }
  }, [isOpen, currentMode]);

  const fetchEligibility = async () => {
    setIsFetchingEligibility(true);
    try {
      const response = await fetch('/api/transition');
      const data = await response.json();
      setEligibility({
        isEligible: data.isEligible,
        weeksStable: data.weeksStable || 0,
        currentOxygenLevel: data.currentOxygenLevel || 0,
        daysInRecovery: data.daysInRecovery || 0,
        has14DaysPassed: data.has14DaysPassed || false,
        message: data.message || '',
        blockers: data.blockers || [],
      });
    } catch (err) {
      console.error('Failed to fetch eligibility:', err);
    } finally {
      setIsFetchingEligibility(false);
    }
  };

  const handleSwitchToRecovery = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/mode-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetMode: 'RECOVERY' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to switch modes');
      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsLoading(false);
    }
  };

  const handleTransitionToAscent = async () => {
    if (!eligibility?.isEligible) return;
    setIsLoading(true);
    setError(null);
    try {
      const protocolResponse = await fetch('/api/crisis-protocol');
      const protocolData = await protocolResponse.json();
      if (!protocolData.protocol) throw new Error('No active protocol found');

      const response = await fetch('/api/transition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ protocolId: protocolData.protocol.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to transition');

      const visionCanvasUrl = '/vision-canvas?transitioned=true';
      router.push(
        `/token-payday?amount=${data.tokensAwarded}&newBalance=${data.newBalance}&reason=CRISIS_EXIT&redirect=${encodeURIComponent(visionCanvasUrl)}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ─────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            aria-hidden="true"
          />

          {/* ── Modal positioner ─────────────────────────── 
              FIX: overflow-y-auto on the positioner lets the modal scroll
              on short viewports (iPhone SE etc.) without clipping content.
              py-4 gives breathing room at top and bottom.
          ─────────────────────────────────────────────── */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label={currentMode === 'ASCENT' ? 'Initiate Recovery Protocol' : 'Flight Check'}
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-4 px-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 16 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="
                relative w-full max-w-md my-auto
                glass-panel bg-slate-900/95 backdrop-blur-xl
                rounded-2xl border border-white/10
                shadow-2xl
              "
            >
              {/* ── Close Button ───────────────────────────
                  FIX: added top padding to the content below so it
                  doesn't start directly under the close button
              ─────────────────────────────────────────── */}
              <button
                ref={closeButtonRef}
                onClick={onClose}
                aria-label="Close modal"
                className="absolute top-4 right-4 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10 z-10"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>

              {/* ── Content area — pt-14 clears the close button ── */}
              <div className="p-5 sm:p-8 pt-14">

                {currentMode === 'ASCENT' ? (

                  /* ── ASCENT → RECOVERY ─────────────────── */
                  <div className="space-y-5">

                    <div className="flex items-center justify-center">
                      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                        <Shield className="w-10 h-10 text-amber-400" aria-hidden="true" />
                      </div>
                    </div>

                    <div className="text-center">
                      <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                        Initiate Recovery Protocol
                      </h2>
                      <p className="text-gray-400 text-sm">
                        Switching from Ascent to Recovery mode
                      </p>
                    </div>

                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                      <p className="text-gray-300 text-sm leading-relaxed">
                        This pauses your Ascent to focus on{' '}
                        <strong className="text-amber-400">stabilizing your foundation</strong>.
                        Your streak will be{' '}
                        <strong className="text-green-400">preserved</strong> while you rebuild.
                      </p>
                    </div>

                    <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
                        <div>
                          <p className="text-red-400 font-semibold text-sm mb-1">
                            14-Day Minimum Commitment
                          </p>
                          <p className="text-gray-400 text-xs leading-relaxed">
                            Once you enter Recovery, you cannot return to Ascent mode for
                            14 days minimum. This prevents micro-toggling and ensures
                            genuine recovery.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                        What Happens:
                      </p>
                      <ul className="space-y-2 text-sm text-gray-300">
                        {[
                          { icon: '✓', color: 'text-green-400', text: 'Weekly logs become Recovery Check-ins' },
                          { icon: '✓', color: 'text-green-400', text: 'Your streak is preserved (no reset)' },
                          { icon: '✓', color: 'text-green-400', text: 'Crisis Surgeon fog checks replace strategic insights' },
                          { icon: '⚠', color: 'text-red-400', text: '14-day lock begins immediately' },
                        ].map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className={`${item.color} mt-0.5 shrink-0`} aria-hidden="true">{item.icon}</span>
                            <span>{item.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg" role="alert">
                        <AlertCircle className="w-5 h-5 text-red-400 shrink-0" aria-hidden="true" />
                        <p className="text-sm text-red-400">{error}</p>
                      </div>
                    )}

                    <div className="flex flex-col gap-3 pt-2">
                      <Button
                        onClick={handleSwitchToRecovery}
                        disabled={isLoading}
                        className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold"
                        aria-label="Confirm entry into Recovery mode"
                      >
                        {isLoading ? (
                          <><Loader2 className="w-5 h-5 mr-2 animate-spin" aria-hidden="true" />Switching Mode...</>
                        ) : (
                          <><Shield className="w-5 h-5 mr-2" aria-hidden="true" />I Understand — Enter Recovery</>
                        )}
                      </Button>
                      <Button
                        onClick={onClose}
                        disabled={isLoading}
                        variant="outline"
                        className="w-full h-12 border-gray-700 text-gray-300 hover:bg-gray-800"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>

                ) : (

                  /* ── RECOVERY → ASCENT (FLIGHT CHECK) ─── */
                  <div className="space-y-5">

                    <div className="flex items-center justify-center">
                      <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                        <TrendingUp className="w-10 h-10 text-blue-400" aria-hidden="true" />
                      </div>
                    </div>

                    <div className="text-center">
                      <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                        Flight Check
                      </h2>
                      <p className="text-gray-400 text-sm">
                        Ready to return to Ascent mode?
                      </p>
                    </div>

                    {/* Loading eligibility */}
                    {isFetchingEligibility && (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" aria-label="Checking eligibility..." />
                      </div>
                    )}

                    {/* Criteria cards */}
                    {!isFetchingEligibility && eligibility && (
                      <div className="space-y-3">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                          Eligibility Criteria:
                        </p>

                        {/* 14-day lock */}
                        <div className={`flex items-start gap-3 p-3 rounded-lg border ${
                          eligibility.has14DaysPassed
                            ? 'bg-green-500/5 border-green-500/20'
                            : 'bg-gray-500/5 border-gray-500/20'
                        }`}>
                          {eligibility.has14DaysPassed
                            ? <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" aria-hidden="true" />
                            : <XCircle className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" aria-hidden="true" />
                          }
                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold text-sm ${eligibility.has14DaysPassed ? 'text-green-400' : 'text-gray-400'}`}>
                              Minimum Stay: 14 Days
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {eligibility.daysInRecovery} {eligibility.daysInRecovery === 1 ? 'day' : 'days'} in recovery
                              {!eligibility.has14DaysPassed && ` · ${14 - eligibility.daysInRecovery} remaining`}
                            </p>
                          </div>
                        </div>

                        {/* Stability */}
                        <div className={`flex items-start gap-3 p-3 rounded-lg border ${
                          eligibility.weeksStable >= 3
                            ? 'bg-green-500/5 border-green-500/20'
                            : 'bg-gray-500/5 border-gray-500/20'
                        }`}>
                          {eligibility.weeksStable >= 3
                            ? <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" aria-hidden="true" />
                            : <XCircle className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" aria-hidden="true" />
                          }
                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold text-sm ${eligibility.weeksStable >= 3 ? 'text-green-400' : 'text-gray-400'}`}>
                              Stability: 3 Weeks at Oxygen 6+
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {eligibility.weeksStable}/3 weeks stable
                              {eligibility.weeksStable < 3 && ` · ${3 - eligibility.weeksStable} more needed`}
                            </p>
                          </div>
                        </div>

                        {/* Oxygen level */}
                        <div className={`flex items-start gap-3 p-3 rounded-lg border ${
                          eligibility.currentOxygenLevel >= 6
                            ? 'bg-green-500/5 border-green-500/20'
                            : 'bg-gray-500/5 border-gray-500/20'
                        }`}>
                          {eligibility.currentOxygenLevel >= 6
                            ? <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" aria-hidden="true" />
                            : <XCircle className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" aria-hidden="true" />
                          }
                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold text-sm ${eligibility.currentOxygenLevel >= 6 ? 'text-green-400' : 'text-gray-400'}`}>
                              Current Oxygen Level: 6+
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Current: {eligibility.currentOxygenLevel}/10
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Status message */}
                    {!isFetchingEligibility && eligibility && (
                      <div className={`p-3 rounded-lg border ${
                        eligibility.isEligible
                          ? 'bg-green-500/10 border-green-500/30'
                          : 'bg-amber-500/10 border-amber-500/30'
                      }`} role="status">
                        <p className={`text-sm ${eligibility.isEligible ? 'text-green-400' : 'text-amber-400'}`}>
                          {eligibility.message}
                        </p>
                      </div>
                    )}

                    {error && (
                      <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg" role="alert">
                        <AlertCircle className="w-5 h-5 text-red-400 shrink-0" aria-hidden="true" />
                        <p className="text-sm text-red-400">{error}</p>
                      </div>
                    )}

                    <div className="flex flex-col gap-3 pt-2">
                      <Button
                        onClick={handleTransitionToAscent}
                        disabled={!eligibility?.isEligible || isLoading || isFetchingEligibility}
                        className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={!eligibility?.isEligible ? 'Complete all criteria to transition' : 'Return to Ascent mode'}
                      >
                        {isLoading ? (
                          <><Loader2 className="w-5 h-5 mr-2 animate-spin" aria-hidden="true" />Transitioning...</>
                        ) : (
                          <><TrendingUp className="w-5 h-5 mr-2" aria-hidden="true" />Return to Ascent Mode</>
                        )}
                      </Button>
                      <Button
                        onClick={onClose}
                        disabled={isLoading}
                        variant="outline"
                        className="w-full h-12 border-gray-700 text-gray-300 hover:bg-gray-800"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}