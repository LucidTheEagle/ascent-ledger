// ============================================
// app/api/recovery-checkin/route.ts
// THE OXYGEN: Recovery mode check-ins
// REFACTORED: Sprint 4 Checkpoint 3 - Added streak tracking
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { awardTokens } from "@/lib/services/token-service";
import { getWeekOf } from "@/lib/utils/week-calculator";
import { generateCrisisFogCheck, saveFogCheckToDB } from "@/lib/services/fog-check-service";
import { updateStreakOnLog } from "@/lib/services/streak-service";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      protocolId,
      protocolCompleted,
      oxygenConnected,
      oxygenLevelCurrent,
      notes,
    } = body;

    // Validation
    if (!protocolId) {
      return NextResponse.json(
        { error: "Protocol ID required" },
        { status: 400 }
      );
    }

    if (
      oxygenLevelCurrent !== undefined &&
      (oxygenLevelCurrent < 1 || oxygenLevelCurrent > 10)
    ) {
      return NextResponse.json(
        { error: "Oxygen level must be between 1-10" },
        { status: 400 }
      );
    }

    // Verify protocol belongs to user
    const protocol = await prisma.crisisProtocol.findFirst({
      where: {
        id: protocolId,
        userId: user.id,
      },
    });

    if (!protocol) {
      return NextResponse.json({ error: "Protocol not found" }, { status: 404 });
    }

    const weekOf = getWeekOf(new Date());

    // Check if check-in already exists for this week
    const existingCheckin = await prisma.recoveryCheckin.findFirst({
      where: {
        userId: user.id,
        protocolId,
        weekOf,
      },
    });

    if (existingCheckin) {
      return NextResponse.json(
        { error: "Already checked in this week" },
        { status: 400 }
      );
    }

    // Create recovery check-in
    const checkin = await prisma.recoveryCheckin.create({
      data: {
        userId: user.id,
        protocolId,
        weekOf,
        protocolCompleted: protocolCompleted ?? null,
        oxygenConnected: oxygenConnected ?? null,
        oxygenLevelCurrent: oxygenLevelCurrent ?? null,
        notes: notes || null,
      },
    });

    // Update protocol's current oxygen level
    if (oxygenLevelCurrent !== undefined) {
      await prisma.crisisProtocol.update({
        where: { id: protocolId },
        data: {
          oxygenLevelCurrent,
          // Set start level on first check-in
          oxygenLevelStart: protocol.oxygenLevelStart ?? oxygenLevelCurrent,
        },
      });
    }

    // ============================================
    // NEW: UPDATE STREAK (RECOVERY MODE)
    // ============================================
    const streakResult = await updateStreakOnLog(
      user.id,
      weekOf,
      'RECOVERY' // Recovery mode flag
    );

    // ============================================
    // REWARD TOKENS
    // ============================================
    await awardTokens({
      userId: user.id,
      amount: 50,
      description: "Recovery Check-in",
      relatedEntityId: checkin.id,
      transactionType: "RECOVERY_CHECKIN",
    });

    // ============================================
    // AUTO-GENERATE CRISIS FOG CHECK
    // ============================================
    let fogCheck = null;
    try {
      const fogCheckResult = await generateCrisisFogCheck(
        user.id,
        protocolId
      );

      const fogCheckId = await saveFogCheckToDB(
        user.id,
        fogCheckResult,
        undefined // No logId for Crisis fog checks
      );

      fogCheck = {
        id: fogCheckId,
        observation: fogCheckResult.observation,
        strategicQuestion: fogCheckResult.strategicQuestion,
      };
    } catch (fogCheckError) {
      console.error("[CRISIS_FOG_CHECK_ERROR]", fogCheckError);
    }

    // ============================================
    // CHECK STABILITY (3+ weeks at oxygen 6+)
    // ============================================
    const recentCheckins = await prisma.recoveryCheckin.findMany({
      where: {
        userId: user.id,
        protocolId,
        oxygenLevelCurrent: {
          gte: 6,
        },
      },
      orderBy: {
        weekOf: "desc",
      },
      take: 3,
    });

    const isStable = recentCheckins.length >= 3;

    // ============================================
    // RESPONSE: SUCCESS
    // ============================================
    return NextResponse.json({
      success: true,
      checkin: {
        id: checkin.id,
        weekOf: checkin.weekOf,
        oxygenLevelCurrent: checkin.oxygenLevelCurrent,
      },
      streak: {
        current: streakResult.newStreak,
        longest: streakResult.longestStreak,
        lifeLinesUsed: streakResult.lifeLinesUsed,
        lifeLinesEarned: streakResult.lifeLinesEarned,
        message: streakResult.message,
      },
      fogCheck,
      isStable,
    });
  } catch (error) {
    console.error("[RECOVERY_CHECKIN_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ============================================
// GET ENDPOINT (No changes needed)
// ============================================
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const protocolId = searchParams.get("protocolId");

    if (!protocolId) {
      return NextResponse.json(
        { error: "Protocol ID required" },
        { status: 400 }
      );
    }

    const checkins = await prisma.recoveryCheckin.findMany({
      where: {
        userId: user.id,
        protocolId,
      },
      orderBy: {
        weekOf: "desc",
      },
    });

    return NextResponse.json({ checkins });
  } catch (error) {
    console.error("[GET_RECOVERY_CHECKINS_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}