// ============================================
// proxy.ts (Next.js 16 Proxy)
// Sprint 5 - Checkpoint 9 (Pre-Homepage)
// Supabase Auth Protection for Routes
// FIXED: Export named 'proxy' function (not 'middleware')
// ============================================

import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// CRITICAL: Must be named 'proxy' (not 'middleware')
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};