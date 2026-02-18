// app/page.tsx

import dynamic from 'next/dynamic';
import { Hero } from '@/components/landing/sections/Hero';
import { SectionTransition } from '@/components/landing/SectionTransition';

// CRITICAL: Hero loads instantly (Above the fold)
// Below-fold sections use next/dynamic with skeleton placeholders

const Fog = dynamic(
  () => import('@/components/landing/sections/Fog').then(mod => ({ default: mod.Fog })),
  {
    loading: () => <div className="w-full min-h-[900px] bg-ascent-obsidian" />,
    ssr: true,
  }
);

const ProblemSection = dynamic(
  () => import('@/components/landing/sections/ProblemSection').then(mod => ({ default: mod.ProblemSection })),
  {
    loading: () => <div className="w-full min-h-[80vh] bg-ascent-black" />,
    ssr: true,
  }
);

const SolutionSection = dynamic(
  () => import('@/components/landing/sections/SolutionSection').then(mod => ({ default: mod.SolutionSection })),
  {
    loading: () => <div className="w-full min-h-[900px] bg-ascent-black" />,
    ssr: true,
  }
);

const Trinity = dynamic(
  () => import('@/components/landing/sections/Trinity').then(mod => ({ default: mod.Trinity })),
  {
    loading: () => <div className="w-full min-h-[1000px] bg-ascent-black" />,
    ssr: true,
  }
);

const SocialProof = dynamic(
  () => import('@/components/landing/sections/SocialProof').then(mod => ({ default: mod.SocialProof })),
  {
    loading: () => <div className="w-full min-h-screen bg-ascent-black" />,
    ssr: true,
  }
);

const Footer = dynamic(
  () => import('@/components/landing/sections/Footer').then(mod => ({ default: mod.Footer })),
  {
    loading: () => <div className="w-full min-h-[500px] bg-ascent-black" />,
    ssr: true,
  }
);

export default function Home() {
  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-between bg-ascent-black overflow-x-hidden scroll-smooth">
        
        {/* HERO - Above the fold, loads instantly */}
        <section aria-labelledby="hero-heading" className="w-full">
          <Hero />
        </section>
        
        {/* Transition: Hero (black) → Fog (obsidian) */}
        <SectionTransition type="black-to-obsidian" />
        
        {/* FOG - System Diagnostic Cards */}
        <section aria-labelledby="fog-heading" className="w-full">
          <Fog />
        </section>
        
        {/* Transition: Fog (obsidian) → Problem (black) */}
        <SectionTransition type="obsidian-to-black" />
        
        {/* PROBLEM - The Entropy Field */}
        <section aria-labelledby="problem-heading" className="w-full">
          <ProblemSection />
        </section>

        {/* Transition: Problem → Solution (both black, just spacing) */}
        <SectionTransition type="black-to-black" />

        {/* SOLUTION - The Vector Alignment */}
        <section aria-labelledby="solution-heading" className="w-full">
          <SolutionSection />
        </section>

        {/* Transition: Solution (black) → Trinity (Aurora bg) */}
        <SectionTransition type="black-to-obsidian" />
        
        {/* TRINITY - Product Features */}
        <section aria-labelledby="trinity-heading" className="w-full">
          <Trinity />
        </section>

        {/* Transition: Trinity (Aurora) → Social Proof (black) */}
        <SectionTransition type="aurora-to-black" />
        
        {/* SOCIAL PROOF - The Roster */}
        <section aria-labelledby="social-proof-heading" className="w-full">
          <SocialProof />
        </section>

        {/* Transition: Social Proof → Footer (both black) */}
        <SectionTransition type="black-to-black-footer" />

        {/* FOOTER - The Landing Pad */}
        <div className="w-full"> 
          <Footer />
        </div>
        
      </main>
    </>
  );
}