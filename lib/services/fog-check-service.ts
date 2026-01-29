// ============================================
// lib/services/fog-check-service.ts
// THE ORCHESTRATOR: Assembles context and generates Fog Checks
// UPDATED: Week 4+ pattern detection from FalkorDB
// ============================================

import { prisma } from '@/lib/prisma';
import { generateFogCheck } from '@/lib/ai/groq-client';
import { 
  buildPatternHunterPrompt, 
  buildPatternHunterPromptWithPatterns 
} from '@/lib/ai/prompts/pattern-hunter';
import { findSimilarLogs, SimilarLog } from '@/lib/db/vector-search';
import { stringToEmbedding } from '@/lib/ai/embeddings';
import { getAscentWeek } from '@/lib/utils/week-calculator';
import { detectAllPatterns } from '@/lib/graph/patterns';

interface FogCheckResult {
  observation: string;
  strategicQuestion: string;
  fogCheckType: 'WEEK_1' | 'WEEK_2_3' | 'WEEK_4_PLUS';
}

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

  if (weekNumber >= 4) {
    // Week 4+: Use pattern detection from FalkorDB
    console.log(`[Fog Check] Week ${weekNumber} - Running pattern detection...`);
    
    const patterns = await detectAllPatterns(
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

  // 7. Generate Fog Check via Groq
  const fogCheck = await generateFogCheck(prompt, {
    temperature: 0.7,
    maxTokens: 500,
  });

  // 8. Validate response
  if (!fogCheck.observation || !fogCheck.strategicQuestion) {
    throw new Error('Invalid Fog Check response from AI');
  }

  // 9. Return result
  return {
    observation: fogCheck.observation,
    strategicQuestion: fogCheck.strategicQuestion,
    fogCheckType,
  };
}

/**
 * Save Fog Check to database
 * 
 * @param logId - The strategic log ID
 * @param userId - The user ID
 * @param fogCheck - The generated Fog Check
 * @returns Created Fog Check record
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