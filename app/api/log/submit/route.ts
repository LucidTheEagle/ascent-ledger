// ============================================
// app/api/log/submit/route.ts
// THE SOUL: Receives the user's truth
// THE MIND: Validates, prevents duplicates, calculates week
// THE HEART: Prepares for the Fog Check
// THE BRAIN: Syncs to graph for pattern detection
// REFACTORED: Sprint 4 Checkpoint 3 - Streak logic moved to service
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { getCurrentWeekStartDate, getAscentWeek } from '@/lib/utils/week-calculator';
import { generateLogEmbedding, embeddingToString } from '@/lib/ai/embeddings';
import { updateStreakOnLog } from '@/lib/services/streak-service';

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
    // THE SOUL: SAVE THE LOG
    // ============================================
    const strategicLog = await prisma.strategicLog.create({
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
          where: { id: strategicLog.id },
          data: { embedding: embeddingToString(embedding) },
        });
      })
      .then(() => {
        console.log(`✅ Embedding generated for log ${strategicLog.id}`);
      })
      .catch(error => {
        console.error(`❌ Failed to generate embedding for log ${strategicLog.id}:`, error);
      });

    // ============================================
    // THE BRAIN: SYNC TO GRAPH (ASYNC)
    // ============================================
    import('@/lib/graph/sync-log')
      .then(({ syncLogToGraph }) => {
        return syncLogToGraph({
          userId: body.userId,
          logId: strategicLog.id,
          weekOf: weekOf,
          weekNumber: ascentWeek,
          leverageBuilt: body.leverageBuilt,
          learnedInsight: body.learnedInsight,
          opportunitiesCreated: body.opportunitiesCreated,
          hadLeverage: !body.hadNoLeverage,
        });
      })
      .then(result => {
        if (result.success) {
          console.log(`✅ Graph synced for log ${strategicLog.id}: ${result.topicsCreated} topics, fog=${result.fogDetected}`);
        } else {
          console.warn(`⚠️ Graph sync incomplete for log ${strategicLog.id}: ${result.error}`);
        }
      })
      .catch(error => {
        console.error(`❌ Graph sync failed for log ${strategicLog.id}:`, error);
      });

    // ============================================
    // THE HEART: UPDATE STREAK (REFACTORED)
    // ============================================
    const streakResult = await updateStreakOnLog(
      body.userId,
      weekOf,
      'ASCENT'
    );

    // ============================================
    // RESPONSE: SUCCESS
    // ============================================
    return NextResponse.json({
      success: true,
      logId: strategicLog.id,
      weekNumber: ascentWeek,
      weekOf: weekOf.toISOString(),
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