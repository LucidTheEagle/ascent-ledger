// ============================================
// lib/services/fog-check-service.ts
// THE ORCHESTRATOR: Assembles context and generates Fog Checks
// UPDATED: Week 4+ pattern detection from FalkorDB
// UPDATED: Checkpoint 8 - Crisis Surgeon for Recovery Mode
// UPDATED: Checkpoint 12 - Tone Adjustment
// ============================================

import { prisma } from '@/lib/prisma';
import { generateFogCheck } from '@/lib/ai/groq-client';
import { 
  buildPatternHunterPrompt, 
  buildPatternHunterPromptWithPatterns 
} from '@/lib/ai/prompts/pattern-hunter';
import { 
  getCrisisSurgeonPrompt, 
  parseCrisisSurgeonResponse,
  type CrisisContext 
} from '@/lib/ai/prompts/crisis-surgeon';
import { buildToneAdjustedPrompt } from '@/lib/ai/prompts/tone-adjuster';
import { findSimilarLogs, SimilarLog } from '@/lib/db/vector-search';
import { stringToEmbedding } from '@/lib/ai/embeddings';
import { getAscentWeek } from '@/lib/utils/week-calculator';
import { detectAllPatterns } from '@/lib/graph/patterns';
import { groq } from '@/lib/ai/groq-client';

interface FogCheckResult {
  observation: string;
  strategicQuestion: string;
  fogCheckType: 'WEEK_1' | 'WEEK_2_3' | 'WEEK_4_PLUS' | 'CRISIS';
}

// ============================================
// VISION TRACK FOG CHECK (Original)
// ============================================

/**
 * Generate a Fog Check for a strategic log
 * Main entry point for Fog Check generation
 * 
 * @param logId - The strategic log ID
 * @returns Generated Fog Check
 * @throws Error if generation fails (caller handles gracefully)
 */
