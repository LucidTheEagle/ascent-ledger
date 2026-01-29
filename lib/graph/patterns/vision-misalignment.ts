// ============================================
// lib/graph/patterns/vision-misalignment.ts
// PATTERN 3: Vision-Action Misalignment
// Detects when user's actions don't align with stated vision
// ============================================

import { executeQuery } from '../falkordb-client';

export interface VisionMisalignmentPattern {
  detected: boolean;
  misalignedLogCount: number;
  visionKeywords: string[];
  actualTopics: string[];
  alignmentScore: number; // 0.0 - 1.0
}

/**
 * Detect "Vision-Action Misalignment" pattern
 * 
 * Pattern: User's log topics don't match their vision keywords
 * For example: Vision says "leadership" but logs show only "coding"
 * 
 * This indicates: Avoiding the real work, staying in comfort zone
 * 
 * @param userId - User UUID
 * @param visionKeywords - Keywords extracted from vision (e.g., ["leadership", "visibility"])
 * @param lookbackWeeks - How far back to check (default: 4)
 * @returns Pattern detection result
 */
export async function detectVisionMisalignment(
  userId: string,
  visionKeywords: string[],
  lookbackWeeks: number = 4
): Promise<VisionMisalignmentPattern> {
  try {
    if (visionKeywords.length === 0) {
      // Can't detect misalignment without vision keywords
      return {
        detected: false,
        misalignedLogCount: 0,
        visionKeywords: [],
        actualTopics: [],
        alignmentScore: 1.0,
      };
    }

    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - (lookbackWeeks * 7));
    const cutoffString = cutoffDate.toISOString().split('T')[0];

    // Normalize vision keywords to lowercase
    const normalizedKeywords = visionKeywords.map(k => k.toLowerCase());

    // Query: Get all topics from recent logs
    const query = `
      MATCH (u:User {id: '${userId}'})-[:LOGGED]->(log:Log)-[:BUILDS_TOWARD]->(t:Topic)
      WHERE log.weekOf >= '${cutoffString}'
      RETURN DISTINCT t.name as topic
    `;

    const result = await executeQuery(query);

    if (!result.data || result.data.length === 0) {
      // No topics extracted yet (user hasn't logged enough)
      return {
        detected: false,
        misalignedLogCount: 0,
        visionKeywords: normalizedKeywords,
        actualTopics: [],
        alignmentScore: 0.5, // Neutral - not enough data
      };
    }

    // Parse actual topics
    const actualTopics = result.data.map(row => {
      const rowData = row as unknown as Record<string, unknown>;
      return (rowData.topic as string).toLowerCase();
    });

    // Calculate alignment score
    const matchingTopics = actualTopics.filter(topic => 
      normalizedKeywords.some(keyword => 
        topic.includes(keyword) || keyword.includes(topic)
      )
    );

    const alignmentScore = matchingTopics.length / actualTopics.length;

    // Pattern detected if alignment score < 0.3 (less than 30% match)
    const detected = alignmentScore < 0.3 && actualTopics.length >= 3;

    // Count misaligned logs
    const misalignedLogCount = detected ? actualTopics.length - matchingTopics.length : 0;

    return {
      detected,
      misalignedLogCount,
      visionKeywords: normalizedKeywords,
      actualTopics,
      alignmentScore,
    };

  } catch (error) {
    console.error('[Pattern] Vision Misalignment detection failed:', error);
    
    // Graceful degradation
    return {
      detected: false,
      misalignedLogCount: 0,
      visionKeywords: visionKeywords.map(k => k.toLowerCase()),
      actualTopics: [],
      alignmentScore: 0.5,
    };
  }
}

/**
 * Get human-readable description of the pattern
 */
export function describeVisionMisalignmentPattern(
  pattern: VisionMisalignmentPattern
): string {
  if (!pattern.detected) {
    return '';
  }

  const visionWords = pattern.visionKeywords.slice(0, 2).join(', ');
  const actualWords = pattern.actualTopics.slice(0, 3).join(', ');
  const alignmentPercent = Math.round(pattern.alignmentScore * 100);

  return `Your vision mentions ${visionWords}, but your recent work is ${actualWords}. ${alignmentPercent}% alignment. You're staying in your comfort zone.`;
}

/**
 * Extract vision keywords from desired state text
 * Simple keyword extraction for pattern matching
 */
export function extractVisionKeywords(desiredState: string): string[] {
  // Common career/leadership keywords
  const keywords = [
    'lead', 'leadership', 'manage', 'management', 'team',
    'strategy', 'strategic', 'influence', 'visibility',
    'mentor', 'coach', 'present', 'speaking', 'communication',
    'negotiate', 'decision', 'autonomy', 'ownership',
  ];

  const lowerText = desiredState.toLowerCase();
  
  return keywords.filter(keyword => lowerText.includes(keyword));
}