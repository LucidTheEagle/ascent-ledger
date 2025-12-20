"use client";

import { useState } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { COPY, SCROLL } from "@/lib/constants";

export function FloatingNavbar() {
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollY, "change", (current) => {
    // Check if we have scrolled enough to show floating nav
    if (typeof current === "number") {
      const previous = scrollY.getPrevious() || 0;
      const direction = current - previous;

      if (scrollY.get() < SCROLL.navbarHideThreshold) {
        // We are at the top, hide floating nav (show main nav instead)
        setVisible(false);
      } else {
        if (direction < 0) {
          // Scrolling UP -> Show
          setVisible(true);
        } else {
          // Scrolling DOWN -> Hide
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
            "fixed top-6 inset-x-0 mx-auto z-100",
            "flex max-w-fit items-center justify-center gap-6",
            "rounded-full border border-white/10",
            "bg-ascent-obsidian/80 backdrop-blur-lg",
            "px-8 py-3",
            "shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]"
          )}
        >
          {/* Show only first 3 links for compact floating nav */}
          {COPY.nav.links.slice(0, 3).map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                "relative text-sm font-medium text-ascent-gray hover:text-white transition-colors",
                "group"
              )}
            >
              {link.label}
              {/* Subtle underline on hover */}
              <span className="absolute -bottom-1 left-0 w-0 h-1px bg-ascent-blue transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
          
          {/* Mini Login Link */}
          <Link 
            href="/login"
            className={cn(
              "ml-2 pl-6 border-l border-white/10",
              "text-sm font-semibold text-ascent-blue hover:text-ascent-purple transition-colors"
            )}
          >
            Login
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}