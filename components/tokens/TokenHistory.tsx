// ============================================
// components/tokens/TokenHistory.tsx
// CLIENT COMPONENT: Token transaction history with filters
// ============================================

'use client';

import { useState, useMemo } from 'react';
import { Coins, TrendingUp, TrendingDown, Filter } from 'lucide-react';
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

export function TokenHistory({
  currentBalance,
  totalEarned,
  totalSpent,
  transactions,
}: TokenHistoryProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // ============================================
  // FILTER TRANSACTIONS
  // ============================================
  const filteredTransactions = useMemo(() => {
    if (filter === 'all') return transactions;
    if (filter === 'earned') return transactions.filter(t => t.amount > 0);
    if (filter === 'spent') return transactions.filter(t => t.amount < 0);
    return transactions;
  }, [transactions, filter]);

  // ============================================
  // STATS CARDS
  // ============================================
  return (
    <div className="space-y-6">
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Current Balance */}
        <div className="glass-panel p-6 rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-yellow-500/10">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-amber-400/70 uppercase tracking-wide">
              Current Balance
            </p>
            <Coins className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-4xl font-bold text-amber-400 font-mono">
            {currentBalance.toLocaleString()}
          </p>
        </div>

        {/* Total Earned */}
        <div className="glass-panel p-6 rounded-xl border border-green-500/20 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-green-400/70 uppercase tracking-wide">
              Total Earned
            </p>
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-3xl font-bold text-green-400 font-mono">
            +{totalEarned.toLocaleString()}
          </p>
        </div>

        {/* Total Spent */}
        <div className="glass-panel p-6 rounded-xl border border-red-500/20 bg-gradient-to-br from-red-500/10 to-orange-500/10">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-red-400/70 uppercase tracking-wide">
              Total Spent
            </p>
            <TrendingDown className="w-5 h-5 text-red-400" />
          </div>
          <p className="text-3xl font-bold text-red-400 font-mono">
            {totalSpent > 0 ? `-${totalSpent.toLocaleString()}` : '0'}
          </p>
        </div>

      </div>

      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          Transactions
        </h2>

        {/* Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 hover:border-gray-600 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium capitalize">{filter}</span>
          </button>

          {/* Dropdown Menu */}
          {showFilterMenu && (
            <div className="absolute right-0 mt-2 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10">
              <button
                onClick={() => {
                  setFilter('all');
                  setShowFilterMenu(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors ${
                  filter === 'all' ? 'text-blue-400 font-semibold' : 'text-gray-300'
                }`}
              >
                All Transactions
              </button>
              <button
                onClick={() => {
                  setFilter('earned');
                  setShowFilterMenu(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors ${
                  filter === 'earned' ? 'text-green-400 font-semibold' : 'text-gray-300'
                }`}
              >
                Earned Only
              </button>
              <button
                onClick={() => {
                  setFilter('spent');
                  setShowFilterMenu(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors rounded-b-lg ${
                  filter === 'spent' ? 'text-red-400 font-semibold' : 'text-gray-300'
                }`}
              >
                Spent Only
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="glass-panel p-12 rounded-xl border border-white/10 text-center">
            <p className="text-gray-400 text-lg">
              No transactions found
            </p>
            <p className="text-gray-500 text-sm mt-2">
              {filter === 'spent' 
                ? "You haven't spent any tokens yet"
                : "Start earning tokens by completing your vision and weekly logs"}
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

      {/* Pagination Info */}
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