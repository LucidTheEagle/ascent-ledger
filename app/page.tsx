// app/page.tsx
// Oracle's Approach: Prevent layout shift with fixed-height skeletons

import dynamic from 'next/dynamic';
import { Navbar } from '@/components/landing/navigation/Navbar';
import { FloatingNavbar } from '@/components/landing/navigation/FloatingNavbar';
import { Hero } from '@/components/landing/sections/Hero';

// CRITICAL: Hero loads instantly (Above the fold)
// Below-fold sections use next/dynamic with skeleton placeholders

// Fixed-height skeletons prevent layout shift (CLS)
const Fog = dynamic(
  () => import('@/components/landing/sections/Fog').then(mod => ({ default: mod.Fog })),
  {
    loading: () => <div className="w-full min-h-[900px] bg-ascent-obsidian" />,
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
      {/* NAVIGATION - Always visible */}
      <Navbar />
      <FloatingNavbar />

      {/* MAIN CONTENT - Semantic HTML */}
      {/* NOTE: Removed 'items-center' because it conflicts with full-width sections. 
         If you prefer keeping it, you MUST add 'w-full' to every section below. 
         I have added 'w-full' to the sections just to be safe.
      */}
      <main className="flex min-h-screen flex-col items-center justify-between bg-ascent-black overflow-x-hidden">
        
        {/* Hero loads instantly (Above the fold) */}
        {/* ADDED: w-full to ensure the background spans the whole screen */}
        <section aria-labelledby="hero-heading" className="w-full">
          <Hero />
        </section>
        
        {/* Below-fold sections load dynamically */}
        <section aria-labelledby="fog-heading" className="w-full">
          <Fog />
        </section>
        
        <section aria-labelledby="trinity-heading" className="w-full">
          <Trinity />
        </section>
        
        <section aria-labelledby="social-proof-heading" className="w-full">
          <SocialProof />
        </section>

        {/* Footer is usually a semantic tag itself, but if it's a component, a wrapper is fine */}
        <div className="w-full"> 
          <Footer />
        </div>
        
      </main>
    </>
  );
}