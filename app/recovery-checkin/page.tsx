// app/recovery-checkin/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BackgroundBeams } from "@/components/ui/background-beams";
import TokenPayday from "@/components/tokens/TokenPayday";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { ArrowLeft, Shield } from "lucide-react";

function RecoveryCheckinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const protocolId = searchParams.get("protocolId");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTokenReward, setShowTokenReward] = useState(false);
  const [formData, setFormData] = useState({
    protocolCompleted: null as boolean | null,
    oxygenConnected: null as boolean | null,
    oxygenLevelCurrent: 5,
    notes: "",
  });

  useEffect(() => {
    if (!protocolId) {
      router.push("/dashboard");
    }
  }, [protocolId, router]);

  const handleSubmit = async () => {
    if (!protocolId) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/recovery-checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          protocolId,
          ...formData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save check-in");
      }

      const result = await response.json();

      // Show token reward (TokenPayday handles redirect via redirectUrl)
      setShowTokenReward(true);
    } catch (error: unknown) {
      console.error("Error saving check-in:", error);
      let message = "Failed to save check-in. Please try again.";
      if (error instanceof Error) {
        message = error.message || message;
      }
      alert(message);
      setIsSubmitting(false);
    }
  };

  if (showTokenReward) {
    return (
      <TokenPayday
        amount={50}
        newBalance={50}
        reason="RECOVERY_CHECKIN"
        redirectUrl="/dashboard"
        duration={3000}
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-ascent-black overflow-hidden">
      <BackgroundBeams className="opacity-30" />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="mb-4 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-ascent-amber" />
            <h1 className="text-3xl font-bold text-white">Weekly Check-In</h1>
          </div>
          <p className="text-ascent-gray">
            How are you doing this week? Be honest—this is for you.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Question 1: Protocol Completed */}
          <Card className="p-6 bg-ascent-card/80 backdrop-blur-sm border border-white/10">
            <Label className="text-white text-lg mb-4 block">
              Did you complete your Conservation protocol this week?
            </Label>

            <div className="space-y-3">
              <button
                onClick={() =>
                  setFormData({ ...formData, protocolCompleted: true })
                }
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  formData.protocolCompleted === true
                    ? "border-ascent-green bg-ascent-green/10"
                    : "border-white/10 hover:border-ascent-green/50"
                }`}
              >
                <p className="text-white font-semibold">
                  ✓ Yes, I cut the weight
                </p>
              </button>

              <button
                onClick={() =>
                  setFormData({ ...formData, protocolCompleted: false })
                }
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  formData.protocolCompleted === false
                    ? "border-ascent-amber bg-ascent-amber/10"
                    : "border-white/10 hover:border-ascent-amber/50"
                }`}
              >
                <p className="text-white font-semibold">Partially</p>
              </button>

              <button
                onClick={() =>
                  setFormData({ ...formData, protocolCompleted: null })
                }
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  formData.protocolCompleted === null
                    ? "border-ascent-red bg-ascent-red/10"
                    : "border-white/10 hover:border-ascent-red/50"
                }`}
              >
                <p className="text-white font-semibold">
                  No, couldn&apos;t execute
                </p>
              </button>
            </div>
          </Card>

          {/* Question 2: Oxygen Connected */}
          <Card className="p-6 bg-ascent-card/80 backdrop-blur-sm border border-white/10">
            <Label className="text-white text-lg mb-4 block">
              Did you connect with your Oxygen source?
            </Label>

            <div className="space-y-3">
              <button
                onClick={() =>
                  setFormData({ ...formData, oxygenConnected: true })
                }
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  formData.oxygenConnected === true
                    ? "border-ascent-green bg-ascent-green/10"
                    : "border-white/10 hover:border-ascent-green/50"
                }`}
              >
                <p className="text-white font-semibold">
                  ✓ Yes, had the conversation
                </p>
              </button>

              <button
                onClick={() =>
                  setFormData({ ...formData, oxygenConnected: false })
                }
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  formData.oxygenConnected === false
                    ? "border-ascent-amber bg-ascent-amber/10"
                    : "border-white/10 hover:border-ascent-amber/50"
                }`}
              >
                <p className="text-white font-semibold">
                  Scheduled but not done yet
                </p>
              </button>

              <button
                onClick={() =>
                  setFormData({ ...formData, oxygenConnected: null })
                }
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  formData.oxygenConnected === null
                    ? "border-ascent-red bg-ascent-red/10"
                    : "border-white/10 hover:border-ascent-red/50"
                }`}
              >
                <p className="text-white font-semibold">No, avoided it</p>
              </button>
            </div>
          </Card>

          {/* Question 3: Oxygen Level */}
          <Card className="p-6 bg-ascent-card/80 backdrop-blur-sm border border-white/10">
            <Label className="text-white text-lg mb-4 block">
              On a scale of 1-10, where are your oxygen levels today?
            </Label>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-ascent-gray w-20">
                  1 (Drowning)
                </span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.oxygenLevelCurrent}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      oxygenLevelCurrent: parseInt(e.target.value),
                    })
                  }
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #ef4444 0%, #f59e0b ${
                      ((formData.oxygenLevelCurrent - 1) / 9) * 100
                    }%, #10b981 100%)`,
                  }}
                />
                <span className="text-sm text-ascent-gray w-24 text-right">
                  10 (Clear)
                </span>
              </div>

              <div className="text-center">
                <p className="text-4xl font-bold text-white mb-2">
                  {formData.oxygenLevelCurrent}
                  <span className="text-ascent-gray text-2xl">/10</span>
                </p>
                <p className="text-ascent-gray">
                  {formData.oxygenLevelCurrent >= 7 && "Breathing clearly"}
                  {formData.oxygenLevelCurrent >= 5 &&
                    formData.oxygenLevelCurrent < 7 &&
                    "Stabilizing"}
                  {formData.oxygenLevelCurrent >= 3 &&
                    formData.oxygenLevelCurrent < 5 &&
                    "Struggling"}
                  {formData.oxygenLevelCurrent < 3 && "Critical"}
                </p>
              </div>
            </div>
          </Card>

          {/* Optional Notes */}
          <Card className="p-6 bg-ascent-card/80 backdrop-blur-sm border border-white/10">
            <Label htmlFor="notes" className="text-white text-lg mb-3 block">
              Additional Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Anything else you want to note about this week..."
              className="min-h-[100px] bg-ascent-black/60 border-white/10 text-white placeholder:text-gray-500"
            />
          </Card>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-ascent-amber to-orange-500 hover:from-ascent-amber/90 hover:to-orange-600 text-white font-semibold py-6 text-lg"
          >
            {isSubmitting ? "Saving..." : "Complete Check-In →"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function RecoveryCheckinPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <RecoveryCheckinContent />
    </Suspense>
  );
}