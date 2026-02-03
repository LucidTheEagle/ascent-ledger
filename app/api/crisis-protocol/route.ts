// app/api/crisis-protocol/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { awardTokens } from "@/lib/services/token-service";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    const { crisisType, burdenToCut, oxygenSource } = body;

    // Validation
    if (!crisisType || !burdenToCut || !oxygenSource) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["TOXIC_ENV", "BURNOUT", "FINANCIAL", "IMPOSTER"].includes(crisisType)) {
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
        oxygenLevelStart: null, // Will be set in first check-in
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

    // Reward tokens for completing crisis triage
    await awardTokens({
      userId: user.id,
      amount: 100,
      description: "Completed Crisis Triage",
      relatedEntityId: protocol.id,
      transactionType: "CRISIS_COMPLETE", // Use valid transactionType per AwardTokensParams
    });

    return NextResponse.json({
      success: true,
      protocol: {
        id: protocol.id,
        crisisType: protocol.crisisType,
        burdenToCut: protocol.burdenToCut,
        oxygenSource: protocol.oxygenSource,
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

// GET endpoint to retrieve active crisis protocol
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

    // Get the most recent active protocol
    const protocol = await prisma.crisisProtocol.findFirst({
      where: {
        userId: user.id,
        completedAt: null, // Only active protocols
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        recoveryCheckins: {
          orderBy: {
            weekOf: "desc",
          },
          take: 1, // Get latest check-in
        },
      },
    });

    if (!protocol) {
      return NextResponse.json({ protocol: null });
    }

    return NextResponse.json({
      protocol: {
        id: protocol.id,
        crisisType: protocol.crisisType,
        burdenToCut: protocol.burdenToCut,
        oxygenSource: protocol.oxygenSource,
        isBurdenCut: protocol.isBurdenCut,
        isOxygenScheduled: protocol.isOxygenScheduled,
        oxygenLevelCurrent: protocol.oxygenLevelCurrent,
        createdAt: protocol.createdAt,
        latestCheckin: protocol.recoveryCheckins[0] || null,
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

// PATCH endpoint to update protocol status
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
    const { protocolId, isBurdenCut, isOxygenScheduled, complete } = body;

    if (!protocolId) {
      return NextResponse.json(
        { error: "Protocol ID required" },
        { status: 400 }
      );
    }

    // Verify protocol belongs to user
    const existingProtocol = await prisma.crisisProtocol.findFirst({
      where: {
        id: protocolId,
        userId: user.id,
      },
    });

    if (!existingProtocol) {
      return NextResponse.json({ error: "Protocol not found" }, { status: 404 });
    }

    // Update protocol
    const updateData: Record<string, unknown> = {};
    if (typeof isBurdenCut === "boolean") updateData.isBurdenCut = isBurdenCut;
    if (typeof isOxygenScheduled === "boolean") updateData.isOxygenScheduled = isOxygenScheduled;
    if (complete) updateData.completedAt = new Date();

    const updated = await prisma.crisisProtocol.update({
      where: { id: protocolId },
      data: updateData,
    });

    return NextResponse.json({ success: true, protocol: updated });
  } catch (error) {
    console.error("[UPDATE_CRISIS_PROTOCOL_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}