// ============================================
// lib/graph/relationships.ts
// THE CONNECTOR: Relationship Creation Functions
// Role: Create edges between graph nodes
// Phase: Sprint 3, Checkpoint 2
// FIXED: FalkorDB uses string interpolation + Fixed SLIDING_INTO to not re-normalize fog name
// ============================================

import { executeQuery } from './falkordb-client';
import {
  HasVisionRel,
  LoggedRel,
  EscapingRel,
  BuildsTowardRel,
  SlidingIntoRel,
  ExhibitsRel,
  REL_TYPES,
} from './schema';

/**
 * Escape single quotes for Cypher queries
 */
function escapeString(str: string): string {
  return str.replace(/'/g, "\\'");
}

/**
 * Create HAS_VISION relationship
 * (User)-[:HAS_VISION]->(Vision)
 * 
 * @param userId - User UUID
 * @param visionId - Vision UUID
 * @param props - Relationship properties
 */
export async function createHasVisionRel(
  userId: string,
  visionId: string,
  props: HasVisionRel
): Promise<void> {
  const query = `
    MATCH (u:User {id: '${escapeString(userId)}'})
    MATCH (v:Vision {id: '${escapeString(visionId)}'})
    MERGE (u)-[r:${REL_TYPES.HAS_VISION}]->(v)
    ON CREATE SET 
      r.createdAt = '${escapeString(props.createdAt)}',
      r.isActive = ${props.isActive}
    ON MATCH SET
      r.isActive = ${props.isActive}
    RETURN r
  `;

  await executeQuery(query);
}

/**
 * Deactivate all visions for a user (when creating new vision)
 * 
 * @param userId - User UUID
 */
export async function deactivateUserVisions(userId: string): Promise<void> {
  const query = `
    MATCH (u:User {id: '${escapeString(userId)}'})-[r:${REL_TYPES.HAS_VISION}]->(:Vision)
    SET r.isActive = false
    RETURN count(r) as updated
  `;

  await executeQuery(query);
}

/**
 * Create LOGGED relationship
 * (User)-[:LOGGED]->(Log)
 * 
 * @param userId - User UUID
 * @param logId - Log UUID
 * @param props - Relationship properties
 */
export async function createLoggedRel(
  userId: string,
  logId: string,
  props: LoggedRel
): Promise<void> {
  const query = `
    MATCH (u:User {id: '${escapeString(userId)}'})
    MATCH (l:Log {id: '${escapeString(logId)}'})
    CREATE (u)-[r:${REL_TYPES.LOGGED} {
      createdAt: '${escapeString(props.createdAt)}',
      weekNumber: ${props.weekNumber}
    }]->(l)
    RETURN r
  `;

  await executeQuery(query);
}

/**
 * Create ESCAPING relationship
 * (User)-[:ESCAPING]->(Fog)
 * 
 * @param userId - User UUID
 * @param fogName - Fog node name (anti-goal)
 * @param props - Relationship properties
 */
export async function createEscapingRel(
  userId: string,
  fogName: string,
  props: EscapingRel
): Promise<void> {
  const normalizedName = fogName.toLowerCase();
  const query = `
    MATCH (u:User {id: '${escapeString(userId)}'})
    MERGE (f:Fog {name: '${escapeString(normalizedName)}'})
    MERGE (u)-[r:${REL_TYPES.ESCAPING}]->(f)
    ON CREATE SET r.definedAt = '${escapeString(props.definedAt)}'
    RETURN r
  `;

  await executeQuery(query);
}

/**
 * Create BUILDS_TOWARD relationship
 * (Log)-[:BUILDS_TOWARD]->(Topic)
 * 
 * @param logId - Log UUID
 * @param topicName - Topic name
 * @param props - Relationship properties
 */
export async function createBuildsTowardRel(
  logId: string,
  topicName: string,
  props: BuildsTowardRel
): Promise<void> {
  const normalizedName = topicName.toLowerCase();
  const query = `
    MATCH (l:Log {id: '${escapeString(logId)}'})
    MERGE (t:Topic {name: '${escapeString(normalizedName)}'})
    CREATE (l)-[r:${REL_TYPES.BUILDS_TOWARD} {
      confidence: ${props.confidence},
      extractedAt: '${escapeString(props.extractedAt)}'
    }]->(t)
    RETURN r
  `;

  await executeQuery(query);
}

/**
 * Create SLIDING_INTO relationship
 * (Log)-[:SLIDING_INTO]->(Fog)
 * DANGER SIGNAL: User mentioned their anti-goal in a log
 * 
 * CRITICAL FIX: The fogName parameter is ALREADY normalized when passed from sync-log.ts
 * We should NOT normalize it again here, or we'll fail to match the existing Fog node
 * 
 * @param logId - Log UUID
 * @param fogName - Fog node name (already normalized/lowercased)
 * @param props - Relationship properties
 */
export async function createSlidingIntoRel(
  logId: string,
  fogName: string,
  props: SlidingIntoRel
): Promise<void> {
  // CRITICAL: Do NOT normalize again - use fogName as-is since it's already normalized
  // The fog node was created with normalized name in createEscapingRel
  const query = `
    MATCH (l:Log {id: '${escapeString(logId)}'})
    MATCH (f:Fog {name: '${escapeString(fogName)}'})
    CREATE (l)-[r:${REL_TYPES.SLIDING_INTO} {
      detectedAt: '${escapeString(props.detectedAt)}',
      mentionCount: ${props.mentionCount}
    }]->(f)
    RETURN r
  `;

  await executeQuery(query);
}

/**
 * Create EXHIBITS relationship
 * (User)-[:EXHIBITS]->(Pattern)
 * 
 * @param userId - User UUID
 * @param patternType - Pattern type
 * @param props - Relationship properties
 */
export async function createExhibitsRel(
  userId: string,
  patternType: string,
  props: ExhibitsRel
): Promise<void> {
  const query = `
    MATCH (u:User {id: '${escapeString(userId)}'})
    MATCH (p:Pattern {type: '${escapeString(patternType)}'})
    CREATE (u)-[r:${REL_TYPES.EXHIBITS} {
      detectedAt: '${escapeString(props.detectedAt)}',
      firstSeenWeek: ${props.firstSeenWeek}
    }]->(p)
    RETURN r
  `;

  await executeQuery(query);
}

/**
 * Get relationship count by type
 * 
 * @param relType - Relationship type
 * @returns Count of relationships
 */
export async function countRelationships(relType: string): Promise<number> {
  const query = `
    MATCH ()-[r:${relType}]->()
    RETURN count(r) as count
  `;

  const result = await executeQuery(query);

  if (!result.data || result.data.length === 0) {
    return 0;
  }

  const row = (result.data[0] as unknown) as Record<string, unknown>;
  return row.count as number;
}

/**
 * Delete all relationships of a specific type for a user
 * ⚠️ Use with caution
 * 
 * @param userId - User UUID
 * @param relType - Relationship type
 */
export async function deleteUserRelationships(
  userId: string,
  relType: string
): Promise<void> {
  const query = `
    MATCH (u:User {id: '${escapeString(userId)}'})-[r:${relType}]->()
    DELETE r
    RETURN count(r) as deleted
  `;

  await executeQuery(query);
}

/**
 * Get all relationships for a node
 * 
 * @param nodeLabel - Node label (e.g., "User", "Log")
 * @param nodeId - Node ID
 * @returns Array of relationship types
 */
export async function getNodeRelationships(
  nodeLabel: string,
  nodeId: string
): Promise<string[]> {
  const query = `
    MATCH (n:${nodeLabel} {id: '${escapeString(nodeId)}'})-[r]->()
    RETURN DISTINCT type(r) as relType
  `;

  const result = await executeQuery(query);

  if (!result.data || result.data.length === 0) {
    return [];
  }

  return result.data.map(row => row[0] as string);
}

/**
 * Check if a relationship exists
 * 
 * @param fromLabel - Source node label
 * @param fromId - Source node ID
 * @param relType - Relationship type
 * @param toLabel - Target node label
 * @param toId - Target node ID
 * @returns true if relationship exists
 */
export async function relationshipExists(
  fromLabel: string,
  fromId: string,
  relType: string,
  toLabel: string,
  toId: string
): Promise<boolean> {
  const query = `
    MATCH (a:${fromLabel} {id: '${escapeString(fromId)}'})-[r:${relType}]->(b:${toLabel} {id: '${escapeString(toId)}'})
    RETURN count(r) > 0 as exists
  `;

  const result = await executeQuery(query);

  if (!result.data || result.data.length === 0) {
    return false;
  }

  return result.data[0][0] as boolean;
}