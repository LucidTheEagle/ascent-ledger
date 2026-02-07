// ============================================
// app/dashboard/page.tsx
// DASHBOARD: User's command center with Bento Grid layout
// UPDATED: Checkpoint 7 - Uses ThisWeekCard component
// ============================================

import { TrendingUp, Coins, Flame } from 'lucide-react';
import Link from 'next/link';
import { getDashboardData } from '@/app/actions/dashboard';
import { RecoveryDashboard } from '@/components/dashboard/RecoveryDashboard';
import { VisionCard } from '@/components/dashboard/cards/VisionCard';
import { ThisWeekCard } from '@/components/dashboard/cards/ThisWeekCard';
import {
  BentoGrid,
  BentoGridItem,
  BentoCardHeader,
  BentoCardContent,
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
              THIS WEEK'S ALTITUDE CARD (2 columns) - NOW COMPONENT
          ============================================ */}
          <BentoGridItem colSpan={2}>
            <ThisWeekCard
              thisWeeksLog={thisWeeksLog}
              currentWeek={currentWeek}
            />
          </BentoGridItem>

          {/* ============================================
              STREAK STATS CARD (1 column)
          ============================================ */}
          <BentoGridItem colSpan={1}>
            <BentoCardHeader
              icon={<Flame className="w-5 h-5 text-orange-400" />}
              title="Streak"
            />
            <BentoCardContent className="justify-center items-center text-center">
              <div className="space-y-4">
                <div>
                  <p className="text-6xl font-bold text-orange-400">
                    {streakData.currentStreak}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Consecutive weeks
                  </p>
                </div>

                {/* Life Lines Display */}
                {streakData.lifeLines > 0 && (
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                      Life Lines
                    </p>
                    <div className="flex items-center justify-center gap-1">
                      {Array.from({ length: streakData.lifeLines }).map((_, i) => (
                        <span key={i} className="text-2xl">🛡️</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Streak Messages */}
                {streakData.currentStreak === 0 && stats.totalLogsCount > 0 && (
                  <p className="text-xs text-amber-500">
                    Streak broken. Log this week to restart.
                  </p>
                )}

                {streakData.currentStreak >= 4 && (
                  <p className="text-xs text-green-400">
                    Milestone reached! Keep the momentum.
                  </p>
                )}
              </div>
            </BentoCardContent>
          </BentoGridItem>

          {/* ============================================
              YOUR ASCENT STATS (Full Width)
          ============================================ */}
          <BentoGridItem colSpan={3}>
            <BentoCardHeader
              icon={<TrendingUp className="w-5 h-5 text-green-400" />}
              title="Your Ascent"
            />
            <BentoCardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Consistency */}
                <div className="p-4 rounded-lg bg-white/5">
                  <p className="text-sm text-gray-500 mb-1">Consistency</p>
                  <p className="text-3xl font-bold text-white">
                    {stats.consistencyPercentage}%
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {stats.totalLogsCount} of {currentWeek} weeks logged
                  </p>
                </div>

                {/* Current Streak */}
                <div className="p-4 rounded-lg bg-white/5">
                  <p className="text-sm text-gray-500 mb-1">Current Streak</p>
                  <p className="text-3xl font-bold text-orange-400">
                    {streakData.currentStreak}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Consecutive weeks
                  </p>
                </div>

                {/* Longest Streak */}
                <div className="p-4 rounded-lg bg-white/5">
                  <p className="text-sm text-gray-500 mb-1">Longest Streak</p>
                  <p className="text-3xl font-bold text-white">
                    {streakData.longestStreak}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Personal best</p>
                </div>
              </div>

              {/* Progress Message */}
              <div className="mt-6 pt-4 border-t border-white/10">
                {stats.totalLogsCount === 0 && (
                  <p className="text-sm text-gray-500">
                    Your ascent begins with the first log. Start today.
                  </p>
                )}

                {stats.totalLogsCount > 0 && streakData.currentStreak === 0 && (
                  <p className="text-sm text-amber-500">
                    Your streak broke. Log this week to restart your chain.
                  </p>
                )}

                {streakData.currentStreak >= 4 && (
                  <p className="text-sm text-green-400">
                    {Math.floor(streakData.currentStreak / 4)} Life Line
                    {Math.floor(streakData.currentStreak / 4) > 1 ? 's' : ''} earned from your consistency!
                  </p>
                )}
              </div>
            </BentoCardContent>
          </BentoGridItem>

        </BentoGrid>
      </div>
    </div>
  );
}