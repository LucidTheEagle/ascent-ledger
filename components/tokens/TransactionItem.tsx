// ============================================
// components/tokens/TransactionItem.tsx
// Individual transaction row with visual hierarchy
// ============================================

'use client';

import { motion } from 'framer-motion';
import {
  Sparkles,
  BookOpen,
  Flame,
  Shield,
  TrendingUp,
  ShoppingBag,
} from 'lucide-react';

interface Transaction {
  id: string;
  amount: number;
  transactionType: string;
  description: string;
  balanceAfter: number;
  createdAt: Date;
}

interface TransactionItemProps {
  transaction: Transaction;
}

// ============================================
// TRANSACTION TYPE METADATA
// ============================================
const TRANSACTION_METADATA: Record<string, {
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  VISION_COMPLETE: {
    icon: <Sparkles className="w-5 h-5" />,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
  },
  WEEKLY_LOG: {
    icon: <BookOpen className="w-5 h-5" />,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
  STREAK_BONUS: {
    icon: <Flame className="w-5 h-5" />,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
  },
  CRISIS_EXIT: {
    icon: <Shield className="w-5 h-5" />,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
  },
  RECOVERY_CHECKIN: {
    icon: <TrendingUp className="w-5 h-5" />,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
  },
  PURCHASE: {
    icon: <ShoppingBag className="w-5 h-5" />,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
  },
};

export function TransactionItem({ transaction }: TransactionItemProps) {
  const metadata = TRANSACTION_METADATA[transaction.transactionType] || {
    icon: <Sparkles className="w-5 h-5" />,
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/20',
  };

  const isPositive = transaction.amount > 0;
  const date = new Date(transaction.createdAt);
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        glass-panel p-4 md:p-5 rounded-xl border 
        ${metadata.borderColor} ${metadata.bgColor}
        hover:border-opacity-40 transition-all
      `}
    >
      <div className="flex items-start justify-between gap-4">
        
        {/* Left: Icon + Description */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          
          {/* Icon */}
          <div className={`
            p-2 rounded-lg ${metadata.bgColor} ${metadata.color}
            shrink-0
          `}>
            {metadata.icon}
          </div>

          {/* Description + Date */}
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium text-sm md:text-base truncate">
              {transaction.description}
            </p>
            <p className="text-gray-500 text-xs md:text-sm mt-0.5">
              {formattedDate}
            </p>
          </div>

        </div>

        {/* Right: Amount + Balance */}
        <div className="text-right shrink-0">
          
          {/* Amount */}
          <p className={`
            text-lg md:text-xl font-bold font-mono
            ${isPositive ? 'text-green-400' : 'text-red-400'}
          `}>
            {isPositive ? '+' : ''}{transaction.amount.toLocaleString()}
          </p>

          {/* Balance After */}
          <p className="text-gray-500 text-xs md:text-sm mt-0.5">
            Balance: {transaction.balanceAfter.toLocaleString()}
          </p>

        </div>

      </div>
    </motion.div>
  );
}