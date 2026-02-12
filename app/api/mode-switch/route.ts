// ============================================
// app/api/mode-switch/route.ts
// MODE SWITCHING API - FINAL VERSION
// Uses existing recoveryStartDate field (no migration needed)
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { targetMode } = body;

    if (!targetMode || !['ASCENT', 'RECOVERY'].includes(targetMode)) {
      return NextResponse.json(
        { error: 'Invalid mode. Must be ASCENT or RECOVERY' },
        { status: 400 }
      );
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        operatingMode: true,
        currentStreak: true,
        recoveryStartDate: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (currentUser.operatingMode === targetMode) {
      return NextResponse.json({
        success: true,
        message: `Already in ${targetMode} mode`,
        alreadyInMode: true,
      });
    }

    if (targetMode === 'RECOVERY') {
      // ASCENT → RECOVERY: Set recoveryStartDate
      const now = new Date();
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          operatingMode: 'RECOVERY',
          recoveryStartDate: now,
        },
      });

      console.log(`✅ User ${user.id} entered RECOVERY mode. 14-day lock started.`);

      return NextResponse.json({
        success: true,
        message: 'Recovery protocol initiated. 14-day minimum commitment started.',
        newMode: 'RECOVERY',
        streakPreserved: true,
      });

    } else {
      // RECOVERY → ASCENT: Use transition endpoint
      return NextResponse.json({
        success: false,
        requiresTransition: true,
        message: 'Use the transition endpoint to return to Ascent mode',
      }, { status: 400 });
    }

  } catch (error) {
    console.error('[MODE_SWITCH_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to switch modes. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        operatingMode: true,
        recoveryStartDate: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      currentMode: currentUser.operatingMode,
      recoveryStartDate: currentUser.recoveryStartDate,
    });

  } catch (error) {
    console.error('[MODE_GET_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to get mode' },
      { status: 500 }
    );
  }
}