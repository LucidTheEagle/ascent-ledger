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

// Derive row types from Prisma return values
type LogWithLeverage = Awaited<ReturnType<typeof prisma.strategicLog.findMany<{
  select: { id: true; weekOf: true; leverageBuilt: true }
}>>>[number];

type LogWithFull = Awaited<ReturnType<typeof prisma.strategicLog.findMany<{
  select: { id: true; weekOf: true; leverageBuilt: true; learnedInsight: true; opportunitiesCreated: true }
}>>>[number];

type LogWithAlignment = Awaited<ReturnType<typeof prisma.strategicLog.findMany<{
  select: { id: true; leverageBuilt: true; learnedInsight: true; opportunitiesCreated: true }
}>>>[number];

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
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - (lookbackWeeks * 7));

    const recentLogs = await prisma.strategicLog.findMany({
      where: {
        userId,
        weekOf: { gte: cutoffDate },
      },
      select: {
        id: true,
        weekOf: true,
        leverageBuilt: true,
      },
      orderBy: { weekOf: 'desc' },
      take: lookbackWeeks,
    });

    const learningKeywords = ['learned', 'studied', 'read', 'researched', 'course', 'tutorial', 'article'];

    const weakLeverageLogs = recentLogs.filter((log: LogWithLeverage) => {
      const leverage = log.leverageBuilt.trim().toLowerCase();
      const isShort = leverage.length < 50;
      const hasLearningKeywords = learningKeywords.some((keyword: string) => leverage.includes(keyword));
      const noActionWords = !leverage.includes('built') &&
                           !leverage.includes('shipped') &&
                           !leverage.includes('launched') &&
                           !leverage.includes('created') &&
                           !leverage.includes('delivered');

      return isShort || (hasLearningKeywords && noActionWords);
    });

    const detected = weakLeverageLogs.length >= 3;

    return {
      detected,
      streakWeeks: weakLeverageLogs.length,
      recentLogs: weakLeverageLogs.map((log: LogWithLeverage) => ({
        logId: log.id,
        weekOf: log.weekOf.toISOString().split('T')[0],
      })),
    };

  } catch (error) {
    console.error('[Fallback] Learning Without Action detection failed:', error);
    return { detected: false, streakWeeks: 0, recentLogs: [] };
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
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - (lookbackWeeks * 7));

    const recentLogs = await prisma.strategicLog.findMany({
      where: {
        userId,
        weekOf: { gte: cutoffDate },
      },
      select: {
        id: true,
        weekOf: true,
        leverageBuilt: true,
        learnedInsight: true,
        opportunitiesCreated: true,
      },
      orderBy: { weekOf: 'desc' },
      take: lookbackWeeks,
    });

    const stopWords = ['the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or', 'but'];
    const antiGoalKeywords = antiGoal
      .toLowerCase()
      .split(/\s+/)
      .filter((word: string) => word.length > 3 && !stopWords.includes(word));

    const logsWithFogMentions = recentLogs.filter((log: LogWithFull) => {
      const combinedText = [
        log.leverageBuilt,
        log.learnedInsight,
        log.opportunitiesCreated,
      ].join(' ').toLowerCase();

      return antiGoalKeywords.some((keyword: string) => combinedText.includes(keyword));
    });

    const totalMentions = logsWithFogMentions.length;
    const detected = totalMentions > 0;

    return {
      detected,
      mentionCount: totalMentions,
      fogName: antiGoal,
      recentMentions: logsWithFogMentions.map((log: LogWithFull) => ({
        logId: log.id,
        weekOf: log.weekOf.toISOString().split('T')[0],
        mentionCount: 1,
      })),
    };

  } catch (error) {
    console.error('[Fallback] Sliding Into Fog detection failed:', error);
    return { detected: false, mentionCount: 0, fogName: antiGoal, recentMentions: [] };
  }
}

/**
 * SQL-based fallback for Vision Misalignment detection
 *
 * Heuristic: Check if vision keywords appear in recent logs
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

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - (lookbackWeeks * 7));

    const recentLogs = await prisma.strategicLog.findMany({
      where: {
        userId,
        weekOf: { gte: cutoffDate },
      },
      select: {
        id: true,
        leverageBuilt: true,
        learnedInsight: true,
        opportunitiesCreated: true,
      },
      orderBy: { weekOf: 'desc' },
      take: lookbackWeeks,
    });

    if (recentLogs.length === 0) {
      return {
        detected: false,
        misalignedLogCount: 0,
        visionKeywords: visionKeywords.map((k: string) => k.toLowerCase()),
        actualTopics: [],
        alignmentScore: 0.5,
      };
    }

    const normalizedKeywords = visionKeywords.map((k: string) => k.toLowerCase());

    const alignedLogs = recentLogs.filter((log: LogWithAlignment) => {
      const combinedText = [
        log.leverageBuilt,
        log.learnedInsight,
        log.opportunitiesCreated,
      ].join(' ').toLowerCase();

      return normalizedKeywords.some((keyword: string) => combinedText.includes(keyword));
    });

    const alignmentScore = alignedLogs.length / recentLogs.length;
    const detected = alignmentScore < 0.3 && recentLogs.length >= 3;

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
      visionKeywords: visionKeywords.map((k: string) => k.toLowerCase()),
      actualTopics: [],
      alignmentScore: 0.5,
    };
  }
}