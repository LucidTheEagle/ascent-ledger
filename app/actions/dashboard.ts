// ============================================
// app/actions/dashboard.ts
// DASHBOARD VIEWMODEL: Single optimized data fetch for both modes
// UPDATED: Checkpoint 9 - Added recentLogs for Ascent Tracker
// ============================================

'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { getCurrentWeekStartDate, getAscentWeek } from '@/lib/utils/week-calculator';
import { getStreakData } from '@/lib/services/streak-service';
import { getTokenStats } from '@/lib/services/token-service';
import { detectAllPatterns, type PatternDetectionResult } from '@/lib/graph/patterns';

// ============================================
// TYPES
// ============================================

export interface VisionTrackDashboardData {
  mode: 'ASCENT';
  user: {
    id: string;
    fullName: string | null;
    tokenBalance: number;
    currentStreak: number;
    longestStreak: number;
    lifeLines: number;
    createdAt: Date;
  };
  vision: {
    id: string;
    aiSynthesis: string | null;
    desiredState: string;
    antiGoal: string;
  };
  currentWeek: number;
  weekStartDate: Date;
  thisWeeksLog: {
    id: string;
    leverageBuilt: string;
    learnedInsight: string;
    opportunitiesCreated: string;
    createdAt: Date;
    fogCheck: {
      id: string;
      observation: string;
      strategicQuestion: string;
    } | null;
  } | null;
  stats: {
    totalLogsCount: number;
    consistencyPercentage: number;
    weeksLogged: number;
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
  fogForecast: PatternDetectionResult;
  recentLogs: Array<{
    id: string;
    weekOf: Date;
    leverageBuilt: string;
    learnedInsight: string;
    createdAt: Date;
  }>;
}

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
  transitionEligibility: {
    isEligible: boolean;
    weeksStable: number;
    currentOxygenLevel: number;
    message: string;
  };
}

export type DashboardData = VisionTrackDashboardData | RecoveryTrackDashboardData;

// ============================================
// MAIN FUNCTION
// ============================================

/**
 * Fetch all dashboard data in a single optimized query
 * Handles both ASCENT and RECOVERY modes
 * 
 * @returns Complete dashboard data or redirects if auth fails
 */
export async function getDashboardData(): Promise<DashboardData> {
  // ============================================
  // AUTHENTICATION
  // ============================================
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // ============================================
  // FETCH USER PROFILE (DETERMINES MODE)
  // ============================================
  const userProfile = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      fullName: true,
      tokenBalance: true,
      currentStreak: true,
      longestStreak: true,
      lifeLines: true,
      createdAt: true,
      operatingMode: true,
      recoveryStartDate: true,
    },
  });

  if (!userProfile) {
    redirect('/onboarding');
  }

  // ============================================
  // ROUTE TO CORRECT MODE
  // ============================================
  if (userProfile.operatingMode === 'RECOVERY') {
    return await getRecoveryDashboardData(userProfile);
  } else {
    return await getVisionDashboardData(userProfile);
  }
}

// ============================================
// VISION TRACK DATA FETCHER
// ============================================

