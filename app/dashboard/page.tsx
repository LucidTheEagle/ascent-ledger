// ============================================
// app/dashboard/page.tsx
// DASHBOARD: User's command center with Bento Grid layout
// UPDATED: Checkpoint 10 - Extracted header to DashboardHeader component
// ============================================

import { getDashboardData } from '@/app/actions/dashboard';
import { RecoveryDashboard } from '@/components/dashboard/RecoveryDashboard';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { VisionCard } from '@/components/dashboard/cards/VisionCard';
import { ThisWeekCard } from '@/components/dashboard/cards/ThisWeekCard';
import { FogForecastCard } from '@/components/dashboard/cards/FogForecastCard';
import { AscentTrackerCard } from '@/components/dashboard/cards/AscentTrackerCard';
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
    return <RecoveryDashboard data={dashboardData} />;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* ============================================
            HEADER (Now extracted to component)
        ============================================ */}
        <DashboardHeader
          title={`Clear Sky${user.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}.`}
          subtitle={`Week ${currentWeek} of your ascent`}
          tokenBalance={user.tokenBalance}
          currentStreak={streakData.currentStreak}
        />

        {/* ============================================
            BENTO GRID LAYOUT
        ============================================ */}
        <BentoGrid>
          
          {/* ============================================
              VISION CARD (Full Width)
          ============================================ */}
          <BentoGridItem colSpan={3}>
            <VisionCard
              vision={vision}
              totalLogsCount={stats.totalLogsCount}
              visionHorizonWeeks={78}
            />
          </BentoGridItem>

          {/* ============================================
              THIS WEEK'S ALTITUDE CARD (2 columns)
          ============================================ */}
          <BentoGridItem colSpan={2}>
            <ThisWeekCard
              thisWeeksLog={thisWeeksLog}
              currentWeek={currentWeek}
            />
          </BentoGridItem>

          {/* ============================================
              FOG FORECAST CARD (1 column)
          ============================================ */}
          <BentoGridItem colSpan={1}>
            <FogForecastCard
              patterns={dashboardData.fogForecast}
              isStreakBroken={streakData.currentStreak === 0 && stats.totalLogsCount > 0}
            />
          </BentoGridItem>

          {/* ============================================
              ASCENT TRACKER (Full Width)
          ============================================ */}
          <BentoGridItem colSpan={3}>
            <AscentTrackerCard
              logs={recentLogs}
              currentStreak={streakData.currentStreak}
              userCreatedAt={user.createdAt}
            />
          </BentoGridItem>

        </BentoGrid>
      </div>
    </div>
  );
}