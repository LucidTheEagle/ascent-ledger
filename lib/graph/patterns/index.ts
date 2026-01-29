// ============================================
// lib/graph/patterns/index.ts
// THE ORCHESTRATOR: Runs all pattern detection queries
// ============================================

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
   * This is the main entry point for pattern detection.
   * Called by Fog Check generation (Week 4+)
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
    // Check if FalkorDB is configured
    if (!isFalkorConfigured()) {
      console.warn('[Patterns] FalkorDB not configured. Skipping pattern detection.');
      return {
        hasPatterns: false,
        learningWithoutAction: { detected: false, streakWeeks: 0, recentLogs: [] },
        slidingIntoFog: { detected: false, mentionCount: 0, fogName: '', recentMentions: [] },
        visionMisalignment: { detected: false, misalignedLogCount: 0, visionKeywords: [], actualTopics: [], alignmentScore: 1.0 },
        summary: [],
      };
    }
  
    try {
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
  
    } catch (error) {
      console.error('[Patterns] Pattern detection failed:', error);
      
      // Graceful degradation: Return no patterns detected
      return {
        hasPatterns: false,
        learningWithoutAction: { detected: false, streakWeeks: 0, recentLogs: [] },
        slidingIntoFog: { detected: false, mentionCount: 0, fogName: '', recentMentions: [] },
        visionMisalignment: { detected: false, misalignedLogCount: 0, visionKeywords: [], actualTopics: [], alignmentScore: 1.0 },
        summary: [],
      };
    }
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