async function getVisionDashboardData(
  userProfile: {
    id: string;
    fullName: string | null;
    tokenBalance: number;
    currentStreak: number;
    longestStreak: number;
    lifeLines: number;
    createdAt: Date;
    operatingMode: string;
  }
): Promise<VisionTrackDashboardData> {
  
  // Check for active vision
  const vision = await prisma.visionCanvas.findFirst({
    where: {
      userId: userProfile.id,
      isActive: true,
    },
    select: {
      id: true,
      aiSynthesis: true,
      desiredState: true,
      antiGoal: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!vision) {
    redirect('/vision-canvas');
  }

  // Calculate current week
  const currentWeek = getAscentWeek(userProfile.createdAt);
  const weekStartDate = getCurrentWeekStartDate();

  // Fetch this week's log + fog check in single query
  const thisWeeksLog = await prisma.strategicLog.findFirst({
    where: {
      userId: userProfile.id,
      weekOf: weekStartDate,
    },
    select: {
      id: true,
      leverageBuilt: true,
      learnedInsight: true,
      opportunitiesCreated: true,
      createdAt: true,
      fogChecks: {
        select: {
          id: true,
          observation: true,
          strategicQuestion: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  // Count total logs (for consistency calculation)
  const totalLogsCount = await prisma.strategicLog.count({
    where: { userId: userProfile.id },
  });

  // Calculate consistency percentage
  const consistencyPercentage = currentWeek > 0 
    ? Math.round((totalLogsCount / currentWeek) * 100)
    : 0;

  // Fetch streak data (from service)
  const streakData = await getStreakData(userProfile.id);

  // Fetch token stats (from service)
  const tokenStats = await getTokenStats(userProfile.id);

  // ============================================
  // PATTERN DETECTION (FOG FORECAST)
  // ============================================
  let fogForecast: PatternDetectionResult = {
    hasPatterns: false,
    learningWithoutAction: { detected: false, streakWeeks: 0, recentLogs: [] },
    slidingIntoFog: { detected: false, mentionCount: 0, fogName: '', recentMentions: [] },
    visionMisalignment: { 
      detected: false, 
      misalignedLogCount: 0, 
      visionKeywords: [], 
      actualTopics: [], 
      alignmentScore: 1.0 
    },
    summary: [],
  };

  try {
    // Run pattern detection (lookback 4 weeks)
    fogForecast = await detectAllPatterns(
      userProfile.id,
      vision.desiredState,
      4
    );
  } catch (error) {
    console.error('[Dashboard] Pattern detection failed:', error);
    // Graceful degradation: Clear skies if detection fails
  }

  // ============================================
  // NEW: FETCH RECENT LOGS (FOR ASCENT TRACKER)
  // ============================================
  const recentLogs = await prisma.strategicLog.findMany({
    where: {
      userId: userProfile.id,
    },
    select: {
      id: true,
      weekOf: true,
      leverageBuilt: true,
      learnedInsight: true,
      createdAt: true,
    },
    orderBy: {
      weekOf: 'desc',
    },
    take: 12, // Last 12 weeks for timeline visualization
  });

  return {
    mode: 'ASCENT',
    user: {
      id: userProfile.id,
      fullName: userProfile.fullName,
      tokenBalance: userProfile.tokenBalance,
      currentStreak: userProfile.currentStreak,
      longestStreak: userProfile.longestStreak,
      lifeLines: userProfile.lifeLines,
      createdAt: userProfile.createdAt,
    },
    vision: {
      id: vision.id,
      aiSynthesis: vision.aiSynthesis,
      desiredState: vision.desiredState,
      antiGoal: vision.antiGoal,
    },
    currentWeek,
    weekStartDate,
    thisWeeksLog: thisWeeksLog ? {
      id: thisWeeksLog.id,
      leverageBuilt: thisWeeksLog.leverageBuilt,
      learnedInsight: thisWeeksLog.learnedInsight,
      opportunitiesCreated: thisWeeksLog.opportunitiesCreated,
      createdAt: thisWeeksLog.createdAt,
      fogCheck: thisWeeksLog.fogChecks[0] || null,
    } : null,
    stats: {
      totalLogsCount,
      consistencyPercentage,
      weeksLogged: totalLogsCount,
    },
    streakData,
    tokenStats,
    fogForecast,
    recentLogs,
  };
}

// ============================================
// RECOVERY TRACK DATA FETCHER
// ============================================

async function getRecoveryDashboardData(
  userProfile: {
    id: string;
    fullName: string | null;
    tokenBalance: number;
    currentStreak: number;
    longestStreak: number;
    lifeLines: number;
    createdAt: Date;
    operatingMode: string;
    recoveryStartDate: Date | null;
  }
): Promise<RecoveryTrackDashboardData> {
  
  // Fetch active crisis protocol
  const protocol = await prisma.crisisProtocol.findFirst({
    where: {
      userId: userProfile.id,
      completedAt: null, // Only active protocols
    },
    select: {
      id: true,
      crisisType: true,
      burdenToCut: true,
      oxygenSource: true,
      isBurdenCut: true,
      isOxygenScheduled: true,
      oxygenLevelCurrent: true,
      oxygenLevelStart: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate weeks since recovery start
  const startDate = userProfile.recoveryStartDate || userProfile.createdAt;
  const now = new Date();
  const weeksSinceStart = Math.floor(
    (now.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
  ) + 1;

  // Fetch latest check-in
  const latestCheckin = protocol ? await prisma.recoveryCheckin.findFirst({
    where: {
      userId: userProfile.id,
      protocolId: protocol.id,
    },
    select: {
      id: true,
      weekOf: true,
      protocolCompleted: true,
      oxygenConnected: true,
      oxygenLevelCurrent: true,
      createdAt: true,
    },
    orderBy: { weekOf: 'desc' },
  }) : null;

  // Check if logged this week
  const weekStartDate = getCurrentWeekStartDate();
  const hasLoggedThisWeek = latestCheckin 
    ? new Date(latestCheckin.weekOf).getTime() >= weekStartDate.getTime()
    : false;

  // Fetch latest crisis fog check
  const latestFogCheck = protocol ? await prisma.fogCheck.findFirst({
    where: {
      userId: userProfile.id,
      fogCheckType: 'CRISIS',
    },
    select: {
      id: true,
      observation: true,
      strategicQuestion: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  }) : null;

  // Count total check-ins
  const totalCheckinsCount = protocol ? await prisma.recoveryCheckin.count({
    where: {
      userId: userProfile.id,
      protocolId: protocol.id,
    },
  }) : 0;

  // Fetch streak data (from service)
  const streakData = await getStreakData(userProfile.id);

  // Fetch token stats (from service)
  const tokenStats = await getTokenStats(userProfile.id);

  // Check transition eligibility
  const transitionEligibility = await checkTransitionEligibility(
    userProfile.id,
    protocol?.id || null
  );

  return {
    mode: 'RECOVERY',
    user: {
      id: userProfile.id,
      fullName: userProfile.fullName,
      tokenBalance: userProfile.tokenBalance,
      currentStreak: userProfile.currentStreak,
      longestStreak: userProfile.longestStreak,
      lifeLines: userProfile.lifeLines,
      createdAt: userProfile.createdAt,
      recoveryStartDate: userProfile.recoveryStartDate,
    },
    protocol,
    latestCheckin,
    latestFogCheck,
    weeksSinceStart,
    hasLoggedThisWeek,
    stats: {
      totalCheckinsCount,
      weeksInRecovery: weeksSinceStart,
    },
    streakData,
    tokenStats,
    transitionEligibility,
  };
}

// ============================================
// HELPER: TRANSITION ELIGIBILITY
// ============================================

async function checkTransitionEligibility(
  userId: string,
  protocolId: string | null
): Promise<{
  isEligible: boolean;
  weeksStable: number;
  currentOxygenLevel: number;
  message: string;
}> {
  
  if (!protocolId) {
    return {
      isEligible: false,
      weeksStable: 0,
      currentOxygenLevel: 0,
      message: 'No active protocol',
    };
  }

  // Get recent check-ins with oxygen level 6+
  const recentStableCheckins = await prisma.recoveryCheckin.findMany({
    where: {
      userId,
      protocolId,
      oxygenLevelCurrent: {
        gte: 6,
      },
    },
    orderBy: {
      weekOf: 'desc',
    },
    take: 3,
    select: {
      oxygenLevelCurrent: true,
    },
  });

  const weeksStable = recentStableCheckins.length;
  const currentOxygenLevel = recentStableCheckins[0]?.oxygenLevelCurrent || 0;
  const isEligible = weeksStable >= 3;

  let message = '';
  if (isEligible) {
    message = `You've maintained oxygen levels above 6 for ${weeksStable} consecutive weeks. You're ready to transition to Vision Track and build your future.`;
  } else {
    const weeksNeeded = 3 - weeksStable;
    message = `Continue recovery. You need ${weeksNeeded} more week(s) at oxygen level 6+ to transition.`;
  }

  return {
    isEligible,
    weeksStable,
    currentOxygenLevel,
    message,
  };
}