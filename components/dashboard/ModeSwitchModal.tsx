// ============================================
// components/dashboard/ModeSwitchModal.tsx
// MODE SWITCH MODAL - The Bridge
// UPDATED: Flight Check interface with real-time eligibility
// Philosophy: "Show the user exactly where they stand"
// ============================================

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, TrendingUp, AlertCircle, Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
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

export function ModeSwitchModal({
  isOpen,
  onClose,
  currentMode,
}: ModeSwitchModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eligibility, setEligibility] = useState<EligibilityData | null>(null);
  const [isFetchingEligibility, setIsFetchingEligibility] = useState(false);

  // ============================================
  // FETCH ELIGIBILITY DATA (Recovery → Ascent)
  // ============================================
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

  // ============================================
  // HANDLER: Switch to Recovery Mode
  // ============================================
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

      if (!response.ok) {
        throw new Error(data.error || 'Failed to switch modes');
      }

      // Success - reload dashboard to show Recovery UI
      console.log('✅ Switched to Recovery mode - 14-day lock started');
      router.refresh();
      onClose();

    } catch (err) {
      console.error('Mode switch error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsLoading(false);
    }
  };

  // ============================================
  // HANDLER: Transition to Ascent (if eligible)
  // ============================================
  const handleTransitionToAscent = async () => {
    if (!eligibility?.isEligible) return;

    setIsLoading(true);
    setError(null);

    try {
      // Get active protocol
      const protocolResponse = await fetch('/api/crisis-protocol');
      const protocolData = await protocolResponse.json();
      
      if (!protocolData.protocol) {
        throw new Error('No active protocol found');
      }

      // Execute transition
      const response = await fetch('/api/transition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ protocolId: protocolData.protocol.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to transition');
      }

      // Success - redirect through token-payday
      const visionCanvasUrl = '/vision-canvas?transitioned=true';
      router.push(
        `/token-payday?amount=${data.tokensAwarded}&newBalance=${data.newBalance}&reason=CRISIS_EXIT&redirect=${encodeURIComponent(visionCanvasUrl)}`
      );

    } catch (err) {
      console.error('Transition error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-panel w-full max-w-md bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/10 p-6 md:p-8 pointer-events-auto shadow-2xl my-8"
            >
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Content */}
              {currentMode === 'ASCENT' ? (
                // ============================================
                // ASCENT → RECOVERY FLOW
                // ============================================
                <div className="space-y-6">
                  
                  {/* Icon */}
                  <div className="flex items-center justify-center">
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                      <Shield className="w-12 h-12 text-amber-400" />
                    </div>
                  </div>

                  {/* Title */}
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Initiate Recovery Protocol
                    </h2>
                    <p className="text-gray-400 text-sm">
                      Switching from Ascent to Recovery mode
                    </p>
                  </div>

                  {/* Explanation */}
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                    <p className="text-gray-300 text-sm leading-relaxed">
                      This pauses your Ascent to focus on <strong className="text-amber-400">stabilizing your foundation</strong>. 
                      Your streak will be <strong className="text-green-400">preserved</strong> while you rebuild.
                    </p>
                  </div>

                  {/* 14-Day Commitment Notice */}
                  <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-red-400 font-semibold text-sm mb-1">
                          14-Day Minimum Commitment
                        </p>
                        <p className="text-gray-400 text-xs leading-relaxed">
                          Once you enter Recovery, you cannot return to Ascent mode for 14 days minimum. 
                          This prevents micro-toggling and ensures genuine recovery.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* What Happens */}
                  <div className="space-y-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                      What Happens:
                    </p>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="text-green-400 mt-0.5">✓</span>
                        <span>Weekly logs become Recovery Check-ins</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-400 mt-0.5">✓</span>
                        <span>Your streak is preserved (no reset)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-400 mt-0.5">✓</span>
                        <span>Crisis Surgeon fog checks replace strategic insights</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-400 mt-0.5">⚠</span>
                        <span>14-day lock begins immediately</span>
                      </li>
                    </ul>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col gap-3 pt-2">
                    <Button
                      onClick={handleSwitchToRecovery}
                      disabled={isLoading}
                      className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Switching Mode...
                        </>
                      ) : (
                        <>
                          <Shield className="w-5 h-5 mr-2" />
                          I Understand - Enter Recovery
                        </>
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
                // ============================================
                // RECOVERY → ASCENT FLOW (FLIGHT CHECK)
                // ============================================
                <div className="space-y-6">
                  
                  {/* Icon */}
                  <div className="flex items-center justify-center">
                    <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                      <TrendingUp className="w-12 h-12 text-blue-400" />
                    </div>
                  </div>

                  {/* Title */}
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Flight Check
                    </h2>
                    <p className="text-gray-400 text-sm">
                      Ready to return to Ascent mode?
                    </p>
                  </div>

                  {/* Loading State */}
                  {isFetchingEligibility && (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                    </div>
                  )}

                  {/* Flight Check Criteria */}
                  {!isFetchingEligibility && eligibility && (
                    <div className="space-y-3">
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                        Eligibility Criteria:
                      </p>

                      {/* 14-Day Lock Check */}
                      <div className={`
                        flex items-start gap-3 p-4 rounded-lg border
                        ${eligibility.has14DaysPassed 
                          ? 'bg-green-500/5 border-green-500/20' 
                          : 'bg-gray-500/5 border-gray-500/20'
                        }
                      `}>
                        {eligibility.has14DaysPassed ? (
                          <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className={`font-semibold text-sm ${eligibility.has14DaysPassed ? 'text-green-400' : 'text-gray-400'}`}>
                            Minimum Stay: 14 Days
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Current: {eligibility.daysInRecovery} {eligibility.daysInRecovery === 1 ? 'day' : 'days'}
                            {!eligibility.has14DaysPassed && ` (${14 - eligibility.daysInRecovery} days remaining)`}
                          </p>
                        </div>
                      </div>

                      {/* Stability Check */}
                      <div className={`
                        flex items-start gap-3 p-4 rounded-lg border
                        ${eligibility.weeksStable >= 3 
                          ? 'bg-green-500/5 border-green-500/20' 
                          : 'bg-gray-500/5 border-gray-500/20'
                        }
                      `}>
                        {eligibility.weeksStable >= 3 ? (
                          <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className={`font-semibold text-sm ${eligibility.weeksStable >= 3 ? 'text-green-400' : 'text-gray-400'}`}>
                            Stability: 3 Weeks at Oxygen 6+
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Current: {eligibility.weeksStable}/3 weeks stable
                            {eligibility.weeksStable < 3 && ` (${3 - eligibility.weeksStable} more needed)`}
                          </p>
                        </div>
                      </div>

                      {/* Current Oxygen Level */}
                      <div className={`
                        flex items-start gap-3 p-4 rounded-lg border
                        ${eligibility.currentOxygenLevel >= 6 
                          ? 'bg-green-500/5 border-green-500/20' 
                          : 'bg-gray-500/5 border-gray-500/20'
                        }
                      `}>
                        {eligibility.currentOxygenLevel >= 6 ? (
                          <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className={`font-semibold text-sm ${eligibility.currentOxygenLevel >= 6 ? 'text-green-400' : 'text-gray-400'}`}>
                            Current Oxygen Level: 6+
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Current: {eligibility.currentOxygenLevel}/10
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Status Message */}
                  {!isFetchingEligibility && eligibility && (
                    <div className={`
                      p-4 rounded-lg border
                      ${eligibility.isEligible 
                        ? 'bg-green-500/10 border-green-500/30' 
                        : 'bg-amber-500/10 border-amber-500/30'
                      }
                    `}>
                      <p className={`text-sm ${eligibility.isEligible ? 'text-green-400' : 'text-amber-400'}`}>
                        {eligibility.message}
                      </p>
                    </div>
                  )}

                  {/* Error */}
                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col gap-3 pt-2">
                    <Button
                      onClick={handleTransitionToAscent}
                      disabled={!eligibility?.isEligible || isLoading || isFetchingEligibility}
                      className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      title={!eligibility?.isEligible ? 'Complete all criteria to transition' : ''}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Transitioning...
                        </>
                      ) : (
                        <>
                          <TrendingUp className="w-5 h-5 mr-2" />
                          Return to Ascent Mode
                        </>
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

            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}