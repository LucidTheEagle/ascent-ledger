// ============================================
// app/dashboard/page.tsx
// DASHBOARD: User's command center with Bento Grid layout
// UPDATED: Checkpoint 9 - Added Ascent Tracker
// ============================================

import { Coins, Flame } from 'lucide-react';
import { getDashboardData } from '@/app/actions/dashboard';
import { RecoveryDashboard } from '@/components/dashboard/RecoveryDashboard';
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
            HEADER
        ============================================ */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Clear Sky{user.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}.
            </h1>
            <p className="text-gray-400 mt-1">
              Week {currentWeek} of your ascent
            </p>
          </div>
          
          {/* Stats Pills */}
          <div className="flex items-center gap-4">
            {/* Token Balance */}
            <div className="px-4 py-3 rounded-lg bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-400" />
                <div>
                  <p className="text-xs text-amber-400/70 uppercase tracking-wide">Tokens</p>
                  <p className="text-2xl font-bold text-amber-400">{user.tokenBalance}</p>
                </div>
              </div>
            </div>
            
            {/* Streak */}
            <div className="px-4 py-3 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-400" />
                <div>
                  <p className="text-xs text-orange-400/70 uppercase tracking-wide">Streak</p>
                  <p className="text-2xl font-bold text-orange-400">
                    {user.currentStreak}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

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
              ASCENT TRACKER (Full Width) - NEW
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