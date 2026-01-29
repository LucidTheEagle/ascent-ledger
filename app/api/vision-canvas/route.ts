// FILE: app/api/vision-canvas/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

// Vision Architect Prompt (Reddington + Greene fusion)
const VISION_ARCHITECT_PROMPT = `
You are The Ledger, an AI mentor with the strategic depth of Robert Greene and the articulate authority of Raymond Reddington.

CONTEXT:
The user has completed their Vision Canvas. You must analyze their answers and generate two outputs.

YOUR OBJECTIVES:
1. Synthesize their vision into a powerful first-person manifesto
2. Identify ONE blind spot or hidden pattern they cannot see

TONE:
- Calm, certain, observational
- "I see the castle you wish to build..." (Connection)
- "...but you have laid the cornerstone on a swamp." (Correction)
- Direct but not cruel. Penetrating but not punishing.

OUTPUT FORMAT (JSON):
{
  "visionStatement": "First-person synthesis (3-4 sentences). 'I am ascending from [fog] to [future state]. Success means [definition]. This matters because [purpose].'",
  "blindSpot": "One-sentence observation of a psychological pattern or misalignment.",
  "strategicQuestion": "One question that forces them to confront the blind spot."
}

EXAMPLE OUTPUT:
{
  "visionStatement": "I am ascending from micromanagement into self-leadership, building toward leading a marketing team that combines technical depth with creative strategy. Success means autonomy over my projects, mentoring others, and earning $70K+. This matters because I want to create work I am proud of—something my past self would respect.",
  "blindSpot": "Your 'Why' is about proving something to your past. That's external fuel—it burns hot but runs out fast.",
  "strategicQuestion": "If no one was watching—no validation, no applause—would you still want this? Or are you running from something rather than toward something?"
}

USER INPUT:
- Current State: {currentState}
- Desired State (18 months): {desiredState}
- Success Definition: {successDefinition}
- Unique Skills: {uniqueSkills}
- Purpose: {purposeStatement}
- Anti-Goal (Fog): {antiGoal}

Generate the Vision Architect response:
`

export async function POST(request: NextRequest) {
  try {
    // 1. AUTHENTICATE USER
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. PARSE REQUEST BODY
    const body = await request.json()
    const {
      currentState,
      desiredState,
      successDefinition,
      uniqueSkills,
      purposeStatement,
      antiGoal,
    } = body

    // 3. VALIDATE INPUT
    if (!currentState || !desiredState || !successDefinition || 
        !uniqueSkills || !purposeStatement || !antiGoal) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate minimum lengths (from Lucid's feedback)
    if (desiredState.length < 50) {
      return NextResponse.json(
        { error: 'Desired State must be at least 50 characters. Define your vision clearly.' },
        { status: 400 }
      )
    }

    if (purposeStatement.length < 50) {
      return NextResponse.json(
        { error: 'Purpose must be at least 50 characters. Why does this truly matter to you?' },
        { status: 400 }
      )
    }

    // 4. GENERATE AI VISION STATEMENT with GROQ
    const prompt = VISION_ARCHITECT_PROMPT
      .replace('{currentState}', currentState)
      .replace('{desiredState}', desiredState)
      .replace('{successDefinition}', successDefinition)
      .replace('{uniqueSkills}', uniqueSkills)
      .replace('{purposeStatement}', purposeStatement)
      .replace('{antiGoal}', antiGoal)

    const completion = await groq.chat.completions.create({
      messages: [{
        role: 'user',
        content: prompt,
      }],
      model: 'llama-3.3-70b-versatile', // Best for reasoning
      temperature: 0.7,
      max_tokens: 1024,
      response_format: { type: 'json_object' },
    })

    const aiResponse = JSON.parse(completion.choices[0]?.message?.content || '{}')

    if (!aiResponse.visionStatement || !aiResponse.blindSpot || !aiResponse.strategicQuestion) {
      throw new Error('Invalid AI response structure')
    }

    // 5. SAVE TO DATABASE (Self-Healing Transaction)
    const result = await prisma.$transaction(async (tx) => {
      
      // CRITICAL FIX: Ensure User exists in public.users table
      // This bridges the gap between Supabase Auth and Prisma
      let dbUser = await tx.user.findUnique({ 
        where: { id: user.id } 
      })
      
      if (!dbUser) {
        // Create user record in public.users table
        dbUser = await tx.user.create({
          data: {
            id: user.id,
            email: user.email!,
            fullName: user.user_metadata?.full_name || null,
            tokenBalance: 0,
            totalTokensEarned: 0,
            currentStreak: 0,
            longestStreak: 0,
            lifeLines: 0,
            operatingMode: 'ASCENT',
          }
        })
      }

      // Create Vision Canvas
      const visionCanvas = await tx.visionCanvas.create({
        data: {
          userId: user.id,
          currentState,
          desiredState,
          successDefinition,
          uniqueSkills,
          purposeStatement,
          antiGoal,
          aiSynthesis: aiResponse.visionStatement,
          isActive: true,
          version: 1,
        },
      })

      // Create Week 1 Fog Check
      const fogCheck = await tx.fogCheck.create({
        data: {
          userId: user.id,
          observation: aiResponse.blindSpot,
          strategicQuestion: aiResponse.strategicQuestion,
          fogCheckType: 'WEEK_1',
        },
      })

      // Award +100 tokens
      const rewardAmount = 100
      
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          tokenBalance: { increment: rewardAmount },
          totalTokensEarned: { increment: rewardAmount },
        },
      })

      // Record token transaction
      await tx.tokenTransaction.create({
        data: {
          userId: user.id,
          amount: rewardAmount,
          transactionType: 'VISION_COMPLETE',
          description: 'Completed Vision Canvas',
          balanceAfter: updatedUser.tokenBalance,
        },
      })

      return { visionCanvas, fogCheck }
    })

    // ============================================
    // THE BRAIN: SYNC TO GRAPH (ASYNC)
    // ============================================
    // Sync vision to FalkorDB for pattern detection
    // This runs asynchronously - user doesn't wait for it
    // If graph sync fails, app continues (graceful degradation)
    import('@/lib/graph/sync-vision')
      .then(({ syncVisionToGraph }) => {
        return syncVisionToGraph({
          userId: user.id,
          userEmail: user.email!,
          visionId: result.visionCanvas.id,
          currentState,
          desiredState,
          successDefinition,
          uniqueSkills,
          purposeStatement,
          antiGoal,
        });
      })
      .then(syncResult => {
        if (syncResult.success) {
          console.log(`✅ Graph synced for vision ${result.visionCanvas.id}: user=${syncResult.userNodeCreated}, vision=${syncResult.visionNodeCreated}, fog=${syncResult.fogNodeCreated}`);
        } else {
          console.warn(`⚠️ Graph sync incomplete for vision ${result.visionCanvas.id}: ${syncResult.error}`);
        }
      })
      .catch(error => {
        console.error(`❌ Graph sync failed for vision ${result.visionCanvas.id}:`, error);
        // Don't fail the request - graph sync is enhancement, not dependency
      });

    // 6. RETURN SUCCESS
    return NextResponse.json({
      success: true,
      visionId: result.visionCanvas.id,
      fogCheckId: result.fogCheck.id,
      message: 'Vision Canvas completed. +100 tokens earned.',
    })

  } catch (error) {
    console.error('Vision Canvas API Error:', error)
    
    // Handle specific Groq errors
    if (error instanceof Error && error.message.includes('rate limit')) {
      return NextResponse.json(
        { error: 'AI service is busy. Please try again in a moment.' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to process Vision Canvas. Please try again.' },
      { status: 500 }
    )
  }
}