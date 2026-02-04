// lib/ai/prompts/tone-adjuster.ts
/**
 * TONE ADJUSTMENT LOGIC
 * Checkpoint 12: Adjust Fog Check tone based on user state
 * 
 * Rules:
 * 1. Soften tone when isSurvivalMode = true (user is in crisis)
 * 2. Validate honesty when hadNoLeverage = true (acknowledge difficulty)
 * 3. Adjust aggression based on patterns
 */

export interface LogContext {
    leverageBuilt: string;
    learnedInsight: string;
    opportunitiesCreated: string;
    isSurvivalMode: boolean;
    hadNoLeverage: boolean;
  }
  
  export interface ToneAdjustment {
    toneSetting: 'soft' | 'balanced' | 'direct';
    prefix: string;
    warningLevel: 'none' | 'gentle' | 'firm';
    validationNeeded: boolean;
  }
  
  /**
   * Determine appropriate tone based on user's current state
   * 
   * @param logContext - Current log context
   * @param weekNumber - User's week in the program
   * @param hasPatterns - Whether patterns were detected
   * @returns Tone adjustment settings
   */
  export function determineTone(
    logContext: LogContext,
    weekNumber: number,
    hasPatterns: boolean
  ): ToneAdjustment {
    const { isSurvivalMode, hadNoLeverage } = logContext;
  
    // RULE 1: Survival Mode = Soft Tone
    if (isSurvivalMode) {
      return {
        toneSetting: 'soft',
        prefix: '[SURVIVAL MODE DETECTED - SOFTEN TONE]',
        warningLevel: 'gentle',
        validationNeeded: false,
      };
    }
  
    // RULE 2: No Leverage = Validate Honesty
    if (hadNoLeverage) {
      return {
        toneSetting: 'balanced',
        prefix: '[NO LEVERAGE THIS WEEK - VALIDATE HONESTY]',
        warningLevel: weekNumber >= 4 && hasPatterns ? 'firm' : 'gentle',
        validationNeeded: true,
      };
    }
  
    // Default: Direct tone with patterns
    return {
      toneSetting: 'direct',
      prefix: '',
      warningLevel: hasPatterns ? 'firm' : 'none',
      validationNeeded: false,
    };
  }
  
  /**
   * Generate tone instruction for AI prompt
   * 
   * @param toneAdjustment - Tone settings from determineTone()
   * @returns Instruction string to inject into prompt
   */
  export function getToneInstruction(toneAdjustment: ToneAdjustment): string {
    const { toneSetting, prefix, warningLevel, validationNeeded } = toneAdjustment;
  
    let instruction = '';
  
    // Add prefix if exists
    if (prefix) {
      instruction += `${prefix}\n\n`;
    }
  
    // Tone setting instructions
    switch (toneSetting) {
      case 'soft':
        instruction += `TONE OVERRIDE: SOFTEN APPROACH
  This user is in Survival Mode. They're dealing with immediate crisis.
  
  Do NOT:
  - Push them to do more
  - Question their effort
  - Use aggressive language
  - Reference long-term vision
  
  DO:
  - Acknowledge their difficulty
  - Validate their honesty
  - Offer tactical support
  - Focus on conservation, not growth
  
  Example:
  "You're in survival mode this week. That's real. No leverage built is honest reporting, not failure. Your only mission right now is conservation. What's one small thing you can cut to create breathing room?"
  
  `;
        break;
  
      case 'balanced':
        if (validationNeeded) {
          instruction += `VALIDATION NEEDED: NO LEVERAGE THIS WEEK
  
  The user reported no leverage built. This requires careful handling.
  
  Two possibilities:
  1. HONEST STRUGGLE: They genuinely couldn't build leverage (validate this)
  2. AVOIDANCE PATTERN: They're learning without action (address gently)
  
  Your response should:
  - First, validate the honesty of reporting no leverage
  - Then, probe WHY (without judgment)
  - Offer a reflection question
  
  Example (Week 2-3):
  "No leverage this week—that's honest reporting. Sometimes the week doesn't cooperate. What got in the way? Was it external (fire drill at work) or internal (analysis paralysis)?"
  
  Example (Week 4+ with patterns):
  "No leverage again. I see you're being honest, and I respect that. But this is the third week in a row. You're learning a lot—but learning without action is just a different kind of fog. What's the real blocker?"
  
  `;
        }
        break;
  
      case 'direct':
        instruction += `TONE: DIRECT (Pattern Hunter Mode)
  
  The user has leverage and is making progress. Use your full Pattern Hunter capabilities.
  
  ${warningLevel === 'firm' ? `
  PATTERNS DETECTED - Be firm but not harsh:
  - Call out the pattern directly
  - Connect it to their vision
  - Give tactical next step
  ` : ''}
  `;
        break;
    }
  
    // Warning level guidance
    if (warningLevel !== 'none') {
      instruction += `\nWARNING LEVEL: ${warningLevel.toUpperCase()}\n`;
      
      switch (warningLevel) {
        case 'gentle':
          instruction += `Keep observations factual but gentle. They're trying.`;
          break;
        case 'firm':
          instruction += `Be direct about patterns, but offer a path forward.`;
          break;
      }
    }
  
    return instruction;
  }
  
  /**
   * Build complete tone-adjusted prompt section
   * 
   * @param logContext - Log context
   * @param weekNumber - Week number
   * @param hasPatterns - Pattern detection result
   * @returns Complete tone instruction to inject into prompt
   */
  export function buildToneAdjustedPrompt(
    logContext: LogContext,
    weekNumber: number,
    hasPatterns: boolean
  ): string {
    const toneAdjustment = determineTone(logContext, weekNumber, hasPatterns);
    const instruction = getToneInstruction(toneAdjustment);
  
    return `
  ## TONE ADJUSTMENT (Checkpoint 12)
  
  ${instruction}
  
  ---
  `;
  }