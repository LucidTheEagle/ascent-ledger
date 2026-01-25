// ============================================
// components/fog-check/FogCheckDisplay.tsx
// THE REVEAL: Reddington-voice insight display
// ENGINEERED: Type-safe, accessible, performant
// ============================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { cn } from '@/lib/utils';

interface FogCheckDisplayProps {
  fogCheckId: string;
  observation: string;
  strategicQuestion: string;
  fogCheckType: string;
  existingReflection?: string | null;
  tokensAwarded?: number;
  newBalance?: number;
}

export default function FogCheckDisplay({
  fogCheckId,
  observation,
  strategicQuestion,
  fogCheckType,
  existingReflection,
  tokensAwarded,
  newBalance,
}: FogCheckDisplayProps) {
  const router = useRouter();
  const [reflection, setReflection] = useState(existingReflection || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Detect if this is an error fallback (shouldn't happen now, but defensive)
  const isErrorState = observation.includes('Unable to generate') || 
                        strategicQuestion.includes('Please try');

  // ============================================
  // SAVE REFLECTION (Optional)
  // ============================================
  const handleSaveReflection = async () => {
    if (!reflection.trim()) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const response = await fetch('/api/fog-check/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fogCheckId,
          reflection: reflection.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save reflection');
      }

      console.log('[Fog Check] Reflection saved');
    } catch (error) {
      console.error('[Fog Check] Save error:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================
  // CONTINUE TO DASHBOARD
  // ============================================
  const handleContinue = async () => {
    // Save reflection if user wrote something
    if (reflection.trim() && reflection !== existingReflection) {
      await handleSaveReflection();
    }

    // Navigate to dashboard
    router.push('/dashboard');
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="w-full max-w-3xl space-y-8">
        {/* Header: Token Earnings (if present) */}
        {tokensAwarded && (
          <div className="text-center space-y-2 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/30">
              <span className="text-2xl">🪙</span>
              <span className="text-yellow-400 font-semibold">
                +{tokensAwarded} Tokens Earned
              </span>
            </div>
            {newBalance !== undefined && (
              <p className="text-sm text-gray-500">
                New balance: <span className="text-gray-400 font-mono">{newBalance}</span>
              </p>
            )}
          </div>
        )}

        {/* Main Content: Fog Check */}
        <SpotlightCard className="p-8 md:p-12">
          {/* Title */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Your Fog Check
            </h1>
            <p className="text-sm text-gray-500 uppercase tracking-wider">
              {fogCheckType.replace('_', ' ')}
            </p>
          </div>

          {/* Observation */}
          <div className="mb-10">
            <div className="flex items-start gap-3 mb-4">
              <div className="mt-1 w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Observation
                </h2>
                <p className="text-base md:text-lg lg:text-xl text-gray-200 leading-relaxed" style={{ lineHeight: '1.7' }}>
                  {observation}
                </p>
              </div>
            </div>
          </div>

          {/* Strategic Question (Highlighted) */}
          {!isErrorState ? (
            <div className="mb-10">
              <div className="flex items-start gap-3">
                <div className="mt-1 w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-sm font-semibold text-purple-400 uppercase tracking-wide mb-2">
                    Strategic Question
                  </h2>
                  <p className="text-xl md:text-2xl text-white font-medium leading-relaxed">
                    <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {strategicQuestion}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-10 p-6 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-center">
                {strategicQuestion}
              </p>
            </div>
          )}

          {/* Reflection Field (Optional - Disabled on error) */}
          <div className="mb-8">
            <label
              htmlFor="reflection"
              className="block text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3"
            >
              Your Reflection (Optional)
            </label>
            <textarea
              id="reflection"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder={isErrorState ? "Reflection unavailable" : "What does this insight reveal to you? What will you do differently?"}
              disabled={isErrorState}
              className={cn(
                'w-full px-4 py-3 rounded-lg',
                'bg-slate-800/50 border border-white/10',
                'text-gray-200 placeholder-gray-600',
                'focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent',
                'transition-all duration-200',
                'resize-none',
                isErrorState && 'opacity-50 cursor-not-allowed'
              )}
              rows={4}
              maxLength={1000}
            />
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-gray-600">
                {reflection.length}/1000 characters
              </p>
              {saveError && (
                <p className="text-xs text-red-400">{saveError}</p>
              )}
            </div>
          </div>

          {/* Continue Button - Mobile optimized tap target */}
          <div className="pt-6 border-t border-white/5">
            <button
              onClick={handleContinue}
              disabled={isSaving}
              className={cn(
                'w-full px-6 md:px-8 py-4 md:py-5 rounded-lg font-semibold text-base md:text-lg',
                'bg-gradient-to-r from-purple-600 to-pink-600',
                'hover:from-purple-500 hover:to-pink-500',
                'transition-all duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'shadow-lg shadow-purple-500/20',
                'text-white',
                'min-h-[48px]' // Minimum tap target for mobile
              )}
            >
              {isSaving ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving reflection...
                </span>
              ) : (
                'Continue to Dashboard →'
              )}
            </button>
          </div>
        </SpotlightCard>

        {/* Footer: The Promise */}
        <div className="text-center">
          <p className="text-xs text-gray-600 italic">
            The Ledger sees your ascent.
            <span className="block mt-1">
              Next week, we&apos;ll see if you acted on this insight.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}