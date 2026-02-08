// ============================================
// lib/graph/patterns/index.ts
// THE ORCHESTRATOR: Runs all pattern detection queries
// UPDATED: Checkpoint 8 - Added SQL fallback layer for resilience
// ============================================

import prisma from '@/lib/prisma';
import { 
  detectLearningWithoutAction, 
  describeLearningWithoutActionPattern,
  type LearningWithoutActionPattern 
} from './learning-without-action';

import { 
  detectSlidingIntoFog, 
  describeSlidingIntoFogPattern,
  type SlidingIntoFogPattern 
} from './sliding-into-fog';

import { 
  detectVisionMisalignment, 
  describeVisionMisalignmentPattern,
  extractVisionKeywords,
  type VisionMisalignmentPattern 
} from './vision-misalignment';

import { 
  detectLearningWithoutActionFallback,
  detectSlidingIntoFogFallback,
  detectVisionMisalignmentFallback 
} from './sql-fallback';

import { isFalkorConfigured } from '../falkordb-client';

/**
 * Aggregate pattern detection results
 */
export interface PatternDetectionResult {
  hasPatterns: boolean;
  learningWithoutAction: LearningWithoutActionPattern;
  slidingIntoFog: SlidingIntoFogPattern;
  visionMisalignment: VisionMisalignmentPattern;
  summary: string[];
}

/**
 * Run all pattern detection queries for a user
 * 
 * PRIMARY: Uses FalkorDB graph queries for sophisticated pattern detection
 * FALLBACK: Uses SQL heuristics if FalkorDB fails (anti-fragile design)
 * 
 * This is the main entry point for pattern detection.
 * Called by Fog Check generation (Week 4+) and Dashboard
 * 
 * @param userId - User UUID
 * @param desiredState - User's vision desired state (for misalignment detection)
 * @param lookbackWeeks - How far back to check (default: 4)
 * @returns Aggregated pattern detection results
 */
export async function detectAllPatterns(
  userId: string,
  desiredState: string,
  lookbackWeeks: number = 4
): Promise<PatternDetectionResult> {
  // ============================================
  // ATTEMPT PRIMARY: FalkorDB Graph Queries
  // ============================================
  if (isFalkorConfigured()) {
    try {
      return await detectAllPatternsGraph(userId, desiredState, lookbackWeeks);
    } catch (error) {
      console.warn('[Patterns] FalkorDB detection failed, falling back to SQL heuristics:', error);
      // Fall through to SQL fallback
    }
  }

  // ============================================
  // FALLBACK: SQL-Based Heuristics
  // ============================================
  return await detectAllPatternsFallback(userId, desiredState, lookbackWeeks);
}

/**
 * PRIMARY: Graph-based pattern detection using FalkorDB
 * Sophisticated relationship-based analysis
 */
async function detectAllPatternsGraph(
  userId: string,
  desiredState: string,
  lookbackWeeks: number = 4
): Promise<PatternDetectionResult> {
  // Extract vision keywords for misalignment detection
  const visionKeywords = extractVisionKeywords(desiredState);

  // Run all 3 pattern detection queries in parallel
  const [learningWithoutAction, slidingIntoFog, visionMisalignment] = await Promise.all([
    detectLearningWithoutAction(userId, lookbackWeeks),
    detectSlidingIntoFog(userId, lookbackWeeks),
    detectVisionMisalignment(userId, visionKeywords, lookbackWeeks),
  ]);

  // Build summary array (only detected patterns)
  const summary: string[] = [];

  if (learningWithoutAction.detected) {
    summary.push(describeLearningWithoutActionPattern(learningWithoutAction));
  }

  if (slidingIntoFog.detected) {
    summary.push(describeSlidingIntoFogPattern(slidingIntoFog));
  }

  if (visionMisalignment.detected) {
    summary.push(describeVisionMisalignmentPattern(visionMisalignment));
  }

  const hasPatterns = summary.length > 0;

  return {
    hasPatterns,
    learningWithoutAction,
    slidingIntoFog,
    visionMisalignment,
    summary,
  };
}

