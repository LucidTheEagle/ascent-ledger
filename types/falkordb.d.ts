// ============================================
// types/falkordb.d.ts
// Type definitions for falkordb npm package
// FIXED: Removed implementation that was throwing errors
// ============================================

declare module 'falkordb' {
  // Query result structure
  export interface GraphQueryResult {
    header: Array<{
      name: string;
      type: number;
    }>;
    data: unknown[][];
    statistics?: Record<string, unknown>;
  }

  // Graph API (returned by selectGraph)
  export interface GraphAPI {
    query(
      query: string,
      params?: Record<string, unknown>
    ): Promise<GraphQueryResult>;
    
    readonly name: string;
  }

  // Constructor options
  export interface FalkorDBOptions {
    url: string;
    password?: string;
    username?: string;
  }

  // Main FalkorDB client class (named export)
  export class FalkorDB {
    constructor(options: FalkorDBOptions);
    selectGraph(graphName: string): GraphAPI;
    close(): Promise<void>;
  }

  // Additional exports (optional, for completeness)
  export class Graph {
    query(query: string, params?: Record<string, unknown>): Promise<GraphQueryResult>;
    readonly name: string;
  }

  export enum ConstraintType {
    UNIQUE = 'UNIQUE',
    MANDATORY = 'MANDATORY'
  }

  export enum EntityType {
    NODE = 'NODE',
    RELATIONSHIP = 'RELATIONSHIP'
  }
}