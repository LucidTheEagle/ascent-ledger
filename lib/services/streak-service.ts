// ============================================
// lib/services/streak-service.ts
// THE ASCENT ENGINE: Streak calculation, Life Line management
// Sprint 4 - Checkpoint 3
// ============================================

import { prisma } from '@/lib/prisma';

// ============================================
// TYPES
// ============================================

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lifeLines: number;
  lastLogDate: Date | null;
  weeksLogged: number;
  consistencyPercentage: number;
}

export interface StreakUpdateResult {
  newStreak: number;
  longestStreak: number;
  lifeLinesUsed: number;
  lifeLinesEarned: number;
  streakBroken: boolean;
  streakFrozen: boolean;
  message: string;
}

// ============================================
// CORE STREAK LOGIC
// ============================================

/**
 * Update user's streak after submitting a log (Vision Track or Recovery Track)
 * Handles:
 * - Consecutive week detection
 * - Life Line auto-consume on missed week
 * - Streak freeze vs break logic
 * - Life Line earning (1 per 4 perfect weeks)
 * 
 * @param userId - User ID
 * @param weekOf - Week start date (Monday 00:00:00)
 * @param _mode - Operating mode ('ASCENT' or 'RECOVERY')
 * @returns Streak update result
 */
export async function updateStreakOnLog(
  userId: string,
  weekOf: Date,
  _mode: 'ASCENT' | 'RECOVERY' = 'ASCENT'
): Promise<StreakUpdateResult> {
  
  // Fetch current user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      currentStreak: true,
      longestStreak: true,
      lifeLines: true,
      lastLogDate: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Initialize result
  const result: StreakUpdateResult = {
    newStreak: 1,
    longestStreak: user.longestStreak,
    lifeLinesUsed: 0,
    lifeLinesEarned: 0,
    streakBroken: false,
    streakFrozen: false,
    message: 'Streak started',
  };

  // ============================================
  // CASE 1: First log ever (no lastLogDate)
  // ============================================
  if (!user.lastLogDate) {
    result.newStreak = 1;
    result.message = 'First log! Streak begins.';
    
    await updateUserStreak(userId, {
      currentStreak: 1,
      longestStreak: Math.max(1, user.longestStreak),
      lastLogDate: weekOf,
    });

    return result;
  }

  // ============================================
  // CASE 2: Calculate weeks missed
  // ============================================
  const lastLogDate = new Date(user.lastLogDate);
  const weeksMissed = calculateWeeksMissed(lastLogDate, weekOf);

  // ============================================
  // CASE 2A: Same week (duplicate prevention handled in route)
  // ============================================
  if (weeksMissed === 0) {
    // This shouldn't happen due to duplicate prevention
    // But if it does, maintain current streak
    result.newStreak = user.currentStreak;
    result.message = 'Already logged this week';
    return result;
  }

  // ============================================
  // CASE 2B: Consecutive week (exactly 1 week later)
  // ============================================
  if (weeksMissed === 1) {
    result.newStreak = user.currentStreak + 1;
    result.message = `Streak continues! Week ${result.newStreak}`;

    // Check if user earned a Life Line (every 4 weeks)
    if (result.newStreak % 4 === 0) {
      result.lifeLinesEarned = 1;
      result.message = `🛡️ Streak milestone! Week ${result.newStreak}. Life Line earned.`;
      
      await updateUserStreak(userId, {
        currentStreak: result.newStreak,
        longestStreak: Math.max(result.newStreak, user.longestStreak),
        lastLogDate: weekOf,
        lifeLines: user.lifeLines + 1,
      });
    } else {
      await updateUserStreak(userId, {
        currentStreak: result.newStreak,
        longestStreak: Math.max(result.newStreak, user.longestStreak),
        lastLogDate: weekOf,
      });
    }

    result.longestStreak = Math.max(result.newStreak, user.longestStreak);
    return result;
  }

  // ============================================
  // CASE 2C: Missed week(s) - Check for Life Lines
  // ============================================
  if (weeksMissed > 1) {
    const weeksActuallyMissed = weeksMissed - 1; // Subtract current week
    
    // Check if user has enough Life Lines to cover missed weeks
    if (user.lifeLines >= weeksActuallyMissed) {
      // FREEZE STREAK: Consume Life Lines, maintain streak
      result.newStreak = user.currentStreak + 1; // Continue streak
      result.lifeLinesUsed = weeksActuallyMissed;
      result.streakFrozen = true;
      result.message = `Streak frozen! Used ${weeksActuallyMissed} Life Line(s). Streak continues.`;

      await updateUserStreak(userId, {
        currentStreak: result.newStreak,
        longestStreak: Math.max(result.newStreak, user.longestStreak),
        lastLogDate: weekOf,
        lifeLines: user.lifeLines - weeksActuallyMissed,
      });

      result.longestStreak = Math.max(result.newStreak, user.longestStreak);
      return result;

    } else if (user.lifeLines > 0) {
      // PARTIAL FREEZE: Use available Life Lines, then break
      // Example: Missed 3 weeks, have 1 Life Line
      // Result: Use 1 Life Line, streak still breaks but damage reduced
      result.newStreak = 1;
      result.lifeLinesUsed = user.lifeLines;
      result.streakBroken = true;
      result.message = `Streak broken. Used ${user.lifeLines} Life Line(s), but missed too many weeks.`;

      await updateUserStreak(userId, {
        currentStreak: 1,
        longestStreak: user.longestStreak, // Don't update longest
        lastLogDate: weekOf,
        lifeLines: 0, // All Life Lines consumed
      });

      result.longestStreak = user.longestStreak;
      return result;

    } else {
      // BREAK STREAK: No Life Lines available
      result.newStreak = 1;
      result.streakBroken = true;
      result.message = `Streak broken. Missed ${weeksActuallyMissed} week(s) with no Life Lines.`;

      await updateUserStreak(userId, {
        currentStreak: 1,
        longestStreak: user.longestStreak,
        lastLogDate: weekOf,
      });

      result.longestStreak = user.longestStreak;
      return result;
    }
  }

  // Fallback (shouldn't reach here)
  return result;
}

