// ============================================
// app/log/new/page.tsx
// Strategic Log - The Weekly Ritual
// HYBRID: Soul (Vision context) + Mind (Clean UX)
// ============================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { StrategicLogForm } from '@/components/log/StrategicLogForm';

export const metadata = {
  title: 'Weekly Log | Ascent Ledger',
  description: 'Track leverage, not tasks. Clear the fog.',
};

export default async function NewLogPage() {
  const supabase = await createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    redirect('/login');
  }

  // Fetch active vision for context (THE SOUL)
  const { data: vision } = await supabase
    .from('vision_canvases')
    .select('ai_synthesis, desired_state, anti_goal')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single();

  // Fetch user metadata for week calculation
  const { data: userData } = await supabase
    .from('users')
    .select('created_at, current_streak')
    .eq('id', user.id)
    .single();

  // TODO: Check if log already exists for this week (Checkpoint 3)
  // We will add double-log prevention in the API

  return (
    <div className="min-h-screen bg-ascent-black py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* THE SOUL: Vision Context */}
        {vision?.ai_synthesis && (
          <div className="mb-8 glass-panel p-6 rounded-xl border border-white/10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-xs uppercase tracking-wider text-ascent-gray mb-2">
                  Your Vision
                </p>
                <p className="text-ascent-white/90 text-sm leading-relaxed italic">
                  &apos;{vision.ai_synthesis.substring(0, 200)}...&apos;
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-ascent-blue">
                  {userData?.current_streak || 0}
                </div>
                <div className="text-xs text-ascent-gray">Week Streak</div>
              </div>
            </div>
          </div>
        )}

        {/* THE MIND: Clear Instructions */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-ascent-white mb-3 tracking-tight">
            The Weekly Ascent
          </h1>
          <p className="text-ascent-gray text-lg">
            Track leverage, not tasks. Clear the fog.
          </p>
          <p className="text-ascent-gray/70 text-sm mt-2">
            Three questions. Five minutes. One strategic insight.
          </p>
        </div>

        {/* THE HEART: The Form */}
        <StrategicLogForm 
          userId={user.id}
          visionContext={{
            desiredState: vision?.desired_state,
            antiGoal: vision?.anti_goal,
          }}
        />
      </div>
    </div>
  );
}