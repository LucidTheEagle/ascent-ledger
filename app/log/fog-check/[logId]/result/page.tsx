// ============================================
// app/log/fog-check/[logId]/result/page.tsx
// SERVER COMPONENT: Fetches Fog Check data, renders display
// FIXED: More defensive async params handling
// ============================================

import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import FogCheckDisplay from '@/components/fog-check/FogCheckDisplay';

interface PageProps {
  params: Promise<{ logId: string }>;
  searchParams: Promise<{ tokensAwarded?: string; newBalance?: string }>;
}

export default async function FogCheckResultPage(props: PageProps) {
  // ============================================
  // AUTHENTICATION
  // ============================================
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // ============================================
  // AWAIT PARAMS (DEFENSIVE)
  // ============================================
  const params = await props.params;
  const searchParams = await props.searchParams;
  
  const logId = params.logId;
  
  if (!logId) {
    console.error('[FOG_CHECK_RESULT] Missing logId in params');
    notFound();
  }

  // ============================================
  // FETCH FOG CHECK DATA
  // ============================================
  const fogCheck = await prisma.fogCheck.findFirst({
    where: {
      logId,
      userId: user.id, // Ensure user owns this Fog Check
    },
    select: {
      id: true,
      observation: true,
      strategicQuestion: true,
      fogCheckType: true,
      userReflection: true,
    },
  });

  if (!fogCheck) {
    console.error(`[FOG_CHECK_RESULT] No fog check found for logId: ${logId}, userId: ${user.id}`);
    notFound();
  }

  // ============================================
  // PARSE URL PARAMS (Token data from loader)
  // ============================================
  const tokensAwarded = searchParams.tokensAwarded ? parseInt(searchParams.tokensAwarded) : undefined;
  const newBalance = searchParams.newBalance ? parseInt(searchParams.newBalance) : undefined;

  console.log(`[FOG_CHECK_RESULT] Rendering for logId: ${logId}, fogCheckId: ${fogCheck.id}`);

  // ============================================
  // RENDER CLIENT COMPONENT
  // ============================================
  return (
    <FogCheckDisplay
      fogCheckId={fogCheck.id}
      observation={fogCheck.observation}
      strategicQuestion={fogCheck.strategicQuestion}
      fogCheckType={fogCheck.fogCheckType}
      existingReflection={fogCheck.userReflection}
      tokensAwarded={tokensAwarded}
      newBalance={newBalance}
    />
  );
}

// ============================================
// METADATA (SEO)
// ============================================
export async function generateMetadata(props: PageProps) {
  const params = await props.params;
  
  return {
    title: 'Your Fog Check | Ascent Ledger',
    description: 'Your weekly strategic insight from The Ledger',
    robots: 'noindex, nofollow', // Private page
  };
}