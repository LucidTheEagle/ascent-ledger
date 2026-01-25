// ============================================
// app/log/fog-check/[logId]/result/page.tsx
// SERVER COMPONENT: Fetches Fog Check data, renders display
// ============================================

import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import FogCheckDisplay from '@/components/fog-check/FogCheckDisplay';

interface PageProps {
  params: Promise<{ logId: string }>;
  searchParams: Promise<{ tokensAwarded?: string; newBalance?: string }>;
}

export default async function FogCheckResultPage({
  params,
  searchParams,
}: PageProps) {
  // ============================================
  // AUTHENTICATION
  // ============================================
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // ============================================
  // FETCH FOG CHECK DATA
  // ============================================
  const { logId } = await params;
  
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
    notFound();
  }

  // ============================================
  // PARSE URL PARAMS (Token data from loader)
  // ============================================
  const search = await searchParams;
  const tokensAwarded = search.tokensAwarded ? parseInt(search.tokensAwarded) : undefined;
  const newBalance = search.newBalance ? parseInt(search.newBalance) : undefined;

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
export async function generateMetadata({ params }: PageProps) {
  const { logId } = await params;
  
  return {
    title: 'Your Fog Check | Ascent Ledger',
    description: 'Your weekly strategic insight from The Ledger',
    robots: 'noindex, nofollow', // Private page
  };
}