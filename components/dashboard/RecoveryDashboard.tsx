// components/dashboard/RecoveryDashboard.tsx (FINAL - All fixes)
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle, Circle, Calendar, TrendingUp, AlertCircle, Check } from "lucide-react";

interface CrisisProtocol {
  id: string;
  crisisType: string;
  burdenToCut: string;
  oxygenSource: string;
  isBurdenCut: boolean;
  isOxygenScheduled: boolean;
  oxygenLevelCurrent: number | null;
  createdAt: string;
  latestCheckin: {
    weekOf: string;
    oxygenLevelCurrent: number;
  } | null;
  latestFogCheck?: {
    id: string;
    observation: string;
    strategicQuestion: string;
    createdAt: string;
  } | null;
}

export function RecoveryDashboard() {
  const router = useRouter();
  const [protocol, setProtocol] = useState<CrisisProtocol | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [weeksSinceStart, setWeeksSinceStart] = useState(0);
  const [hasLoggedThisWeek, setHasLoggedThisWeek] = useState(false);

  // Get Monday of current week
  const getWeekStart = useCallback((date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  }, []);

  const fetchProtocol = useCallback(async () => {
    try {
      const response = await fetch("/api/crisis-protocol");
      const data = await response.json();
      
      if (data.protocol) {
        setProtocol(data.protocol);
        
        // Calculate weeks since start
        const start = new Date(data.protocol.createdAt);
        const now = new Date();
        const weeks = Math.floor(
          (now.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000)
        );
        setWeeksSinceStart(weeks + 1);

        // Check if logged this week
        if (data.protocol.latestCheckin) {
          const checkinDate = new Date(data.protocol.latestCheckin.weekOf);
          const currentWeekStart = getWeekStart(now);
          setHasLoggedThisWeek(checkinDate >= currentWeekStart);
        }
      }
    } catch (error) {
      console.error("Error fetching protocol:", error);
    } finally {
      setIsLoading(false);
    }
  }, [getWeekStart]);

  useEffect(() => {
    fetchProtocol();
  }, [fetchProtocol]);

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
    if (!protocol) return;

    try {
      // Mark protocol as complete
      await fetch("/api/crisis-protocol", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          protocolId: protocol.id,
          completedAt: new Date().toISOString(),
        }),
      });

      // Switch user to ASCENT mode
      await fetch("/api/user/mode", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operatingMode: "ASCENT",
        }),
      });

      // Navigate to vision canvas
      router.push("/vision-canvas");
    } catch (error) {
      console.error("Error transitioning to vision:", error);
    }
  };

  const handleStayInRecovery = () => {
    // User chose to keep recovering - just refresh to show confirmation
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">Loading recovery protocol...</div>
      </div>
    );
  }

  if (!protocol) {
    return (
      <div className="text-center py-12">
        <Shield className="h-16 w-16 text-gray-600 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-white mb-2">
          No Active Protocol
        </h2>
        <p className="text-gray-400 mb-6">
          Start a crisis triage to activate recovery mode.
        </p>
        <Button
          onClick={() => router.push("/crisis-triage")}
          className="bg-amber-500 hover:bg-amber-600"
        >
          Start Crisis Triage
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-amber-500" />
        <div>
          <h1 className="text-3xl font-bold text-white">Recovery Mode</h1>
          <p className="text-gray-400">
            Mission: Conservation · Week {weeksSinceStart}
          </p>
        </div>
      </div>

      {/* Crisis Type Badge */}
      <Card className="p-4 bg-amber-500/10 border-amber-500/30">
        <p className="text-amber-400 font-semibold">
          Active Crisis: {getCrisisTypeLabel(protocol.crisisType)}
        </p>
      </Card>

      {/* Crisis Surgeon Assessment */}
      {protocol.latestFogCheck && (
        <Card className="p-6 bg-red-500/5 border-red-500/20">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="h-6 w-6 text-red-400 shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1">
                Crisis Surgeon Assessment
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                {new Date(protocol.latestFogCheck.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
              
              {/* Explainer */}
              <div className="mb-4 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <p className="text-sm text-gray-400">
                  <strong className="text-red-400">Emergency Room Doctor</strong> — 
                  Tactical, directive feedback focused on survival. 
                  No philosophy. No 5-year plans. Just: stop the bleeding.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-red-400 font-semibold mb-2">Clinical Observation:</p>
              <p className="text-gray-300 leading-relaxed">
                {protocol.latestFogCheck.observation}
              </p>
            </div>

            <div className="pt-4 border-t border-white/10">
              <p className="text-sm text-red-400 font-semibold mb-2">Immediate Directive:</p>
              <p className="text-white font-medium">
                {protocol.latestFogCheck.strategicQuestion}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Your Protocol */}
      <Card className="p-6 bg-ascent-obsidian/80 backdrop-blur-sm border border-white/10">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-amber-500" />
          Your Protocol
        </h2>

        <div className="space-y-4">
          {/* Burden to Cut */}
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
                  className="mt-2"
                  onClick={async () => {
                    await fetch("/api/crisis-protocol", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        protocolId: protocol.id,
                        isBurdenCut: true,
                      }),
                    });
                    fetchProtocol();
                  }}
                >
                  Mark as Done
                </Button>
              )}
            </div>
          </div>

          {/* Oxygen Source */}
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
                  className="mt-2"
                  onClick={async () => {
                    await fetch("/api/crisis-protocol", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        protocolId: protocol.id,
                        isOxygenScheduled: true,
                      }),
                    });
                    fetchProtocol();
                  }}
                >
                  Mark as Scheduled
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* This Week's Check-In */}
      <Card className="p-6 bg-ascent-obsidian/80 backdrop-blur-sm border border-white/10">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-500" />
          This Week&apos;s Check-In
        </h2>

        {hasLoggedThisWeek ? (
          // Already logged this week
          <div className="text-center py-4 space-y-3">
            <div className="flex items-center justify-center gap-2 text-green-500">
              <Check className="h-5 w-5" />
              <p className="font-medium">Check-in completed for this week</p>
            </div>
            <p className="text-sm text-gray-400">
              You logged your oxygen levels on{' '}
              {protocol.latestCheckin && new Date(protocol.latestCheckin.weekOf).toLocaleDateString('en-US', {
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
          // Not logged yet
          <>
            <p className="text-gray-400 mb-4">How are your oxygen levels?</p>
            <Button
              onClick={() => router.push(`/recovery-checkin?protocolId=${protocol.id}`)}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              Log Check-In →
            </Button>
          </>
        )}
      </Card>

      {/* Recovery Tracker */}
      <Card className="p-6 bg-ascent-obsidian/80 backdrop-blur-sm border border-white/10">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          Recovery Tracker
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </div>
      </Card>

      {/* Transition Offer (if stable) */}
      {protocol.oxygenLevelCurrent !== null && protocol.oxygenLevelCurrent >= 7 && (
        <Card className="p-6 bg-green-500/10 border-green-500/30">
          <h3 className="text-lg font-semibold text-green-400 mb-2">
            Recovery Checkpoint
          </h3>
          <p className="text-gray-300 mb-4">
            You&apos;ve stabilized. Your oxygen levels are holding at {protocol.oxygenLevelCurrent}/10.
            You&apos;re ready to think beyond this week.
          </p>
          <div className="flex gap-3">
            <Button
              onClick={handleTransitionToVision}
              className="bg-green-500 hover:bg-green-600"
            >
              I&apos;m Ready - Build My Vision
            </Button>
            <Button
              onClick={handleStayInRecovery}
              variant="outline"
              className="border-green-500/50 text-green-400 hover:bg-green-500/10"
            >
              Not Yet - Keep Recovering
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}