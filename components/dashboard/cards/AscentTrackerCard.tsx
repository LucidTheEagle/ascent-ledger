// ============================================
// components/dashboard/cards/AscentTrackerCard.tsx
// ASCENT TRACKER CARD: Wrapper with header
// Sprint 4 - Checkpoint 9
// ============================================

import { TrendingUp } from 'lucide-react';
import { BentoCardHeader, BentoCardContent } from '@/components/ui/bento-grid';
import { AscentTracker } from '../AscentTracker';

interface AscentTrackerCardProps {
  logs: Array<{
    id: string;
    weekOf: Date;
    leverageBuilt: string;
    learnedInsight: string;
    createdAt: Date;
  }>;
  currentStreak: number;
  userCreatedAt: Date;
}

export function AscentTrackerCard({ logs, currentStreak, userCreatedAt }: AscentTrackerCardProps) {
  return (
    <>
      <BentoCardHeader
        icon={<TrendingUp className="w-5 h-5 text-green-400" />}
        title="Ascent Tracker"
      />
      <BentoCardContent>
        <AscentTracker
          logs={logs}
          currentStreak={currentStreak}
          userCreatedAt={userCreatedAt}
        />
      </BentoCardContent>
    </>
  );
}