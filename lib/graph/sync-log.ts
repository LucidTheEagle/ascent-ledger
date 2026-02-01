// ============================================
// lib/graph/sync-log.ts
// THE ORCHESTRATOR: Sync Strategic Logs to FalkorDB
// Role: Coordinates graph updates when user submits a log
// Phase: Sprint 3, Checkpoint 3
// FIXED: Corrected fog detection regex logic
// ============================================

import { extractTopicsFromLog, extractFallbackTopics } from '@/lib/ai/topic-extraction';
import {
  createUserNode,
  createLogNode,
  createTopicNode,
  getUserNode,
  getUserFog,
} from './nodes';
import {
  createLoggedRel,
  createBuildsTowardRel,
  createSlidingIntoRel,
} from './relationships';
import { isFalkorConfigured } from './falkordb-client';

/**
 * Strategic Log data for graph sync
 */
export interface LogSyncData {
  userId: string;
  logId: string;
  weekOf: Date;
  weekNumber: number;
  leverageBuilt: string;
  learnedInsight: string;
  opportunitiesCreated: string;
  hadLeverage: boolean;
}

/**
 * Sync result with metadata
 */
export interface LogSyncResult {
  success: boolean;
  userNodeCreated: boolean;
  logNodeCreated: boolean;
  topicsCreated: number;
  fogDetected: boolean;
  error?: string;
}

/**
 * Sync a Strategic Log to FalkorDB
 * This is the main entry point called by the API route
 * 
 * FLOW:
 * 1. Check if FalkorDB is configured
 * 2. Merge User node (idempotent)
 * 3. Create Log node
 * 4. Extract topics via Groq
 * 5. Create Topic nodes + BUILDS_TOWARD relationships
 * 6. Create LOGGED relationship
 * 7. Check for Fog mentions (SLIDING_INTO)
 * 
 * @param data - Strategic Log data
 * @returns Sync result
 */
