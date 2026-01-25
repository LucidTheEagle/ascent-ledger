// ============================================
// app/log/fog-check/[logId]/page.tsx
// THE ANTICIPATION: Meteor loading → Fog Check generation → Display
// ============================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import FogCheckLoader from '@/components/log/FogCheckLoader';

interface PageProps {
  params: Promise<{
    logId: string;
  }>;
}

export default async function FogCheckPage({ params }: PageProps) {
  const { logId } = await params;
  
  // Verify authentication
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    redirect('/login');
  }

  // Verify log exists and belongs to user
  const { data: log } = await supabase
    .from('strategic_logs')
    .select('id, user_id')
    .eq('id', logId)
    .single();

  if (!log) {
    redirect('/dashboard');
  }

  if (log.user_id !== user.id) {
    redirect('/dashboard');
  }

  // Check if Fog Check already exists
  const { data: existingFogCheck } = await supabase
    .from('fog_checks')
    .select('*')
    .eq('log_id', logId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return (
    <div className="min-h-screen bg-ascent-black">
      <FogCheckLoader 
        logId={logId}
        userId={user.id}
        existingFogCheck={existingFogCheck}
      />
    </div>
  );
}