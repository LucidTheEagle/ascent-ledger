// ============================================
// app/tokens/page.tsx
// TOKEN HISTORY PAGE - Server Component
// Displays complete transaction ledger
// ============================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getTokenBalance, getTokenHistory } from '@/lib/services/token-service';
import { TokenHistory } from '@/components/tokens/TokenHistory';

type TokenTransactionItem = Awaited<ReturnType<typeof getTokenHistory>>[number];

export const metadata = {
  title: 'Token History | Ascent Ledger',
  description: 'Your complete token transaction history',
};

export default async function TokenHistoryPage() {
  // ============================================
  // AUTHENTICATION
  // ============================================
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // ============================================
  // FETCH TOKEN DATA
  // ============================================
  let balanceData = null;
  let transactions = null;
  let fetchError = null;

  try {
    // Get current balance and stats
    balanceData = await getTokenBalance(user.id);

    // Get transaction history (last 100 transactions)
    transactions = await getTokenHistory(user.id, 100);
  } catch (error) {
    console.error('Error fetching token history:', error);
    fetchError = error;
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Unable to Load Token History
            </h2>
            <p className="text-gray-400 mb-6">
              Something went wrong. Please try again.
            </p>
            <a
              href="/dashboard"
              className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-ascent-white rounded-lg font-semibold hover:opacity-90"
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Token History
          </h1>
          <p className="text-gray-400">
            Every token earned. Every milestone reached.
          </p>
        </div>

        {/* Client Component with Filters */}
        <TokenHistory
          currentBalance={balanceData?.currentBalance ?? 0}
          totalEarned={balanceData?.totalEarned ?? 0}
          totalSpent={balanceData?.totalSpent ?? 0}
          transactions={(transactions ?? []).map((txn: TokenTransactionItem) => ({
            ...txn,
            description: txn.description ?? ""
          }))}
        />

      </div>
    </div>
  );
}