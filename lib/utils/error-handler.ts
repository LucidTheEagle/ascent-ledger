// ============================================
// lib/utils/error-handler.ts
// CENTRALIZED ERROR HANDLING
// Maps errors to user-friendly messages
// ============================================

import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

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

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: unknown): string {
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
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }

  // Rate limit errors
  if (error instanceof AppError && error.code === 'RATE_LIMIT') {
    return true;
  }

  // Database connection errors
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }

  return false;
}