/**
 * Calculate number of weeks missed between two dates
 * Uses Monday-to-Monday week boundaries
 * 
 * @param lastLogDate - Date of last log
 * @param currentWeekOf - Current week start date
 * @returns Number of weeks between dates
 */
function calculateWeeksMissed(lastLogDate: Date, currentWeekOf: Date): number {
  const diffInMs = currentWeekOf.getTime() - lastLogDate.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const weeksMissed = Math.floor(diffInDays / 7);
  
  return weeksMissed;
}

/**
 * Update user's streak data in database
 * Internal helper function
 */
async function updateUserStreak(
  userId: string,
  data: {
    currentStreak: number;
    longestStreak: number;
    lastLogDate: Date;
    lifeLines?: number;
  }
) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      currentStreak: data.currentStreak,
      longestStreak: data.longestStreak,
      lastLogDate: data.lastLogDate,
      ...(data.lifeLines !== undefined && { lifeLines: data.lifeLines }),
    },
  });
}

// ============================================
// STREAK DATA RETRIEVAL
// ============================================

/**
 * Get complete streak data for dashboard display
 * Includes calculated consistency percentage
 * 
 * @param userId - User ID
 * @returns Complete streak data
 */
export async function getStreakData(userId: string): Promise<StreakData> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      currentStreak: true,
      longestStreak: true,
      lifeLines: true,
      lastLogDate: true,
      createdAt: true,
      operatingMode: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Count total logs based on operating mode
  let weeksLogged = 0;
  
  if (user.operatingMode === 'RECOVERY') {
    weeksLogged = await prisma.recoveryCheckin.count({
      where: { userId },
    });
  } else {
    weeksLogged = await prisma.strategicLog.count({
      where: { userId },
    });
  }

  // Calculate weeks since account creation
  const now = new Date();
  const accountAge = now.getTime() - user.createdAt.getTime();
  const weeksSinceCreation = Math.floor(accountAge / (1000 * 60 * 60 * 24 * 7));
  const totalPossibleWeeks = Math.max(1, weeksSinceCreation);

  // Calculate consistency percentage
  const consistencyPercentage = Math.round((weeksLogged / totalPossibleWeeks) * 100);

  return {
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    lifeLines: user.lifeLines,
    lastLogDate: user.lastLogDate,
    weeksLogged,
    consistencyPercentage: Math.min(100, consistencyPercentage), // Cap at 100%
  };
}

/**
 * Calculate current streak from database (recalculation)
 * Used for dashboard display or recovery from data inconsistencies
 * 
 * @param userId - User ID
 * @returns Current streak number
 */
export async function calculateCurrentStreak(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      operatingMode: true,
      lastLogDate: true,
    },
  });

  if (!user || !user.lastLogDate) {
    return 0;
  }

  // Get logs in reverse chronological order
  let logs: { weekOf: Date }[] = [];

  if (user.operatingMode === 'RECOVERY') {
    logs = await prisma.recoveryCheckin.findMany({
      where: { userId },
      orderBy: { weekOf: 'desc' },
      select: { weekOf: true },
    });
  } else {
    logs = await prisma.strategicLog.findMany({
      where: { userId },
      orderBy: { weekOf: 'desc' },
      select: { weekOf: true },
    });
  }

  if (logs.length === 0) return 0;

  // Start from most recent log and count backwards
  let streak = 1;
  let expectedPreviousWeek = new Date(logs[0].weekOf);
  expectedPreviousWeek.setDate(expectedPreviousWeek.getDate() - 7);

  for (let i = 1; i < logs.length; i++) {
    const currentLogWeek = new Date(logs[i].weekOf);
    
    // Check if this log is exactly 1 week before the previous one
    if (currentLogWeek.getTime() === expectedPreviousWeek.getTime()) {
      streak++;
      expectedPreviousWeek = new Date(currentLogWeek);
      expectedPreviousWeek.setDate(expectedPreviousWeek.getDate() - 7);
    } else {
      // Gap detected, stop counting
      break;
    }
  }

  return streak;
}

// ============================================
// LIFE LINE MANAGEMENT
// ============================================

/**
 * Manually consume a Life Line (if needed for future features)
 * 
 * @param userId - User ID
 * @returns Success boolean
 */
export async function consumeLifeLine(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lifeLines: true },
  });

  if (!user || user.lifeLines <= 0) {
    return false;
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      lifeLines: user.lifeLines - 1,
    },
  });

  return true;
}

/**
 * Award a Life Line manually (if needed for future features)
 * 
 * @param userId - User ID
 * @returns New Life Line count
 */
export async function awardLifeLine(userId: string): Promise<number> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      lifeLines: { increment: 1 },
    },
    select: {
      lifeLines: true,
    },
  });

  return user.lifeLines;
}