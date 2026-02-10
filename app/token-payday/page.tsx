// ============================================
// app/token-payday/page.tsx
// UNIVERSAL TOKEN PAYDAY PAGE
// Reads URL params, displays animation, redirects
// ============================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import TokenPayday from '@/components/tokens/TokenPayday';

interface PageProps {
  searchParams: Promise<{
    amount?: string;
    newBalance?: string;
    reason?: string;
    redirect?: string;
  }>;
}

export default async function TokenPaydayPage(props: PageProps) {
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
  const searchParams = await props.searchParams;
  
  const amount = searchParams.amount ? parseInt(searchParams.amount) : 0;
  const newBalance = searchParams.newBalance ? parseInt(searchParams.newBalance) : 0;
  const reason = searchParams.reason || 'UNKNOWN';
  const redirectUrl = searchParams.redirect || '/dashboard';

  // ============================================
  // VALIDATE PARAMS
  // ============================================
  if (amount <= 0 || newBalance < 0) {
    console.error('[TOKEN_PAYDAY] Invalid params:', { amount, newBalance, reason });
    redirect('/dashboard');
  }

  // ============================================
  // RENDER PAYDAY ANIMATION
  // ============================================
  return (
    <TokenPayday
      amount={amount}
      newBalance={newBalance}
      reason={reason}
      redirectUrl={redirectUrl}
      duration={2000}
    />
  );
}

// ============================================
// METADATA
// ============================================
export const metadata = {
  title: 'Tokens Earned | Ascent Ledger',
  description: 'Your reward for taking action',
  robots: 'noindex, nofollow',
};