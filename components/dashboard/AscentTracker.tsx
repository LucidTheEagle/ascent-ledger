// ============================================
// components/dashboard/AscentTracker.tsx
// ASCENT TRACKER: Visual timeline of user's climb
// ============================================

'use client';

import { motion } from 'framer-motion';
import { Mountain } from 'lucide-react';
import Link from 'next/link';
import { useReducedMotion, getStaggerDelay } from '@/hooks/useReducedMotion';

// ============================================
// TYPES
// ============================================

interface LogEntry {
  id: string;
  weekOf: Date;
  leverageBuilt: string;
  learnedInsight: string;
  createdAt: Date;
}

interface AscentTrackerProps {
  logs: LogEntry[];
  currentStreak: number;
  userCreatedAt: Date;
}

// ============================================
// HELPER: Determine if log is part of current streak
// ============================================

function isInCurrentStreak(
  logIndex: number,
  currentStreak: number
): boolean {
  // Logs are sorted desc, so index 0 is most recent
  return logIndex < currentStreak;
}

// ============================================
// HELPER: Check if there's a gap after this log
// ============================================

function hasGapAfter(
  currentLog: LogEntry,
  nextLog: LogEntry | undefined
): boolean {
  if (!nextLog) return false;

  const currentWeek = new Date(currentLog.weekOf).getTime();
  const nextWeek = new Date(nextLog.weekOf).getTime();
  
  // Gap exists if more than 1 week between logs (+ buffer for timezone diffs)
  // Using 8 days as a safe threshold for a "missed week"
  const eightDaysMs = 8 * 24 * 60 * 60 * 1000;
  return (currentWeek - nextWeek) > eightDaysMs;
}

// ============================================
// HELPER: Calculate week number from account creation
// ============================================

function getWeekNumber(logDate: Date, userCreatedAt: Date): number {
  // 1. Reset both dates to Midnight (00:00:00) to ignore time-of-day differences
  const start = new Date(userCreatedAt);
  start.setHours(0, 0, 0, 0);

  const current = new Date(logDate);
  current.setHours(0, 0, 0, 0);

  // 2. Calculate difference in milliseconds
  const diffTime = current.getTime() - start.getTime();

  // 3. Convert to days
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  // 4. Calculate Week:
  // Days 0-6 = Week 1
  // Days 7-13 = Week 2
  // Formula: Floor(Days / 7) + 1
  // We use Math.max(1, ...) to ensure we never show "Week 0" or negative
  return Math.max(1, Math.floor(diffDays / 7) + 1);
}

// ============================================
// COMPONENT
// ============================================

export function AscentTracker({ logs, currentStreak, userCreatedAt }: AscentTrackerProps) {
  const prefersReducedMotion = useReducedMotion();

  // Empty state
  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center">
          <Mountain className="w-8 h-8 text-blue-400" />
        </div>
        <div className="text-center">
          <p className="text-gray-300 text-lg font-medium">
            Your ascent begins here
          </p>
          <p className="text-gray-500 text-sm mt-1">
            Log your first week to start tracking progress
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative pt-2">
      
      {/* Streak Info Badge */}
      {currentStreak > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-end">
            <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 shadow-lg shadow-orange-900/10">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-orange-400" />
                  <div className="absolute inset-0 rounded-full bg-orange-400 animate-ping opacity-75" />
                </div>
                <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                  {currentStreak} Week Streak
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Timeline Container */}
      <div className="space-y-0">
        {logs.map((log, index) => {
          const inStreak = isInCurrentStreak(index, currentStreak);
          const nextLog = logs[index + 1];
          const hasGap = hasGapAfter(log, nextLog);
          const isLatest = index === 0;
          const weekNumber = getWeekNumber(log.weekOf, userCreatedAt);

          return (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: getStaggerDelay(index, prefersReducedMotion),
                ease: 'easeOut',
              }}
              className="relative"
            >
              {/* Timeline Node */}
              <Link
                href={`/log/${log.id}`}
                className="flex items-start gap-4 group cursor-pointer relative z-10"
              >
                {/* Left: Date & Icon Column */}
                <div className="flex flex-col items-center w-16 md:w-20 shrink-0">
                  {/* Week Number & Date */}
                  <div className="text-center mb-2">
                    <p className="text-[10px] md:text-xs text-gray-500">
                      Week {weekNumber}
                    </p>
                    <p className="text-xs md:text-sm font-semibold text-white">
                      {new Date(log.weekOf).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>

                  {/* Node Icon */}
                  <div className="relative z-10">
                    {inStreak ? (
                      <div
                        className={`w-3 h-3 md:w-4 md:h-4 rounded-full ${
                          isLatest
                            ? 'bg-gradient-to-br from-blue-400 to-purple-500 ring-2 md:ring-4 ring-blue-400/20'
                            : 'bg-gradient-to-br from-orange-400 to-red-500'
                        } transition-all group-hover:scale-125`}
                      >
                        {isLatest && (
                          <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-75" />
                        )}
                      </div>
                    ) : (
                      <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-gray-600 transition-all group-hover:scale-125" />
                    )}
                  </div>
                </div>

                {/* Right: Content */}
                <div className="flex-1 pb-8">
                  <div
                    className={`p-4 rounded-lg border transition-all duration-300 ${
                      inStreak
                        ? 'bg-gradient-to-br from-orange-500/5 to-red-500/5 border-orange-500/20 group-hover:border-orange-500/40 group-hover:bg-orange-500/10'
                        : 'bg-white/5 border-white/10 group-hover:border-white/20 group-hover:bg-white/10'
                    }`}
                  >
                    {/* Leverage Preview */}
                    <div className="mb-2">
                      <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block mb-1">
                        Leverage Built
                      </span>
                      <p className="text-sm text-gray-300 line-clamp-2 leading-relaxed">
                        {log.leverageBuilt}
                      </p>
                    </div>

                    {/* Insight Preview */}
                    <div>
                      <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block mb-1">
                        Key Insight
                      </span>
                      <p className="text-xs text-gray-400 line-clamp-1">
                        {log.learnedInsight}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Connecting Line */}
              {index < logs.length - 1 && (
                <div className="absolute left-10 top-12 bottom-0 w-0.5 -ml-px z-0">
                  {hasGap ? (
                    // Dashed line for gaps
                    <div className="w-full h-full border-l-2 border-dashed border-gray-700 opacity-50" />
                  ) : inStreak && isInCurrentStreak(index + 1, currentStreak) ? (
                    // Glowing line for streak
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: '100%' }}
                      transition={{
                        duration: 0.5,
                        delay: getStaggerDelay(index, prefersReducedMotion) + 0.2,
                      }}
                      className="w-full bg-gradient-to-b from-orange-400 to-red-500 relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-orange-400 to-red-500 blur-md opacity-40" />
                    </motion.div>
                  ) : (
                    // Regular line
                    <div className="w-full h-full bg-gray-800" />
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Summit Marker (Account Start) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: getStaggerDelay(logs.length, prefersReducedMotion) + 0.3 }}
        className="flex items-center gap-4 mt-2 opacity-40 hover:opacity-100 transition-opacity"
      >
        <div className="flex flex-col items-center w-20 shrink-0">
          <Mountain className="w-5 h-5 text-gray-500" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-500 font-mono">
            Base Camp · Week 1 · {new Date(userCreatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </motion.div>
    </div>
  );
}