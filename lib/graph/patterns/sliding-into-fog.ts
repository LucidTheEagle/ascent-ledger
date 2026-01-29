// ============================================
// lib/graph/patterns/sliding-into-fog.ts
// PATTERN 2: Sliding Into Fog
// Detects when user mentions their anti-goal in recent logs
// ============================================

import { executeQuery } from '../falkordb-client';

export interface SlidingIntoFogPattern {
  detected: boolean;
  mentionCount: number;
  fogName: string;
  recentMentions: Array<{
    logId: string;
    weekOf: string;
    mentionCount: number;
  }>;
}

/**
 * Detect "Sliding Into Fog" pattern
 * 
 * Pattern: User has SLIDING_INTO relationships in recent logs
 * (meaning they mentioned their anti-goal)
 * 
 * This indicates: Backsliding, losing focus, returning to old patterns
 * 
 * @param userId - User UUID
 * @param lookbackWeeks - How far back to check (default: 4)
 * @returns Pattern detection result
 */
export async function detectSlidingIntoFog(
  userId: string,
  lookbackWeeks: number = 4
): Promise<SlidingIntoFogPattern> {
  try {
    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - (lookbackWeeks * 7));
    const cutoffString = cutoffDate.toISOString().split('T')[0];

    // Query: Find logs with SLIDING_INTO relationship to Fog
    const query = `
      MATCH (u:User {id: '${userId}'})-[:ESCAPING]->(f:Fog),
            (u)-[:LOGGED]->(log:Log)-[s:SLIDING_INTO]->(f)
      WHERE log.weekOf >= '${cutoffString}'
      RETURN log.id as logId, 
             log.weekOf as weekOf, 
             s.mentionCount as mentionCount,
             f.name as fogName
      ORDER BY log.weekOf DESC
    `;

    const result = await executeQuery(query);

    if (!result.data || result.data.length === 0) {
      // No fog mentions - user is staying on track
      return {
        detected: false,
        mentionCount: 0,
        fogName: '',
        recentMentions: [],
      };
    }

    // Parse results
    const mentions = result.data.map(row => {
      const rowData = row as unknown as Record<string, unknown>;
      return {
        logId: rowData.logId as string,
        weekOf: rowData.weekOf as string,
        mentionCount: (rowData.mentionCount as number) || 1,
      };
    });

    const firstRow = result.data[0] as unknown as Record<string, unknown>;
    const fogName = (firstRow.fogName as string) || 'unknown';

    // Calculate total mentions
    const totalMentions = mentions.reduce((sum, m) => sum + m.mentionCount, 0);

    // Pattern detected if ANY mentions (this is a danger signal)
    return {
      detected: true,
      mentionCount: totalMentions,
      fogName,
      recentMentions: mentions,
    };

  } catch (error) {
    console.error('[Pattern] Sliding Into Fog detection failed:', error);
    
    // Graceful degradation
    return {
      detected: false,
      mentionCount: 0,
      fogName: '',
      recentMentions: [],
    };
  }
}

/**
 * Get human-readable description of the pattern
 */
export function describeSlidingIntoFogPattern(
  pattern: SlidingIntoFogPattern
): string {
  if (!pattern.detected) {
    return '';
  }

  const weeks = pattern.recentMentions.length;
  const mentions = pattern.mentionCount;

  if (weeks === 1 && mentions === 1) {
    return `You mentioned "${pattern.fogName}" this week. That's what you're ascending FROM. Are you sliding back or is this intentional?`;
  }

  if (weeks > 1) {
    return `You've mentioned "${pattern.fogName}" ${mentions} times across ${weeks} recent weeks. This is the fog you're supposed to be leaving behind. What's pulling you back?`;
  }

  return `"${pattern.fogName}" appeared ${mentions} times in your recent logs. That's the fog. You're supposed to be ascending away from it.`;
}