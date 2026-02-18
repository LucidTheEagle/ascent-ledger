// ============================================
// components/dashboard/DailyAnchor.tsx
// DAILY ANCHOR: Rotating grounding quote based on crisis type + date
// Enhancement: Recovery Dashboard Upgrade
// ============================================

'use client';

import { motion } from 'framer-motion';
import { Anchor } from 'lucide-react';

type CrisisType = 'TOXIC_ENV' | 'BURNOUT' | 'FINANCIAL' | 'IMPOSTER';

const ANCHOR_QUOTES: Record<CrisisType, string[]> = {
  TOXIC_ENV: [
    'You have power over your mind — not outside events. Realize this, and you will find strength. — Marcus Aurelius',
    'The impediment to action advances action. What stands in the way becomes the way. — Marcus Aurelius',
    'No man is free who is not master of himself. — Epictetus',
    'It never ceases to amaze me: we all love ourselves more than other people, but care more about their opinion than our own. — Marcus Aurelius',
    'Waste no more time arguing about what a good man should be. Be one. — Marcus Aurelius',
    'You are not required to set yourself on fire to keep other people warm. — Unknown',
    'The best revenge is not to be like your enemy. — Marcus Aurelius',
  ],
  BURNOUT: [
    'Almost everything will work again if you unplug it for a few minutes, including you. — Anne Lamott',
    'Rest is not idleness. To lie sometimes on the grass is not a waste of time. — John Lubbock',
    'You cannot pour from an empty vessel. Refill before you give. — Unknown',
    'Nowhere can man find a quieter or more untroubled retreat than in his own soul. — Marcus Aurelius',
    'Do less. But do what you do with complete and excellent attention. — Marc Lesser',
    'Nature does not hurry, yet everything is accomplished. — Lao Tzu',
    'The most important thing is to enjoy your life — to be happy — it\'s all that matters. — Audrey Hepburn',
  ],
  FINANCIAL: [
    'We suffer more in imagination than in reality. — Seneca',
    'A man is rich in proportion to the number of things he can afford to let alone. — Henry David Thoreau',
    'It\'s not the man who has too little, but the man who craves more, that is poor. — Seneca',
    'Wealth consists not in having great possessions, but in having few wants. — Epictetus',
    'He who is not satisfied with a little is satisfied with nothing. — Epicurus',
    'Fortune is a wheel that turns without cease. When it turns, the man at bottom rises to the top. — Unknown',
    'Stability is not the absence of chaos. It\'s your response to it. — Unknown',
  ],
  IMPOSTER: [
    'The more I learn, the more I realize how much I don\'t know. That is not weakness — it is wisdom. — Albert Einstein',
    'Doubt is not a pleasant condition, but certainty is absurd. — Voltaire',
    'Nobody tells this to people who are beginners — the gap between your taste and your ability will close. — Ira Glass',
    'Comparison is the thief of joy. — Theodore Roosevelt',
    'You are allowed to be both a masterpiece and a work in progress simultaneously. — Sophia Bush',
    'The cave you fear to enter holds the treasure you seek. — Joseph Campbell',
    'Act as if what you do makes a difference. It does. — William James',
  ],
};

// Fallback quotes for unknown crisis types
const FALLBACK_QUOTES = [
  'In the middle of difficulty lies opportunity. — Albert Einstein',
  'This too shall pass. — Persian adage',
  'The darkest nights produce the brightest stars. — John Green',
];

// ─────────────────────────────────────────────────────────
// Rotate quotes by day — same quote all day, changes at midnight
// No randomness — deterministic so SSR and client match
// ─────────────────────────────────────────────────────────
function getDailyQuote(crisisType: string): string {
  const quotes =
    ANCHOR_QUOTES[crisisType as CrisisType] ?? FALLBACK_QUOTES;

  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return quotes[dayOfYear % quotes.length];
}

function getCrisisLabel(crisisType: string): string {
  const labels: Record<string, string> = {
    TOXIC_ENV: 'Toxic Environment',
    BURNOUT: 'Overwhelmed / Burnout',
    FINANCIAL: 'Financial Pressure',
    IMPOSTER: 'Imposter Syndrome',
  };
  return labels[crisisType] ?? crisisType;
}

interface DailyAnchorProps {
  crisisType: string;
}

export function DailyAnchor({ crisisType }: DailyAnchorProps) {
  const quote = getDailyQuote(crisisType);

  // Split quote from attribution
  const lastDash = quote.lastIndexOf('—');
  const quoteText = lastDash > 0 ? quote.slice(0, lastDash).trim() : quote;
  const attribution = lastDash > 0 ? quote.slice(lastDash).trim() : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative p-6 rounded-xl border border-white/10 bg-gradient-to-br from-ascent-card/80 to-ascent-obsidian overflow-hidden"
      aria-label="Daily anchor quote"
    >
      {/* Decorative background glow */}
      <div
        className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #8B5CF6, transparent)' }}
        aria-hidden="true"
      />

      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Anchor className="w-4 h-4 text-purple-400 shrink-0" aria-hidden="true" />
        <p className="text-xs text-purple-400 uppercase tracking-widest font-semibold">
          Today&apos;s Anchor
        </p>
        <span className="ml-auto text-[10px] text-gray-600 uppercase tracking-wide">
          {getCrisisLabel(crisisType)}
        </span>
      </div>

      {/* Quote */}
      <blockquote className="space-y-3">
        <p className="text-white text-base md:text-lg leading-relaxed italic font-light">
          &ldquo;{quoteText}&rdquo;
        </p>
        {attribution && (
          <footer className="text-sm text-gray-500">
            {attribution}
          </footer>
        )}
      </blockquote>
    </motion.div>
  );
}