// ============================================
// lib/graph/index.ts
// THE GATEWAY: Export Barrel for Graph Module
// Role: Single import point for all graph operations
// Phase: Sprint 3, Checkpoint 4
// ============================================

// Core client
export {
  getGraphClient,
  executeQuery,
  executeQueryWithRetry,
  testGraphConnection,
  getGraphStats,
  clearTestData,
  isFalkorConfigured,
  getGraphName,
  FALKORDB_CONFIG,
} from './falkordb-client';

// Schema types (as types)
export type {
  // Node types
  UserNode,
  VisionNode,
  LogNode,
  TopicNode,
  FogNode,
  PatternNode,
  // Relationship types
  HasVisionRel,
  LoggedRel,
  EscapingRel,
  BuildsTowardRel,
  SlidingIntoRel,
  ExhibitsRel,
  // Helper types
  NodeType,
  RelType,
  NodeLabel,
  RelationshipType,
  PatternType,
} from './schema';

// Schema constants (as values)
export {
  NODE_LABELS,
  REL_TYPES,
  PATTERN_TYPES,
  // Type guards
  isUserNode,
  isVisionNode,
  isLogNode,
  isTopicNode,
  isFogNode,
  isPatternNode,
} from './schema';

// Node operations
export {
  createUserNode,
  createVisionNode,
  createLogNode,
  createTopicNode,
  createFogNode,
  createPatternNode,
  getUserNode,
  getUserTopics,
  getUserFog,
  deleteNode,
  countNodes,
} from './nodes';

// Relationship operations
export {
  createHasVisionRel,
  deactivateUserVisions,
  createLoggedRel,
  createEscapingRel,
  createBuildsTowardRel,
  createSlidingIntoRel,
  createExhibitsRel,
  countRelationships,
  deleteUserRelationships,
  getNodeRelationships,
  relationshipExists,
} from './relationships';

// ============================================
// SYNC ORCHESTRATORS (Sprint 3, Checkpoint 3)
// ============================================

// Log sync
export type { LogSyncData, LogSyncResult } from './sync-log';
export {
  syncLogToGraph,
  batchSyncLogsToGraph,
  isLogSynced,
  getUserSyncStats,
} from './sync-log';

// Vision sync
export type { VisionSyncData, VisionSyncResult } from './sync-vision';
export {
  syncVisionToGraph,
  isVisionSynced,
  getUserActiveVision,
  getUserAntiGoal,
  updateUserVision,
  getUserVisionHistory,
} from './sync-vision';

// ============================================
// PATTERN DETECTION (Sprint 3, Checkpoint 4)
// ============================================

// Pattern detection orchestrator
export type {
  PatternDetectionResult,
  LearningWithoutActionPattern,
  SlidingIntoFogPattern,
  VisionMisalignmentPattern,
} from './patterns';

export {
  detectAllPatterns,
  detectLearningWithoutAction,
  detectSlidingIntoFog,
  detectVisionMisalignment,
  extractVisionKeywords,
} from './patterns';