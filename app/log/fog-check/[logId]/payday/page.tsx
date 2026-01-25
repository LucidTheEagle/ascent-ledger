// ============================================
// app/log/fog-check/[logId]/payday/page.tsx
// TOKEN PAYDAY PAGE: Shows reward animation
// ============================================

import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import TokenPayday from '@/components/tokens/TokenPayday';

interface PageProps {
  params: Promise<{ logId: string }>;
  searchParams: Promise<{ tokensAwarded?: string; newBalance?: string }>;
}

export default async function TokenPaydayPage({
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
  // PARSE URL PARAMS
  // ============================================
  const { logId } = await params;
  const search = await searchParams;
  
  const tokensAwarded = search.tokensAwarded ? parseInt(search.tokensAwarded) : undefined;
  const newBalance = search.newBalance ? parseInt(search.newBalance) : undefined;

  // Validate required params
  if (!tokensAwarded || !newBalance) {
    notFound();
  }

  // ============================================
  // RENDER CELEBRATION
  // ============================================
  return (
    <TokenPayday
      tokensAwarded={tokensAwarded}
      newBalance={newBalance}
      logId={logId}
      duration={2000} // 2 seconds
    />
  );
}

// ============================================
// METADATA (SEO)
// ============================================
export async function generateMetadata() {
  return {
    title: 'Tokens Earned! | Ascent Ledger',
    description: 'You earned tokens for completing your weekly log',
    robots: 'noindex, nofollow', // Private page
  };
}