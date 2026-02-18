// ============================================
// app/dashboard/loading.tsx
// UPDATED: CP20 - Skeleton matches actual DashboardHeader structure
// Uses fixed Skeleton component (dark-theme shimmer, not bg-accent)
// ============================================

import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── HEADER SKELETON ──────────────────────────────
            Matches DashboardHeader two-row structure:
            Row 1: title + subtitle
            Row 2: mode badge + token pill + streak pill
        ─────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 mb-6 md:mb-8">
          {/* Title row */}
          <div className="space-y-2">
            <Skeleton className="h-9 w-56 md:w-72" />
            <Skeleton className="h-4 w-36" />
          </div>
          {/* Pills row */}
          <div className="flex items-center gap-2 flex-wrap">
            <Skeleton className="h-[44px] w-24 rounded-lg" />
            <Skeleton className="h-[44px] w-28 rounded-lg" />
            <Skeleton className="h-[44px] w-20 rounded-lg" />
          </div>
        </div>

        {/* ── BENTO GRID SKELETON ──────────────────────────
            Matches exact grid: VisionCard (3), ThisWeek (2),
            FogForecast (1), AscentTracker (3)
        ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">

          {/* Vision Card — full width */}
          <div className="md:col-span-2 lg:col-span-3">
            <Skeleton className="h-44 w-full rounded-2xl" />
          </div>

          {/* This Week — 2 cols */}
          <div className="md:col-span-1 lg:col-span-2">
            <Skeleton className="h-72 w-full rounded-2xl" />
          </div>

          {/* Fog Forecast — 1 col */}
          <div className="md:col-span-1 lg:col-span-1">
            <Skeleton className="h-72 w-full rounded-2xl" />
          </div>

          {/* Ascent Tracker — full width */}
          <div className="md:col-span-2 lg:col-span-3">
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>

        </div>
      </div>
    </div>
  );
}