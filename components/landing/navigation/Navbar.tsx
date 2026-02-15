"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { ArrowRight, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/landing/navigation/MobileNav";
import { FloatingNavbar } from "@/components/landing/navigation/FloatingNavbar";
import { cn } from "@/lib/utils";
import { COPY, SCROLL } from "@/lib/constants";
import { fadeInVariants } from "@/lib/animations";

export function Navbar() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hide full navbar when scrolling down past threshold
  // Track scroll state for background opacity change
  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > SCROLL.navbarHideThreshold) {
      setHidden(true);
    } else {
      setHidden(false);
    }
    
    // More solid background when scrolled down
    setScrolled(latest > 50);
  });

  return (
    <>
      <motion.header
        variants={fadeInVariants}
        initial="initial"
        animate={hidden ? "exit" : "animate"}
        className={cn(
          "fixed top-0 left-0 right-0 z-50",
          "flex items-center justify-between",
          "px-6 py-4 md:px-12 md:py-6",
          // ENHANCED: Glass effect that solidifies on scroll
          scrolled 
            ? "bg-ascent-obsidian/90 backdrop-blur-lg" 
            : "bg-ascent-obsidian/40 backdrop-blur-lg",
          "border-b border-white/10",
          "transition-colors duration-300",
          // ENHANCED: Animated scan line border
          "relative overflow-hidden"
        )}
      >
        {/* ANIMATED SCAN LINE - Radar sweep effect */}
        <motion.div
          className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-ascent-blue to-transparent"
          animate={{
            x: ["-100%", "200%"],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ opacity: 0.6 }}
        />

        {/* LOGO - Enhanced with crosshair pulse */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-ascent-black/30 border border-white/20 group-hover:border-white/40 transition-all">
            {/* Crosshair Icon with Pulse */}
            <motion.div
              className="relative w-5 h-5"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {/* Vertical line */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1.5px] h-full bg-white" />
              {/* Horizontal line */}
              <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-[1.5px] bg-white" />
              {/* Center dot */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            </motion.div>
          </div>
          <span className="text-base font-bold tracking-wide text-white">
            ASCENT
          </span>
        </Link>

        {/* DESKTOP NAV LINKS */}
        <nav className="hidden md:flex items-center gap-8">
          {COPY.nav.links.slice(0, 4).map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-white/80 hover:text-white transition-colors relative group"
            >
              {link.label}
              {/* Hover Underline */}
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* CTA & MOBILE MENU */}
        <div className="flex items-center gap-4">
          {/* Desktop CTA */}
          <div className="hidden md:block">
            <Button
              size="sm"
              className="bg-white text-ascent-blue hover:bg-white/90 font-semibold"
            >
              {COPY.nav.ctaLabel}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Mobile Menu Button - Enhanced with signal strength icon */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className={cn(
              "md:hidden",
              "p-2.5", // Creates 44px tap target with icon
              "text-white hover:text-white/80",
              "transition-all duration-200",
              "rounded-lg hover:bg-white/10",
              "active:scale-95"
            )}
            aria-label="Open menu"
          >
            {/* Signal Strength Icon (|||) - More tactical than hamburger */}
            <div className="flex items-end gap-0.5 w-6 h-6">
              <motion.div 
                className="w-1.5 h-3 bg-white rounded-sm"
                whileHover={{ height: "16px" }}
                transition={{ duration: 0.2 }}
              />
              <motion.div 
                className="w-1.5 h-4 bg-white rounded-sm"
                whileHover={{ height: "18px" }}
                transition={{ duration: 0.2, delay: 0.05 }}
              />
              <motion.div 
                className="w-1.5 h-5 bg-white rounded-sm"
                whileHover={{ height: "20px" }}
                transition={{ duration: 0.2, delay: 0.1 }}
              />
            </div>
          </button>
        </div>
      </motion.header>

      {/* MOBILE NAV BOTTOM SHEET */}
      <MobileNav 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
      />

      {/* FLOATING NAV - Hidden when mobile nav is open */}
      <FloatingNavbar mobileNavOpen={mobileMenuOpen} />
    </>
  );
}