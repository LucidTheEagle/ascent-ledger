// ============================================
// ASCENT LEDGER - POSTHOG EVENT TRACKING
// ============================================
// Sprint 5 - Checkpoint 6: Type-Safe Analytics
// Track critical user events: Sign Up, Log Submitted, Vision Created
// ============================================

import { posthog } from './client';

// ============================================
// EVENT TYPES
// ============================================

export type AscentEvent = 
  | 'sign_up'
  | 'login'
  | 'log_submitted'
  | 'vision_created'
  | 'vision_updated'
  | 'fog_check_completed'
  | 'mode_switched'
  | 'crisis_protocol_started'
  | 'recovery_checkin_completed'
  | 'tokens_earned'
  | 'dashboard_viewed';

// ============================================
// EVENT PROPERTIES
// ============================================

interface SignUpProperties {
  method?: 'email' | 'google' | 'github';
  referrer?: string;
}

interface LogSubmittedProperties {
  week_of: string;
  has_leverage: boolean;
  is_survival_mode: boolean;
  word_count?: number;
}

interface VisionCreatedProperties {
  version: number;
  has_ai_synthesis: boolean;
}

interface ModeSwitchedProperties {
  from_mode: 'ASCENT' | 'RECOVERY';
  to_mode: 'ASCENT' | 'RECOVERY';
  reason?: string;
}

interface TokensEarnedProperties {
  amount: number;
  transaction_type: string;
  new_balance: number;
}

// ============================================
// TRACKING FUNCTIONS
// ============================================

export const analytics = {
  // User Authentication
  trackSignUp: (properties?: SignUpProperties) => {
    posthog.capture('sign_up', properties);
  },

  trackLogin: () => {
    posthog.capture('login');
  },

  // Core Features (Sprint 5 Priority)
  trackLogSubmitted: (properties: LogSubmittedProperties) => {
    posthog.capture('log_submitted', properties);
  },

  trackVisionCreated: (properties: VisionCreatedProperties) => {
    posthog.capture('vision_created', properties);
  },

  trackVisionUpdated: (properties: VisionCreatedProperties) => {
    posthog.capture('vision_updated', properties);
  },

  // Fog Check
  trackFogCheckCompleted: (properties?: { has_reflection: boolean }) => {
    posthog.capture('fog_check_completed', properties);
  },

  // Mode & Crisis
  trackModeSwitched: (properties: ModeSwitchedProperties) => {
    posthog.capture('mode_switched', properties);
  },

  trackCrisisProtocolStarted: (properties?: { crisis_type: string }) => {
    posthog.capture('crisis_protocol_started', properties);
  },

  trackRecoveryCheckinCompleted: (properties?: { oxygen_level: number }) => {
    posthog.capture('recovery_checkin_completed', properties);
  },

  // Token Economy
  trackTokensEarned: (properties: TokensEarnedProperties) => {
    posthog.capture('tokens_earned', properties);
  },

  // Page Views
  trackDashboardViewed: () => {
    posthog.capture('dashboard_viewed');
  },

  // Identify User (call after login/signup)
  identifyUser: (userId: string, properties?: Record<string, unknown>) => {
    posthog.identify(userId, properties);
  },

  // Reset User (call on logout)
  resetUser: () => {
    posthog.reset();
  },
};