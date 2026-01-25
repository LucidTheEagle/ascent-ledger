// ============================================
// lib/db/vector-search.ts
// THE MEMORY RETRIEVAL: Find semantically similar past logs
// Uses cosine similarity to find logs with similar emotional/content patterns
// ============================================

import { prisma } from '@/lib/prisma';
import { cosineSimilarity, stringToEmbedding } from '@/lib/ai/embeddings';

export interface SimilarLog {
  id: string;
  weekOf: Date;
  leverageBuilt: string;
  learnedInsight: string;
  opportunitiesCreated: string;
  isSurvivalMode: boolean;
  hadNoLeverage: boolean;
  similarity: number; // 0-1 score (higher = more similar)
}

/**
 * Find semantically similar past logs for a user
 * Uses cosine similarity to compare embedding vectors
 * 
 * @param userId - The user's ID
 * @param currentEmbedding - The embedding of the current log
 * @param options - Search configuration
 * @returns Array of similar logs with similarity scores
 */
export async function findSimilarLogs(
  userId: string,
  currentEmbedding: number[],
  options: {
    limit?: number;
    minSimilarity?: number; // Threshold (0.6 = Phase 2 recommendation)
    excludeLogId?: string; // Don't include the current log
  } = {}
): Promise<SimilarLog[]> {
  const {
    limit = 3,
    minSimilarity = 0.6, // Gemini recommended lowering from 0.7 to 0.6
    excludeLogId,
  } = options;

  try {
    // Fetch all past logs with embeddings for this user
    const pastLogs = await prisma.strategicLog.findMany({
      where: {
        userId,
        embedding: { not: null }, // Only logs with embeddings
        id: excludeLogId ? { not: excludeLogId } : undefined,
      },
      orderBy: { createdAt: 'desc' },
      // We'll filter by similarity in-memory, so fetch more than limit
      take: 50, // Get last 50 logs max (performance balance)
    });

    if (pastLogs.length === 0) {
      return []; // No past logs yet
    }

    // Calculate similarity scores
    const logsWithSimilarity: SimilarLog[] = pastLogs
      .map(log => {
        if (!log.embedding) return null;

        const pastEmbedding = stringToEmbedding(log.embedding);
        const similarity = cosineSimilarity(currentEmbedding, pastEmbedding);

        return {
          id: log.id,
          weekOf: log.weekOf,
          leverageBuilt: log.leverageBuilt,
          learnedInsight: log.learnedInsight,
          opportunitiesCreated: log.opportunitiesCreated,
          isSurvivalMode: log.isSurvivalMode,
          hadNoLeverage: log.hadNoLeverage,
          similarity,
        };
      })
      .filter((log): log is SimilarLog => log !== null)
      .filter(log => log.similarity >= minSimilarity) // Filter by threshold
      .sort((a, b) => b.similarity - a.similarity) // Sort by similarity (highest first)
      .slice(0, limit); // Take top N

    return logsWithSimilarity;

  } catch (error) {
    console.error('Vector search error:', error);
    return []; // Return empty array on error (don't break Fog Check generation)
  }
}

/**
 * Find logs from a specific time period
 * Useful for "You said this 4 weeks ago..." type insights
 * 
 * @param userId - The user's ID
 * @param weeksAgo - How many weeks back to look
 * @returns The log from that week (if exists)
 */
export async function findLogFromWeeksAgo(
  userId: string,
  weeksAgo: number
): Promise<SimilarLog | null> {
  try {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - (weeksAgo * 7));
    
    // Get Monday of that week
    const dayOfWeek = targetDate.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    targetDate.setDate(targetDate.getDate() - daysToMonday);
    targetDate.setHours(0, 0, 0, 0);

    const log = await prisma.strategicLog.findFirst({
      where: {
        userId,
        weekOf: targetDate,
      },
    });

    if (!log) return null;

    return {
      id: log.id,
      weekOf: log.weekOf,
      leverageBuilt: log.leverageBuilt,
      learnedInsight: log.learnedInsight,
      opportunitiesCreated: log.opportunitiesCreated,
      isSurvivalMode: log.isSurvivalMode,
      hadNoLeverage: log.hadNoLeverage,
      similarity: 1.0, // Exact match by time
    };

  } catch (error) {
    console.error('Time-based log search error:', error);
    return null;
  }
}

/**
 * Get summary statistics for context
 * Used in Fog Check generation to understand patterns
 * 
 * @param userId - The user's ID
 * @returns Statistics about user's logging history
 */
export async function getLogStatistics(userId: string) {
  try {
    const logs = await prisma.strategicLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 12, // Last 12 weeks
    });

    const totalLogs = logs.length;
    const survivalModeCount = logs.filter(l => l.isSurvivalMode).length;
    const noLeverageCount = logs.filter(l => l.hadNoLeverage).length;

    return {
      totalLogs,
      survivalModeCount,
      noLeverageCount,
      survivalModePercentage: totalLogs > 0 ? (survivalModeCount / totalLogs) * 100 : 0,
      noLeveragePercentage: totalLogs > 0 ? (noLeverageCount / totalLogs) * 100 : 0,
    };

  } catch (error) {
    console.error('Log statistics error:', error);
    return {
      totalLogs: 0,
      survivalModeCount: 0,
      noLeverageCount: 0,
      survivalModePercentage: 0,
      noLeveragePercentage: 0,
    };
  }
}