export async function generateFogCheckForLog(
  logId: string
): Promise<FogCheckResult> {
  // 1. Fetch the log
  const log = await prisma.strategicLog.findUnique({
    where: { id: logId },
    include: {
      user: {
        select: {
          id: true,
          createdAt: true,
        },
      },
    },
  });

  if (!log) {
    throw new Error('Log not found');
  }

  // 2. Fetch active vision
  const vision = await prisma.visionCanvas.findFirst({
    where: {
      userId: log.userId,
      isActive: true,
    },
    select: {
      aiSynthesis: true,
      desiredState: true,
      antiGoal: true,
    },
  });

  if (!vision || !vision.aiSynthesis) {
    throw new Error('Active vision not found. Please complete Vision Canvas first.');
  }

  // 3. Calculate which week they're in
  const weekNumber = getAscentWeek(log.user.createdAt);

  // 4. Determine Fog Check type
  const fogCheckType: 'WEEK_1' | 'WEEK_2_3' | 'WEEK_4_PLUS' = 
    weekNumber === 1 ? 'WEEK_1' :
    weekNumber <= 3 ? 'WEEK_2_3' :
    'WEEK_4_PLUS';

  // 5. Find similar past logs (if embedding exists)
  let similarLogs: SimilarLog[] = [];

  if (log.embedding) {
    try {
      const embedding = stringToEmbedding(log.embedding);
      similarLogs = await findSimilarLogs(log.userId, embedding, {
        excludeLogId: logId,
        limit: 3,
        minSimilarity: 0.6,
      });
    } catch (error) {
      console.warn('[Fog Check] Embedding search failed:', error);
      // Continue without similar logs (not critical)
    }
  }

  // 6. Build the prompt (with or without patterns)
  let prompt: string;
  let patterns;

  if (weekNumber >= 4) {
    // Week 4+: Use pattern detection from FalkorDB
    console.log(`[Fog Check] Week ${weekNumber} - Running pattern detection...`);
    
    patterns = await detectAllPatterns(
      log.userId,
      vision.desiredState,
      4 // Look back 4 weeks
    );

    if (patterns.hasPatterns) {
      console.log(`[Fog Check] Patterns detected:`, patterns.summary);
    }

    prompt = buildPatternHunterPromptWithPatterns(
      {
        visionStatement: vision.aiSynthesis,
        desiredState: vision.desiredState,
        antiGoal: vision.antiGoal,
      },
      {
        leverageBuilt: log.leverageBuilt,
        learnedInsight: log.learnedInsight,
        opportunitiesCreated: log.opportunitiesCreated,
        isSurvivalMode: log.isSurvivalMode,
        hadNoLeverage: log.hadNoLeverage,
      },
      weekNumber,
      patterns,
      similarLogs
    );
  } else {
    // Week 2-3: Basic pattern hunter (no graph patterns yet)
    prompt = buildPatternHunterPrompt(
      {
        visionStatement: vision.aiSynthesis,
        desiredState: vision.desiredState,
        antiGoal: vision.antiGoal,
      },
      {
        leverageBuilt: log.leverageBuilt,
        learnedInsight: log.learnedInsight,
        opportunitiesCreated: log.opportunitiesCreated,
        isSurvivalMode: log.isSurvivalMode,
        hadNoLeverage: log.hadNoLeverage,
      },
      weekNumber,
      similarLogs
    );
  }

  // CHECKPOINT 12: Inject tone adjustment BEFORE AI generation
  const tonePrompt = buildToneAdjustedPrompt(
    {
      leverageBuilt: log.leverageBuilt,
      learnedInsight: log.learnedInsight,
      opportunitiesCreated: log.opportunitiesCreated,
      isSurvivalMode: log.isSurvivalMode,
      hadNoLeverage: log.hadNoLeverage,
    },
    weekNumber,
    patterns?.hasPatterns || false
  );

  // Prepend tone instruction to prompt
  prompt = tonePrompt + prompt;

  // 7. Generate Fog Check via Groq
  const fogCheckResponse = await generateFogCheck(prompt, {
    temperature: 0.7,
    maxTokens: 500,
  });

  // 8. Validate response
  if (!fogCheckResponse.observation || !fogCheckResponse.strategicQuestion) {
    throw new Error('Invalid Fog Check response from AI');
  }

  // 9. Return result
  return {
    observation: fogCheckResponse.observation,
    strategicQuestion: fogCheckResponse.strategicQuestion,
    fogCheckType,
  };
}

// ============================================
// RECOVERY TRACK FOG CHECK (NEW - Checkpoint 8)
// ============================================

/**
 * Generate Crisis Surgeon Fog Check for Recovery Mode
 * 
 * @param userId - User ID
 * @param protocolId - Crisis protocol ID
 * @returns Generated Crisis Fog Check
 */
