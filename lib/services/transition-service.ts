// lib/services/transition-service.ts
/**
 * TRANSITION SERVICE
 * Detects when users are ready to transition from Recovery to Vision Track
 * Checkpoint 11: Transition Logic
 */

import { prisma } from '@/lib/prisma';

interface TransitionEligibility {
  isEligible: boolean;
  weeksStable: number;
  currentOxygenLevel: number;
  message: string;
}

/**
 * Check if user is eligible to transition from Recovery to Vision Track
 * 
 * Criteria: 3+ weeks at oxygen level 6+
 * 
 * @param userId - User ID to check
 * @returns Transition eligibility details
 */
export async function checkTransitionEligibility(
  userId: string
): Promise<TransitionEligibility> {
  // Get active crisis protocol
  const protocol = await prisma.crisisProtocol.findFirst({
    where: {
      userId,
      completedAt: null,
    },
    include: {
      recoveryCheckins: {
        where: {
          oxygenLevelCurrent: {
            gte: 6, // Oxygen level 6 or higher
          },
        },
        orderBy: {
          weekOf: 'desc',
        },
      },
    },
  });

  if (!protocol) {
    return {
      isEligible: false,
      weeksStable: 0,
      currentOxygenLevel: 0,
      message: 'No active recovery protocol found',
    };
  }

  const currentOxygenLevel = protocol.oxygenLevelCurrent || 0;
  const stableWeeks = protocol.recoveryCheckins.length;

  // Check if meets criteria: 3+ weeks at oxygen 6+
  const isEligible = stableWeeks >= 3 && currentOxygenLevel >= 6;

  return {
    isEligible,
    weeksStable: stableWeeks,
    currentOxygenLevel,
    message: isEligible
      ? `You've been stable for ${stableWeeks} weeks at oxygen level ${currentOxygenLevel}/10. You're ready!`
      : `Keep recovering. You need ${3 - stableWeeks} more stable week(s) at oxygen level 6+.`,
  };
}

/**
 * Transition user from Recovery Track to Vision Track
 * 
 * Steps:
 * 1. Mark crisis protocol as completed
 * 2. Switch user to ASCENT mode
 * 3. Award bonus tokens (+150)
 * 
 * @param userId - User ID to transition
 * @param protocolId - Crisis protocol ID to complete
 * @returns Success status
 */
export async function transitionToVisionTrack(
  userId: string,
  protocolId: string
): Promise<{
  success: boolean;
  message: string;
  tokensAwarded?: number;
}> {
  try {
    // Verify protocol belongs to user
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

    // Check eligibility
    const eligibility = await checkTransitionEligibility(userId);

    if (!eligibility.isEligible) {
      return {
        success: false,
        message: eligibility.message,
      };
    }

    // Execute transition in transaction
    await prisma.$transaction(async (tx) => {
      // 1. Mark protocol as completed
      await tx.crisisProtocol.update({
        where: { id: protocolId },
        data: {
          completedAt: new Date(),
        },
      });

      // 2. Switch user to ASCENT mode
      await tx.user.update({
        where: { id: userId },
        data: {
          operatingMode: 'ASCENT',
        },
      });

      // 3. Award bonus tokens (+150)
      const currentUser = await tx.user.findUnique({
        where: { id: userId },
        select: { tokenBalance: true },
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          tokenBalance: (currentUser?.tokenBalance || 0) + 150,
        },
      });

      // Record transaction
      await tx.tokenTransaction.create({
        data: {
          userId,
          amount: 150,
          transactionType: 'RECOVERY_COMPLETE',
          description: 'Transitioned from Recovery to Vision Track',
          balanceAfter: (currentUser?.tokenBalance || 0) + 150,
          relatedEntityId: protocolId,
        },
      });
    });

    return {
      success: true,
      message: 'Successfully transitioned to Vision Track!',
      tokensAwarded: 150,
    };
  } catch (error) {
    console.error('[TRANSITION_ERROR]', error);
    return {
      success: false,
      message: 'Failed to transition. Please try again.',
    };
  }
}

/**
 * Get weeks stable count for display
 * 
 * @param userId - User ID
 * @returns Number of consecutive weeks at oxygen 6+
 */
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