// app/api/crisis-fog-check/route.ts
/**
 * CRISIS FOG CHECK API
 * Manual endpoint to generate Crisis Surgeon feedback
 * Useful for testing or re-generating fog checks
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateCrisisFogCheck, saveFogCheckToDB } from '@/lib/services/fog-check-service';

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

    // Verify protocol belongs to user
    const { prisma } = await import('@/lib/prisma');
    const protocol = await prisma.crisisProtocol.findFirst({
      where: {
        id: protocolId,
        userId: user.id,
      },
    });

    if (!protocol) {
      return NextResponse.json(
        { error: 'Protocol not found' },
        { status: 404 }
      );
    }

    // Generate Crisis Fog Check
    const fogCheck = await generateCrisisFogCheck(user.id, protocolId);

    // Save to database
    const fogCheckId = await saveFogCheckToDB(
      user.id,
      fogCheck,
      undefined // No logId for Crisis fog checks
    );

    return NextResponse.json({
      success: true,
      fogCheck: {
        id: fogCheckId,
        observation: fogCheck.observation,
        strategicQuestion: fogCheck.strategicQuestion,
        fogCheckType: fogCheck.fogCheckType,
      },
    });
  } catch (error: unknown) {
    console.error('[CRISIS_FOG_CHECK_ERROR]', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate Crisis Fog Check',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// GET endpoint - Fetch crisis fog check history
export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const { prisma } = await import('@/lib/prisma');

    // Build query
    const where = {
      userId: user.id,
      fogCheckType: 'CRISIS',
    };


    // If protocolId provided, we need to fetch check-ins and their fog checks
    // For now, just return all crisis fog checks for the user
    const fogChecks = await prisma.fogCheck.findMany({
      where: where, // Remove type assertion to non-existent FogCheckWhereInput export 
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      select: {
        id: true,
        observation: true,
        strategicQuestion: true,
        fogCheckType: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      fogChecks,
      total: fogChecks.length,
    });
  } catch (error: unknown) {
    console.error('[GET_CRISIS_FOG_CHECKS_ERROR]', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch fog checks' },
      { status: 500 }
    );
  }
}