export async function syncLogToGraph(data: LogSyncData): Promise<LogSyncResult> {
  const result: LogSyncResult = {
    success: false,
    userNodeCreated: false,
    logNodeCreated: false,
    topicsCreated: 0,
    fogDetected: false,
  };

  try {
    // ============================================
    // STEP 0: CHECK IF FALKORDB IS CONFIGURED
    // ============================================
    if (!isFalkorConfigured()) {
      console.warn('[GraphSync] FalkorDB not configured. Skipping graph sync.');
      result.error = 'FalkorDB not configured';
      return result;
    }

    // ============================================
    // STEP 1: MERGE USER NODE
    // ============================================
    const existingUser = await getUserNode(data.userId);
    
    if (!existingUser) {
      // Create new User node (we don't have email here, will update from Vision Canvas)
      await createUserNode({
        id: data.userId,
        email: 'pending', // Will be updated when Vision Canvas syncs
      });
      result.userNodeCreated = true;
      console.log(`✅ [GraphSync] User node created: ${data.userId}`);
    } else {
      console.log(`✅ [GraphSync] User node exists: ${data.userId}`);
    }

    // ============================================
    // STEP 2: CREATE LOG NODE
    // ============================================
    const combinedContent = `${data.leverageBuilt} ${data.learnedInsight} ${data.opportunitiesCreated}`;
    
    await createLogNode({
      id: data.logId,
      weekOf: data.weekOf.toISOString().split('T')[0], // YYYY-MM-DD
      hadLeverage: data.hadLeverage,
      content: combinedContent, // Full text for pattern detection
    });
    
    result.logNodeCreated = true;
    console.log(`✅ [GraphSync] Log node created: ${data.logId}`);

    // ============================================
    // STEP 3: CREATE LOGGED RELATIONSHIP
    // ============================================
    await createLoggedRel(data.userId, data.logId, {
      createdAt: new Date().toISOString(),
      weekNumber: data.weekNumber,
    });
    
    console.log(`✅ [GraphSync] LOGGED relationship created`);

    // ============================================
    // STEP 4: EXTRACT TOPICS (ASYNC)
    // ============================================
    let topics: Array<{ name: string; confidence: number }> = [];
    
    try {
      topics = await extractTopicsFromLog({
        leverageBuilt: data.leverageBuilt,
        learnedInsight: data.learnedInsight,
        opportunitiesCreated: data.opportunitiesCreated,
      });
      
      console.log(`✅ [GraphSync] Topics extracted: ${topics.map(t => t.name).join(', ')}`);
    } catch (error) {
      console.warn('[GraphSync] Groq topic extraction failed. Using fallback.', error);
      
      // Fallback: Basic keyword extraction
      topics = extractFallbackTopics(combinedContent);
      console.log(`⚠️ [GraphSync] Fallback topics: ${topics.map(t => t.name).join(', ')}`);
    }

    // ============================================
    // STEP 5: CREATE TOPIC NODES + RELATIONSHIPS
    // ============================================
    for (const topic of topics) {
      try {
        // Create/merge Topic node
        await createTopicNode({ name: topic.name });
        
        // Create BUILDS_TOWARD relationship
        await createBuildsTowardRel(data.logId, topic.name, {
          confidence: topic.confidence,
          extractedAt: new Date().toISOString(),
        });
        
        result.topicsCreated++;
      } catch (error) {
        console.error(`[GraphSync] Failed to create topic "${topic.name}":`, error);
        // Continue with other topics
      }
    }
    
    console.log(`✅ [GraphSync] ${result.topicsCreated} topics synced`);

    // ============================================
    // STEP 6: CHECK FOR FOG MENTIONS (DANGER SIGNAL)
    // ============================================
    try {
      const userFog = await getUserFog(data.userId);
    
      if (userFog?.name) {
        // 🔒 Normalize fog name safely - strip quotes and normalize
        const rawFogName = userFog.name
          .replace(/^"+|"+$/g, '') // strip accidental quotes
          .toLowerCase()
          .trim();
    
        // Convert both content and fog term to lowercase for case-insensitive matching
        const contentLower = combinedContent.toLowerCase();
    
        // CRITICAL FIX: Iterative stemming to get the TRUE root
        // "micromanagement" -> "micromanag" -> "microman" (removes "ment" then "ag")
        // This ensures we match ALL variants: micromanage, micromanaging, micromanagement, etc.
        let fogRoot = rawFogName;
        let prevRoot = '';
        
        // Keep removing suffixes until no more can be removed
        while (fogRoot !== prevRoot) {
          prevRoot = fogRoot;
          fogRoot = fogRoot.replace(/(ing|ment|ement|age|tion|sion|ness|ful|less|able|ible|al|ial|ed|er|or|en|est|ly|ity|ty|ive|ative|ive|y|e|s)$/i, '');
        }
        
        // Ensure minimum root length to avoid false positives
        if (fogRoot.length < 3) {
          fogRoot = rawFogName.substring(0, Math.min(6, rawFogName.length));
        }
    
        // Build regex pattern to match the fog root with word boundaries
        // This catches: micromanage, micromanaging, micromanagement, micromanaged, etc.
        const fogPattern = new RegExp(`\\b${fogRoot}\\w*\\b`, 'gi');
    
        // Find all matches in the content
        const matches = contentLower.match(fogPattern);
    
        if (matches && matches.length > 0) {
          // Create SLIDING_INTO relationship
          await createSlidingIntoRel(data.logId, rawFogName, {
            detectedAt: new Date().toISOString(),
            mentionCount: matches.length,
          });
    
          result.fogDetected = true;
          console.warn(
            `⚠️ [GraphSync] FOG DETECTED: "${rawFogName}" (root: "${fogRoot}") mentioned ${matches.length}x (matches: ${matches.join(', ')})`
          );
        } else {
          // Debug logging when no match found
          console.log(`[GraphSync] No fog match - root: "${fogRoot}", pattern: ${fogPattern}, content length: ${contentLower.length}`);
        }
      }
    } catch (error) {
      console.error('[GraphSync] Fog detection failed:', error);
      // Non-critical, continue
    }

    // ============================================
    // SUCCESS
    // ============================================
    result.success = true;
    console.log(`✅ [GraphSync] Log sync complete: ${data.logId}`);
    
    return result;

  } catch (error) {
    console.error('[GraphSync] Log sync failed:', error);
    
    result.success = false;
    result.error = error instanceof Error ? error.message : 'Unknown error';
    
    return result;
  }
}

