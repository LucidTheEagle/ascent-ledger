// ============================================
// lib/ai/groq-client.ts
// THE VOICE: Groq API Client for Fog Check Generation
// Uses Llama 3.3 70B for strategic insights
// UPDATED: Fixed return type (no fogCheckType in base response)
// ============================================

import Groq from 'groq-sdk';

// Initialize Groq client
export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Generate a Fog Check using Groq's Llama 3.3 70B
 * Returns structured JSON response
 * 
 * @param systemPrompt - The full prompt with context
 * @param options - Generation configuration
 * @returns Parsed JSON response (observation + strategicQuestion only)
 * @throws Error if API fails (caller handles gracefully)
 */
export async function generateFogCheck(
  systemPrompt: string,
  options: {
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<{
  observation: string;
  strategicQuestion: string;
}> {
  const {
    temperature = 0.7, // Balanced creativity vs consistency
    maxTokens = 500,   // Keep responses concise
  } = options;

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile', // Latest stable model
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
      ],
      temperature,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' }, // Force JSON output
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content in Groq response');
    }

    // Parse JSON response
    const parsed = JSON.parse(content);

    // Validate required fields
    if (!parsed.observation || !parsed.strategicQuestion) {
      throw new Error('Invalid Fog Check format: missing required fields');
    }

    return {
      observation: parsed.observation.trim(),
      strategicQuestion: parsed.strategicQuestion.trim(),
    };

  } catch (error) {
    console.error('Groq API error:', error);

    if (error instanceof Groq.APIError) {
      console.error('Groq API Error Details:', {
        status: error.status,
        message: error.message,
      });

      // ============================================
      // ENHANCED ERROR HANDLING
      // ============================================

      // Rate limit (429) - Groq free tier: 30 RPM
      if (error.status === 429) {
        throw new Error(
          'AI service is currently at capacity. Please try again in 1 minute.'
        );
      }

      // Model deprecated/not found (400)
      if (
        error.message.includes('decommissioned') || 
        error.message.includes('not found') ||
        error.message.includes('does not exist')
      ) {
        throw new Error(
          'AI model configuration error. Please contact support.'
        );
      }

      // Authentication error (401)
      if (error.status === 401) {
        throw new Error(
          'AI service authentication failed. Please contact support.'
        );
      }

      // Server error (500+)
      if (error.status && error.status >= 500) {
        throw new Error(
          'AI service is temporarily unavailable. Please try again later.'
        );
      }

      // Generic API error
      throw new Error(
        `AI service error: ${error.message || 'Unknown error occurred'}`
      );
    }

    // JSON parsing error
    if (error instanceof SyntaxError) {
      throw new Error(
        'AI returned invalid response format. Please try again.'
      );
    }

    // Network/timeout errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(
        'Network error connecting to AI service. Please check your connection.'
      );
    }

    // Re-throw original error if not handled above
    throw error;
  }
}

/**
 * Test Groq API connection
 * Useful for debugging and health checks
 * 
 * @returns true if API is working, false otherwise
 */
export async function testGroqConnection(): Promise<boolean> {
  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'Respond with exactly: {"status": "connected"}',
        },
      ],
      max_tokens: 20,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return false;

    const parsed = JSON.parse(content);
    return parsed.status === 'connected';

  } catch (error) {
    console.error('Groq connection test failed:', error);
    return false;
  }
}

/**
 * Get Groq rate limit info from response headers
 * Useful for monitoring usage and preventing rate limit errors
 * 
 * @param response - Fetch API Response object
 * @returns Rate limit info or null if unavailable
 */
export function getRateLimitInfo(
  response: Response
): {
  limit: number;
  remaining: number;
  reset: Date;
} | null {
  try {
    const headers = response.headers;
    if (!headers) return null;

    return {
      limit: Number(headers.get('x-ratelimit-limit') ?? 0),
      remaining: Number(headers.get('x-ratelimit-remaining') ?? 0),
      reset: new Date(
        Number(headers.get('x-ratelimit-reset') ?? 0) * 1000
      ),
    };
  } catch {
    return null;
  }
}

/**
 * Check if Groq API is configured properly
 * Call this during app initialization
 * 
 * @returns true if API key is set, false otherwise
 */
export function isGroqConfigured(): boolean {
  return !!process.env.GROQ_API_KEY;
}

/**
 * Get current Groq model being used
 * Useful for debugging and logging
 */
export function getGroqModel(): string {
  return 'llama-3.3-70b-versatile';
}

/**
 * Groq API configuration constants
 */
export const GROQ_CONFIG = {
  MODEL: 'llama-3.3-70b-versatile',
  MODEL_VERSION: '2024-01',
  FREE_TIER_RPM: 30, // Requests per minute
  FREE_TIER_RPD: 14400, // Requests per day
  MAX_TOKENS: 8000, // Model context window
  DEFAULT_TEMPERATURE: 0.7,
  DEFAULT_MAX_TOKENS: 500,
} as const