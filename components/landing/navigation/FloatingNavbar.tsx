"use client";

import { useState } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SCROLL } from "@/lib/constants";

interface FloatingNavbarProps {
  mobileNavOpen?: boolean; // ADDED: Track mobile nav state
}

// ENHANCED: Mini-dashboard instead of just links
// Shows user state (or mock data for logged-out users)
export function FloatingNavbar({ mobileNavOpen = false }: FloatingNavbarProps) {
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);

  // Mock user data (replace with real data from auth/context)
  const userData = {
    week: 3,
    streak: 2,
    fogLevel: 35, // percentage (0-100)
    isLoggedIn: false, // Set to true when user is authenticated
  };

  useMotionValueEvent(scrollY, "change", (current) => {
    // CRITICAL: Don't show floating nav if mobile nav is open
    if (mobileNavOpen) {
      setVisible(false);
      return;
    }

    if (typeof current === "number") {
      const previous = scrollY.getPrevious() || 0;
      const direction = current - previous;

      if (scrollY.get() < SCROLL.navbarHideThreshold) {
        setVisible(false);
      } else {
        if (direction < 0) {
          setVisible(true);
        } else {
          setVisible(false);
        }
      }
    }
  });

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "fixed top-6 inset-x-0 mx-auto z-[100]",
            "flex max-w-fit items-center justify-center gap-3",
            "rounded-full border border-white/10",
            "bg-ascent-obsidian/90 backdrop-blur-lg",
            "px-6 py-3",
            "shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]"
          )}
        >
          {userData.isLoggedIn ? (
            <>
              {/* USER STATE - Mini Dashboard */}
              <div className="flex items-center gap-3 text-xs font-mono text-ascent-gray">
                {/* Week Counter */}
                <span className="flex items-center gap-1.5">
                  <span className="text-white font-semibold">Week {userData.week}</span>
                </span>

                {/* Divider */}
                <div className="w-px h-4 bg-white/10" />

                {/* Streak */}
                <span className="flex items-center gap-1.5">
                  <span className="text-ascent-green">●</span>
                  <span className="text-white">Streak: {userData.streak}</span>
                </span>

                {/* Divider */}
                <div className="w-px h-4 bg-white/10" />

                {/* Fog Level Indicator */}
                <span className="flex items-center gap-1.5">
                  <div className="relative w-12 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className={cn(
                        "absolute inset-y-0 left-0 rounded-full",
                        userData.fogLevel < 30 ? "bg-ascent-green" :
                        userData.fogLevel < 60 ? "bg-ascent-amber" :
                        "bg-ascent-red"
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${userData.fogLevel}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                  <span className="text-white">{userData.fogLevel}% fog</span>
                </span>
              </div>

              {/* Dashboard Link */}
              <Link
                href="/dashboard"
                className={cn(
                  "ml-3 pl-3 border-l border-white/10",
                  "flex items-center gap-1.5",
                  "text-sm font-semibold text-ascent-blue hover:text-ascent-purple transition-colors"
                )}
              >
                Dashboard
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          ) : (
            <>
              {/* LOGGED OUT STATE - Status Unknown */}
              <div className="flex items-center gap-3 text-xs font-mono text-ascent-gray">
                <span className="flex items-center gap-1.5">
                  <span className="text-ascent-red">●</span>
                  <span className="text-white">FOG: UNKNOWN</span>
                </span>

                {/* Divider */}
                <div className="w-px h-4 bg-white/10" />

                <span className="text-ascent-gray/60">Start logging to track ascent</span>
              </div>

              {/* Login Link */}
              <Link
                href="/login"
                className={cn(
                  "ml-3 pl-3 border-l border-white/10",
                  "flex items-center gap-1.5",
                  "text-sm font-semibold text-ascent-blue hover:text-ascent-purple transition-colors"
                )}
              >
                Login
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}