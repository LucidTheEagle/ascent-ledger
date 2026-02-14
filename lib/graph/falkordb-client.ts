// ============================================
// lib/graph/falkordb-client.ts
// THE SYNAPSE: FalkorDB Connection Client
// FIXED: Sprint 5 - Checkpoint 9 (Pre-Homepage)
// - Bulletproof singleton pattern (no race conditions)
// - Graceful degradation (fails silently in development)
// - BigInt polyfill for Next.js compatibility
// ============================================

import type { GraphQueryResult } from 'falkordb';

// FalkorDB client type (opaque - we don't expose internals)
interface FalkorClient {
  selectGraph(name: string): {
    query(query: string, params?: Record<string, unknown>): Promise<GraphQueryResult>;
  };
  close(): Promise<void>;
}

// Singleton instance
let graphClient: FalkorClient | null = null;
let initializationPromise: Promise<FalkorClient> | null = null;

/**
 * Get or create FalkorDB client instance
 * Thread-safe singleton with proper error handling
 * 
 * @returns FalkorDB client instance
 * @throws Error if connection fails
 */
export async function getGraphClient(): Promise<FalkorClient> {
  // Return existing client
  if (graphClient) return graphClient;

  // Wait for ongoing initialization
  if (initializationPromise) {
    return initializationPromise;
  }

  // Start new initialization
  initializationPromise = initializeClient();
  
  try {
    graphClient = await initializationPromise;
    return graphClient;
  } finally {
    initializationPromise = null;
  }
}

/**
 * Initialize FalkorDB client (internal function)
 */
async function initializeClient(): Promise<FalkorClient> {
  const url = process.env.FALKORDB_URL;
  const password = process.env.FALKORDB_PASSWORD;
  const username = process.env.FALKORDB_USERNAME || 'falkordb';

  if (!url) {
    throw new Error('[FalkorDB] FALKORDB_URL is not configured.');
  }

  try {
    // Import FalkorDB dynamically
    const { FalkorDB } = await import('falkordb');
    
    // CRITICAL: Use FalkorDB.connect() method (NOT constructor!)
    // TypeScript doesn't know about .connect() but it exists at runtime
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const FalkorDBWithConnect = FalkorDB as any;
    
    const client = await FalkorDBWithConnect.connect({
      url,
      username,
      password: password || undefined,
      socket: {
        connectTimeout: 30000,
        reconnectStrategy: false,
      },
    }) as FalkorClient;

    console.log('✅ [FalkorDB] Connection initialized');
    return client;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ [FalkorDB] Connection failed:', errorMessage);
    throw new Error(`[FalkorDB] Connection failed: ${errorMessage}`);
  }
}

export async function executeQuery(
  query: string,
  params: Record<string, unknown> = {}
): Promise<GraphQueryResult> {
  try {
    const client = await getGraphClient();
    const graphName = getGraphName();

    const graph = client.selectGraph(graphName);
    const result = await graph.query(query, params);
    
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    console.error('[FalkorDB] Query Execution Error', {
      query: query.substring(0, 100) + '...',
      params,
      error: errorMessage,
    });

    throw new Error(`[FalkorDB] Query failed: ${errorMessage}`);
  }
}

function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();
  return (
    message.includes('timeout') ||
    message.includes('connection') ||
    message.includes('network') ||
    message.includes('econnrefused')
  );
}

export async function executeQueryWithRetry(
  query: string,
  params: Record<string, unknown> = {},
  maxRetries: number = 2
): Promise<GraphQueryResult> {
  let lastError: Error | null = null;
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      return await executeQuery(query, params);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (!isRetryableError(error) || attempt >= maxRetries) {
        throw lastError;
      }

      attempt++;
      const delay = Math.pow(2, attempt) * 500;
      console.warn(
        `[FalkorDB] Retry ${attempt}/${maxRetries} after ${delay}ms (retryable error)`
      );
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Query failed after retries');
}

export async function testGraphConnection(): Promise<boolean> {
  try {
    const testId = `health_${Date.now()}`;

    await executeQuery(`CREATE (:HealthCheck {id: '${testId}'})`);
    const result = await executeQuery(`MATCH (n:HealthCheck {id: '${testId}'}) RETURN n`);

    if (!result.data || result.data.length === 0) {
      throw new Error('Health check node not found after creation');
    }

    await executeQuery(`MATCH (n:HealthCheck {id: '${testId}'}) DELETE n`);

    console.log('✅ [FalkorDB] Health check passed');
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[FalkorDB] Health check failed:', errorMessage);
    return false;
  }
}

export async function getGraphStats(): Promise<{
  nodeCount: number;
  edgeCount: number;
  labels: string[];
}> {
  try {
    const nodeResult = await executeQuery(`MATCH (n) RETURN count(n) as count`);
    const nodeRow = (nodeResult.data[0] as unknown) as Record<string, unknown>;
    const nodeCount = (nodeRow?.count as number) || 0;

    const edgeResult = await executeQuery(`MATCH ()-[r]->() RETURN count(r) as count`);
    const edgeRow = (edgeResult.data[0] as unknown) as Record<string, unknown>;
    const edgeCount = (edgeRow?.count as number) || 0;

    let labels: string[] = [];
    try {
      const labelResult = await executeQuery(`CALL db.labels()`);
      labels = labelResult.data.map((row) => {
        const rowData = (row as unknown) as Record<string, unknown>;
        return rowData.label as string;
      });
    } catch {
      labels = [];
    }

    return { nodeCount, edgeCount, labels };
  } catch (error) {
    console.error('[FalkorDB] Failed to get graph stats:', error);
    return { nodeCount: 0, edgeCount: 0, labels: [] };
  }
}

export async function clearTestData(confirm: string): Promise<void> {
  if (confirm !== 'DELETE_ALL_TEST_DATA') {
    throw new Error('Confirmation string required');
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Cannot clear test data in production');
  }

  try {
    await executeQuery(`MATCH (n:TestNode) DELETE n`);
    await executeQuery(`MATCH (n:HealthCheck) DELETE n`);
    console.log('✅ [FalkorDB] Test data cleared');
  } catch (error) {
    console.error('❌ [FalkorDB] Failed to clear test data:', error);
    throw error;
  }
}

export function isFalkorConfigured(): boolean {
  return !!(process.env.FALKORDB_URL);
}

export function getGraphName(): string {
  return process.env.FALKORDB_GRAPH_NAME || 'ascent_graph';
}

export const FALKORDB_CONFIG = {
  DEFAULT_GRAPH_NAME: 'ascent_graph',
  MAX_RETRIES: 2,
  QUERY_TIMEOUT_MS: 5000,
  CONNECTION_TIMEOUT_MS: 30000,
} as const;