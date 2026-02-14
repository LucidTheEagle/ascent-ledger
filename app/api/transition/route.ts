// app/api/transition/route.ts
/**
 * TRANSITION API
 * UPDATED: Returns detailed eligibility data for Flight Check modal
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { rateLimit, RATE_LIMITS, createRateLimitResponse } from '@/lib/upstash/rate-limiter';
import {
  checkTransitionEligibility,
  transitionToVisionTrack,
} from '@/lib/services/transition-service';

// POST - Execute transition
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ============================================
    // RATE LIMITING - STRICT (Transition is critical + awards tokens)
    // ============================================
    const rateLimitResult = await rateLimit(req, {
      limit: RATE_LIMITS.STRICT.limit,      // 5 requests
      window: RATE_LIMITS.STRICT.window,    // per hour
      identifier: `user:${user.id}`,
    });

    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult);
    }

    const body = await req.json();
    const { protocolId } = body;

    if (!protocolId) {
      return NextResponse.json(
        { error: 'Protocol ID required' },
        { status: 400 }
      );
    }

    // Execute transition
    const result = await transitionToVisionTrack(user.id, protocolId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    // Return success with token data for token-payday flow
    return NextResponse.json({
      success: true,
      message: result.message,
      tokensAwarded: result.tokensAwarded,
      newBalance: result.newBalance,
    });
  } catch (error) {
    console.error('[TRANSITION_API_ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Check eligibility (UPDATED: Returns detailed Flight Check data)
export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const eligibility = await checkTransitionEligibility(user.id);

    // Return comprehensive eligibility data for Flight Check modal
    return NextResponse.json({
      isEligible: eligibility.isEligible,
      weeksStable: eligibility.weeksStable,
      currentOxygenLevel: eligibility.currentOxygenLevel,
      daysInRecovery: eligibility.daysInRecovery,       // NEW
      has14DaysPassed: eligibility.has14DaysPassed,     // NEW
      message: eligibility.message,
      blockers: eligibility.blockers,                   // NEW
    });
  } catch (error) {
    console.error('[TRANSITION_CHECK_ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}