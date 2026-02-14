// app/api/crisis-protocol/route.ts (UPDATED - Include Fog Check)
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { awardTokens } from "@/lib/services/token-service";
import { rateLimit, RATE_LIMITS, createRateLimitResponse } from '@/lib/upstash/rate-limiter';

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

    // ============================================
    // RATE LIMITING - STRICT (Crisis is expensive)
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
    const { crisisType, burdenToCut, oxygenSource } = body;

    // Validation
    if (!crisisType || !burdenToCut || !oxygenSource) {
      return NextResponse.json(
        { error: "All fields required" },
        { status: 400 }
      );
    }

    // Valid crisis types
    const validTypes = ["TOXIC_ENV", "BURNOUT", "FINANCIAL", "IMPOSTER"];
    if (!validTypes.includes(crisisType)) {
      return NextResponse.json(
        { error: "Invalid crisis type" },
        { status: 400 }
      );
    }

    // Create crisis protocol
    const protocol = await prisma.crisisProtocol.create({
      data: {
        userId: user.id,
        crisisType,
        burdenToCut,
        oxygenSource,
        isBurdenCut: false,
        isOxygenScheduled: false,
      },
    });

    // Switch user to RECOVERY mode
    await prisma.user.update({
      where: { id: user.id },
      data: {
        operatingMode: "RECOVERY",
        recoveryStartDate: new Date(),
      },
    });

    // Reward tokens
    await awardTokens({
      userId: user.id,
      amount: 100,
      transactionType: "CRISIS_COMPLETE",
      description: "Completed Crisis Triage",
      relatedEntityId: protocol.id,
    });

    return NextResponse.json({
      success: true,
      protocol: {
        id: protocol.id,
        crisisType: protocol.crisisType,
      },
    });
  } catch (error) {
    console.error("[CRISIS_PROTOCOL_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint - Fetch active protocol WITH latest fog check
export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch active protocol with latest check-in AND fog check
    const protocol = await prisma.crisisProtocol.findFirst({
      where: {
        userId: user.id,
        completedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        recoveryCheckins: {
          orderBy: { weekOf: "desc" },
          take: 1,
        },
      },
    });

    if (!protocol) {
      return NextResponse.json({ protocol: null });
    }

    // Fetch latest fog check for this user
    const latestFogCheck = await prisma.fogCheck.findFirst({
      where: {
        userId: user.id,
        fogCheckType: "CRISIS",
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        observation: true,
        strategicQuestion: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      protocol: {
        ...protocol,
        latestCheckin: protocol.recoveryCheckins[0] || null,
        latestFogCheck: latestFogCheck || null,
      },
    });
  } catch (error) {
    console.error("[GET_CRISIS_PROTOCOL_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH endpoint - Update protocol status
export async function PATCH(req: NextRequest) {
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
    const { protocolId, isBurdenCut, isOxygenScheduled, completedAt } = body;

    if (!protocolId) {
      return NextResponse.json(
        { error: "Protocol ID required" },
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

    // Update protocol
    const updated = await prisma.crisisProtocol.update({
      where: { id: protocolId },
      data: {
        ...(isBurdenCut !== undefined && { isBurdenCut }),
        ...(isOxygenScheduled !== undefined && { isOxygenScheduled }),
        ...(completedAt !== undefined && { completedAt: new Date(completedAt) }),
      },
    });

    return NextResponse.json({
      success: true,
      protocol: updated,
    });
  } catch (error) {
    console.error("[PATCH_CRISIS_PROTOCOL_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}