// ============================================
// components/log/FogCheckLoader.tsx
// ENGINEERED VERSION: Performance-monitored, UX-optimized
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

// ============================================
// CONFIGURATION CONSTANTS
// ============================================
const TIMING = {
  MIN_TOTAL_DURATION: 5000,        // Never feel rushed (5s minimum)
  MAX_BEFORE_WARNING: 10000,       // Show "still working" after 10s
  PHASE_BASE_DURATION: 1200,       // Base duration per phase
  PHASE_JITTER: 300,               // ±300ms randomness (feels organic)
  REDIRECT_DELAY: 1200,            // Pause before redirect (let success breathe)
} as const;

export default function FogCheckLoader({ logId, existingFogCheck }: FogCheckLoaderProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<LoadingPhase>('analyzing');
  const [progress, setProgress] = useState(0);
  const [fogCheckData, setFogCheckData] = useState<FogCheckSuccessResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSlowNetwork, setIsSlowNetwork] = useState(false);
  
  // Performance tracking
  const startTimeRef = useRef<number>(0);
  const apiStartRef = useRef<number>(0);
  
  // Run-once guard (prevents double execution in dev mode)
  const hasRunRef = useRef<boolean>(false);

  // ============================================
  // PROGRESS ANIMATION (Smooth, requestAnimationFrame-based)
  // ============================================
  const animateProgress = useCallback((start: number, end: number, duration: number) => {
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progressRatio = Math.min(elapsed / duration, 1);
      
      // Ease-out curve (feels natural)
      const eased = 1 - Math.pow(1 - progressRatio, 3);
      const current = start + (end - start) * eased;
      
      setProgress(current);

      if (progressRatio < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, []);

  // ============================================
  // PHASE TIMING (Organic, not robotic)
  // ============================================
  const waitForPhase = useCallback((baseMs: number): Promise<void> => {
    const jitter = Math.random() * TIMING.PHASE_JITTER * 2 - TIMING.PHASE_JITTER;
    const duration = baseMs + jitter;
    return new Promise(resolve => setTimeout(resolve, duration));
  }, []);

  // ============================================
  // FOG CHECK GENERATION (With performance monitoring)
  // ============================================
  const generateFogCheck = useCallback(async () => {
    startTimeRef.current = performance.now();
    
    try {
      // Phase 1: Analyzing (0-33%)
      setPhase('analyzing');
      animateProgress(0, 33, TIMING.PHASE_BASE_DURATION);
      await waitForPhase(TIMING.PHASE_BASE_DURATION);

      // Phase 2: Detecting patterns (33-66%)
      setPhase('detecting');
      animateProgress(33, 66, TIMING.PHASE_BASE_DURATION * 1.2);
      await waitForPhase(TIMING.PHASE_BASE_DURATION * 1.2);

      // Phase 3: Generating insight (66-90%)
      setPhase('generating');
      animateProgress(66, 90, TIMING.PHASE_BASE_DURATION);
      
      // ============================================
      // API CALL (With minimum duration enforcement)
      // ============================================
      apiStartRef.current = performance.now();
      
      const [apiResult] = await Promise.all([
        fetch('/api/fog-check/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logId }),
        }).then(res => res.json()) as Promise<FogCheckResponse>,
        
        // Enforce minimum total duration
        new Promise(resolve => {
          const elapsed = performance.now() - startTimeRef.current;
          const remaining = Math.max(0, TIMING.MIN_TOTAL_DURATION - elapsed);
          setTimeout(resolve, remaining);
        }),
      ]);

      const apiDuration = performance.now() - apiStartRef.current;
      
      // Performance monitoring
      if (apiDuration > 8000) {
        console.warn('[Fog Check] API slow:', Math.round(apiDuration), 'ms');
      }

      // ============================================
      // ERROR HANDLING (Type-safe)
      // ============================================
      if (!apiResult.success) {
        throw new Error(apiResult.error);
      }

      // ✅ TypeScript knows this is success now

      // Phase 4: Complete (90-100%)
      animateProgress(90, 100, 400);
      await new Promise(resolve => setTimeout(resolve, 400));
      
      setFogCheckData(apiResult);
      setPhase('complete');

      const totalDuration = performance.now() - startTimeRef.current;
      console.log('[Fog Check] Generated in', Math.round(totalDuration), 'ms');

      // ============================================
      // REDIRECT (With breathing room)
      // ============================================
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
      const timer = setTimeout(() => {
        setIsSlowNetwork(true);
      }, TIMING.MAX_BEFORE_WARNING);

      return () => clearTimeout(timer);
    }
  }, [phase]);

  // ============================================
  // INITIAL LOAD (Run-once with guard)
  // ============================================
  useEffect(() => {
    // Prevent double execution in React StrictMode (dev)
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    // If Fog Check already exists, skip to display
    if (existingFogCheck) {
      setPhase('complete');
      setProgress(100);
      setTimeout(() => {
        router.push(`/log/fog-check/${logId}/result`);
      }, 1000);
      return;
    }

    // Generate new Fog Check
    generateFogCheck();
  }, []); // ✅ Empty deps - truly run once

  // ============================================
  // UI COPY (Context-aware)
  // ============================================
  const phaseMessages = {
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

    const descriptions = {
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
      {/* Meteor Background */}
      <Meteors number={20} className="opacity-0 animate-fade-in"
               style={{ animationDelay: `${Math.random() * 2}s` }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-2xl">
        <div className="glass-panel p-12 rounded-2xl text-center border border-white/10 backdrop-blur-xl">
          {/* Icon/Status */}
          <div className="mb-8">
            {phase === 'error' ? (
              <div className="w-20 h-20 mx-auto rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center">
                <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            ) : phase === 'complete' ? (
              <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center animate-pulse">
                <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="w-20 h-20 mx-auto rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
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
              />
            </div>
          )}

          {/* Progress Percentage */}
          {phase !== 'error' && phase !== 'complete' && (
            <p className="text-sm text-gray-500 font-mono tabular-nums">
              {Math.round(progress)}%
            </p>
          )}

          {/* Token Preview (TYPE-SAFE) */}
          {phase === 'complete' && fogCheckData && (
            <div className="mt-6 p-4 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 rounded-lg animate-pulse">
              <p className="text-sm text-yellow-400 font-semibold">
                +{fogCheckData.tokensAwarded} Tokens Earned! 🪙
              </p>
            </div>
          )}

          {/* Error Actions */}
          {phase === 'error' && (
            <div className="mt-6 flex gap-4 justify-center">
              <button
                onClick={() => {
                  setPhase('analyzing');
                  setProgress(0);
                  setError(null);
                  setIsSlowNetwork(false);
                  generateFogCheck();
                }}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-semibold hover:opacity-90 transition-opacity text-white"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 border border-white/10 rounded-lg font-semibold hover:bg-white/5 transition-colors text-white"
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