export async function generateCrisisFogCheck(
  userId: string,
  protocolId: string
): Promise<FogCheckResult> {
  // 1. Fetch crisis protocol with latest check-in
  const protocol = await prisma.crisisProtocol.findUnique({
    where: { id: protocolId },
    include: {
      recoveryCheckins: {
        orderBy: { weekOf: 'desc' },
        take: 1,
      },
    },
  });

  if (!protocol) {
    throw new Error('Crisis protocol not found');
  }

  const latestCheckin = protocol.recoveryCheckins[0];

  // 2. Calculate weeks since recovery started
  const weeksSinceStart = Math.ceil(
    (Date.now() - protocol.createdAt.getTime()) / (7 * 24 * 60 * 60 * 1000)
  );

  // 3. Build Crisis Context
  const crisisContext: CrisisContext = {
    crisisType: protocol.crisisType as 'TOXIC_ENV' | 'BURNOUT' | 'FINANCIAL' | 'IMPOSTER',
    burdenToCut: protocol.burdenToCut,
    oxygenSource: protocol.oxygenSource,
    isBurdenCut: protocol.isBurdenCut,
    isOxygenScheduled: protocol.isOxygenScheduled,
    oxygenLevelCurrent: protocol.oxygenLevelCurrent,
    oxygenLevelStart: protocol.oxygenLevelStart,
    weeksSinceStart,
    protocolCompleted: latestCheckin?.protocolCompleted ?? undefined,
    oxygenConnected: latestCheckin?.oxygenConnected ?? undefined,
  };

  // 4. Generate Crisis Surgeon prompt
  const systemPrompt = getCrisisSurgeonPrompt(crisisContext);

  // 5. Call Groq API
  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.1-70b-versatile',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: 'Generate the Crisis Fog Check based on the context provided.',
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from Groq');
    }

    const crisisCheck = parseCrisisSurgeonResponse(content);

    return {
      observation: crisisCheck.triageAssessment,
      strategicQuestion: crisisCheck.immediateDirective,
      fogCheckType: 'CRISIS',
    };
  } catch (error) {
    console.error('[CRISIS_FOG_CHECK_ERROR]', error);

    // Fallback to generic crisis guidance
    return {
      observation: 'You are in survival mode. Focus on executing your protocol: cut the burden, connect with oxygen.',
      strategicQuestion: 'Did you complete the actions you committed to this week?',
      fogCheckType: 'CRISIS',
    };
  }
}

// ============================================
// UNIFIED INTERFACE (NEW)
// ============================================

/**
 * Generate Fog Check based on user's operating mode
 * Automatically routes to Vision Track or Recovery Track
 * 
 * @param params - Generation parameters
 * @returns Generated Fog Check
 */
export async function generateFogCheckUnified(params: {
  userId: string;
  logId?: string;
  protocolId?: string;
}): Promise<FogCheckResult> {
  const { userId, logId, protocolId } = params;

  // Check user's operating mode
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { operatingMode: true },
  });

  if (user?.operatingMode === 'RECOVERY') {
    // RECOVERY MODE: Use Crisis Surgeon
    if (!protocolId) {
      throw new Error('Protocol ID required for Crisis Fog Check');
    }
    return await generateCrisisFogCheck(userId, protocolId);
  } else {
    // VISION TRACK: Use Pattern Hunter
    if (!logId) {
      throw new Error('Log ID required for Vision Fog Check');
    }
    return await generateFogCheckForLog(logId);
  }
}

// ============================================
// DATABASE OPERATIONS
// ============================================

/**
 * Save Fog Check to database
 * 
 * @param userId - User ID
 * @param fogCheck - Generated Fog Check
 * @param logId - Strategic log ID (Vision Track only)
 * @returns Created Fog Check ID
 */
export async function saveFogCheckToDB(
  userId: string,
  fogCheck: FogCheckResult,
  logId?: string
): Promise<string> {
  const created = await prisma.fogCheck.create({
    data: {
      userId,
      logId: logId || null,
      observation: fogCheck.observation,
      strategicQuestion: fogCheck.strategicQuestion,
      fogCheckType: fogCheck.fogCheckType,
    },
  });

  return created.id;
}

/**
 * Get Fog Check by log ID
 * 
 * @param logId - The strategic log ID
 * @returns Fog Check if exists, null otherwise
 */
export async function getFogCheckByLogId(logId: string) {
  return await prisma.fogCheck.findFirst({
    where: { logId },
    orderBy: { createdAt: 'desc' },
  });
}

// ============================================
// BACKWARD COMPATIBILITY (Kept from original)
// ============================================

/**
 * Save Fog Check to database (original signature)
 * Kept for backward compatibility with existing code
 */
export async function saveFogCheck(
  logId: string,
  userId: string,
  fogCheck: FogCheckResult
) {
  return await prisma.fogCheck.create({
    data: {
      userId,
      logId,
      observation: fogCheck.observation,
      strategicQuestion: fogCheck.strategicQuestion,
      fogCheckType: fogCheck.fogCheckType,
    },
  });
}

export { generateFogCheck };