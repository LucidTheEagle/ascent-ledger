// app/crisis-triage/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import TokenPayday from "@/components/tokens/TokenPayday";
import { ArrowLeft, Shield, Flame, Heart, DollarSign, AlertTriangle } from "lucide-react";

type CrisisType = "TOXIC_ENV" | "BURNOUT" | "FINANCIAL" | "IMPOSTER";

interface CrisisData {
  crisisType: CrisisType | null;
  burdenToCut: string;
  oxygenSource: string;
}

export default function CrisisTriagePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTokenReward, setShowTokenReward] = useState(false);
  const [crisisData, setCrisisData] = useState<CrisisData>({
    crisisType: null,
    burdenToCut: "",
    oxygenSource: "",
  });

  const crisisOptions = [
    {
      type: "TOXIC_ENV" as CrisisType,
      icon: Flame,
      title: "Toxic Environment",
      description: "Boss is unbearable. Culture is draining. I can't breathe.",
      color: "border-ascent-red/50 hover:border-ascent-red hover:bg-ascent-red/5",
      iconColor: "text-ascent-red",
    },
    {
      type: "BURNOUT" as CrisisType,
      icon: AlertTriangle,
      title: "Overwhelmed/Burnout",
      description: "Too much volume. No capacity. Drowning in tasks.",
      color: "border-ascent-amber/50 hover:border-ascent-amber hover:bg-ascent-amber/5",
      iconColor: "text-ascent-amber",
    },
    {
      type: "FINANCIAL" as CrisisType,
      icon: DollarSign,
      title: "Financial Panic",
      description: "Underpaid. Debt crushing. Can't afford to leave.",
      color: "border-orange-500/50 hover:border-orange-500 hover:bg-orange-500/5",
      iconColor: "text-orange-500",
    },
    {
      type: "IMPOSTER" as CrisisType,
      icon: Heart,
      title: "Imposter Syndrome",
      description: "Feel like a fraud. Constant anxiety. Questioning everything.",
      color: "border-ascent-purple/50 hover:border-ascent-purple hover:bg-ascent-purple/5",
      iconColor: "text-ascent-purple",
    },
  ];

  const handleCrisisSelect = (type: CrisisType) => {
    setCrisisData({ ...crisisData, crisisType: type });
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!crisisData.crisisType || !crisisData.burdenToCut || !crisisData.oxygenSource) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/crisis-protocol", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(crisisData),
      });

      if (!response.ok) {
        throw new Error("Failed to create crisis protocol");
      }

      const result = await response.json();

      // Show token reward (TokenPayday handles redirect via redirectUrl)
      setShowTokenReward(true);
    } catch (error) {
      console.error("Error creating crisis protocol:", error);
      alert("Failed to create protocol. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (showTokenReward) {
    return (
      <TokenPayday
        amount={100}
        newBalance={100}
        reason="Crisis Protocol Activated"
        redirectUrl="/dashboard"
        duration={3000}
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-ascent-black overflow-hidden">
      <BackgroundBeams className="opacity-30" />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => (step === 1 ? router.back() : setStep(step - 1))}
            className="mb-4 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-ascent-amber" />
            <h1 className="text-3xl font-bold text-white">Crisis Triage</h1>
          </div>
          <p className="text-ascent-gray">
            {step === 1 && "You're not alone. Let's identify what's burning today."}
            {step === 2 && "To ascend, you must lighten the load."}
            {step === 3 && "Who is the ONE person who actually sees your value?"}
          </p>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 mt-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`h-2 w-16 rounded-full transition-all ${
                    s <= step ? "bg-ascent-amber" : "bg-gray-700"
                  }`}
                />
                {s < 3 && <div className="text-gray-600">→</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Crisis Type Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-white mb-2">
                What is burning today?
              </h2>
              <p className="text-ascent-gray">(Select ONE)</p>
            </div>

            <div className="grid gap-4">
              {crisisOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Card
                    key={option.type}
                    className={`p-6 cursor-pointer transition-all border-2 ${option.color} bg-ascent-card/80 backdrop-blur-sm`}
                    onClick={() => handleCrisisSelect(option.type)}
                  >
                    <div className="flex items-start gap-4">
                      <Icon className={`h-8 w-8 ${option.iconColor} flex-shrink-0`} />
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                          {option.title}
                        </h3>
                        <p className="text-ascent-gray">{option.description}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Burden to Cut */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-white mb-3">
                The Immediate Cut
              </h2>
              <p className="text-ascent-gray mb-2">
                You cannot add vision when the boat is sinking.
              </p>
              <p className="text-ascent-gray">
                You must throw weight overboard.
              </p>
            </div>

            <Card className="p-6 bg-ascent-card/80 backdrop-blur-sm border border-white/10">
              <Label htmlFor="burden" className="text-white text-lg mb-3 block">
                What is ONE thing you can Pause, Delegate, or Delete in the next 48
                hours?
              </Label>
              <Textarea
                id="burden"
                value={crisisData.burdenToCut}
                onChange={(e) =>
                  setCrisisData({ ...crisisData, burdenToCut: e.target.value })
                }
                placeholder="E.g., Stop attending Tuesday status meetings, Delegate the weekly newsletter, Delete non-critical Slack channels"
                className="min-h-[120px] bg-ascent-black/60 border-white/10 text-white placeholder:text-gray-500"
              />
              <p className="text-sm text-gray-500 mt-2">
                {crisisData.burdenToCut.length}/500 characters
              </p>
            </Card>

            <Button
              onClick={() => setStep(3)}
              disabled={crisisData.burdenToCut.trim().length < 10}
              className="w-full bg-gradient-to-r from-ascent-amber to-orange-500 hover:from-ascent-amber/90 hover:to-orange-600 text-white font-semibold py-6 text-lg"
            >
              Next →
            </Button>
          </div>
        )}

        {/* Step 3: Oxygen Source */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-white mb-3">
                The Oxygen Source
              </h2>
              <p className="text-ascent-gray mb-2">
                (Not your boss. Not someone in crisis with you.)
              </p>
            </div>

            <Card className="p-6 bg-ascent-card/80 backdrop-blur-sm border border-white/10">
              <Label htmlFor="oxygen" className="text-white text-lg mb-3 block">
                Who is the ONE person who actually sees your value?
              </Label>
              <Textarea
                id="oxygen"
                value={crisisData.oxygenSource}
                onChange={(e) =>
                  setCrisisData({ ...crisisData, oxygenSource: e.target.value })
                }
                placeholder="E.g., Sarah in Product, My old mentor, College friend who knows my strengths"
                className="min-h-[120px] bg-ascent-black/60 border-white/10 text-white placeholder:text-gray-500"
              />
              <p className="text-sm text-gray-500 mt-2">
                {crisisData.oxygenSource.length}/500 characters
              </p>
            </Card>

            <Button
              onClick={handleSubmit}
              disabled={
                crisisData.oxygenSource.trim().length < 10 || isSubmitting
              }
              className="w-full bg-gradient-to-r from-ascent-amber to-orange-500 hover:from-ascent-amber/90 hover:to-orange-600 text-white font-semibold py-6 text-lg"
            >
              {isSubmitting ? "Generating Protocol..." : "Generate My Protocol →"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}