// lib/services/transition-service.ts
/**
 * TRANSITION SERVICE - FINAL VERSION
 * Uses existing recoveryStartDate field (no migration needed)
 */

import { prisma } from '@/lib/prisma';
import { awardTokens } from '@/lib/services/token-service';

interface TransitionEligibility {
  isEligible: boolean;
  weeksStable: number;
  currentOxygenLevel: number;
  daysInRecovery: number;
  has14DaysPassed: boolean;
  message: string;
  blockers: string[];
}

export async function checkTransitionEligibility(
  userId: string
): Promise<TransitionEligibility> {
  const protocol = await prisma.crisisProtocol.findFirst({
    where: {
      userId,
      completedAt: null,
    },
    include: {
      recoveryCheckins: {
        where: {
          oxygenLevelCurrent: {
            gte: 6,
          },
        },
        orderBy: {
          weekOf: 'desc',
        },
      },
    },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      recoveryStartDate: true,
    },
  });

  if (!protocol || !user) {
    return {
      isEligible: false,
      weeksStable: 0,
      currentOxygenLevel: 0,
      daysInRecovery: 0,
      has14DaysPassed: false,
      message: 'No active recovery protocol found',
      blockers: ['No active recovery protocol'],
    };
  }

  // CHECK 1: 14-DAY LOCK
  const recoveryStartDate = user.recoveryStartDate;
  let daysInRecovery = 0;
  let has14DaysPassed = false;

  if (recoveryStartDate) {
    const now = new Date();
    const msInRecovery = now.getTime() - new Date(recoveryStartDate).getTime();
    daysInRecovery = Math.floor(msInRecovery / (1000 * 60 * 60 * 24));
    has14DaysPassed = daysInRecovery >= 14;
  } else {
    // Legacy users: no lock
    has14DaysPassed = true;
    daysInRecovery = 999;
  }

  // CHECK 2: STABILITY
  const currentOxygenLevel = protocol.oxygenLevelCurrent || 0;
  const stableWeeks = protocol.recoveryCheckins.length;
  const hasStability = stableWeeks >= 3 && currentOxygenLevel >= 6;

  const blockers: string[] = [];
  
  if (!has14DaysPassed) {
    const daysRemaining = 14 - daysInRecovery;
    blockers.push(`Minimum 14-day commitment (${daysRemaining} days remaining)`);
  }
  
  if (!hasStability) {
    const weeksRemaining = Math.max(0, 3 - stableWeeks);
    blockers.push(`Need ${weeksRemaining} more stable week(s) at oxygen 6+`);
  }
  
  if (currentOxygenLevel < 6) {
    blockers.push(`Current oxygen level too low (${currentOxygenLevel}/10)`);
  }

  const isEligible = has14DaysPassed && hasStability;

  return {
    isEligible,
    weeksStable: stableWeeks,
    currentOxygenLevel,
    daysInRecovery,
    has14DaysPassed,
    message: isEligible
      ? `You've been stable for ${stableWeeks} weeks at oxygen level ${currentOxygenLevel}/10. You're ready!`
      : `Not yet ready to transition. ${blockers.join('. ')}.`,
    blockers,
  };
}

export async function transitionToVisionTrack(
  userId: string,
  protocolId: string
): Promise<{
  success: boolean;
  message: string;
  tokensAwarded?: number;
  newBalance?: number;
}> {
  try {
    const protocol = await prisma.crisisProtocol.findFirst({
      where: {
        id: protocolId,
        userId,
      },
    });

    if (!protocol) {
      return {
        success: false,
        message: 'Crisis protocol not found',
      };
    }

    const eligibility = await checkTransitionEligibility(userId);

    if (!eligibility.isEligible) {
      return {
        success: false,
        message: eligibility.message,
      };
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.crisisProtocol.update({
        where: { id: protocolId },
        data: {
          completedAt: new Date(),
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          operatingMode: 'ASCENT',
          recoveryStartDate: null, // Clear the lock
        },
      });

      const tokenResult = await awardTokens({
        userId,
        amount: 150,
        transactionType: 'CRISIS_EXIT',
        description: 'Transitioned from Recovery to Vision Track',
        relatedEntityId: protocolId,
      });

      return {
        newBalance: tokenResult.newBalance,
      };
    });

    console.log(`✅ User ${userId} transitioned to ASCENT. 14-day lock cleared.`);

    return {
      success: true,
      message: 'Successfully transitioned to Vision Track!',
      tokensAwarded: 150,
      newBalance: result.newBalance,
    };
  } catch (error) {
    console.error('[TRANSITION_ERROR]', error);
    return {
      success: false,
      message: 'Failed to transition. Please try again.',
    };
  }
}

export async function getWeeksStable(userId: string): Promise<number> {
  const protocol = await prisma.crisisProtocol.findFirst({
    where: {
      userId,
      completedAt: null,
    },
    include: {
      recoveryCheckins: {
        where: {
          oxygenLevelCurrent: {
            gte: 6,
          },
        },
        orderBy: {
          weekOf: 'desc',
        },
      },
    },
  });

  return protocol?.recoveryCheckins.length || 0;
}