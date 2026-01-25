// ============================================
// lib/contracts/fog-check.ts
// LOCKED CONTRACT: Frontend + Backend share this
// ============================================

/**
 * Successful Fog Check generation response
 * All fields are guaranteed to exist
 */
export interface FogCheckSuccessResponse {
    success: true; // Literal type for discrimination
    fogCheckId: string;
    observation: string;
    strategicQuestion: string;
    fogCheckType: string;
    tokensAwarded: number;
    newTokenBalance: number;
    transactionId: string;
  }
  
  /**
   * Error response when Fog Check generation fails
   */
  export interface FogCheckErrorResponse {
    success: false; // Literal type for discrimination
    error: string;
  }
  
  /**
   * Discriminated union: response can ONLY be one of these
   * TypeScript can narrow based on `success` field
   */
  export type FogCheckResponse = FogCheckSuccessResponse | FogCheckErrorResponse;