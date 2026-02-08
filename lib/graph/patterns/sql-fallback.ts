// ============================================
// lib/graph/patterns/sql-fallback.ts
// SQL-BASED FALLBACK: Heuristic pattern detection when FalkorDB fails
// Sprint 4 - Checkpoint 8
// ============================================

import { prisma } from '@/lib/prisma';
import type { 
  LearningWithoutActionPattern,
  SlidingIntoFogPattern,
  VisionMisalignmentPattern 
} from './index';

/**
 * SQL-based fallback for Learning Without Action detection
 * 
 * Heuristic: Count logs with weak leverage content (< 50 chars)
 * Not as sophisticated as graph detection, but works without FalkorDB
 */
export async function detectLearningWithoutActionFallback(
  userId: string,
  lookbackWeeks: number = 4
): Promise<LearningWithoutActionPattern> {
  try {
    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - (lookbackWeeks * 7));

    // Get recent logs
    const recentLogs = await prisma.strategicLog.findMany({
      where: {
        userId,
        weekOf: {
          gte: cutoffDate,
        },
      },
      select: {
        id: true,
        weekOf: true,
        leverageBuilt: true,
      },
      orderBy: {
        weekOf: 'desc',
      },
      take: lookbackWeeks,
    });

    // Heuristic: Weak leverage = less than 50 characters OR contains "learning" keywords
    const learningKeywords = ['learned', 'studied', 'read', 'researched', 'course', 'tutorial', 'article'];
    
    const weakLeverageLogs = recentLogs.filter(log => {
      const leverage = log.leverageBuilt.trim().toLowerCase();
      const isShort = leverage.length < 50;
      const hasLearningKeywords = learningKeywords.some(keyword => leverage.includes(keyword));
      const noActionWords = !leverage.includes('built') && 
                           !leverage.includes('shipped') && 
                           !leverage.includes('launched') &&
                           !leverage.includes('created') &&
                           !leverage.includes('delivered');
      
      return isShort || (hasLearningKeywords && noActionWords);
    });

    // Pattern detected if 3+ weeks of weak leverage
    const detected = weakLeverageLogs.length >= 3;

    return {
      detected,
      streakWeeks: weakLeverageLogs.length,
      recentLogs: weakLeverageLogs.map(log => ({
        logId: log.id,
        weekOf: log.weekOf.toISOString().split('T')[0],
      })),
    };

  } catch (error) {
    console.error('[Fallback] Learning Without Action detection failed:', error);
    return {
      detected: false,
      streakWeeks: 0,
      recentLogs: [],
    };
  }
}

/**
 * SQL-based fallback for Sliding Into Fog detection
 * 
 * Heuristic: Search log text for anti-goal keywords
 */
export async function detectSlidingIntoFogFallback(
  userId: string,
  antiGoal: string,
  lookbackWeeks: number = 4
): Promise<SlidingIntoFogPattern> {
  try {
    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - (lookbackWeeks * 7));

    // Get recent logs
    const recentLogs = await prisma.strategicLog.findMany({
      where: {
        userId,
        weekOf: {
          gte: cutoffDate,
        },
      },
      select: {
        id: true,
        weekOf: true,
        leverageBuilt: true,
        learnedInsight: true,
        opportunitiesCreated: true,
      },
      orderBy: {
        weekOf: 'desc',
      },
      take: lookbackWeeks,
    });

    // Extract keywords from anti-goal (split by spaces, remove common words)
    const stopWords = ['the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or', 'but'];
    const antiGoalKeywords = antiGoal
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.includes(word));

    // Search for anti-goal keywords in logs
    const logsWithFogMentions = recentLogs.filter(log => {
      const combinedText = [
        log.leverageBuilt,
        log.learnedInsight,
        log.opportunitiesCreated,
      ].join(' ').toLowerCase();

      return antiGoalKeywords.some(keyword => combinedText.includes(keyword));
    });

    // Count total mentions (simple: 1 per log that mentions it)
    const totalMentions = logsWithFogMentions.length;

    // Pattern detected if ANY mentions (danger signal)
    const detected = totalMentions > 0;

    return {
      detected,
      mentionCount: totalMentions,
      fogName: antiGoal,
      recentMentions: logsWithFogMentions.map(log => ({
        logId: log.id,
        weekOf: log.weekOf.toISOString().split('T')[0],
        mentionCount: 1, // Simplified: 1 per log
      })),
    };

  } catch (error) {
    console.error('[Fallback] Sliding Into Fog detection failed:', error);
    return {
      detected: false,
      mentionCount: 0,
      fogName: antiGoal,
      recentMentions: [],
    };
  }
}

/**
 * SQL-based fallback for Vision Misalignment detection
 * 
 * Heuristic: Check if vision keywords appear in recent logs
 * Simpler than graph-based topic extraction, but functional
 */
export async function detectVisionMisalignmentFallback(
  userId: string,
  visionKeywords: string[],
  lookbackWeeks: number = 4
): Promise<VisionMisalignmentPattern> {
  try {
    if (visionKeywords.length === 0) {
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

    // Get recent logs
    const recentLogs = await prisma.strategicLog.findMany({
      where: {
        userId,
        weekOf: {
          gte: cutoffDate,
        },
      },
      select: {
        id: true,
        leverageBuilt: true,
        learnedInsight: true,
        opportunitiesCreated: true,
      },
      orderBy: {
        weekOf: 'desc',
      },
      take: lookbackWeeks,
    });

    if (recentLogs.length === 0) {
      return {
        detected: false,
        misalignedLogCount: 0,
        visionKeywords: visionKeywords.map(k => k.toLowerCase()),
        actualTopics: [],
        alignmentScore: 0.5,
      };
    }

    // Count logs that mention vision keywords
    const normalizedKeywords = visionKeywords.map(k => k.toLowerCase());
    
    const alignedLogs = recentLogs.filter(log => {
      const combinedText = [
        log.leverageBuilt,
        log.learnedInsight,
        log.opportunitiesCreated,
      ].join(' ').toLowerCase();

      return normalizedKeywords.some(keyword => combinedText.includes(keyword));
    });

    const alignmentScore = alignedLogs.length / recentLogs.length;

    // Pattern detected if alignment < 30% and we have enough data
    const detected = alignmentScore < 0.3 && recentLogs.length >= 3;

    // Extract actual topics (simplified: just show what keywords are missing)
    const actualTopics = detected 
      ? ['comfort zone work', 'avoiding vision topics']
      : normalizedKeywords;

    return {
      detected,
      misalignedLogCount: detected ? recentLogs.length - alignedLogs.length : 0,
      visionKeywords: normalizedKeywords,
      actualTopics,
      alignmentScore,
    };

  } catch (error) {
    console.error('[Fallback] Vision Misalignment detection failed:', error);
    return {
      detected: false,
      misalignedLogCount: 0,
      visionKeywords: visionKeywords.map(k => k.toLowerCase()),
      actualTopics: [],
      alignmentScore: 0.5,
    };
  }
}