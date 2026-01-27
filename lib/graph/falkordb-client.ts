// ============================================
// lib/graph/falkordb-client.ts
// THE SYNAPSE: FalkorDB Connection Client
// Role: Graph database interface for pattern detection
// FIXED: Uses FalkorDB.connect() method with proper socket options
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
let isInitializing = false;

/**
 * Get or create FalkorDB client instance
 * Thread-safe singleton with proper error handling
 * 
 * @returns FalkorDB client instance
 * @throws Error if connection fails
 */
export async function getGraphClient(): Promise<FalkorClient> {
  if (graphClient) return graphClient;

  if (isInitializing) {
    throw new Error('[FalkorDB] Concurrent initialization detected.');
  }

  const url = process.env.FALKORDB_URL;
  const password = process.env.FALKORDB_PASSWORD;
  const username = process.env.FALKORDB_USERNAME || 'falkordb';

  if (!url) {
    throw new Error('FALKORDB_URL is not configured.');
  }

  try {
    isInitializing = true;

    // Import FalkorDB as named export
    const { FalkorDB } = await import('falkordb');
    
    // CRITICAL: Use FalkorDB.connect() method (NOT constructor!)
    // The constructor initializes with NullClient by default
    // Only .connect() properly initializes the Redis client
    graphClient = await (FalkorDB as any).connect({
      url,
      username,
      password: password || undefined,
      socket: {
        connectTimeout: 30000, // 30 seconds (FalkorDB Cloud needs longer timeout)
        reconnectStrategy: false, // Disable auto-reconnect (we handle it manually)
      },
    }) as unknown as FalkorClient;

    console.log('✅ [FalkorDB] Connection initialized');
    return graphClient;
  } catch (error) {
    graphClient = null;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ [FalkorDB] Connection failed:', errorMessage);
    throw new Error(`[FalkorDB] Connection failed: ${errorMessage}`);
  } finally {
    isInitializing = false;
  }
}

/**
 * Execute a Cypher query on the graph
 * 
 * @param query - Cypher query string
 * @param params - Query parameters
 * @returns Query result with typed structure
 */
export async function executeQuery(
  query: string,
  params: Record<string, unknown> = {}
): Promise<GraphQueryResult> {
  const client = await getGraphClient();
  const graphName = getGraphName();

  try {
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

/**
 * Check if error is retryable (network/timeout only)
 * 
 * @param error - Error object
 * @returns true if error should be retried
 */
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

/**
 * Execute query with automatic retry on network failures only
 * Does NOT retry syntax/constraint/auth errors
 * 
 * @param query - Cypher query
 * @param params - Query parameters
 * @param maxRetries - Maximum retry attempts (default: 2)
 * @returns Query result
 */
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
      const delay = Math.pow(2, attempt) * 500; // 1s, 2s exponential backoff
      console.warn(
        `[FalkorDB] Retry ${attempt}/${maxRetries} after ${delay}ms (retryable error)`
      );
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Query failed after retries');
}

/**
 * Test FalkorDB connection health
 * Creates, queries, and deletes a test node
 * 
 * @returns true if connection is healthy
 */
export async function testGraphConnection(): Promise<boolean> {
  try {
    const testId = `health_${Date.now()}`;

    // FalkorDB Cypher syntax (slightly different from Neo4j)
    // CREATE without RETURN
    await executeQuery(
      `CREATE (:HealthCheck {id: '${testId}'})`
    );

    // MATCH with RETURN
    const result = await executeQuery(
      `MATCH (n:HealthCheck {id: '${testId}'}) RETURN n`
    );

    // Verify we got a result
    if (!result.data || result.data.length === 0) {
      throw new Error('Health check node not found after creation');
    }

    // DELETE
    await executeQuery(
      `MATCH (n:HealthCheck {id: '${testId}'}) DELETE n`
    );

    console.log('✅ [FalkorDB] Health check passed');
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[FalkorDB] Health check failed:', errorMessage);
    return false;
  }
}

/**
 * Get graph statistics for monitoring
 * 
 * @returns Node count, edge count, and labels
 */
export async function getGraphStats(): Promise<{
  nodeCount: number;
  edgeCount: number;
  labels: string[];
}> {
  try {
    // Count nodes - FalkorDB syntax
    const nodeResult = await executeQuery(`MATCH (n) RETURN count(n) as count`);
    const nodeCount = (nodeResult.data[0]?.[0] as number) || 0;

    // Count edges
    const edgeResult = await executeQuery(`MATCH ()-[r]->() RETURN count(r) as count`);
    const edgeCount = (edgeResult.data[0]?.[0] as number) || 0;

    // Get all labels - FalkorDB uses db.labels()
    let labels: string[] = [];
    try {
      const labelResult = await executeQuery(`CALL db.labels()`);
      labels = labelResult.data.map((row) => row[0] as string);
    } catch {
      // db.labels() might not be available, continue without labels
      labels = [];
    }

    return { nodeCount, edgeCount, labels };
  } catch (error) {
    console.error('[FalkorDB] Failed to get graph stats:', error);
    return { nodeCount: 0, edgeCount: 0, labels: [] };
  }
}

/**
 * Clear test data from graph (development only)
 * 
 * @param confirm - Must be 'DELETE_ALL_TEST_DATA'
 */
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

/**
 * Check if FalkorDB is configured
 * 
 * @returns true if environment variables are set
 */
export function isFalkorConfigured(): boolean {
  return !!(process.env.FALKORDB_URL);
}

/**
 * Get graph name from environment
 * 
 * @returns Graph name (default: 'ascent_graph')
 */
export function getGraphName(): string {
  return process.env.FALKORDB_GRAPH_NAME || 'ascent_graph';
}

/**
 * FalkorDB configuration constants
 */
export const FALKORDB_CONFIG = {
  DEFAULT_GRAPH_NAME: 'ascent_graph',
  MAX_RETRIES: 2,
  QUERY_TIMEOUT_MS: 5000,
  CONNECTION_TIMEOUT_MS: 30000, // Increased from 10s to 30s for Cloud
} as const;