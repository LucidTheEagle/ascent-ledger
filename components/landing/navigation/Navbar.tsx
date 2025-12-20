"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { ArrowRight, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { COPY, SCROLL } from "@/lib/constants";
import { fadeInVariants } from "@/lib/animations";

export function Navbar() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

  // Hide full navbar when scrolling down past threshold
  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > SCROLL.navbarHideThreshold) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  return (
    <motion.header
      variants={fadeInVariants}
      initial="initial"
      animate={hidden ? "exit" : "animate"}
      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        "flex items-center justify-between",
        "px-6 py-4 md:px-12 md:py-6",
        "bg-ascent-blue/90 backdrop-blur-md",
        "border-b border-white/10"
      )}
    >
      {/* LOGO */}
      <Link href="/" className="flex items-center gap-2 group">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-ascent-black/30 border border-white/20 group-hover:border-white/40 transition-all">
          {/* Abstract Radar Icon */}
          <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.6)]" />
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

        {/* Mobile Hamburger (placeholder for Phase 9) */}
        <button
          className="md:hidden p-2 text-white hover:text-white/80 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </motion.header>
  );
}