/**
 * FALLBACK: SQL-based pattern detection using heuristics
 * Simpler but functional when graph DB is unavailable
 */
async function detectAllPatternsFallback(
  userId: string,
  desiredState: string,
  lookbackWeeks: number = 4
): Promise<PatternDetectionResult> {
  // Get user's anti-goal for fog detection
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      visionCanvases: {
        where: { isActive: true },
        select: { antiGoal: true },
        take: 1,
      },
    },
  });

  const antiGoal = user?.visionCanvases[0]?.antiGoal || 'unknown';
  
  // Extract vision keywords for misalignment detection
  const visionKeywords = extractVisionKeywords(desiredState);

  // Run all 3 fallback detectors in parallel
  const [learningWithoutAction, slidingIntoFog, visionMisalignment] = await Promise.all([
    detectLearningWithoutActionFallback(userId, lookbackWeeks),
    detectSlidingIntoFogFallback(userId, antiGoal, lookbackWeeks),
    detectVisionMisalignmentFallback(userId, visionKeywords, lookbackWeeks),
  ]);

  // Build summary array (only detected patterns)
  const summary: string[] = [];

  if (learningWithoutAction.detected) {
    summary.push(describeLearningWithoutActionPattern(learningWithoutAction));
  }

  if (slidingIntoFog.detected) {
    summary.push(describeSlidingIntoFogPattern(slidingIntoFog));
  }

  if (visionMisalignment.detected) {
    summary.push(describeVisionMisalignmentPattern(visionMisalignment));
  }

  const hasPatterns = summary.length > 0;

  console.log('[Patterns] Using SQL fallback detection. Patterns found:', hasPatterns);

  return {
    hasPatterns,
    learningWithoutAction,
    slidingIntoFog,
    visionMisalignment,
    summary,
  };
}

/**
 * Format pattern detection results for prompt injection
 * Converts patterns into text that can be injected into AI prompt
 */
export function formatPatternsForPrompt(patterns: PatternDetectionResult): string {
  if (!patterns.hasPatterns) {
    return '[PATTERN DETECTION]: No negative patterns detected. User is aligned.';
  }

  let formatted = '[PATTERN DETECTION]: The following patterns were detected:\n';

  if (patterns.learningWithoutAction.detected) {
    formatted += `\n1. LEARNING WITHOUT ACTION:
   - ${patterns.learningWithoutAction.streakWeeks} weeks of no leverage
   - User is hiding in research, avoiding scary work
   - Call this out directly: "You're building a library, not a career"`;
  }

  if (patterns.slidingIntoFog.detected) {
    formatted += `\n\n2. SLIDING INTO FOG:
   - User mentioned "${patterns.slidingIntoFog.fogName}" ${patterns.slidingIntoFog.mentionCount} times
   - This is their anti-goal - what they're supposed to be leaving behind
   - DANGER SIGNAL: Ask "Are you sliding back or is this intentional?"`;
  }

  if (patterns.visionMisalignment.detected) {
    formatted += `\n\n3. VISION-ACTION MISALIGNMENT:
   - Vision keywords: ${patterns.visionMisalignment.visionKeywords.join(', ')}
   - Actual work topics: ${patterns.visionMisalignment.actualTopics.join(', ')}
   - Alignment: ${Math.round(patterns.visionMisalignment.alignmentScore * 100)}%
   - User is staying in comfort zone, avoiding vision work`;
  }

  return formatted;
}

// Re-export types for convenience
export type {
  LearningWithoutActionPattern,
  SlidingIntoFogPattern,
  VisionMisalignmentPattern,
};

// Re-export individual detectors (for testing/debugging)
export {
  detectLearningWithoutAction,
  detectSlidingIntoFog,
  detectVisionMisalignment,
  extractVisionKeywords,
};

// Re-export fallback detectors
export {
  detectLearningWithoutActionFallback,
  detectSlidingIntoFogFallback,
  detectVisionMisalignmentFallback,
};