// ============================================
// app/dashboard/loading.tsx
// LOADING SKELETON: Bento Grid skeleton for dashboard
// Sprint 4 - Checkpoint 5
// ============================================

import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64 bg-white/5" />
            <Skeleton className="h-4 w-40 bg-white/5" />
          </div>
          
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-24 bg-white/5 rounded-lg" />
            <Skeleton className="h-16 w-24 bg-white/5 rounded-lg" />
          </div>
        </div>

        {/* Bento Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Large card (full width on desktop) */}
          <div className="md:col-span-2 lg:col-span-3">
            <Skeleton className="h-48 w-full bg-white/5 rounded-2xl" />
          </div>

          {/* Medium cards */}
          <div className="md:col-span-1">
            <Skeleton className="h-80 w-full bg-white/5 rounded-2xl" />
          </div>
          
          <div className="md:col-span-1">
            <Skeleton className="h-80 w-full bg-white/5 rounded-2xl" />
          </div>

          <div className="md:col-span-1">
            <Skeleton className="h-80 w-full bg-white/5 rounded-2xl" />
          </div>

          {/* Stats card (spans 2 columns) */}
          <div className="md:col-span-2 lg:col-span-3">
            <Skeleton className="h-64 w-full bg-white/5 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}