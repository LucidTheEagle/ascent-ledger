// ============================================
// lib/graph/schema.ts
// THE BLUEPRINT: Graph Schema Type Definitions
// Role: TypeScript types for FalkorDB nodes and relationships
// Phase: Sprint 3, Checkpoint 2
// ============================================

/**
 * Node Types - The 6 core entities in our graph
 */

export interface UserNode {
    id: string;
    email: string;
  }
  
  export interface VisionNode {
    id: string;
    desiredState: string;
    antiGoal: string;
  }
  
  export interface LogNode {
    id: string;
    weekOf: string; // ISO date string
    hadLeverage: boolean;
    content?: string; // Full log text for pattern detection
  }
  
  export interface TopicNode {
    name: string; // e.g., "leadership", "visibility"
  }
  
  export interface FogNode {
    name: string; // Matches user's anti-goal
  }
  
  export interface PatternNode {
    type: string; // "LEARNING_WITHOUT_ACTION" | "SLIDING_INTO_FOG" | "VISION_MISALIGNMENT"
    severity: number; // 1-10
    detectedAt: string; // ISO timestamp
    description?: string;
  }
  
  /**
   * Relationship Types - The 6 core connections
   */
  
  export interface HasVisionRel {
    createdAt: string; // ISO timestamp
    isActive: boolean; // Only one active vision per user
  }
  
  export interface LoggedRel {
    createdAt: string; // ISO timestamp
    weekNumber: number; // Week 1, Week 2, etc.
  }
  
  export interface EscapingRel {
    definedAt: string; // When user set this anti-goal
  }
  
  export interface BuildsTowardRel {
    confidence: number; // 0.0-1.0 (from Groq extraction)
    extractedAt: string; // ISO timestamp
  }
  
  export interface SlidingIntoRel {
    detectedAt: string; // ISO timestamp
    mentionCount: number; // How many times anti-goal mentioned
  }
  
  export interface ExhibitsRel {
    detectedAt: string; // ISO timestamp
    firstSeenWeek: number; // Which week pattern started
  }
  
  /**
   * Node Label Constants - For Cypher queries
   */
  export const NODE_LABELS = {
    USER: 'User',
    VISION: 'Vision',
    LOG: 'Log',
    TOPIC: 'Topic',
    FOG: 'Fog',
    PATTERN: 'Pattern',
  } as const;
  
  /**
   * Relationship Type Constants - For Cypher queries
   */
  export const REL_TYPES = {
    HAS_VISION: 'HAS_VISION',
    LOGGED: 'LOGGED',
    ESCAPING: 'ESCAPING',
    BUILDS_TOWARD: 'BUILDS_TOWARD',
    SLIDING_INTO: 'SLIDING_INTO',
    EXHIBITS: 'EXHIBITS',
  } as const;
  
  /**
   * Pattern Types - For pattern detection
   */
  export const PATTERN_TYPES = {
    LEARNING_WITHOUT_ACTION: 'LEARNING_WITHOUT_ACTION',
    SLIDING_INTO_FOG: 'SLIDING_INTO_FOG',
    VISION_MISALIGNMENT: 'VISION_MISALIGNMENT',
  } as const;
  
  /**
   * Type Guards - Runtime type checking
   */
  
  export function isUserNode(node: unknown): node is UserNode {
    return (
      typeof node === 'object' &&
      node !== null &&
      'id' in node &&
      'email' in node
    );
  }
  
  export function isVisionNode(node: unknown): node is VisionNode {
    return (
      typeof node === 'object' &&
      node !== null &&
      'id' in node &&
      'desiredState' in node &&
      'antiGoal' in node
    );
  }
  
  export function isLogNode(node: unknown): node is LogNode {
    return (
      typeof node === 'object' &&
      node !== null &&
      'id' in node &&
      'weekOf' in node &&
      'hadLeverage' in node
    );
  }
  
  export function isTopicNode(node: unknown): node is TopicNode {
    return (
      typeof node === 'object' &&
      node !== null &&
      'name' in node
    );
  }
  
  export function isFogNode(node: unknown): node is FogNode {
    return (
      typeof node === 'object' &&
      node !== null &&
      'name' in node
    );
  }
  
  export function isPatternNode(node: unknown): node is PatternNode {
    return (
      typeof node === 'object' &&
      node !== null &&
      'type' in node &&
      'severity' in node &&
      'detectedAt' in node
    );
  }
  
  /**
   * Helper Types - For function parameters
   */
  
  export type NodeType = 
    | UserNode
    | VisionNode
    | LogNode
    | TopicNode
    | FogNode
    | PatternNode;
  
  export type RelType =
    | HasVisionRel
    | LoggedRel
    | EscapingRel
    | BuildsTowardRel
    | SlidingIntoRel
    | ExhibitsRel;
  
  export type NodeLabel = typeof NODE_LABELS[keyof typeof NODE_LABELS];
  export type RelationshipType = typeof REL_TYPES[keyof typeof REL_TYPES];
  export type PatternType = typeof PATTERN_TYPES[keyof typeof PATTERN_TYPES];