// ============================================
// app/api/log/submit/route.ts
// THE SOUL: Receives the user's truth
// THE MIND: Validates, prevents duplicates, calculates week
// THE HEART: Prepares for the Fog Check
// THE BRAIN: Syncs to graph for pattern detection
// UPDATED: Checkpoint 11 - Token award integration (+50 tokens)
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { getCurrentWeekStartDate, getAscentWeek } from '@/lib/utils/week-calculator';
import { generateLogEmbedding, embeddingToString } from '@/lib/ai/embeddings';
import { updateStreakOnLog } from '@/lib/services/streak-service';
import { rateLimit, RATE_LIMITS, createRateLimitResponse } from '@/lib/upstash/rate-limiter'

// Validation schema
interface LogSubmitBody {
  userId: string;
  leverageBuilt: string;
  learnedInsight: string;
  opportunitiesCreated: string;
  isSurvivalMode: boolean;
  hadNoLeverage: boolean;
}

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body: LogSubmitBody = await req.json();
    
    // Validate required fields
    if (!body.userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!body.leverageBuilt || body.leverageBuilt.trim().length < 10) {
      return NextResponse.json(
        { error: 'Question 1 requires at least 10 characters' },
        { status: 400 }
      );
    }

    // Verify authentication via Supabase
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Ensure the user can only submit their own logs
    if (user.id !== body.userId) {
      return NextResponse.json(
        { error: 'Forbidden: Cannot submit logs for another user' },
        { status: 403 }
      );
    }

    // Get current week start date (Monday 00:00:00)
    const weekOf = getCurrentWeekStartDate();

    // ============================================
    // DOUBLE LOG PREVENTION
    // ============================================
    const existingLog = await prisma.strategicLog.findFirst({
      where: {
        userId: body.userId,
        weekOf: weekOf,
      },
    });

    if (existingLog) {
      return NextResponse.json(
        { 
          error: 'You already logged this week. Edit your existing log instead.',
          existingLogId: existingLog.id,
        },
        { status: 409 } // 409 Conflict
      );
    }

    // ============================================
    // RATE LIMITING (CHECKPOINT 8)
    // ============================================
    // AUTHENTICATED limit: 100 logs per hour (prevents spam, allows retries)
    const rateLimitResult = await rateLimit(req, {
      limit: RATE_LIMITS.AUTHENTICATED.limit,      // 100 requests
      window: RATE_LIMITS.AUTHENTICATED.window,    // per hour
      identifier: `user:${user.id}`,               // Track by user ID
    });

    // Block if rate limit exceeded
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult);
    }

    // ============================================
    // WEEK CALCULATION
    // ============================================
    const userData = await prisma.user.findUnique({
      where: { id: body.userId },
      select: { createdAt: true },
    });

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const ascentWeek = getAscentWeek(userData.createdAt);
    // ============================================
    // THE SOUL: SAVE THE LOG + AWARD TOKENS
    // ============================================
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create strategic log
      const strategicLog = await tx.strategicLog.create({
        data: {
          userId: body.userId,
          weekOf: weekOf,
          leverageBuilt: body.leverageBuilt.trim(),
          learnedInsight: body.learnedInsight.trim(),
          opportunitiesCreated: body.opportunitiesCreated.trim(),
          isSurvivalMode: body.isSurvivalMode,
          hadNoLeverage: body.hadNoLeverage,
          // Embedding will be generated asynchronously below
          embedding: null,
        },
      });

      // Award +50 tokens for weekly log
      const tokenAmount = 50;

      const updatedUser = await tx.user.update({
        where: { id: body.userId },
        data: {
          tokenBalance: { increment: tokenAmount },
          totalTokensEarned: { increment: tokenAmount },
        },
      });

      // Record token transaction
      await tx.tokenTransaction.create({
        data: {
          userId: body.userId,
          amount: tokenAmount,
          transactionType: 'WEEKLY_LOG',
          description: `Week ${ascentWeek} log completed`,
          balanceAfter: updatedUser.tokenBalance,
          relatedEntityId: strategicLog.id,
        },
      });

      return { strategicLog, newBalance: updatedUser.tokenBalance };
    });

    // ============================================
    // THE MEMORY: GENERATE EMBEDDING (ASYNC)
    // ============================================
    generateLogEmbedding({
      leverageBuilt: body.leverageBuilt,
      learnedInsight: body.learnedInsight,
      opportunitiesCreated: body.opportunitiesCreated,
    })
      .then(embedding => {
        return prisma.strategicLog.update({
          where: { id: result.strategicLog.id },
          data: { embedding: embeddingToString(embedding) },
        });
      })
      .then(() => {
        console.log(`✅ Embedding generated for log ${result.strategicLog.id}`);
      })
      .catch(error => {
        console.error(`❌ Failed to generate embedding for log ${result.strategicLog.id}:`, error);
      });

    // ============================================
    // THE BRAIN: SYNC TO GRAPH (ASYNC)
    // ============================================
    import('@/lib/graph/sync-log')
      .then(({ syncLogToGraph }) => {
        return syncLogToGraph({
          userId: body.userId,
          logId: result.strategicLog.id,
          weekOf: weekOf,
          weekNumber: ascentWeek,
          leverageBuilt: body.leverageBuilt,
          learnedInsight: body.learnedInsight,
          opportunitiesCreated: body.opportunitiesCreated,
          hadLeverage: !body.hadNoLeverage,
        });
      })
      .then(syncResult => {
        if (syncResult.success) {
          console.log(`✅ Graph synced for log ${result.strategicLog.id}: ${syncResult.topicsCreated} topics, fog=${syncResult.fogDetected}`);
        } else {
          console.warn(`⚠️ Graph sync incomplete for log ${result.strategicLog.id}: ${syncResult.error}`);
        }
      })
      .catch(error => {
        console.error(`❌ Graph sync failed for log ${result.strategicLog.id}:`, error);
      });

    // ============================================
    // THE HEART: UPDATE STREAK
    // ============================================
    const streakResult = await updateStreakOnLog(
      body.userId,
      weekOf,
      'ASCENT'
    );

    // ============================================
    // RESPONSE: SUCCESS (INCLUDING TOKEN DATA)
    // ============================================
    return NextResponse.json({
      success: true,
      logId: result.strategicLog.id,
      weekNumber: ascentWeek,
      weekOf: weekOf.toISOString(),
      tokensAwarded: 50,
      newBalance: result.newBalance,
      streak: {
        current: streakResult.newStreak,
        longest: streakResult.longestStreak,
        lifeLinesUsed: streakResult.lifeLinesUsed,
        lifeLinesEarned: streakResult.lifeLinesEarned,
        message: streakResult.message,
      },
      message: 'Log saved. Preparing your Fog Check...',
    });

  } catch (error) {
    console.error('Log submission error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to save log. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}