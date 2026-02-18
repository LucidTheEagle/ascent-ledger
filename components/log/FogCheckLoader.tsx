// ============================================
// components/log/FogCheckLoader.tsx
// ENGINEERED VERSION: Performance-monitored, UX-optimized
// FIX: Math.random() moved to useRef — was causing hydration mismatch
//      (server and client computed different values on first render)
// ============================================

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Meteors } from '@/components/ui/meteors';
import type { FogCheckResponse, FogCheckSuccessResponse } from '@/lib/contracts/fog-check';

interface FogCheckLoaderProps {
  logId: string;
  existingFogCheck?: {
    id: string;
    observation: string;
    strategic_question: string;
    fog_check_type: string;
  } | null;
}

type LoadingPhase = 'analyzing' | 'detecting' | 'generating' | 'complete' | 'error';

const TIMING = {
  MIN_TOTAL_DURATION: 5000,
  MAX_BEFORE_WARNING: 10000,
  PHASE_BASE_DURATION: 1200,
  PHASE_JITTER: 300,
  REDIRECT_DELAY: 1200,
} as const;

export default function FogCheckLoader({ logId, existingFogCheck }: FogCheckLoaderProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<LoadingPhase>('analyzing');
  const [progress, setProgress] = useState(0);
  const [fogCheckData, setFogCheckData] = useState<FogCheckSuccessResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSlowNetwork, setIsSlowNetwork] = useState(false);

  const startTimeRef = useRef<number>(0);
  const apiStartRef = useRef<number>(0);
  const hasRunRef = useRef<boolean>(false);

  // FIX: Math.random() in JSX runs on every render and produces different
  // values on server vs client → React hydration warning.
  // useRef computes once on mount, client-side only, never changes.
  const meteorDelayRef = useRef<string | null>(null);
  useEffect(() => {
    meteorDelayRef.current = `${(Math.random() * 2).toFixed(2)}s`;
  }, []);

  // ============================================
  // PROGRESS ANIMATION
  // ============================================
  const animateProgress = useCallback((start: number, end: number, duration: number) => {
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progressRatio = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progressRatio, 3);
      const current = start + (end - start) * eased;
      setProgress(current);
      if (progressRatio < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, []);

  // ============================================
  // PHASE TIMING
  // ============================================
  const waitForPhase = useCallback((baseMs: number): Promise<void> => {
    const jitter = Math.random() * TIMING.PHASE_JITTER * 2 - TIMING.PHASE_JITTER;
    return new Promise(resolve => setTimeout(resolve, baseMs + jitter));
  }, []);

  // ============================================
  // FOG CHECK GENERATION
  // ============================================
  const generateFogCheck = useCallback(async () => {
    startTimeRef.current = performance.now();

    try {
      setPhase('analyzing');
      animateProgress(0, 33, TIMING.PHASE_BASE_DURATION);
      await waitForPhase(TIMING.PHASE_BASE_DURATION);

      setPhase('detecting');
      animateProgress(33, 66, TIMING.PHASE_BASE_DURATION * 1.2);
      await waitForPhase(TIMING.PHASE_BASE_DURATION * 1.2);

      setPhase('generating');
      animateProgress(66, 90, TIMING.PHASE_BASE_DURATION);

      apiStartRef.current = performance.now();

      const [apiResult] = await Promise.all([
        fetch('/api/fog-check/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logId }),
        }).then(res => res.json()) as Promise<FogCheckResponse>,

        new Promise(resolve => {
          const elapsed = performance.now() - startTimeRef.current;
          const remaining = Math.max(0, TIMING.MIN_TOTAL_DURATION - elapsed);
          setTimeout(resolve, remaining);
        }),
      ]);

      const apiDuration = performance.now() - apiStartRef.current;
      if (apiDuration > 8000) {
        console.warn('[Fog Check] API slow:', Math.round(apiDuration), 'ms');
      }

      if (!apiResult.success) {
        throw new Error(apiResult.error);
      }

      animateProgress(90, 100, 400);
      await new Promise(resolve => setTimeout(resolve, 400));

      setFogCheckData(apiResult);
      setPhase('complete');

      const totalDuration = performance.now() - startTimeRef.current;
      console.log('[Fog Check] Generated in', Math.round(totalDuration), 'ms');

      setTimeout(() => {
        const params = new URLSearchParams({
          tokensAwarded: apiResult.tokensAwarded.toString(),
          newBalance: apiResult.newTokenBalance.toString(),
        });
        router.push(`/log/fog-check/${logId}/result?${params.toString()}`);
      }, TIMING.REDIRECT_DELAY);

    } catch (err) {
      console.error('[Fog Check] Generation error:', err);
      setPhase('error');
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  }, [logId, animateProgress, waitForPhase, router]);

  // ============================================
  // SLOW NETWORK DETECTION
  // ============================================
  useEffect(() => {
    if (phase === 'analyzing' || phase === 'detecting' || phase === 'generating') {
      const timer = setTimeout(() => setIsSlowNetwork(true), TIMING.MAX_BEFORE_WARNING);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // ============================================
  // INITIAL LOAD
  // ============================================
  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    if (existingFogCheck) {
      setPhase('complete');
      setProgress(100);
      setTimeout(() => {
        router.push(`/log/fog-check/${logId}/result`);
      }, 1000);
      return;
    }

    generateFogCheck();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================
  // UI COPY
  // ============================================
  const phaseMessages: Record<LoadingPhase, string> = {
    analyzing: 'Analyzing your week...',
    detecting: 'Detecting patterns...',
    generating: 'Generating your insight...',
    complete: 'Fog Check ready.',
    error: 'Something went wrong.',
  };

  const getPhaseDescription = (): string => {
    if (phase === 'error') return error || 'Please try again';
    if (isSlowNetwork && phase !== 'complete') {
      return 'Still working... Your insight is worth the extra time.';
    }
    const descriptions: Record<LoadingPhase, string> = {
      analyzing: 'Reviewing your leverage, insights, and opportunities',
      detecting: 'Comparing with your vision and past weeks',
      generating: 'Crafting your strategic guidance',
      complete: 'Preparing your Fog Check',
      error: error || 'Please try again',
    };
    return descriptions[phase];
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-gradient-to-br from-ascent-obsidian via-ascent-obsidian to-ascent-purple/10">
      <Meteors
        number={20}
        className="opacity-0 animate-fade-in"
        // Safe: meteorDelayRef is set client-side only in useEffect
        // Falls back to no delay on first render (before effect runs)
        style={{ animationDelay: meteorDelayRef.current ?? '0s' }}
      />

      <div className="relative z-10 w-full max-w-2xl">
        <div className="glass-panel p-12 rounded-2xl text-center border border-white/10 backdrop-blur-xl">

          {/* Status Icon */}
          <div className="mb-8">
            {phase === 'error' ? (
              <div className="w-20 h-20 mx-auto rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center">
                <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            ) : phase === 'complete' ? (
              <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center animate-pulse">
                <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="w-20 h-20 mx-auto rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center">
                <div
                  className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
                  role="status"
                  aria-label={phaseMessages[phase]}
                />
              </div>
            )}
          </div>

          {/* Phase Message */}
          <h1 className="text-3xl font-bold text-white mb-3">
            {phaseMessages[phase]}
          </h1>
          <p className="text-gray-400 text-lg mb-8 transition-all duration-500">
            {getPhaseDescription()}
          </p>

          {/* Progress Bar */}
          {phase !== 'error' && (
            <div className="w-full bg-white/5 rounded-full h-2 mb-6 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
                role="progressbar"
                aria-valuenow={Math.round(progress)}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          )}

          {phase !== 'error' && phase !== 'complete' && (
            <p className="text-sm text-gray-500 font-mono tabular-nums">
              {Math.round(progress)}%
            </p>
          )}

          {/* Token Preview */}
          {phase === 'complete' && fogCheckData && (
            <div className="mt-6 p-4 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 rounded-lg animate-pulse">
              <p className="text-sm text-yellow-400 font-semibold">
                +{fogCheckData.tokensAwarded} Tokens Earned! 🪙
              </p>
            </div>
          )}

          {/* Error Actions */}
          {phase === 'error' && (
            <div className="mt-6 flex gap-4 justify-center flex-wrap">
              <button
                onClick={() => {
                  setPhase('analyzing');
                  setProgress(0);
                  setError(null);
                  setIsSlowNetwork(false);
                  hasRunRef.current = false;
                  generateFogCheck();
                }}
                className="px-6 py-3 min-h-[44px] bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-semibold hover:opacity-90 transition-opacity text-white"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 min-h-[44px] border border-white/10 rounded-lg font-semibold hover:bg-white/5 transition-colors text-white"
              >
                Go to Dashboard
              </button>
            </div>
          )}

          {/* The Promise */}
          {phase !== 'error' && phase !== 'complete' && (
            <div className="mt-12 pt-8 border-t border-white/5">
              <p className="text-xs text-gray-500 italic">
                The Ledger is analyzing your ascent.
                <span className="block mt-1">
                  {isSlowNetwork
                    ? 'Taking longer than usual, but quality takes time.'
                    : 'This takes 5-10 seconds. The insight will be worth the wait.'
                  }
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}