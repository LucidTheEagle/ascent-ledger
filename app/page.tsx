/**
 * ASCENT LEDGER - HOMEPAGE
 * The Gateway: External face that filters tourists, attracts pilots
 */

import { Navbar } from "@/components/landing/navigation/Navbar";
import { FloatingNavbar } from "@/components/landing/navigation/FloatingNavbar";
import { Hero } from "@/components/landing/sections/Hero";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {/* NAVIGATION LAYER */}
      <Navbar />
      <FloatingNavbar />

      {/* Hero Section */}
      <Hero />

      {/* SPACER SECTION - For Testing Scroll */}
      <section className="min-h-screen w-full flex items-center justify-center bg-ascent-obsidian">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white">
            Phase 3A: Navigation Testing
          </h2>
          <p className="text-ascent-gray">
            Keep scrolling to test the floating navbar behavior
          </p>
        </div>
      </section>

      {/* ANOTHER SPACER */}
      <section className="min-h-screen w-full flex items-center justify-center bg-ascent-black">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white">
            Scroll back up now
          </h2>
          <p className="text-ascent-gray">
            The floating navbar should appear when you scroll up
          </p>
        </div>
      </section>
    </main>
  );
}