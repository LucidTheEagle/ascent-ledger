// ============================================
// lib/graph/sync-vision.ts
// THE FOUNDATION: Sync Vision Canvas to FalkorDB
// Role: Creates User, Vision, Fog nodes when user completes Vision Canvas
// Phase: Sprint 3, Checkpoint 3
// ============================================

import {
    createUserNode,
    createVisionNode,
    createFogNode,
    getUserNode,
  } from './nodes';
  import {
    createHasVisionRel,
    createEscapingRel,
    deactivateUserVisions,
  } from './relationships';
  import { isFalkorConfigured } from './falkordb-client';
  
  /**
   * Vision Canvas data for graph sync
   */
  export interface VisionSyncData {
    userId: string;
    userEmail: string;
    visionId: string;
    currentState: string;
    desiredState: string;
    successDefinition: string;
    uniqueSkills: string;
    purposeStatement: string;
    antiGoal: string; // This becomes the Fog node
  }
  
  /**
   * Vision sync result with metadata
   */
  export interface VisionSyncResult {
    success: boolean;
    userNodeCreated: boolean;
    visionNodeCreated: boolean;
    fogNodeCreated: boolean;
    error?: string;
  }
  
  /**
   * Sync a Vision Canvas to FalkorDB
   * This is called after user completes their Vision Canvas
   * 
   * FLOW:
   * 1. Check if FalkorDB is configured
   * 2. Merge User node (with email)
   * 3. Deactivate old visions
   * 4. Create Vision node
   * 5. Create Fog node (from anti-goal)
   * 6. Create HAS_VISION relationship (User → Vision)
   * 7. Create ESCAPING relationship (User → Fog)
   * 
   * @param data - Vision Canvas data
   * @returns Sync result
   */
  export async function syncVisionToGraph(data: VisionSyncData): Promise<VisionSyncResult> {
    const result: VisionSyncResult = {
      success: false,
      userNodeCreated: false,
      visionNodeCreated: false,
      fogNodeCreated: false,
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
      // STEP 1: MERGE USER NODE (WITH EMAIL)
      // ============================================
      const existingUser = await getUserNode(data.userId);
      
      if (!existingUser) {
        // Create new User node
        await createUserNode({
          id: data.userId,
          email: data.userEmail,
        });
        result.userNodeCreated = true;
        console.log(`✅ [GraphSync] User node created: ${data.userId}`);
      } else {
        // Update email if it was 'pending' from log sync
        if (existingUser.email === 'pending') {
          await createUserNode({
            id: data.userId,
            email: data.userEmail,
          });
          console.log(`✅ [GraphSync] User email updated: ${data.userId}`);
        } else {
          console.log(`✅ [GraphSync] User node exists: ${data.userId}`);
        }
      }
  
      // ============================================
      // STEP 2: DEACTIVATE OLD VISIONS
      // ============================================
      // Users can only have ONE active vision at a time
      await deactivateUserVisions(data.userId);
      console.log(`✅ [GraphSync] Old visions deactivated`);
  
      // ============================================
      // STEP 3: CREATE VISION NODE
      // ============================================
      await createVisionNode({
        id: data.visionId,
        desiredState: data.desiredState,
        antiGoal: data.antiGoal,
      });
      
      result.visionNodeCreated = true;
      console.log(`✅ [GraphSync] Vision node created: ${data.visionId}`);
  
      // ============================================
      // STEP 4: CREATE HAS_VISION RELATIONSHIP
      // ============================================
      await createHasVisionRel(data.userId, data.visionId, {
        createdAt: new Date().toISOString(),
        isActive: true,
      });
      
      console.log(`✅ [GraphSync] HAS_VISION relationship created`);
  
      // ============================================
      // STEP 5: CREATE FOG NODE (FROM ANTI-GOAL)
      // ============================================
      const fogName = data.antiGoal.toLowerCase().trim();
      
      await createFogNode({
        name: fogName,
      });
      
      result.fogNodeCreated = true;
      console.log(`✅ [GraphSync] Fog node created: "${fogName}"`);
  
      // ============================================
      // STEP 6: CREATE ESCAPING RELATIONSHIP
      // ============================================
      await createEscapingRel(data.userId, fogName, {
        definedAt: new Date().toISOString(),
      });
      
      console.log(`✅ [GraphSync] ESCAPING relationship created`);
  
      // ============================================
      // SUCCESS
      // ============================================
      result.success = true;
      console.log(`✅ [GraphSync] Vision sync complete: ${data.visionId}`);
      
      return result;
  
    } catch (error) {
      console.error('[GraphSync] Vision sync failed:', error);
      
      result.success = false;
      result.error = error instanceof Error ? error.message : 'Unknown error';
      
      return result;
    }
  }
  
  /**
   * Check if a vision is already synced to graph
   * 
   * @param visionId - Vision UUID
   * @returns true if vision exists in graph
   */
  export async function isVisionSynced(visionId: string): Promise<boolean> {
    try {
      const { executeQuery } = await import('./falkordb-client');
      
      const query = `
        MATCH (v:Vision {id: '${visionId}'})
        RETURN count(v) > 0 as exists
      `;
      
      const result = await executeQuery(query);
      
      if (!result.data || result.data.length === 0) {
        return false;
      }
      
      const row = (result.data[0] as unknown) as Record<string, unknown>;
      return row.exists as boolean;
      
    } catch (error) {
      console.error('[GraphSync] isVisionSynced check failed:', error);
      return false;
    }
  }
  
  /**
   * Get user's active vision from graph
   * 
   * @param userId - User UUID
   * @returns Vision data or null
   */
  export async function getUserActiveVision(userId: string): Promise<{
    visionId: string;
    desiredState: string;
    antiGoal: string;
  } | null> {
    try {
      const { executeQuery } = await import('./falkordb-client');
      
      const query = `
        MATCH (u:User {id: '${userId}'})-[r:HAS_VISION {isActive: true}]->(v:Vision)
        RETURN v
      `;
      
      const result = await executeQuery(query);
      
      if (!result.data || result.data.length === 0) {
        return null;
      }
      
      // Parse result
      const row = (result.data[0] as unknown) as Record<string, unknown>;
      const visionObj = row.v as Record<string, unknown> | undefined;
      const visionData = visionObj?.properties as Record<string, unknown> | undefined;
      
      if (!visionData) {
        return null;
      }
      
      return {
        visionId: visionData.id as string,
        desiredState: visionData.desiredState as string,
        antiGoal: visionData.antiGoal as string,
      };
      
    } catch (error) {
      console.error('[GraphSync] getUserActiveVision failed:', error);
      return null;
    }
  }
  
  /**
   * Get user's fog (anti-goal) from graph
   * 
   * @param userId - User UUID
   * @returns Fog name or null
   */
  export async function getUserAntiGoal(userId: string): Promise<string | null> {
    try {
      const { executeQuery } = await import('./falkordb-client');
      
      const query = `
        MATCH (u:User {id: '${userId}'})-[:ESCAPING]->(f:Fog)
        RETURN f.name as fogName
      `;
      
      const result = await executeQuery(query);
      
      if (!result.data || result.data.length === 0) {
        return null;
      }
      
      const row = (result.data[0] as unknown) as Record<string, unknown>;
      return row.fogName as string;
      
    } catch (error) {
      console.error('[GraphSync] getUserAntiGoal failed:', error);
      return null;
    }
  }
  
  /**
   * Update user's vision (deactivate old, create new)
   * Useful when user revises their Vision Canvas
   * 
   * @param data - New vision data
   * @returns Sync result
   */
  export async function updateUserVision(data: VisionSyncData): Promise<VisionSyncResult> {
    console.log(`[GraphSync] Updating vision for user ${data.userId}...`);
    
    // syncVisionToGraph already handles deactivation
    return await syncVisionToGraph(data);
  }
  
  /**
   * Get vision change history for a user
   * Shows how their vision has evolved over time
   * 
   * @param userId - User UUID
   * @returns Array of visions in chronological order
   */
  export async function getUserVisionHistory(userId: string): Promise<Array<{
    visionId: string;
    desiredState: string;
    antiGoal: string;
    createdAt: string;
    isActive: boolean;
  }>> {
    try {
      const { executeQuery } = await import('./falkordb-client');
      
      const query = `
        MATCH (u:User {id: '${userId}'})-[r:HAS_VISION]->(v:Vision)
        RETURN v, r
        ORDER BY r.createdAt DESC
      `;
      
      const result = await executeQuery(query);
      
      if (!result.data || result.data.length === 0) {
        return [];
      }
      
      // Parse results
      return result.data.map(row => {
        const rowData = (row as unknown) as Record<string, unknown>;
        const visionObj = rowData.v as Record<string, unknown> | undefined;
        const relObj = rowData.r as Record<string, unknown> | undefined;
        
        const visionData = visionObj?.properties as Record<string, unknown> | undefined;
        const relData = relObj?.properties as Record<string, unknown> | undefined;
        
        return {
          visionId: (visionData?.id as string) || '',
          desiredState: (visionData?.desiredState as string) || '',
          antiGoal: (visionData?.antiGoal as string) || '',
          createdAt: (relData?.createdAt as string) || '',
          isActive: (relData?.isActive as boolean) || false,
        };
      });
      
    } catch (error) {
      console.error('[GraphSync] getUserVisionHistory failed:', error);
      return [];
    }
  }