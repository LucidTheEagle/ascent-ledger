// ============================================
// app/error.tsx
// NEXT.JS ERROR PAGE - Route-level error handling
// ============================================


import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Route Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20">
            <AlertTriangle className="w-16 h-16 text-red-400" />
          </div>
        </div>

        {/* Error Message */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-3">
            Page Error
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            This page encountered an error while loading. 
            Try refreshing or return to the dashboard.
          </p>
        </div>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
            <p className="text-xs font-mono text-red-400 break-all mb-2">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs font-mono text-gray-500">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={reset}
            className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Try Again
          </Button>

          <Button
            onClick={() => window.location.href = '/dashboard'}
            variant="outline"
            className="w-full h-12 border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            <Home className="w-5 h-5 mr-2" />
            Go to Dashboard
          </Button>
        </div>

      </div>
    </div>
  );
}