// ============================================
// lib/graph/patterns/learning-without-action.ts
// PATTERN 1: Learning Without Action
// Detects when user logs learning for 3+ weeks with no leverage
// ============================================

import { executeQuery } from '../falkordb-client';

export interface LearningWithoutActionPattern {
  detected: boolean;
  streakWeeks: number;
  recentLogs: Array<{
    logId: string;
    weekOf: string;
  }>;
}

/**
 * Detect "Learning Without Action" pattern
 * 
 * Pattern: User has logged learning/insights for 3+ weeks
 * but reported NO leverage built (hadLeverage = false)
 * 
 * This indicates: Hiding in research, avoiding scary work
 * 
 * @param userId - User UUID
 * @param lookbackWeeks - How far back to check (default: 4)
 * @returns Pattern detection result
 */
export async function detectLearningWithoutAction(
  userId: string,
  lookbackWeeks: number = 4
): Promise<LearningWithoutActionPattern> {
  try {
    // Calculate cutoff date (4 weeks ago)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - (lookbackWeeks * 7));
    const cutoffString = cutoffDate.toISOString().split('T')[0]; // YYYY-MM-DD

    // Query: Find logs where hadLeverage = false in recent weeks
    const query = `
      MATCH (u:User {id: '${userId}'})-[:LOGGED]->(log:Log)
      WHERE log.hadLeverage = false
        AND log.weekOf >= '${cutoffString}'
      RETURN log.id as logId, log.weekOf as weekOf
      ORDER BY log.weekOf DESC
    `;

    const result = await executeQuery(query);

    if (!result.data || result.data.length === 0) {
      return {
        detected: false,
        streakWeeks: 0,
        recentLogs: [],
      };
    }

    // Parse results
    const logs = result.data.map(row => {
      const rowData = row as unknown as Record<string, unknown>;
      return {
        logId: rowData.logId as string,
        weekOf: rowData.weekOf as string,
      };
    });

    // Pattern detected if 3+ weeks of no leverage
    const detected = logs.length >= 3;

    return {
      detected,
      streakWeeks: logs.length,
      recentLogs: logs,
    };

  } catch (error) {
    console.error('[Pattern] Learning Without Action detection failed:', error);
    
    // Graceful degradation: Return no pattern detected
    return {
      detected: false,
      streakWeeks: 0,
      recentLogs: [],
    };
  }
}

/**
 * Get human-readable description of the pattern
 */
export function describeLearningWithoutActionPattern(
  pattern: LearningWithoutActionPattern
): string {
  if (!pattern.detected) {
    return '';
  }

  if (pattern.streakWeeks === 3) {
    return `Three weeks of learning, zero action. You're hiding in research.`;
  }

  if (pattern.streakWeeks === 4) {
    return `Four weeks. Four weeks of learning with no leverage built. You're building a library, not a career.`;
  }

  return `${pattern.streakWeeks} weeks of learning activities with zero leverage. Libraries are quiet. Careers require noise—conversations, visibility, risk.`;
}