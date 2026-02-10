// app/api/transition/route.ts
/**
 * TRANSITION API
 * Handles Recovery → Vision Track transitions
 * UPDATED: Checkpoint 12 - Return newBalance for token-payday flow
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
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
      newBalance: result.newBalance, // NEW: For token-payday redirect
    });
  } catch (error) {
    console.error('[TRANSITION_API_ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Check eligibility
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

    return NextResponse.json({
      isEligible: eligibility.isEligible,
      weeksStable: eligibility.weeksStable,
      currentOxygenLevel: eligibility.currentOxygenLevel,
      message: eligibility.message,
    });
  } catch (error) {
    console.error('[TRANSITION_CHECK_ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}