// ============================================
// lib/services/fog-check-service.ts
// THE ORCHESTRATOR: Assembles context and generates Fog Checks
// UPDATED: Week 4+ pattern detection from FalkorDB
// UPDATED: Checkpoint 8 - Crisis Surgeon for Recovery Mode
// UPDATED: Checkpoint 12 - Tone Adjustment
// UPDATED: Checkpoint 13 - Error Handling & Graceful Degradation
// FIXED: TypeScript Ghost Schema - Proper PatternDetectionResult typing
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
import { detectAllPatterns, type PatternDetectionResult } from '@/lib/graph/patterns';
import { groq } from '@/lib/ai/groq-client';
import { logError, retryWithBackoff } from '@/lib/utils/error-handler';

interface FogCheckResult {
  observation: string;
  strategicQuestion: string;
  fogCheckType: 'WEEK_1' | 'WEEK_2_3' | 'WEEK_4_PLUS' | 'CRISIS';
}

// ============================================
// FIX 1: STRICTLY TYPED EMPTY PATTERN RESULT
// ============================================

/**
 * A safe, fully-typed fallback for PatternDetectionResult.
 * This ensures TypeScript never complains about missing properties
 * when pattern detection fails or is skipped.
 */
const EMPTY_PATTERN_RESULT: PatternDetectionResult = {
  hasPatterns: false,
  summary: [],
  learningWithoutAction: { 
    detected: false, 
    streakWeeks: 0, 
    recentLogs: [] 
  },
  slidingIntoFog: { 
    detected: false, 
    mentionCount: 0, 
    fogName: "", 
    recentMentions: [] 
  },
  visionMisalignment: { 
    detected: false, 
    misalignedLogCount: 0, 
    visionKeywords: [], 
    actualTopics: [], 
    alignmentScore: 1 
  }
};

// ============================================
// CHECKPOINT 13: FALLBACK RESPONSES
// ============================================

function getFallbackObservation(log: unknown): string {
  if (
    typeof log === 'object' &&
    log !== null &&
    'isSurvivalMode' in log &&
    (log as { isSurvivalMode?: boolean }).isSurvivalMode
  ) {
    return "You're in survival mode. That's honest. Focus on conservation, not growth. Execute your protocol one step at a time.";
  }

  if (
    typeof log === 'object' &&
    log !== null &&
    'hadNoLeverage' in log &&
    (log as { hadNoLeverage?: boolean }).hadNoLeverage
  ) {
    return "No leverage built. That's honest reporting. Reflect on what blocked execution—was it external or internal?";
  }

  return "You logged your work this week. Leverage compounds over time. Keep building consistently.";
}

function getFallbackQuestion(log: unknown): string {
  if (
    typeof log === 'object' &&
    log !== null &&
    'isSurvivalMode' in log &&
    (log as { isSurvivalMode?: boolean }).isSurvivalMode
  ) {
    return "What's one small action you can take this week to create breathing room?";
  }

  if (
    typeof log === 'object' &&
    log !== null &&
    'hadNoLeverage' in log &&
    (log as { hadNoLeverage?: boolean }).hadNoLeverage
  ) {
    return "What blocked you from building leverage this week—fire drill or analysis paralysis?";
  }

  return "What leverage will you build next week?";
}

// ============================================
// VISION TRACK FOG CHECK (FIXED VERSION)
// ============================================

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
    } catch (embeddingError) {
      console.warn('[Fog Check] Embedding search failed:', embeddingError);
      // Continue without similar logs (not critical)
    }
  }

  // ============================================
  // FIX 2: INITIALIZE WITH SAFE DEFAULT
  // patterns is NEVER undefined now
  // ============================================
  
  let prompt: string;
  let patterns: PatternDetectionResult = EMPTY_PATTERN_RESULT;

  if (weekNumber >= 4) {
    // Week 4+: Use pattern detection from FalkorDB
    console.log(`[Fog Check] Week ${weekNumber} - Running pattern detection...`);
    
    try {
      // CHECKPOINT 13: Timeout protection (5 seconds)
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Pattern detection timeout')), 5000)
      );

      // FIX 3: Type assertion for Promise.race result
      const result = await Promise.race([
        detectAllPatterns(log.userId, vision.desiredState, 4),
        timeoutPromise
      ]) as PatternDetectionResult;

      patterns = result;

      if (patterns.hasPatterns) {
        console.log(`[Fog Check] Patterns detected:`, patterns.summary);
      }
    } catch (patternError) {
      // FIX 4: Graceful degradation with typed constant
      console.warn('[Fog Check] Pattern detection failed, continuing without patterns');
      logError(patternError, {
        service: 'FalkorDB',
        operation: 'Pattern Detection',
        userId: log.userId,
        additionalData: { weekNumber, logId },
      });

      // Use the safe constant instead of empty object/array
      patterns = EMPTY_PATTERN_RESULT;
    }

    // FIX 5: patterns is guaranteed to be PatternDetectionResult (never undefined)
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
      patterns, // No TypeScript errors here anymore
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
    patterns.hasPatterns // Safe to access - patterns is always defined
  );

  // Prepend tone instruction to prompt
  prompt = tonePrompt + prompt;

  // 7. Generate Fog Check via Groq WITH RETRY LOGIC (Checkpoint 13)
  let fogCheckResponse;

  try {
    fogCheckResponse = await retryWithBackoff(
      async () => {
        return await generateFogCheck(prompt, {
          temperature: 0.7,
          maxTokens: 500,
        });
      },
      {
        maxRetries: 3,
        delayMs: 1000,
        exponentialBackoff: true,
      }
    );
  } catch (fogCheckError) {
    // CHECKPOINT 13: Fallback - Use generic response
    console.error('[Fog Check] AI generation failed after retries, using fallback');
    logError(fogCheckError, {
      service: 'Groq',
      operation: 'Fog Check Generation',
      userId: log.userId,
      additionalData: { weekNumber, logId },
    });

    fogCheckResponse = {
      observation: getFallbackObservation(log),
      strategicQuestion: getFallbackQuestion(log),
    };
  }

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
// RECOVERY TRACK FOG CHECK (Checkpoint 8)
// ============================================

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

  // 5. Call Groq API WITH RETRY (Checkpoint 13)
  try {
    const response = await retryWithBackoff(
      async () => {
        return await groq.chat.completions.create({
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
      },
      {
        maxRetries: 3,
        delayMs: 1000,
        exponentialBackoff: true,
      }
    );

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
  } catch (crisisError) {
    console.error('[CRISIS_FOG_CHECK_ERROR]', crisisError);
    logError(crisisError, {
      service: 'Groq',
      operation: 'Crisis Fog Check',
      userId,
      additionalData: { protocolId, weeksSinceStart },
    });

    // Fallback to generic crisis guidance
    return {
      observation: 'You are in survival mode. Focus on executing your protocol: cut the burden, connect with oxygen.',
      strategicQuestion: 'Did you complete the actions you committed to this week?',
      fogCheckType: 'CRISIS',
    };
  }
}

// ============================================
// UNIFIED INTERFACE
// ============================================

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

export async function getFogCheckByLogId(logId: string) {
  return await prisma.fogCheck.findFirst({
    where: { logId },
    orderBy: { createdAt: 'desc' },
  });
}

// ============================================
// BACKWARD COMPATIBILITY
// ============================================

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