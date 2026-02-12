// ============================================
// components/dashboard/RecoveryDashboard.tsx
// RECOVERY MODE DASHBOARD: Now accepts props from Server Action
// UPDATED: Checkpoint 10 - Extracted header to DashboardHeader component
// ============================================

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
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
import type { RecoveryTrackDashboardData } from "@/app/actions/dashboard";
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
    // stats, // Available for future checkpoint (token history display)
    streakData,
    transitionEligibility,
  } = data;

  const getCrisisTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      TOXIC_ENV: "Toxic Environment",
      BURNOUT: "Overwhelmed/Burnout",
      FINANCIAL: "Financial Panic",
      IMPOSTER: "Imposter Syndrome",
    };
    return labels[type] || type;
  };

  const getOxygenStatus = (level: number | null) => {
    if (level === null) return "Not assessed";
    if (level >= 7) return "Breathing clearly";
    if (level >= 5) return "Stabilizing";
    if (level >= 3) return "Struggling";
    return "Critical";
  };

  const getOxygenColor = (level: number | null) => {
    if (level === null) return "text-gray-400";
    if (level >= 7) return "text-green-500";
    if (level >= 5) return "text-amber-500";
    if (level >= 3) return "text-orange-500";
    return "text-red-500";
  };

  const handleTransitionToVision = async () => {
    if (!protocol || !transitionEligibility.isEligible) return;

    setIsTransitioning(true);

    try {
      const response = await fetch("/api/transition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          protocolId: protocol.id,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // ============================================
        // UPDATED: Redirect through token-payday page
        // ============================================
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

  // ============================================
  // EMPTY STATE: No Active Protocol
  // ============================================
  if (!protocol) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12 space-y-6">
            <Shield className="h-16 w-16 text-gray-600 mx-auto" />
            <h2 className="text-2xl font-semibold text-white">
              No Active Protocol
            </h2>
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

  const showTransitionOffer = transitionEligibility.isEligible;

  // ============================================
  // RECOVERY DASHBOARD LAYOUT
  // ============================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* ============================================
            HEADER (Now extracted to component)
        ============================================ */}
        <DashboardHeader
          title="Recovery Mode"
          subtitle={`Mission: Conservation · Week ${weeksSinceStart}`}
          tokenBalance={user.tokenBalance}
          currentStreak={streakData.currentStreak}
          mode="RECOVERY"
          icon={<Shield className="h-8 w-8 text-amber-500" />}
        />

        {/* Crisis Type Badge */}
        <Card className="p-4 bg-amber-500/10 border-amber-500/30">
          <p className="text-amber-400 font-semibold">
            Active Crisis: {getCrisisTypeLabel(protocol.crisisType)}
          </p>
        </Card>

        {/* ============================================
            BENTO GRID LAYOUT
        ============================================ */}
        <BentoGrid>
          
          {/* ============================================
              TRANSITION OFFER (if eligible, full width)
          ============================================ */}
          {showTransitionOffer && (
            <BentoGridItem colSpan={3}>
              <div className="flex items-start gap-4">
                <Sparkles className="h-8 w-8 text-green-400 shrink-0" />
                <div className="flex-1">
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
                      className="bg-green-500 hover:bg-green-600 min-h-[44px]"
                    >
                      {isTransitioning ? 'Transitioning...' : "I'm Ready - Build My Vision (+150 tokens)"}
                    </Button>
                    <Button
                      onClick={() => router.refresh()}
                      variant="outline"
                      className="border-green-500/50 text-green-400 hover:bg-green-500/10 min-h-[44px]"
                    >
                      Not Yet - Keep Recovering
                    </Button>
                  </div>
                </div>
              </div>
            </BentoGridItem>
          )}

          {/* ============================================
              CRISIS SURGEON ASSESSMENT (if exists, 2 cols)
          ============================================ */}
          {latestFogCheck && (
            <BentoGridItem colSpan={2}>
              <BentoCardHeader
                icon={<AlertCircle className="w-5 h-5 text-red-400" />}
                title="Crisis Surgeon Assessment"
              />
              <BentoCardContent>
                <p className="text-xs text-gray-500 mb-3">
                  {new Date(latestFogCheck.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
                
                <div className="mb-4 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                  <p className="text-sm text-gray-400">
                    <strong className="text-red-400">Emergency Room Doctor</strong> — 
                    Tactical, directive feedback focused on survival. 
                    No philosophy. No 5-year plans. Just: stop the bleeding.
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

          {/* ============================================
              PROTOCOL STATUS (1 col)
          ============================================ */}
          <BentoGridItem colSpan={latestFogCheck ? 1 : 2}>
            <BentoCardHeader
              icon={<Shield className="w-5 h-5 text-amber-500" />}
              title="Your Protocol"
            />
            <BentoCardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  {protocol.isBurdenCut ? (
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-500 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-gray-400 mb-1">Cut</p>
                    <p className="text-white">{protocol.burdenToCut}</p>
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
                      >
                        Mark as Done
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  {protocol.isOxygenScheduled ? (
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-500 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-gray-400 mb-1">Oxygen</p>
                    <p className="text-white">{protocol.oxygenSource}</p>
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
                      >
                        Mark as Scheduled
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </BentoCardContent>
          </BentoGridItem>

          {/* ============================================
              THIS WEEK'S CHECK-IN (2 cols)
          ============================================ */}
          <BentoGridItem colSpan={2}>
            <BentoCardHeader
              icon={<Calendar className="w-5 h-5 text-blue-500" />}
              title="This Week's Check-In"
            />
            <BentoCardContent>
              {hasLoggedThisWeek ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-4 space-y-3">
                  <div className="flex items-center justify-center gap-2 text-green-500">
                    <Check className="h-5 w-5" />
                    <p className="font-medium">Check-in completed for this week</p>
                  </div>
                  <p className="text-sm text-gray-400">
                    You logged your oxygen levels on{' '}
                    {latestCheckin && new Date(latestCheckin.weekOf).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-xs text-gray-500">
                    Come back next week to log again.
                  </p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-gray-300 text-lg font-medium">
                      How are your oxygen levels?
                    </p>
                  </div>
                  <Button
                    onClick={() => router.push(`/recovery-checkin?protocolId=${protocol.id}`)}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 min-h-[44px]"
                  >
                    Log Check-In →
                  </Button>
                </div>
              )}
            </BentoCardContent>
          </BentoGridItem>

          {/* ============================================
              RECOVERY TRACKER (1 col)
          ============================================ */}
          <BentoGridItem colSpan={1}>
            <BentoCardHeader
              icon={<TrendingUp className="w-5 h-5 text-green-500" />}
              title="Recovery Tracker"
            />
            <BentoCardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Weeks in Recovery</p>
                  <p className="text-2xl font-bold text-white">{weeksSinceStart}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-1">Protocol Status</p>
                  <p className="text-2xl font-bold text-white">
                    {protocol.isBurdenCut && protocol.isOxygenScheduled ? "2/2" : 
                     protocol.isBurdenCut || protocol.isOxygenScheduled ? "1/2" : "0/2"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-1">Oxygen Level</p>
                  <p className={`text-2xl font-bold ${getOxygenColor(protocol.oxygenLevelCurrent)}`}>
                    {protocol.oxygenLevelCurrent !== null
                      ? `${protocol.oxygenLevelCurrent}/10`
                      : "Not set"}
                  </p>
                  <p className={`text-sm ${getOxygenColor(protocol.oxygenLevelCurrent)}`}>
                    {getOxygenStatus(protocol.oxygenLevelCurrent)}
                  </p>
                </div>

                {/* Streak Display */}
                {streakData.currentStreak > 0 && (
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-sm text-gray-400 mb-1">Check-in Streak</p>
                    <p className="text-2xl font-bold text-orange-400">
                      {streakData.currentStreak} 🔥
                    </p>
                  </div>
                )}
              </div>
            </BentoCardContent>
          </BentoGridItem>

        </BentoGrid>
      </div>
    </div>
  );
}