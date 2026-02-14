// ============================================
// app/api/fog-check/generate/route.ts
// THE ENDPOINT: Generates Fog Check + Awards Tokens
// FINAL VERSION: Uses shared contract, fully type-safe
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateFogCheckForLog, saveFogCheck } from '@/lib/services/fog-check-service';
import { awardTokens, TOKEN_AMOUNTS, TRANSACTION_TYPES } from '@/lib/services/token-service';
import type { FogCheckResponse } from '@/lib/contracts/fog-check';
import { createErrorResponse, withRetry, AppError } from '@/lib/utils/error-handler';
import { rateLimit, RATE_LIMITS, createRateLimitResponse } from '@/lib/upstash/rate-limiter';

export async function POST(req: NextRequest) {
  try {
    const { logId } = await req.json();

    if (!logId) {
      throw new AppError('Log ID is required', 400);
    }

    // Verify authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new AppError('Unauthorized. Please log in again.', 401);
    }

    // ============================================
    // RATE LIMITING - AUTHENTICATED (Fog checks are frequent)
    // ============================================
    const rateLimitResult = await rateLimit(req, {
      limit: RATE_LIMITS.AUTHENTICATED.limit,      // 100 requests
      window: RATE_LIMITS.AUTHENTICATED.window,    // per hour
      identifier: `user:${user.id}`,
    });

    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult);
    }

    // ============================================
    // STEP 1: Generate Fog Check (with retry)
    // ============================================
    const fogCheck = await withRetry(
      () => generateFogCheckForLog(logId),
      {
        maxRetries: 2,
        delayMs: 1000,
      }
    );

    // ============================================
    // STEP 2: Save to Database
    // ============================================
    const savedFogCheck = await saveFogCheck(logId, user.id, fogCheck);

    // ============================================
    // STEP 3: Award Tokens (+50)
    // ============================================
    const tokenResult = await awardTokens({
      userId: user.id,
      amount: TOKEN_AMOUNTS.FOG_CHECK_COMPLETE,
      transactionType: TRANSACTION_TYPES.FOG_CHECK,
      description: 'Completed weekly Fog Check',
      relatedEntityId: savedFogCheck.id,
    });

    // ============================================
    // STEP 4: Return Type-Safe Success Response
    // ============================================
    const successResponse: FogCheckResponse = {
      success: true,
      fogCheckId: savedFogCheck.id,
      observation: fogCheck.observation,
      strategicQuestion: fogCheck.strategicQuestion,
      fogCheckType: fogCheck.fogCheckType,
      tokensAwarded: TOKEN_AMOUNTS.FOG_CHECK_COMPLETE,
      newTokenBalance: tokenResult.newBalance,
      transactionId: tokenResult.transactionId,
    };

    return NextResponse.json(successResponse);

  } catch (error) {
    console.error('[Fog Check API] Error:', error);
    return createErrorResponse(error);
  }
}

// GET endpoint to retrieve existing Fog Check
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const logId = searchParams.get('logId');

    if (!logId) {
      return NextResponse.json(
        { error: 'Log ID is required' },
        { status: 400 }
      );
    }

    // Verify authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Import here to avoid circular dependency
    const { getFogCheckByLogId } = await import('@/lib/services/fog-check-service');
    const fogCheck = await getFogCheckByLogId(logId);

    if (!fogCheck) {
      return NextResponse.json(
        { error: 'Fog Check not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (fogCheck.userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      fogCheck: {
        id: fogCheck.id,
        observation: fogCheck.observation,
        strategicQuestion: fogCheck.strategicQuestion,
        fogCheckType: fogCheck.fogCheckType,
        createdAt: fogCheck.createdAt,
      },
    });

  } catch (error) {
    console.error('Fog Check GET error:', error);

    return NextResponse.json(
      {
        error: 'Failed to retrieve Fog Check',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}