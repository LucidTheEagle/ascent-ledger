// ============================================
// app/dashboard/page.tsx
// DASHBOARD: User's command center with Bento Grid layout
// REFACTORED: Sprint 4 Checkpoint 5 - Uses Server Action + Bento Grid
// FIXED: Removed unused imports and variables
// ============================================

import { Sparkles, Target, TrendingUp, Coins, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getDashboardData } from '@/app/actions/dashboard';
import { RecoveryDashboard } from '@/components/dashboard/RecoveryDashboard';
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
            <BentoCardHeader
              icon={<Sparkles className="w-5 h-5" />}
              title="Your Vision"
              action={
                <Link 
                  href="/vision-canvas" 
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Edit →
                </Link>
              }
            />
            <BentoCardContent>
              <p className="text-gray-300 leading-relaxed">
                {vision.aiSynthesis}
              </p>
            </BentoCardContent>
          </BentoGridItem>

          {/* ============================================
              THIS WEEK'S LOG CARD (2 columns on desktop)
          ============================================ */}
          <BentoGridItem colSpan={2}>
            <BentoCardHeader
              icon={<Target className="w-5 h-5 text-purple-400" />}
              title="This Week's Log"
            />
            <BentoCardContent>
              {thisWeeksLog ? (
                // User HAS logged this week
                <div className="space-y-6">
                  {/* Log Preview */}
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Leverage Built
                      </p>
                      <p className="text-gray-300 line-clamp-2">
                        {thisWeeksLog.leverageBuilt}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Learned Insight
                      </p>
                      <p className="text-gray-300 line-clamp-2">
                        {thisWeeksLog.learnedInsight}
                      </p>
                    </div>
                  </div>

                  {/* Fog Check Preview */}
                  {thisWeeksLog.fogCheck && (
                    <div className="pt-4 border-t border-white/10">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                        <p className="text-sm text-purple-400 font-semibold">
                          Your Fog Check
                        </p>
                      </div>
                      <p className="text-gray-400 italic line-clamp-3">
                        &quot;{thisWeeksLog.fogCheck.observation}&quot;
                      </p>
                      <Link
                        href={`/log/fog-check/${thisWeeksLog.id}/result`}
                        className="inline-block mt-3 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        View full Fog Check →
                      </Link>
                    </div>
                  )}

                  {/* Logged timestamp */}
                  <p className="text-xs text-gray-600 mt-auto">
                    Logged {new Date(thisWeeksLog.createdAt).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              ) : (
                // User has NOT logged this week (Empty State)
                <div className="flex-1 flex flex-col items-center justify-center text-center py-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <Target className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-gray-300 text-lg font-medium">
                      You haven&apos;t logged yet this week.
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      Your vision is waiting.
                    </p>
                  </div>
                  
                  <Link href="/log/new">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-6 text-lg min-h-[44px]">
                      Log This Week →
                    </Button>
                  </Link>
                </div>
              )}
            </BentoCardContent>
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