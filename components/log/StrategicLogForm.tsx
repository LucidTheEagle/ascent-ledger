// ============================================
// components/log/StrategicLogForm.tsx
// HYBRID: Gemini's Clean UX + Victor's Soul Context
// The Form That Sees You
// ============================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StrategicLogFormProps {
  userId: string;
  visionContext?: {
    desiredState?: string;
    antiGoal?: string;
  };
}

interface LogFormData {
  leverageBuilt: string;
  learnedInsight: string;
  opportunitiesCreated: string;
  isSurvivalMode: boolean;
  hadNoLeverage: boolean;
}

const CHAR_LIMIT = 500;

export function StrategicLogForm({ userId, visionContext }: StrategicLogFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<LogFormData>({
    leverageBuilt: '',
    learnedInsight: '',
    opportunitiesCreated: '',
    isSurvivalMode: false,
    hadNoLeverage: false,
  });

  const handleChange = (field: keyof LogFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.leverageBuilt.trim() || formData.leverageBuilt.length < 10) {
      setError('Question 1 requires at least 10 characters.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/log/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ...formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit log');
      }

      const fogCheckUrl = `/log/fog-check/${data.logId}`;
      
      router.push(
        `/token-payday?amount=${data.tokensAwarded}&newBalance=${data.newBalance}&reason=WEEKLY_LOG&redirect=${encodeURIComponent(fogCheckUrl)}`
      );
    } catch (err) {
      console.error('Submission error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Helper for Character Count
  const CharCount = ({ text }: { text: string }) => (
    <span className={cn(
      "text-xs font-mono transition-colors",
      text.length > 450 ? "text-ascent-amber" : "text-ascent-gray"
    )}>
      {text.length}/{CHAR_LIMIT}
    </span>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="bg-ascent-red/10 border border-ascent-red/30 rounded-lg p-4">
          <p className="text-ascent-red text-sm">{error}</p>
        </div>
      )}

      {/* QUESTION 1: Leverage Built */}
      <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 p-6 rounded-xl shadow-xl hover:border-zinc-700 transition-all group">
        <label className="block text-base font-semibold text-ascent-white mb-2">
          1. What leverage did you build this week?
        </label>
        <p className="text-xs text-ascent-gray mb-4 leading-relaxed">
          Leverage = skills, relationships, visibility, or systems that compound.
          <span className="block mt-1 italic text-ascent-gray/70">
            Not tasks—leverage. What works while you sleep?
          </span>
        </p>

        <textarea
          required
          maxLength={CHAR_LIMIT}
          className="w-full bg-black/50 border border-zinc-700 rounded-lg p-3 text-ascent-white placeholder-zinc-600 focus:ring-2 focus:ring-ascent-blue focus:border-transparent outline-none min-h-[120px] transition-all"
          placeholder="E.g., Had coffee with senior director about leadership transition, Shipped side project demonstrating strategic thinking..."
          value={formData.leverageBuilt}
          onChange={(e) => handleChange('leverageBuilt', e.target.value)}
        />

        <div className="flex justify-between items-start mt-3">
          <div className="flex flex-col gap-2">
            {/* Smart Default: No Leverage */}
            <label className="flex items-center gap-2 text-xs text-ascent-gray cursor-pointer hover:text-ascent-white transition-colors group/checkbox">
              <input 
                type="checkbox" 
                checked={formData.hadNoLeverage}
                onChange={(e) => handleChange('hadNoLeverage', e.target.checked)}
                className="rounded border-zinc-700 bg-black/50 text-ascent-blue focus:ring-ascent-blue focus:ring-offset-ascent-black"
              />
              <span>No leverage this week (being honest)</span>
            </label>
          </div>
          <CharCount text={formData.leverageBuilt} />
        </div>

        {/* Soul Context: Anti-Goal Warning */}
        {visionContext?.antiGoal && formData.leverageBuilt.toLowerCase().includes(visionContext.antiGoal.toLowerCase()) && (
          <div className="mt-3 bg-ascent-amber/10 border border-ascent-amber/30 rounded-lg p-3">
            <p className="text-xs text-ascent-amber">
              ⚠️ You mentioned &apos;{visionContext.antiGoal}&apso; — the fog you&apos;re ascending from. Are you sliding back?
            </p>
          </div>
        )}
      </div>

      {/* QUESTION 2: Learned Insight */}
      <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 p-6 rounded-xl shadow-xl hover:border-zinc-700 transition-all">
        <label className="block text-base font-semibold text-ascent-white mb-2">
          2. What learned insight reshaped your view?
        </label>
        <p className="text-xs text-ascent-gray mb-4 leading-relaxed">
          Not just information absorbed—a shift in perspective.
          <span className="block mt-1 italic text-ascent-gray/70">
            What changed how you see yourself, your craft, or the game?
          </span>
        </p>

        <textarea
          required
          maxLength={CHAR_LIMIT}
          className="w-full bg-black/50 border border-zinc-700 rounded-lg p-3 text-ascent-white placeholder-zinc-600 focus:ring-2 focus:ring-ascent-purple focus:border-transparent outline-none min-h-[120px] transition-all"
          placeholder="E.g., Realized I avoid visibility work because I fear judgment, Learned that leadership requires noise—conversations, visibility, risk..."
          value={formData.learnedInsight}
          onChange={(e) => handleChange('learnedInsight', e.target.value)}
        />

        <div className="flex justify-end mt-3">
          <CharCount text={formData.learnedInsight} />
        </div>
      </div>

      {/* QUESTION 3: Opportunities Created */}
      <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 p-6 rounded-xl shadow-xl hover:border-zinc-700 transition-all">
        <label className="block text-base font-semibold text-ascent-white mb-2">
          3. What opportunities did you create?
        </label>
        <p className="text-xs text-ascent-gray mb-4 leading-relaxed">
          Outbound actions, new connections, or &apos;luck&apos; engineered.
          <span className="block mt-1 italic text-ascent-gray/70">
            Applications sent, conversations started, content posted, skills demonstrated.
          </span>
        </p>

        <textarea
          required
          maxLength={CHAR_LIMIT}
          className="w-full bg-black/50 border border-zinc-700 rounded-lg p-3 text-ascent-white placeholder-zinc-600 focus:ring-2 focus:ring-ascent-green focus:border-transparent outline-none min-h-[120px] transition-all"
          placeholder="E.g., Applied to 3 PM roles, Posted LinkedIn article on strategy, Reached out to 2 former colleagues for advice..."
          value={formData.opportunitiesCreated}
          onChange={(e) => handleChange('opportunitiesCreated', e.target.value)}
        />

        <div className="flex justify-between items-start mt-3">
          <div className="flex flex-col gap-2">
            {/* Smart Default: Survival Mode */}
            <label className="flex items-center gap-2 text-xs text-ascent-gray cursor-pointer hover:text-ascent-red transition-colors group/checkbox">
              <input 
                type="checkbox" 
                checked={formData.isSurvivalMode}
                onChange={(e) => handleChange('isSurvivalMode', e.target.checked)}
                className="rounded border-zinc-700 bg-black/50 text-ascent-red focus:ring-ascent-red focus:ring-offset-ascent-black"
              />
              <span>Survival mode this week (just keeping head above water)</span>
            </label>
          </div>
          <CharCount text={formData.opportunitiesCreated} />
        </div>
      </div>

      {/* Submit Button - THE HEART */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting || formData.leverageBuilt.length < 10}
          className={cn(
            "w-full py-5 rounded-xl font-semibold text-lg transition-all transform active:scale-[0.98] relative overflow-hidden",
            isSubmitting || formData.leverageBuilt.length < 10
              ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              : "bg-gradient-to-r from-ascent-blue to-ascent-purple text-white hover:opacity-90 shadow-[0_0_30px_rgba(59,130,246,0.3)]"
          )}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin" />
              Securing your ascent...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Generate My Fog Check
              <svg 
                className="w-5 h-5 transition-transform group-hover:translate-x-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          )}
        </button>

        {/* Validation Hint */}
        {formData.leverageBuilt.length < 10 && formData.leverageBuilt.length > 0 && (
          <p className="text-xs text-ascent-red mt-2 text-center">
            Question 1 needs at least 10 characters to proceed
          </p>
        )}
      </div>

      {/* The Promise - THE SOUL */}
      <div className="text-center pt-6 border-t border-white/5">
        <p className="text-xs text-ascent-gray/70 italic">
          Your log feeds The Ledger. In 5 seconds, you&apos;ll receive an insight
          {visionContext?.desiredState && (
            <span className="block mt-1">
              aligned with your vision: {visionContext.desiredState.substring(0, 60)}...
            </span>
          )}
        </p>
      </div>
    </form>
  );
}