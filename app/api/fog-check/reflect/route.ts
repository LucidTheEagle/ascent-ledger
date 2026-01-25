// ============================================
// app/api/fog-check/reflect/route.ts
// Save user's reflection on Fog Check
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

interface ReflectRequest {
  fogCheckId: string;
  reflection: string;
}

export async function POST(req: NextRequest) {
  try {
    const { fogCheckId, reflection }: ReflectRequest = await req.json();

    // Validate input
    if (!fogCheckId || !reflection) {
      return NextResponse.json(
        { error: 'Fog Check ID and reflection are required' },
        { status: 400 }
      );
    }

    if (reflection.length > 1000) {
      return NextResponse.json(
        { error: 'Reflection cannot exceed 1000 characters' },
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

    // Verify ownership of Fog Check
    const fogCheck = await prisma.fogCheck.findUnique({
      where: { id: fogCheckId },
      select: { userId: true },
    });

    if (!fogCheck) {
      return NextResponse.json(
        { error: 'Fog Check not found' },
        { status: 404 }
      );
    }

    if (fogCheck.userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Update reflection
    await prisma.fogCheck.update({
      where: { id: fogCheckId },
      data: { userReflection: reflection.trim() },
    });

    console.log(`[Fog Check] Reflection saved for ${fogCheckId}`);

    return NextResponse.json({
      success: true,
      message: 'Reflection saved',
    });

  } catch (error) {
    console.error('Reflection save error:', error);

    return NextResponse.json(
      {
        error: 'Failed to save reflection',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}