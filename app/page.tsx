import { Navbar } from "@/components/landing/navigation/Navbar";
import { FloatingNavbar } from "@/components/landing/navigation/FloatingNavbar";
import { Hero } from "@/components/landing/sections/Hero";
import { Fog } from "@/components/landing/sections/Fog";
import { Trinity } from "@/components/landing/sections/Trinity";
import { SocialProof } from "@/components/landing/sections/SocialProof";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <Navbar />
      <FloatingNavbar />
      <Hero />
      <Fog />
      <Trinity />
      <SocialProof />  

      {/* SPACER */}
      <section className="min-h-screen w-full flex items-center justify-center bg-ascent-obsidian">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white">
            Phase 6: Social Proof Complete ✅
          </h2>
          <p className="text-ascent-gray">
            Next: Phase 7 (Footer)
          </p>
        </div>
      </section>
    </main>
  );
}