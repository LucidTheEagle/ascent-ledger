// ============================================
// app/dashboard/page.tsx
// DASHBOARD: User's command center
// Updated for Sprint 2: Shows latest log + Fog Check
// Updated for Sprint 3 Checkpoint 7: Recovery Mode support
// ============================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { Sparkles, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getCurrentWeekStartDate, getAscentWeek } from '@/lib/utils/week-calculator';
import { RecoveryDashboard } from '@/components/dashboard/RecoveryDashboard';

// NOTE: RecoveryDashboard import removed to avoid module-not-found error.

export default async function DashboardPage() {
  // ============================================
  // 1. AUTHENTICATION
  // ============================================
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  // ============================================
  // 2. CHECK OPERATING MODE (NEW - CHECKPOINT 7)
  // ============================================
  const userProfile = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      operatingMode: true,
      tokenBalance: true,
      currentStreak: true,
      longestStreak: true,
      fullName: true,
      createdAt: true,
    },
  });

  // IF RECOVERY MODE, SHOW RECOVERY DASHBOARD
  if (userProfile?.operatingMode === 'RECOVERY') {
    return <RecoveryDashboard />;
  }

  // ============================================
  // 3. VISION TRACK - CHECK VISION CANVAS
  // ============================================
  const visionCanvas = await prisma.visionCanvas.findFirst({
    where: {
      userId: user.id,
      isActive: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!visionCanvas) {
    redirect('/vision-canvas');
  }

  // ============================================
  // 4. FETCH ADDITIONAL DATA (Vision Track)
  // ============================================
  const currentWeek = getAscentWeek(userProfile?.createdAt || new Date());
  const weekStartDate = getCurrentWeekStartDate();

  // ============================================
  // 5. CHECK IF USER LOGGED THIS WEEK
  // ============================================
  const thisWeeksLog = await prisma.strategicLog.findFirst({
    where: {
      userId: user.id,
      weekOf: weekStartDate,
    },
    include: {
      fogChecks: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  // ============================================
  // 6. CALCULATE STATS
  // ============================================
  const totalLogs = await prisma.strategicLog.count({
    where: { userId: user.id },
  });

  const consistencyPercent = currentWeek > 0 
    ? Math.round((totalLogs / currentWeek) * 100)
    : 0;

  // ============================================
  // 7. RENDER VISION TRACK DASHBOARD
  // ============================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Clear Sky{userProfile?.fullName ? `, ${userProfile.fullName.split(' ')[0]}` : ''}.
            </h1>
            <p className="text-gray-400 mt-1">
              Week {currentWeek} of your ascent
            </p>
          </div>
          
          {/* Stats Pills */}
          <div className="flex items-center gap-4">
            {/* Token Balance */}
            <div className="px-4 py-3 rounded-lg bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20">
              <p className="text-xs text-amber-400/70 uppercase tracking-wide">Tokens</p>
              <p className="text-2xl font-bold text-amber-400">{userProfile?.tokenBalance || 0}</p>
            </div>
            
            {/* Streak */}
            <div className="px-4 py-3 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
              <p className="text-xs text-orange-400/70 uppercase tracking-wide">Streak</p>
              <p className="text-2xl font-bold text-orange-400">
                {userProfile?.currentStreak || 0} 🔥
              </p>
            </div>
          </div>
        </div>

        {/* Vision Card */}
        <div className="glass-panel rounded-2xl border border-white/10 p-8 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">Your Vision</h2>
            </div>
            <Link 
              href="/vision-canvas" 
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Edit →
            </Link>
          </div>
          <p className="text-gray-300 leading-relaxed">
            {visionCanvas.aiSynthesis}
          </p>
        </div>

        {/* This Week's Log Card */}
        <div className="glass-panel rounded-2xl border border-white/10 p-8 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">This Week&apos;s Log</h2>
          </div>
          
          {thisWeeksLog ? (
            // User HAS logged this week
            <div className="space-y-6">
              {/* Log Preview */}
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Leverage Built</p>
                  <p className="text-gray-300 line-clamp-2">{thisWeeksLog.leverageBuilt}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Learned Insight</p>
                  <p className="text-gray-300 line-clamp-2">{thisWeeksLog.learnedInsight}</p>
                </div>
              </div>

              {/* Fog Check Preview (if exists) */}
              {thisWeeksLog.fogChecks[0] && (
                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                    <p className="text-sm text-purple-400 font-semibold">Your Fog Check</p>
                  </div>
                  <p className="text-gray-400 italic line-clamp-3">
                    &apos;{thisWeeksLog.fogChecks[0].observation}&apos;
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
              <p className="text-xs text-gray-600">
                Logged {new Date(thisWeeksLog.createdAt).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          ) : (
            // User has NOT logged this week
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-purple-500/10 flex items-center justify-center">
                <Target className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <p className="text-gray-300 text-lg font-medium">You haven&apos;t logged yet this week.</p>
                <p className="text-gray-500 text-sm mt-1">Your vision is waiting.</p>
              </div>
              
              <Link href="/log/new">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-6 text-lg">
                  Log This Week →
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Your Ascent Stats */}
        <div className="glass-panel rounded-2xl border border-white/10 p-8 space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <h2 className="text-xl font-semibold text-white">Your Ascent</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Consistency */}
            <div className="p-4 rounded-lg bg-white/5">
              <p className="text-sm text-gray-500 mb-1">Consistency</p>
              <p className="text-3xl font-bold text-white">{consistencyPercent}%</p>
              <p className="text-xs text-gray-600 mt-1">
                {totalLogs} of {currentWeek} weeks logged
              </p>
            </div>

            {/* Current Streak */}
            <div className="p-4 rounded-lg bg-white/5">
              <p className="text-sm text-gray-500 mb-1">Current Streak</p>
              <p className="text-3xl font-bold text-orange-400">
                {userProfile?.currentStreak || 0} 🔥
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Consecutive weeks
              </p>
            </div>

            {/* Longest Streak */}
            <div className="p-4 rounded-lg bg-white/5">
              <p className="text-sm text-gray-500 mb-1">Longest Streak</p>
              <p className="text-3xl font-bold text-white">
                {userProfile?.longestStreak || 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Personal best
              </p>
            </div>
          </div>

          {/* Progress Message */}
          {totalLogs === 0 && (
            <div className="pt-4 border-t border-white/10">
              <p className="text-sm text-gray-500">
                📈 Your ascent begins with the first log. Start today.
              </p>
            </div>
          )}

          {totalLogs > 0 && userProfile?.currentStreak === 0 && (
            <div className="pt-4 border-t border-white/10">
              <p className="text-sm text-amber-500">
                ⚠️ Your streak broke. Log this week to restart your chain.
              </p>
            </div>
          )}

          {(userProfile?.currentStreak || 0) >= 4 && (
            <div className="pt-4 border-t border-white/10">
              <p className="text-sm text-green-400">
                🎉 {Math.floor((userProfile?.currentStreak || 0) / 4)} Life Line{Math.floor((userProfile?.currentStreak || 0) / 4) > 1 ? 's' : ''} earned from your consistency!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}