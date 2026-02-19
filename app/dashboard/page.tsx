// ============================================
// app/dashboard/page.tsx
// DASHBOARD: User's command center with Bento Grid layout
// CP24: Each card wrapped in ErrorBoundary (cardMode)
//       One card crash cannot take down the whole dashboard
// ============================================

import { getDashboardData } from '@/app/actions/dashboard';
import { RecoveryDashboard } from '@/components/dashboard/RecoveryDashboard';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { VisionCard } from '@/components/dashboard/cards/VisionCard';
import { ThisWeekCard } from '@/components/dashboard/cards/ThisWeekCard';
import { FogForecastCard } from '@/components/dashboard/cards/FogForecastCard';
import { AscentTrackerCard } from '@/components/dashboard/cards/AscentTrackerCard';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import {
  BentoGrid,
  BentoGridItem,
} from '@/components/ui/bento-grid';

export default async function DashboardPage() {
  // ============================================
  // FETCH ALL DATA VIA SERVER ACTION
  // ============================================
  const dashboardData = await getDashboardData();

  // ============================================
  // RECOVERY MODE: RENDER RECOVERY DASHBOARD
  // ============================================
  if (dashboardData.mode === 'RECOVERY') {
    return (
      <ErrorBoundary>
        <RecoveryDashboard data={dashboardData} />
      </ErrorBoundary>
    );
  }

  // ============================================
  // VISION TRACK: EXTRACT DATA
  // ============================================
  const {
    user,
    vision,
    currentWeek,
    thisWeeksLog,
    stats,
    streakData,
    recentLogs,
    // tokenStats - available but not displayed yet (will use in future checkpoints)
  } = dashboardData;

  // ============================================
  // RENDER VISION TRACK DASHBOARD
  // ============================================
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* ============================================
              HEADER
          ============================================ */}
          <DashboardHeader
            title={`Clear Sky${user.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}.`}
            subtitle={`Week ${currentWeek} of your ascent`}
            tokenBalance={user.tokenBalance}
            currentStreak={streakData.currentStreak}
            mode="ASCENT"
          />

          {/* ============================================
              BENTO GRID LAYOUT
          ============================================ */}
          <BentoGrid>

            {/* VISION CARD — Full Width */}
            <BentoGridItem colSpan={3}>
              <ErrorBoundary cardMode cardTitle="Vision">
                <VisionCard
                  vision={vision}
                  totalLogsCount={stats.totalLogsCount}
                  visionHorizonWeeks={78}
                />
              </ErrorBoundary>
            </BentoGridItem>

            {/* THIS WEEK'S ALTITUDE — 2 cols */}
            <BentoGridItem colSpan={2}>
              <ErrorBoundary cardMode cardTitle="This Week">
                <ThisWeekCard
                  thisWeeksLog={thisWeeksLog}
                  currentWeek={currentWeek}
                />
              </ErrorBoundary>
            </BentoGridItem>

            {/* FOG FORECAST — 1 col */}
            <BentoGridItem colSpan={1}>
              <ErrorBoundary cardMode cardTitle="Fog Forecast">
                <FogForecastCard
                  patterns={dashboardData.fogForecast}
                  isStreakBroken={streakData.currentStreak === 0 && stats.totalLogsCount > 0}
                />
              </ErrorBoundary>
            </BentoGridItem>

            {/* ASCENT TRACKER — Full Width */}
            <BentoGridItem colSpan={3}>
              <ErrorBoundary cardMode cardTitle="Ascent Tracker">
                <AscentTrackerCard
                  logs={recentLogs}
                  currentStreak={streakData.currentStreak}
                  userCreatedAt={user.createdAt}
                />
              </ErrorBoundary>
            </BentoGridItem>

          </BentoGrid>
        </div>
      </div>
    </ErrorBoundary>
  );
}