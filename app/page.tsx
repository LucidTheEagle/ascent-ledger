import { Navbar } from "@/components/landing/navigation/Navbar";
import { FloatingNavbar } from "@/components/landing/navigation/FloatingNavbar";
import { Hero } from "@/components/landing/sections/Hero";
import { Fog } from "@/components/landing/sections/Fog";
import { Trinity } from "@/components/landing/sections/Trinity";
import { SocialProof } from "@/components/landing/sections/SocialProof";
import { Footer } from "@/components/landing/sections/Footer";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <Navbar />
      <FloatingNavbar />
      <Hero />
      <Fog />
      <Trinity />
      <SocialProof />
      <Footer />  
    </main>
  );
}