export type TransitionEligibility = {
  isEligible: boolean;
  weeksStable: number;
  currentOxygenLevel: number;
  daysInRecovery: number;
  has14DaysPassed: boolean;
  message: string;
  blockers: string[];
};

export interface RecoveryTrackDashboardData {
  mode: 'RECOVERY';
  user: {
    id: string;
    fullName: string | null;
    tokenBalance: number;
    currentStreak: number;
    longestStreak: number;
    lifeLines: number;
    createdAt: Date;
    recoveryStartDate: Date | null;
  };
  protocol: {
    id: string;
    crisisType: string;
    burdenToCut: string;
    oxygenSource: string;
    isBurdenCut: boolean;
    isOxygenScheduled: boolean;
    oxygenLevelCurrent: number | null;
    oxygenLevelStart: number | null;
    createdAt: Date;
  } | null;
  latestCheckin: {
    id: string;
    weekOf: Date;
    protocolCompleted: boolean | null;
    oxygenConnected: boolean | null;
    oxygenLevelCurrent: number | null;
    createdAt: Date;
  } | null;
  latestFogCheck: {
    id: string;
    observation: string;
    strategicQuestion: string;
    createdAt: Date;
  } | null;
  weeksSinceStart: number;
  hasLoggedThisWeek: boolean;
  stats: {
    totalCheckinsCount: number;
    weeksInRecovery: number;
  };
  streakData: {
    currentStreak: number;
    longestStreak: number;
    lifeLines: number;
    lastLogDate: Date | null;
    weeksLogged: number;
    consistencyPercentage: number;
  };
  tokenStats: {
    currentBalance: number;
    totalEarned: number;
    totalSpent: number;
    recentTransactions: Array<{
      id: string;
      amount: number;
      transactionType: string;
      description: string | null;
      createdAt: Date;
    }>;
  };
  transitionEligibility: TransitionEligibility;
}

