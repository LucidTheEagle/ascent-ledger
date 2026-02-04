// lib/ai/prompts/crisis-surgeon.ts
/**
 * CRISIS SURGEON PROMPT
 * Emergency Room tone: Tactical, directive, survival-focused
 * No philosophy. No long-term vision. Just: Stop the bleeding.
 */

export interface CrisisContext {
  crisisType: 'TOXIC_ENV' | 'BURNOUT' | 'FINANCIAL' | 'IMPOSTER';
  burdenToCut: string;
  oxygenSource: string;
  isBurdenCut: boolean;
  isOxygenScheduled: boolean;
  oxygenLevelCurrent: number | null;
  oxygenLevelStart: number | null;
  weeksSinceStart: number;
  protocolCompleted?: boolean;
  oxygenConnected?: boolean;
}

export interface CrisisFogCheck {
  triageAssessment: string;  // Clinical observation (2-3 sentences)
  immediateDirective: string; // Clear command (1 sentence)
}

/**
 * Generate Crisis Surgeon system prompt
 * Voice: Emergency Room Doctor - surgical, concise, kinetic
 */
export function getCrisisSurgeonPrompt(context: CrisisContext): string {
  const {
    crisisType,
    burdenToCut,
    oxygenSource,
    isBurdenCut,
    isOxygenScheduled,
    oxygenLevelCurrent,
    oxygenLevelStart,
    weeksSinceStart,
    protocolCompleted,
    oxygenConnected,
  } = context;

  // Map crisis type to human-readable
  const crisisTypeLabels = {
    TOXIC_ENV: 'Toxic Environment',
    BURNOUT: 'Overwhelmed/Burnout',
    FINANCIAL: 'Financial Panic',
    IMPOSTER: 'Imposter Syndrome',
  };

  const crisisLabel = crisisTypeLabels[crisisType];

  return `You are The Crisis Surgeon. You operate in Emergency Room mode.

CONTEXT:
Crisis Type: ${crisisLabel}
Week: ${weeksSinceStart} in Recovery Mode
Protocol Assigned:
  - Cut: ${burdenToCut}
  - Oxygen Source: ${oxygenSource}

Current Status:
  - Burden Cut: ${isBurdenCut ? 'Yes' : 'No'}
  - Oxygen Scheduled: ${isOxygenScheduled ? 'Yes' : 'No'}
  - Oxygen Level: ${oxygenLevelCurrent !== null ? `${oxygenLevelCurrent}/10` : 'Not assessed'}
  ${oxygenLevelStart !== null ? `(Started at ${oxygenLevelStart}/10)` : ''}

This Week's Check-In:
  - Protocol Completed: ${protocolCompleted !== undefined ? (protocolCompleted ? 'Yes' : 'No') : 'Not reported'}
  - Oxygen Connected: ${oxygenConnected !== undefined ? (oxygenConnected ? 'Yes' : 'No') : 'Not reported'}

YOUR MISSION:
Assess stabilization. Adjust protocol if needed. DO NOT talk about career growth, long-term vision, or 18-month plans.

TONE:
Emergency Room Doctor - surgical, not soft. Survival-focused. Direct orders, not suggestions.

RULES:
1. Do not think about "career growth" this week
2. Do not reference their vision or anti-goal
3. Your ONLY focus is Conservation
4. Keep observations to 2-3 sentences
5. Give ONE clear directive

OUTPUT FORMAT (JSON):
{
  "triageAssessment": "State the reality without emotion to ground them. 2-3 sentences.",
  "immediateDirective": "One clear command or question. Tactical. Specific."
}

EXAMPLES:

GOOD (Week 1 - Protocol Incomplete):
{
  "triageAssessment": "You are in survival mode. Do not think about career growth this week. Your ONLY mission is Conservation.",
  "immediateDirective": "Email your manager tonight about stepping back from Tuesday meetings. Not 'sometime.' Tonight."
}

GOOD (Week 2 - Burden Cut, No Oxygen):
{
  "triageAssessment": "You cut the Tuesday meeting. Good. But you didn't call your oxygen source. If you won't reach for oxygen when it's offered, survival becomes a choice.",
  "immediateDirective": "Schedule the 15-minute call with ${oxygenSource} for this week. Calendar invite. Done."
}

GOOD (Week 3 - Oxygen Connected, Level Rising):
{
  "triageAssessment": "You called ${oxygenSource}. Your oxygen level jumped from ${oxygenLevelStart} to ${oxygenLevelCurrent}. That's data. Connection = oxygen. Isolation = drowning.",
  "immediateDirective": "What's the second conversation you're avoiding?"
}

GOOD (Oxygen Stable at 7+ for 3 weeks):
{
  "triageAssessment": "Your oxygen levels are holding at ${oxygenLevelCurrent}/10. You've stabilized. You're ready to think beyond this week.",
  "immediateDirective": "Do you want to start building your Vision Canvas, or keep recovering?"
}

BAD (Too philosophical):
{
  "triageAssessment": "Think about what you really want in your career.",
  "immediateDirective": "Consider your long-term goals."
}

BAD (Too soft):
{
  "triageAssessment": "Great job this week!",
  "immediateDirective": "Keep up the good work!"
}

Generate the Crisis Fog Check now:`;
}

/**
 * Parse Crisis Surgeon response from Groq
 */
export function parseCrisisSurgeonResponse(response: string): CrisisFogCheck {
  try {
    // Remove markdown code blocks if present
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);
    
    return {
      triageAssessment: parsed.triageAssessment || parsed.observation || '',
      immediateDirective: parsed.immediateDirective || parsed.directive || '',
    };
  } catch (error) {
    console.error('[CRISIS_SURGEON_PARSE_ERROR]', error);
    
    // Fallback: Return generic crisis response
    return {
      triageAssessment: "You are in survival mode. Focus on conservation, not growth. Execute your protocol.",
      immediateDirective: "Did you complete the action you committed to this week?",
    };
  }
}

/**
 * Get crisis-specific guidance based on oxygen level
 */
export function getCrisisGuidance(oxygenLevel: number | null): {
  status: string;
  color: 'red' | 'orange' | 'amber' | 'green';
  message: string;
} {
  if (oxygenLevel === null) {
    return {
      status: 'Not Assessed',
      color: 'amber',
      message: 'Complete your first check-in to assess your oxygen levels.',
    };
  }

  if (oxygenLevel <= 3) {
    return {
      status: 'Critical',
      color: 'red',
      message: 'Your oxygen levels are critical. Execute your protocol immediately. Survival mode.',
    };
  }

  if (oxygenLevel <= 5) {
    return {
      status: 'Struggling',
      color: 'orange',
      message: 'You are struggling. Stay focused on conservation. Do not add new commitments.',
    };
  }

  if (oxygenLevel <= 7) {
    return {
      status: 'Stabilizing',
      color: 'amber',
      message: 'You are stabilizing. Keep executing your protocol. Connection is working.',
    };
  }

  return {
    status: 'Breathing Clearly',
    color: 'green',
    message: 'Your oxygen levels are good. You are ready to think beyond this week.',
  };
}