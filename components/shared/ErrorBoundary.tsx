// ============================================
// components/shared/ErrorBoundary.tsx
// CATCHES REACT RENDER ERRORS
// CP24: Added Sentry capture, card-level fallback variant
// ============================================

'use client';

import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import * as Sentry from '@sentry/nextjs';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  // Card mode: compact error state for bento grid cards
  // instead of full-page takeover
  cardMode?: boolean;
  cardTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Sentry capture — primary error reporting
    Sentry.captureException(error, {
      extra: {
        componentStack: errorInfo.componentStack,
        cardTitle: this.props.cardTitle,
      },
    });

    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    // Custom fallback
    if (this.props.fallback) {
      return this.props.fallback;
    }

    // ── Card mode: compact inline error for bento grid ──
    // Doesn't take over the whole screen — just shows the
    // card in an error state while other cards keep working
    if (this.props.cardMode) {
      return (
        <div className="h-full flex flex-col items-center justify-center gap-3 p-6 text-center">
          <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              {this.props.cardTitle ?? 'This card'} failed to load
            </p>
            <p className="text-xs text-gray-500 mt-1">
              The rest of your dashboard is unaffected.
            </p>
          </div>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <p className="text-[10px] text-red-400 font-mono break-all max-w-full">
              {this.state.error.message}
            </p>
          )}
          <button
            onClick={this.handleReset}
            className="text-xs text-blue-400 hover:text-blue-300 underline underline-offset-2 min-h-[44px] px-3"
          >
            Try again
          </button>
        </div>
      );
    }

    // ── Full page error (default) ───────────────────────
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
      >
        <div className="max-w-md w-full text-center space-y-6">

          <div className="w-20 h-20 mx-auto rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center">
            <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Something went wrong
            </h1>
            <p className="text-gray-400">
              The Ledger encountered an unexpected error.
            </p>
          </div>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-left">
              <p className="text-xs text-red-400 font-mono break-all">
                {this.state.error.message}
              </p>
              {this.state.errorInfo && (
                <details className="mt-2">
                  <summary className="text-xs text-gray-500 cursor-pointer">
                    Stack trace
                  </summary>
                  <pre className="text-xs text-gray-600 mt-2 overflow-auto max-h-40">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button
              onClick={this.handleReset}
              className="w-full min-h-[44px] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
            >
              Try Again
            </Button>
            <Button
              onClick={() => (window.location.href = '/dashboard')}
              variant="outline"
              className="w-full min-h-[44px] border-white/10 hover:bg-white/5"
            >
              Go to Dashboard
            </Button>
          </div>

          <p className="text-xs text-gray-600">
            If this persists, the error has been automatically reported.
          </p>
        </div>
      </div>
    );
  }
}