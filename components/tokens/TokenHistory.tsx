// ============================================
// components/tokens/TokenHistory.tsx
// UPDATED: CP21-23 — Eagle voice empty states, dropdown outside-click close,
//          touch target compliance on filter buttons
// ============================================

'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Coins, TrendingUp, TrendingDown, Filter, ChevronDown } from 'lucide-react';
import { TransactionItem } from './TransactionItem';

interface Transaction {
  id: string;
  amount: number;
  transactionType: string;
  description: string;
  balanceAfter: number;
  createdAt: Date;
}

interface TokenHistoryProps {
  currentBalance: number;
  totalEarned: number;
  totalSpent: number;
  transactions: Transaction[];
}

type FilterType = 'all' | 'earned' | 'spent';

// ─────────────────────────────────────────────────────────
// Eagle voice empty state copy — per filter context
// ─────────────────────────────────────────────────────────
const EMPTY_STATES: Record<FilterType, { title: string; description: string }> = {
  all: {
    title: 'Clean ledger.',
    description:
      'Every token you earn lands here. Complete your Vision Canvas or submit your first weekly log to get started.',
  },
  earned: {
    title: 'Nothing earned yet.',
    description:
      'Tokens flow in when you do the work — Vision Canvas, weekly logs, Fog Checks. Start logging and the ledger fills itself.',
  },
  spent: {
    title: 'No tokens deployed.',
    description:
      'You haven\'t spent any tokens yet. Tokens are used when you activate AI-powered features like Fog Checks and Crisis Protocol.',
  },
}

export function TokenHistory({
  currentBalance,
  totalEarned,
  totalSpent,
  transactions,
}: TokenHistoryProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── Outside-click closes dropdown ──────────────────────
  // Without this, on mobile the dropdown stays open when
  // the user taps anywhere else on the page
  useEffect(() => {
    if (!showFilterMenu) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowFilterMenu(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showFilterMenu]);

  // ── Filter transactions ─────────────────────────────────
  const filteredTransactions = useMemo(() => {
    if (filter === 'earned') return transactions.filter(t => t.amount > 0);
    if (filter === 'spent') return transactions.filter(t => t.amount < 0);
    return transactions;
  }, [transactions, filter]);

  const emptyState = EMPTY_STATES[filter];

  return (
    <div className="space-y-6">

      {/* ── STATS OVERVIEW ─────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div className="glass-panel p-6 rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-yellow-500/10">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-amber-400/70 uppercase tracking-wide">
              Current Balance
            </p>
            <Coins className="w-5 h-5 text-amber-400" aria-hidden="true" />
          </div>
          <p className="text-4xl font-bold text-amber-400 font-mono">
            {currentBalance.toLocaleString()}
          </p>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-green-500/20 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-green-400/70 uppercase tracking-wide">
              Total Earned
            </p>
            <TrendingUp className="w-5 h-5 text-green-400" aria-hidden="true" />
          </div>
          <p className="text-3xl font-bold text-green-400 font-mono">
            +{totalEarned.toLocaleString()}
          </p>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-red-500/20 bg-gradient-to-br from-red-500/10 to-orange-500/10">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-red-400/70 uppercase tracking-wide">
              Total Spent
            </p>
            <TrendingDown className="w-5 h-5 text-red-400" aria-hidden="true" />
          </div>
          <p className="text-3xl font-bold text-red-400 font-mono">
            {totalSpent > 0 ? `-${totalSpent.toLocaleString()}` : '0'}
          </p>
        </div>

      </div>

      {/* ── FILTER HEADER ──────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Transactions</h2>

        {/* Filter dropdown — ref for outside-click detection */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            aria-expanded={showFilterMenu}
            aria-haspopup="listbox"
            aria-label={`Filter transactions: ${filter}`}
            className="flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 hover:border-gray-600 transition-colors"
          >
            <Filter className="w-4 h-4" aria-hidden="true" />
            <span className="text-sm font-medium capitalize">{filter}</span>
            <ChevronDown
              className={`w-3 h-3 transition-transform duration-200 ${showFilterMenu ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>

          {showFilterMenu && (
            <div
              role="listbox"
              aria-label="Transaction filter options"
              className="absolute right-0 mt-2 w-44 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 overflow-hidden"
            >
              {(['all', 'earned', 'spent'] as FilterType[]).map((option) => (
                <button
                  key={option}
                  role="option"
                  aria-selected={filter === option}
                  onClick={() => {
                    setFilter(option);
                    setShowFilterMenu(false);
                  }}
                  className={`w-full text-left min-h-[44px] px-4 py-2 text-sm hover:bg-gray-700 transition-colors capitalize ${
                    filter === option
                      ? option === 'earned'
                        ? 'text-green-400 font-semibold'
                        : option === 'spent'
                        ? 'text-red-400 font-semibold'
                        : 'text-blue-400 font-semibold'
                      : 'text-gray-300'
                  }`}
                >
                  {option === 'all' ? 'All Transactions' : `${option.charAt(0).toUpperCase() + option.slice(1)} Only`}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── TRANSACTION LIST ────────────────────────────── */}
      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (

          // ── EMPTY STATE: Eagle voice ──────────────────
          <div className="glass-panel p-12 rounded-xl border border-white/10 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
              <Coins className="w-7 h-7 text-amber-400/60" aria-hidden="true" />
            </div>
            <p className="text-white text-lg font-semibold">
              {emptyState.title}
            </p>
            <p className="text-gray-500 text-sm max-w-xs mx-auto leading-relaxed">
              {emptyState.description}
            </p>
          </div>

        ) : (
          filteredTransactions.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
            />
          ))
        )}
      </div>

      {/* ── PAGINATION NOTE ─────────────────────────────── */}
      {transactions.length >= 100 && (
        <div className="text-center pt-4">
          <p className="text-sm text-gray-500">
            Showing last 100 transactions
          </p>
        </div>
      )}

    </div>
  );
}