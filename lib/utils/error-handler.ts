// ============================================
// lib/utils/error-handler.ts
// CENTRALIZED ERROR HANDLING
// Maps errors to user-friendly messages
// UPDATED: Checkpoint 13 - Service-specific handling
// ============================================

import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import * as Sentry from '@sentry/nextjs';

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// ============================================
// CHECKPOINT 13: Service-specific error types
// ============================================

export type ServiceName = 'FalkorDB' | 'Groq' | 'Supabase' | 'Prisma';

interface ErrorContext {
  service: ServiceName;
  operation: string;
  userId?: string;
  additionalData?: Record<string, unknown>;
}

/**
 * CHECKPOINT 13: Log error to Sentry with context
 */
export function logError(error: Error | unknown, context: ErrorContext): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  console.error(`[${context.service}] ${context.operation} failed:`, errorMessage);

  // Send to Sentry (only if configured)
  try {
    Sentry.captureException(error, {
      tags: {
        service: context.service,
        operation: context.operation,
      },
      user: context.userId ? { id: context.userId } : undefined,
      extra: context.additionalData,
    });
  } catch (sentryError) {
    // Sentry not configured - that's ok
    console.warn('[Sentry] Not configured or failed to send error');
  }
}

/**
 * CHECKPOINT 13: Check if error is a rate limit error
 */
export function isRateLimitError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('rate limit') ||
      message.includes('too many requests') ||
      message.includes('429')
    );
  }
  if (error instanceof AppError && error.code === 'RATE_LIMIT') {
    return true;
  }
  return false;
}

/**
 * CHECKPOINT 13: Check if error is a timeout error
 */
export function isTimeoutError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('timeout') ||
      message.includes('timed out') ||
      message.includes('etimedout')
    );
  }
  return false;
}

/**
 * CHECKPOINT 13: Check if error is a connection error
 */
export function isConnectionError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('connection') ||
      message.includes('econnrefused') ||
      message.includes('network') ||
      message.includes('fetch failed')
    );
  }
  return false;
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: unknown): string {
  // CHECKPOINT 13: Rate limit errors
  if (isRateLimitError(error)) {
    return 'Our AI service is currently busy. Please try again in a few minutes.';
  }

  // CHECKPOINT 13: Timeout errors
  if (isTimeoutError(error)) {
    return 'The request took too long. Please try again.';
  }

  // CHECKPOINT 13: Connection errors
  if (isConnectionError(error)) {
    return 'Connection issue. Please check your internet and try again.';
  }

  // Known AppError
  if (error instanceof AppError) {
    return error.message;
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return 'This record already exists. Please try a different value.';
      case 'P2025':
        return 'Record not found. It may have been deleted.';
      case 'P2003':
        return 'Related record not found. Please check your data.';
      default:
        return 'Database error. Please try again.';
    }
  }

  // Prisma connection errors
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return 'Unable to connect to database. Please try again later.';
  }

  // Fetch errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return 'Network error. Please check your connection.';
  }

  // Generic Error
  if (error instanceof Error) {
    // Don't expose internal errors in production
    if (process.env.NODE_ENV === 'production') {
      return 'An unexpected error occurred. Please try again.';
    }
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Get appropriate HTTP status code
 */
export function getStatusCode(error: unknown): number {
  if (error instanceof AppError) {
    return error.statusCode;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': // Unique constraint
        return 409;
      case 'P2025': // Record not found
        return 404;
      default:
        return 500;
    }
  }

  return 500;
}

/**
 * Create standardized error response
 */
export function createErrorResponse(error: unknown) {
  const message = getUserFriendlyMessage(error);
  const statusCode = getStatusCode(error);

  // Log error (but don't expose to client)
  console.error('[Error Handler]', error);

  return NextResponse.json(
    {
      success: false,
      error: message,
      // Include error code in dev mode
      ...(process.env.NODE_ENV === 'development' && {
        details: error instanceof Error ? error.message : String(error),
      }),
    },
    { status: statusCode }
  );
}

/**
 * Retry utility for transient failures
 * UPDATED: Checkpoint 13 - Enhanced with backoff options
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    delayMs?: number;
    exponentialBackoff?: boolean;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delayMs = 1000,
    exponentialBackoff = true,
  } = options;

  let lastError: Error | unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx)
      if (error instanceof AppError && error.statusCode < 500) {
        throw error;
      }

      // CHECKPOINT 13: Don't retry rate limits
      if (isRateLimitError(error)) {
        throw error;
      }

      // Last attempt, throw error
      if (attempt === maxRetries - 1) {
        throw error;
      }

      // Wait before retry
      const delay = exponentialBackoff
        ? delayMs * Math.pow(2, attempt)
        : delayMs;

      console.warn(`[Retry] Attempt ${attempt + 1}/${maxRetries} failed. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * CHECKPOINT 13: Alias for backward compatibility
 */
export const retryWithBackoff = withRetry;

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }

  // Rate limit errors (retryable but need longer delay)
  if (isRateLimitError(error)) {
    return true;
  }

  // Timeout errors
  if (isTimeoutError(error)) {
    return true;
  }

  // Connection errors
  if (isConnectionError(error)) {
    return true;
  }

  // Database connection errors
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }

  return false;
}