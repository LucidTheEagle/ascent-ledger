// ============================================
// lib/services/token-service.ts
// THE ECONOMY: Token awarding and transaction management
// Sprint 4 Enhanced: Dashboard-ready
// ============================================

import { prisma } from '@/lib/prisma';

export const TOKEN_AMOUNTS = {
  VISION_CANVAS_COMPLETE: 100,
  WEEKLY_LOG_COMPLETE: 50,        // NEW: Strategic Log submission
  FOG_CHECK_COMPLETE: 50,
  RECOVERY_CHECKIN: 30,
  STREAK_MILESTONE_4_WEEKS: 200,
  CRISIS_PROTOCOL_COMPLETE: 150,
  CRISIS_EXIT_BONUS: 50,          // NEW: Transitioning Recovery → Ascent
} as const;

export const TRANSACTION_TYPES = {
  VISION_CANVAS: 'VISION_CANVAS',
  WEEKLY_LOG: 'WEEKLY_LOG',       // NEW
  FOG_CHECK: 'FOG_CHECK',
  RECOVERY_CHECKIN: 'RECOVERY_CHECKIN',
  STREAK_BONUS: 'STREAK_BONUS',
  CRISIS_COMPLETE: 'CRISIS_COMPLETE',
  CRISIS_EXIT: 'CRISIS_EXIT',     // NEW
  PURCHASE: 'PURCHASE',
} as const;

interface AwardTokensParams {
  userId: string;
  amount: number;
  transactionType: keyof typeof TRANSACTION_TYPES;
  description?: string;
  relatedEntityId?: string;
}

/**
 * Award tokens to a user and create transaction record
 * 
 * @param params - Token award parameters
 * @returns Updated token balance
 */
export async function awardTokens({
  userId,
  amount,
  transactionType,
  description,
  relatedEntityId,
}: AwardTokensParams): Promise<{
  newBalance: number;
  transactionId: string;
}> {
  try {
    // Fetch current user balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        tokenBalance: true,
        totalTokensEarned: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Calculate new balance
    const newBalance = user.tokenBalance + amount;
    const newTotalEarned = user.totalTokensEarned + amount;

    // Update user balance and total earned
    await prisma.user.update({
      where: { id: userId },
      data: {
        tokenBalance: newBalance,
        totalTokensEarned: newTotalEarned,
      },
    });

    // Create transaction record
    const transaction = await prisma.tokenTransaction.create({
      data: {
        userId,
        amount,
        transactionType,
        description: description || `Earned ${amount} tokens`,
        relatedEntityId,
        balanceAfter: newBalance,
      },
    });

    console.log(`✅ Awarded ${amount} tokens to user ${userId}. New balance: ${newBalance}`);

    return {
      newBalance,
      transactionId: transaction.id,
    };

  } catch (error) {
    console.error('Token award error:', error);
    throw new Error('Failed to award tokens');
  }
}

/**
 * Deduct tokens from a user (for purchases, etc.)
 * 
 * @param params - Token deduction parameters
 * @returns Updated token balance
 */
export async function deductTokens({
  userId,
  amount,
  transactionType,
  description,
  relatedEntityId,
}: AwardTokensParams): Promise<{
  newBalance: number;
  transactionId: string;
}> {
  try {
    // Fetch current user balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        tokenBalance: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if user has enough tokens
    if (user.tokenBalance < amount) {
      throw new Error('Insufficient token balance');
    }

    // Calculate new balance (negative amount)
    const newBalance = user.tokenBalance - amount;

    // Update user balance
    await prisma.user.update({
      where: { id: userId },
      data: {
        tokenBalance: newBalance,
      },
    });

    // Create transaction record (negative amount)
    const transaction = await prisma.tokenTransaction.create({
      data: {
        userId,
        amount: -amount, // Negative for deductions
        transactionType,
        description: description || `Spent ${amount} tokens`,
        relatedEntityId,
        balanceAfter: newBalance,
      },
    });

    console.log(`💸 Deducted ${amount} tokens from user ${userId}. New balance: ${newBalance}`);

    return {
      newBalance,
      transactionId: transaction.id,
    };

  } catch (error) {
    console.error('Token deduction error:', error);
    throw error;
  }
}

/**
 * Get user's token transaction history
 * 
 * @param userId - User ID
 * @param limit - Number of transactions to return
 * @returns Array of transactions
 */
export async function getTokenHistory(
  userId: string,
  limit: number = 20
) {
  return await prisma.tokenTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      amount: true,
      transactionType: true,
      description: true,
      balanceAfter: true,
      createdAt: true,
    },
  });
}

/**
 * Get user's current token balance
 * 
 * @param userId - User ID
 * @returns Token balance and stats
 */
export async function getTokenBalance(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      tokenBalance: true,
      totalTokensEarned: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return {
    currentBalance: user.tokenBalance,
    totalEarned: user.totalTokensEarned,
    totalSpent: user.totalTokensEarned - user.tokenBalance,
  };
}

// ============================================
// SPRINT 4 ENHANCEMENTS: Dashboard Helpers
// ============================================

/**
 * Check if user has already been awarded tokens for a specific entity
 * (Prevents double-awarding for the same log/vision/etc.)
 * 
 * @param userId - User ID
 * @param relatedEntityId - ID of log, vision, etc.
 * @returns Boolean indicating if tokens already awarded
 */
export async function hasBeenAwarded(
  userId: string,
  relatedEntityId: string
): Promise<boolean> {
  const existingTransaction = await prisma.tokenTransaction.findFirst({
    where: {
      userId,
      relatedEntityId,
    },
  });

  return existingTransaction !== null;
}

/**
 * Get comprehensive token statistics for dashboard display
 * 
 * @param userId - User ID
 * @returns Token stats including recent transactions
 */
export async function getTokenStats(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      tokenBalance: true,
      totalTokensEarned: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Get recent transactions (last 5)
  const recentTransactions = await prisma.tokenTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      amount: true,
      transactionType: true,
      description: true,
      createdAt: true,
    },
  });

  // Calculate stats
  const totalSpent = user.totalTokensEarned - user.tokenBalance;

  return {
    currentBalance: user.tokenBalance,
    totalEarned: user.totalTokensEarned,
    totalSpent,
    recentTransactions,
  };
}