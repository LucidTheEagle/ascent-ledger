// ============================================
// components/tokens/TokenBalancePill.tsx
// TOKEN BALANCE DISPLAY: Animated coin icon + balance
// Premium aesthetic, updates on balance change
// ============================================

'use client';

import { Coins } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface TokenBalancePillProps {
  balance: number;
  /** Optional: Show animation on balance change */
  animate?: boolean;
  /** Optional: Click handler for future token history link */
  onClick?: () => void;
}

export function TokenBalancePill({ 
  balance, 
  animate = true,
  onClick 
}: TokenBalancePillProps) {
  const [previousBalance, setPreviousBalance] = useState(balance);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  // ============================================
  // DETECT BALANCE CHANGE & TRIGGER ANIMATION
  // ============================================
  useEffect(() => {
    if (balance !== previousBalance && animate) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShouldAnimate(true);
      const timer = setTimeout(() => setShouldAnimate(false), 600);
      setPreviousBalance(balance);
      return () => clearTimeout(timer);
    }
  }, [balance, previousBalance, animate]);

  return (
    <motion.div
      initial={false}
      animate={shouldAnimate ? {
        scale: [1, 1.1, 1],
        rotate: [0, 5, -5, 0],
      } : {}}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      onClick={onClick}
      className={`
        px-3 py-2 md:px-4 md:py-3 
        rounded-lg 
        bg-gradient-to-r from-amber-500/10 to-yellow-500/10 
        border border-amber-500/20
        flex-1 md:flex-initial
        ${onClick ? 'cursor-pointer hover:border-amber-500/40 transition-colors' : ''}
      `}
    >
      <div className="flex items-center gap-2">
        <motion.div
          animate={shouldAnimate ? {
            rotateY: [0, 360],
          } : {}}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          <Coins className="w-4 h-4 md:w-5 md:h-5 text-amber-400" />
        </motion.div>
        
        <div>
          <p className="text-[10px] md:text-xs text-amber-400/70 uppercase tracking-wide">
            Tokens
          </p>
          <motion.p
            key={balance}
            initial={animate ? { scale: 1.2, opacity: 0 } : false}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-xl md:text-2xl font-bold text-amber-400 font-mono"
          >
            {balance.toLocaleString()}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}