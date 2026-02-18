// ============================================
// components/dashboard/RecoveryDashboard.tsx
// RECOVERY MODE DASHBOARD
// ENHANCED: OxygenGauge + EscapeVelocityProgress + DailyAnchor
// ============================================

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { OxygenGauge } from "@/components/dashboard/OxygenGauge";
import { EscapeVelocityProgress } from "@/components/dashboard/EscapeVelocityProgress";
import { DailyAnchor } from "@/components/dashboard/DailyAnchor";
import {
  Shield,
  CheckCircle,
  Circle,
  Calendar,
  TrendingUp,
  AlertCircle,
  Check,
  Sparkles,
} from "lucide-react";
import type { RecoveryTrackDashboardData } from "@/lib/dashboard-types";
import {
  BentoGrid,
  BentoGridItem,
  BentoCardHeader,
  BentoCardContent,
} from "@/components/ui/bento-grid";

interface RecoveryDashboardProps {
  data: RecoveryTrackDashboardData;
}

export function RecoveryDashboard({ data }: RecoveryDashboardProps) {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const {
    user,
    protocol,
    latestCheckin,
    latestFogCheck,
    weeksSinceStart,
    hasLoggedThisWeek,
    streakData,
    transitionEligibility,
  } = data;

  const handleTransitionToVision = async () => {
    if (!protocol || !transitionEligibility.isEligible) return;
    setIsTransitioning(true);

    try {
      const response = await fetch("/api/transition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ protocolId: protocol.id }),
      });
      const result = await response.json();

      if (result.success) {
        const visionCanvasUrl = "/vision-canvas?transitioned=true";
        router.push(
          `/token-payday?amount=${result.tokensAwarded}&newBalance=${result.newBalance}&reason=CRISIS_EXIT&redirect=${encodeURIComponent(visionCanvasUrl)}`
        );
      } else {
        alert(result.error || "Failed to transition. Please try again.");
      }
    } catch (error) {
      console.error("Error transitioning:", error);
      alert("Failed to transition. Please try again.");
    } finally {
      setIsTransitioning(false);
    }
  };

  // ── Empty state ────────────────────────────────────────
  if (!protocol) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12 space-y-6">
            <Shield className="h-16 w-16 text-gray-600 mx-auto" aria-hidden="true" />
            <h2 className="text-2xl font-semibold text-white">No Active Protocol</h2>
            <p className="text-gray-400">
              Start a crisis triage to activate recovery mode.
            </p>
            <Button
              onClick={() => router.push("/crisis-triage")}
              className="bg-amber-500 hover:bg-amber-600 min-h-[44px]"
            >
              Start Crisis Triage
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── HEADER ─────────────────────────────────── */}
        <DashboardHeader
          title="Recovery Mode"
          subtitle={`Mission: Conservation · Week ${weeksSinceStart}`}
          tokenBalance={user.tokenBalance}
          currentStreak={streakData.currentStreak}
          mode="RECOVERY"
          icon={<Shield className="h-8 w-8 text-amber-500" aria-hidden="true" />}
        />

        {/* ── DAILY ANCHOR (replaces plain crisis type badge) ── */}
        <DailyAnchor crisisType={protocol.crisisType} />

        {/* ── BENTO GRID ─────────────────────────────── */}
        <BentoGrid>

          {/* ── TRANSITION OFFER (full width, if eligible) ── */}
          {transitionEligibility.isEligible && (
            <BentoGridItem colSpan={3}>
              <div className="flex items-start gap-4 flex-wrap sm:flex-nowrap">
                <Sparkles className="h-8 w-8 text-green-400 shrink-0" aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-green-400 mb-2">
                    Recovery Complete
                  </h3>
                  <p className="text-gray-300 mb-4">
                    {transitionEligibility.message}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handleTransitionToVision}
                      disabled={isTransitioning}
                      className="bg-green-500 hover:bg-green-600 min-h-[44px] w-full sm:w-auto"
                      aria-label="Transition to Vision Track and earn 150 tokens"
                    >
                      {isTransitioning
                        ? "Transitioning..."
                        : "I'm Ready — Build My Vision (+150 tokens)"}
                    </Button>
                    <Button
                      onClick={() => router.refresh()}
                      variant="outline"
                      className="border-green-500/50 text-green-400 hover:bg-green-500/10 min-h-[44px] w-full sm:w-auto"
                    >
                      Not Yet — Keep Recovering
                    </Button>
                  </div>
                </div>
              </div>
            </BentoGridItem>
          )}

          {/* ── OXYGEN GAUGE + ESCAPE VELOCITY (side by side on md+) ── */}
          {/* 
            Enhancement: These two new components replace the plain
            "Recovery Tracker" 1-col card. Oxygen Gauge gets its own
            card, Escape Velocity gets its own card.
          */}
          <BentoGridItem colSpan={1}>
            <BentoCardHeader
              icon={<TrendingUp className="w-5 h-5 text-green-500" />}
              title="Oxygen Level"
            />
            <BentoCardContent className="items-center justify-center py-2">
              <OxygenGauge
                level={protocol.oxygenLevelCurrent}
                startLevel={protocol.oxygenLevelStart ?? null}
              />

              {/* Recovery weeks stat below gauge */}
              <div className="mt-4 pt-4 border-t border-white/10 w-full text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                  Weeks in Recovery
                </p>
                <p className="text-2xl font-bold text-white">{weeksSinceStart}</p>
              </div>

              {/* Streak */}
              {streakData.currentStreak > 0 && (
                <div className="mt-3 text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Check-in Streak
                  </p>
                  <p className="text-xl font-bold text-orange-400">
                    {streakData.currentStreak} 🔥
                  </p>
                </div>
              )}
            </BentoCardContent>
          </BentoGridItem>

          <BentoGridItem colSpan={2}>
            <BentoCardHeader
              icon={<Sparkles className="w-5 h-5 text-blue-400" />}
              title="Escape Velocity"
            />
            <BentoCardContent className="justify-center">
              <EscapeVelocityProgress
                weeksStable={transitionEligibility.weeksStable}
                daysInRecovery={transitionEligibility.daysInRecovery}
                has14DaysPassed={transitionEligibility.has14DaysPassed}
                isEligible={transitionEligibility.isEligible}
                blockers={transitionEligibility.blockers}
              />
            </BentoCardContent>
          </BentoGridItem>

          {/* ── CRISIS SURGEON ASSESSMENT (2 cols, if exists) ── */}
          {latestFogCheck && (
            <BentoGridItem colSpan={2}>
              <BentoCardHeader
                icon={<AlertCircle className="w-5 h-5 text-red-400" />}
                title="Crisis Surgeon Assessment"
              />
              <BentoCardContent>
                <p className="text-xs text-gray-500 mb-3">
                  {new Date(latestFogCheck.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>

                <div className="mb-4 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                  <p className="text-sm text-gray-400">
                    <strong className="text-red-400">Emergency Room Doctor</strong> —
                    Tactical, directive feedback focused on survival. No philosophy. No
                    5-year plans. Just: stop the bleeding.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-red-400 font-semibold mb-2">
                      Clinical Observation:
                    </p>
                    <p className="text-gray-300 leading-relaxed">
                      {latestFogCheck.observation}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-sm text-red-400 font-semibold mb-2">
                      Immediate Directive:
                    </p>
                    <p className="text-white font-medium">
                      {latestFogCheck.strategicQuestion}
                    </p>
                  </div>
                </div>
              </BentoCardContent>
            </BentoGridItem>
          )}

          {/* ── PROTOCOL STATUS ────────────────────────── */}
          <BentoGridItem colSpan={latestFogCheck ? 1 : 2}>
            <BentoCardHeader
              icon={<Shield className="w-5 h-5 text-amber-500" />}
              title="Your Protocol"
            />
            <BentoCardContent>
              <div className="space-y-4">

                {/* Burden to cut */}
                <div className="flex items-start gap-3">
                  {protocol.isBurdenCut ? (
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" aria-hidden="true" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-500 shrink-0 mt-0.5" aria-hidden="true" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-400 mb-1">Cut</p>
                    <p className="text-white break-words">{protocol.burdenToCut}</p>
                    {!protocol.isBurdenCut && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2 min-h-[44px]"
                        onClick={async () => {
                          await fetch("/api/crisis-protocol", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              protocolId: protocol.id,
                              isBurdenCut: true,
                            }),
                          });
                          router.refresh();
                        }}
                        aria-label="Mark burden as cut"
                      >
                        Mark as Done
                      </Button>
                    )}
                  </div>
                </div>

                {/* Oxygen source */}
                <div className="flex items-start gap-3">
                  {protocol.isOxygenScheduled ? (
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" aria-hidden="true" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-500 shrink-0 mt-0.5" aria-hidden="true" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-400 mb-1">Oxygen</p>
                    <p className="text-white break-words">{protocol.oxygenSource}</p>
                    {!protocol.isOxygenScheduled && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2 min-h-[44px]"
                        onClick={async () => {
                          await fetch("/api/crisis-protocol", {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              protocolId: protocol.id,
                              isOxygenScheduled: true,
                            }),
                          });
                          router.refresh();
                        }}
                        aria-label="Mark oxygen source as scheduled"
                      >
                        Mark as Scheduled
                      </Button>
                    )}
                  </div>
                </div>

                {/* Protocol completion ratio */}
                <div className="pt-3 border-t border-white/10">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Protocol Status
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {protocol.isBurdenCut && protocol.isOxygenScheduled
                      ? "2/2"
                      : protocol.isBurdenCut || protocol.isOxygenScheduled
                      ? "1/2"
                      : "0/2"}
                  </p>
                </div>

              </div>
            </BentoCardContent>
          </BentoGridItem>

          {/* ── THIS WEEK'S CHECK-IN (2 cols) ─────────── */}
          <BentoGridItem colSpan={2}>
            <BentoCardHeader
              icon={<Calendar className="w-5 h-5 text-blue-500" />}
              title="This Week's Check-In"
            />
            <BentoCardContent>
              {hasLoggedThisWeek ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-4 space-y-3">
                  <div className="flex items-center justify-center gap-2 text-green-500">
                    <Check className="h-5 w-5" aria-hidden="true" />
                    <p className="font-medium">Check-in completed for this week</p>
                  </div>
                  <p className="text-sm text-gray-400">
                    You logged your oxygen levels on{" "}
                    {latestCheckin &&
                      new Date(latestCheckin.weekOf).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })}
                  </p>
                  <p className="text-xs text-gray-500">
                    Come back next week to log again.
                  </p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-blue-400" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-gray-300 text-lg font-medium">
                      How are your oxygen levels?
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      Log your weekly check-in to track your recovery.
                    </p>
                  </div>
                  <Button
                    onClick={() =>
                      router.push(`/recovery-checkin?protocolId=${protocol.id}`)
                    }
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 min-h-[44px]"
                    aria-label="Log this week's recovery check-in"
                  >
                    Log Check-In →
                  </Button>
                </div>
              )}
            </BentoCardContent>
          </BentoGridItem>

        </BentoGrid>
      </div>
    </div>
  );
}