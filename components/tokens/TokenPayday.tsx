// ============================================
// components/tokens/TokenPayday.tsx
// THE REWARD: 3D coin animation + particle burst
// REFACTORED: Checkpoint 11 - Universal redirect support
// ============================================

'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface TokenPaydayProps {
  /** Amount of tokens awarded */
  amount: number;
  /** New total balance */
  newBalance: number;
  /** Reason for token award (displayed to user) */
  reason: string;
  /** Where to redirect after animation (flexible) */
  redirectUrl: string;
  /** Duration in milliseconds before auto-advance */
  duration?: number;
}

const REASON_LABELS: Record<string, string> = {
  VISION_COMPLETE: 'Vision Canvas Completed',
  WEEKLY_LOG: 'Weekly Log Completed',
  STREAK_MILESTONE: 'Streak Milestone Reached',
  CRISIS_EXIT: 'Recovery Complete',
  RECOVERY_CHECKIN: 'Recovery Check-in',
};

export default function TokenPayday({
  amount,
  newBalance,
  reason,
  redirectUrl,
  duration = 2000,
}: TokenPaydayProps) {
  const router = useRouter();
  const [count, setCount] = useState(0);

  const displayReason = REASON_LABELS[reason] || reason;

  // ============================================
  // ANIMATED COUNTER (0 → amount)
  // ============================================
  useEffect(() => {
    const increment = amount / 30; // 30 frames over ~500ms
    const interval = 500 / 30;

    const timer = setInterval(() => {
      setCount((prev) => {
        const next = prev + increment;
        if (next >= amount) {
          clearInterval(timer);
          return amount;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [amount]);

  // ============================================
  // AUTO-ADVANCE (After duration)
  // ============================================
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(redirectUrl);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, router, redirectUrl]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-950 via-amber-950/20 to-slate-950 overflow-hidden relative">
      {/* Radial Glow Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.1)_0%,transparent_70%)]" />

      {/* Particle Burst */}
      <ParticleBurst />

      {/* Main Content */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 text-center"
      >
        {/* 3D Spinning Coin */}
        <div className="mb-8 flex justify-center">
          <div className="coin-container">
            <div className="coin">
              <div className="coin-face coin-front">
                <span className="text-6xl">🪙</span>
              </div>
              <div className="coin-face coin-back">
                <span className="text-6xl">🪙</span>
              </div>
            </div>
          </div>
        </div>

        {/* Token Amount (Animated) */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="text-7xl md:text-8xl font-bold bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
            +{Math.round(count)}
          </h1>
          <p className="text-2xl text-amber-400 font-semibold mt-2">
            Tokens Earned
          </p>
        </motion.div>

        {/* Reason */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mb-4"
        >
          <p className="text-lg text-gray-300">
            {displayReason}
          </p>
        </motion.div>

        {/* New Balance */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-gray-400"
        >
          <p className="text-lg">
            New Balance: <span className="text-amber-400 font-mono font-semibold">{newBalance.toLocaleString()}</span>
          </p>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
          className="mt-12 h-1 w-64 mx-auto bg-amber-500/30 rounded-full overflow-hidden"
        >
          <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-500" />
        </motion.div>
      </motion.div>

      {/* CSS for 3D Coin Animation */}
      <style jsx>{`
        .coin-container {
          perspective: 1000px;
          width: 200px;
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .coin {
          width: 150px;
          height: 150px;
          position: relative;
          transform-style: preserve-3d;
          animation: coinSpin 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
          will-change: transform;
        }

        /* Mobile optimization: smaller coin, faster animation */
        @media (max-width: 768px) {
          .coin-container {
            width: 150px;
            height: 150px;
          }
          
          .coin {
            width: 120px;
            height: 120px;
          }
          
          .coin-face span {
            font-size: 48px;
          }
        }

        .coin-face {
          position: absolute;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          backface-visibility: hidden;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, rgba(251, 191, 36, 0.8), rgba(217, 119, 6, 0.6));
          box-shadow: 
            0 0 30px rgba(251, 191, 36, 0.6),
            inset 0 0 20px rgba(255, 255, 255, 0.2);
        }

        .coin-back {
          transform: rotateY(180deg);
        }

        @keyframes coinSpin {
          0% {
            transform: rotateY(0deg);
          }
          100% {
            transform: rotateY(1080deg); /* 3 full rotations */
          }
        }

        /* Pulse glow effect */
        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 0 30px rgba(251, 191, 36, 0.6);
          }
          50% {
            box-shadow: 0 0 60px rgba(251, 191, 36, 0.9);
          }
        }

        .coin-face {
          animation: pulseGlow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

// ============================================
// PARTICLE BURST COMPONENT
// ============================================
function ParticleBurst() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const particleCount = isMobile ? 12 : 24;
  const particles = Array.from({ length: particleCount }, (_, i) => i);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {particles.map((i) => (
        <motion.div
          key={i}
          initial={{
            x: '50vw',
            y: '50vh',
            scale: 0,
            opacity: 1,
          }}
          animate={{
            x: `${50 + Math.cos((i / particles.length) * 2 * Math.PI) * 40}vw`,
            y: `${50 + Math.sin((i / particles.length) * 2 * Math.PI) * 40}vh`,
            scale: [0, 1, 0],
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 1.2,
            ease: 'easeOut',
            delay: i * 0.02,
          }}
          className="absolute w-3 h-3 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500"
          style={{
            boxShadow: '0 0 10px rgba(251, 191, 36, 0.8)',
          }}
        />
      ))}
    </div>
  );
}