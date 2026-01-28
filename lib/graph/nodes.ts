// ============================================
// lib/graph/nodes.ts
// THE CONSTRUCTOR: Node Creation Functions
// Role: CRUD operations for graph nodes
// Phase: Sprint 3, Checkpoint 2
// FIXED: Correct FalkorDB result parsing with proper type assertions
// ============================================

import { executeQuery } from './falkordb-client';
import {
  UserNode,
  VisionNode,
  LogNode,
  TopicNode,
  FogNode,
  PatternNode,
  NODE_LABELS,
} from './schema';

/**
 * Escape single quotes for Cypher queries
 */
function escapeString(str: string): string {
  return str.replace(/'/g, "\\'");
}

/**
 * Create or update a User node
 * Uses MERGE to avoid duplicates
 * 
 * @param user - User node data
 * @returns Created/updated node
 */
export async function createUserNode(user: UserNode): Promise<UserNode> {
  const query = `
    MERGE (u:${NODE_LABELS.USER} {id: '${escapeString(user.id)}'})
    ON CREATE SET u.email = '${escapeString(user.email)}'
    ON MATCH SET u.email = '${escapeString(user.email)}'
    RETURN u
  `;

  const result = await executeQuery(query);

  if (!result.data || result.data.length === 0) {
    throw new Error('Failed to create User node');
  }

  return user;
}

/**
 * Create a Vision node
 * Each user should only have ONE active vision
 * 
 * @param vision - Vision node data
 * @returns Created node
 */
export async function createVisionNode(vision: VisionNode): Promise<VisionNode> {
  const query = `
    CREATE (v:${NODE_LABELS.VISION} {
      id: '${escapeString(vision.id)}',
      desiredState: '${escapeString(vision.desiredState)}',
      antiGoal: '${escapeString(vision.antiGoal)}'
    })
    RETURN v
  `;

  const result = await executeQuery(query);

  if (!result.data || result.data.length === 0) {
    throw new Error('Failed to create Vision node');
  }

  return vision;
}

/**
 * Create a Log node
 * One node per weekly Strategic Log
 * 
 * @param log - Log node data
 * @returns Created node
 */
export async function createLogNode(log: LogNode): Promise<LogNode> {
  const query = `
    CREATE (l:${NODE_LABELS.LOG} {
      id: '${escapeString(log.id)}',
      weekOf: '${escapeString(log.weekOf)}',
      hadLeverage: ${log.hadLeverage},
      content: '${escapeString(log.content || '')}'
    })
    RETURN l
  `;

  const result = await executeQuery(query);

  if (!result.data || result.data.length === 0) {
    throw new Error('Failed to create Log node');
  }

  return log;
}

/**
 * Create or merge a Topic node
 * Topics are shared across users (e.g., "leadership")
 * 
 * @param topic - Topic node data
 * @returns Created/merged node
 */
export async function createTopicNode(topic: TopicNode): Promise<TopicNode> {
  const normalizedName = topic.name.toLowerCase();
  const query = `
    MERGE (t:${NODE_LABELS.TOPIC} {name: '${escapeString(normalizedName)}'})
    RETURN t
  `;

  const result = await executeQuery(query);

  if (!result.data || result.data.length === 0) {
    throw new Error('Failed to create Topic node');
  }

  return { name: normalizedName };
}

/**
 * Create or merge a Fog node
 * One Fog node per anti-goal phrase
 * 
 * @param fog - Fog node data
 * @returns Created/merged node
 */
export async function createFogNode(fog: FogNode): Promise<FogNode> {
  const normalizedName = fog.name.toLowerCase();
  const query = `
    MERGE (f:${NODE_LABELS.FOG} {name: '${escapeString(normalizedName)}'})
    RETURN f
  `;

  const result = await executeQuery(query);

  if (!result.data || result.data.length === 0) {
    throw new Error('Failed to create Fog node');
  }

  return { name: normalizedName };
}

/**
 * Create a Pattern node
 * Represents a detected behavioral pattern
 * 
 * @param pattern - Pattern node data
 * @returns Created node
 */
export async function createPatternNode(pattern: PatternNode): Promise<PatternNode> {
  const query = `
    CREATE (p:${NODE_LABELS.PATTERN} {
      type: '${escapeString(pattern.type)}',
      severity: ${pattern.severity},
      detectedAt: '${escapeString(pattern.detectedAt)}',
      description: '${escapeString(pattern.description || '')}'
    })
    RETURN p
  `;

  const result = await executeQuery(query);

  if (!result.data || result.data.length === 0) {
    throw new Error('Failed to create Pattern node');
  }

  return pattern;
}

/**
 * Get a User node by ID
 * 
 * @param userId - User UUID
 * @returns User node or null
 */
export async function getUserNode(userId: string): Promise<UserNode | null> {
  const query = `
    MATCH (u:${NODE_LABELS.USER} {id: '${escapeString(userId)}'})
    RETURN u
  `;

  const result = await executeQuery(query);

  if (!result.data || result.data.length === 0) {
    return null;
  }

  // FalkorDB returns: { data: [{ u: { properties: { id, email } } }] }
  // Double cast to avoid TypeScript error
  const row = (result.data[0] as unknown) as Record<string, unknown>;
  const userObj = row.u as Record<string, unknown> | undefined;
  const nodeData = userObj?.properties as Record<string, unknown> | undefined;
  
  if (!nodeData) {
    return null;
  }

  return {
    id: nodeData.id as string,
    email: nodeData.email as string,
  };
}

/**
 * Get all Topic nodes for a user's logs
 * 
 * @param userId - User UUID
 * @returns Array of topic names
 */
export async function getUserTopics(userId: string): Promise<string[]> {
  const query = `
    MATCH (u:${NODE_LABELS.USER} {id: '${escapeString(userId)}'})-[:LOGGED]->(l:${NODE_LABELS.LOG})
          -[:BUILDS_TOWARD]->(t:${NODE_LABELS.TOPIC})
    RETURN DISTINCT t.name as topic
  `;

  const result = await executeQuery(query);

  if (!result.data || result.data.length === 0) {
    return [];
  }

  // FalkorDB returns: { data: [{ topic: 'value' }] }
  // Double cast for each row
  return result.data.map(row => {
    const rowData = (row as unknown) as Record<string, unknown>;
    return rowData.topic as string;
  });
}

/**
 * Get the user's Fog node (anti-goal)
 * 
 * @param userId - User UUID
 * @returns Fog node or null
 */
export async function getUserFog(userId: string): Promise<FogNode | null> {
  const query = `
    MATCH (u:${NODE_LABELS.USER} {id: '${escapeString(userId)}'})-[:ESCAPING]->(f:${NODE_LABELS.FOG})
    RETURN f
  `;

  const result = await executeQuery(query);

  if (!result.data || result.data.length === 0) {
    return null;
  }

  // FalkorDB returns: { data: [{ f: { properties: { name } } }] }
  // Double cast to avoid TypeScript error
  const row = (result.data[0] as unknown) as Record<string, unknown>;
  const fogObj = row.f as Record<string, unknown> | undefined;
  const nodeData = fogObj?.properties as Record<string, unknown> | undefined;
  
  if (!nodeData || typeof nodeData.name !== 'string') {
    return null;
  }

  return {
    name: nodeData.name,
  };
}

/**
 * Delete a node by label and ID
 * ⚠️ Use with caution - this deletes relationships too
 * 
 * @param label - Node label (e.g., "User", "Log")
 * @param id - Node ID
 */
export async function deleteNode(label: string, id: string): Promise<void> {
  const query = `
    MATCH (n:${label} {id: '${escapeString(id)}'})
    DETACH DELETE n
  `;

  await executeQuery(query);
}

/**
 * Count nodes by label
 * 
 * @param label - Node label
 * @returns Node count
 */
export async function countNodes(label: string): Promise<number> {
  const query = `
    MATCH (n:${label})
    RETURN count(n) as count
  `;

  const result = await executeQuery(query);

  if (!result.data || result.data.length === 0) {
    return 0;
  }

  // FalkorDB returns: { data: [{ count: number }] }
  // Double cast to avoid TypeScript error
  const row = (result.data[0] as unknown) as Record<string, unknown>;
  return row.count as number;
}