/**
 * Batch sync multiple logs to graph
 * Useful for backfilling historical data
 * 
 * @param logs - Array of log data
 * @returns Array of sync results
 */
export async function batchSyncLogsToGraph(
  logs: LogSyncData[]
): Promise<LogSyncResult[]> {
  const results: LogSyncResult[] = [];
  
  console.log(`[GraphSync] Starting batch sync of ${logs.length} logs...`);
  
  for (const log of logs) {
    try {
      const result = await syncLogToGraph(log);
      results.push(result);
      
      // Rate limiting: Wait 200ms between syncs
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      console.error(`[GraphSync] Batch sync failed for log ${log.logId}:`, error);
      
      results.push({
        success: false,
        userNodeCreated: false,
        logNodeCreated: false,
        topicsCreated: 0,
        fogDetected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
  
  const successCount = results.filter(r => r.success).length;
  console.log(`[GraphSync] Batch sync complete: ${successCount}/${logs.length} succeeded`);
  
  return results;
}

/**
 * Check if a log is already synced to graph
 * Useful for avoiding duplicate syncs
 * 
 * @param logId - Log UUID
 * @returns true if log exists in graph
 */
export async function isLogSynced(logId: string): Promise<boolean> {
  try {
    const { executeQuery } = await import('./falkordb-client');
    
    const query = `
      MATCH (l:Log {id: '${logId}'})
      RETURN count(l) > 0 as exists
    `;
    
    const result = await executeQuery(query);
    
    if (!result.data || result.data.length === 0) {
      return false;
    }
    
    const row = (result.data[0] as unknown) as Record<string, unknown>;
    return row.exists as boolean;
    
  } catch (error) {
    console.error('[GraphSync] isLogSynced check failed:', error);
    return false;
  }
}

/**
 * Get sync statistics for a user
 * Useful for debugging and monitoring
 * 
 * @param userId - User UUID
 * @returns Sync stats
 */
export async function getUserSyncStats(userId: string): Promise<{
  totalLogs: number;
  totalTopics: number;
  fogMentions: number;
}> {
  try {
    const { executeQuery } = await import('./falkordb-client');
    
    // Count logs
    const logsQuery = `
      MATCH (u:User {id: '${userId}'})-[:LOGGED]->(l:Log)
      RETURN count(l) as count
    `;
    const logsResult = await executeQuery(logsQuery);
    const logsRow = (logsResult.data[0] as unknown) as Record<string, unknown>;
    const totalLogs = (logsRow?.count as number) || 0;
    
    // Count unique topics
    const topicsQuery = `
      MATCH (u:User {id: '${userId}'})-[:LOGGED]->(l:Log)-[:BUILDS_TOWARD]->(t:Topic)
      RETURN count(DISTINCT t) as count
    `;
    const topicsResult = await executeQuery(topicsQuery);
    const topicsRow = (topicsResult.data[0] as unknown) as Record<string, unknown>;
    const totalTopics = (topicsRow?.count as number) || 0;
    
    // Count fog mentions
    const fogQuery = `
      MATCH (u:User {id: '${userId}'})-[:LOGGED]->(l:Log)-[:SLIDING_INTO]->(f:Fog)
      RETURN count(l) as count
    `;
    const fogResult = await executeQuery(fogQuery);
    const fogRow = (fogResult.data[0] as unknown) as Record<string, unknown>;
    const fogMentions = (fogRow?.count as number) || 0;
    
    return { totalLogs, totalTopics, fogMentions };
    
  } catch (error) {
    console.error('[GraphSync] getUserSyncStats failed:', error);
    return { totalLogs: 0, totalTopics: 0, fogMentions: 0 };
  }
}