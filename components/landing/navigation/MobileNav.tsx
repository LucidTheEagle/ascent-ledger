"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Target, PenLine, Search, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { COPY } from "@/lib/constants";

// Icon mapping for feature cards
const iconMap = {
  "Vision": Target,
  "Log": PenLine,
  "Fog Check": Search,
  "Roster": Users,
};

// Feature descriptions
const featureDescriptions = {
  "Vision": "Define your target coordinates",
  "Log": "Document your ascent",
  "Fog Check": "AI pattern detection",
  "Roster": "View active climbers",
};

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const [isDragging, setIsDragging] = useState(false);

  // CRITICAL: Lock body scroll when mobile nav is open
  useEffect(() => {
    if (isOpen) {
      // Store original body styles
      const originalStyle = window.getComputedStyle(document.body).overflow;
      const originalPaddingRight = window.getComputedStyle(document.body).paddingRight;
      
      // Get scrollbar width to prevent layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // Lock scroll
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      
      // Cleanup on unmount or close
      return () => {
        document.body.style.overflow = originalStyle;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [isOpen]);

  // CRITICAL: Auto-close on desktop resize
  useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => {
      // Close mobile nav if window width exceeds tablet breakpoint (768px)
      if (window.innerWidth >= 768) {
        onClose();
      }
    };

    // Listen for resize events
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, onClose]);

  // Mock user data (replace with real auth state)
  const userData = {
    fogLevel: 0, // 0-100 (0 = unknown for logged-out users)
    lastLog: null, // "3 days ago" or null
    isLoggedIn: false,
  };

  // Handle drag end to dismiss
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 150) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* BACKDROP - Dimmed background with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-ascent-black/70 backdrop-blur-sm"
          />

          {/* BOTTOM SHEET */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 300,
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            className={cn(
              "fixed bottom-0 left-0 right-0 z-[70]",
              "rounded-t-3xl",
              "bg-ascent-obsidian/95 backdrop-blur-xl",
              "border-t border-white/10",
              "shadow-[0_-8px_32px_rgba(0,0,0,0.5)]",
              "max-h-[85vh] overflow-y-auto",
              // ENHANCED: Better mobile touch handling
              "overscroll-contain", // Prevent scroll chaining to body
              "touch-pan-y", // Only allow vertical pan
              // ENHANCED: Safe area support for notch devices
              "pb-safe-area-inset-bottom"
            )}
          >
            {/* DRAG HANDLE */}
            <div className="sticky top-0 z-10 flex justify-center pt-4 pb-2 bg-ascent-obsidian/95 backdrop-blur-xl">
              <div className="w-12 h-1.5 rounded-full bg-white/20" />
            </div>

            {/* CONTENT */}
            <div className="px-6 pb-8 pt-2 flex flex-col space-y-6">
              
              {/* MISSION CONTROL HEADER */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.05 }}
                className="text-center"
              >
                <h2 className="text-xs font-mono uppercase tracking-widest text-ascent-gray/60">
                  ━━━━━━━━━━ MISSION CONTROL ━━━━━━━━━━
                </h2>
              </motion.div>

              {/* STATUS BAR */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="w-full p-4 rounded-xl bg-ascent-obsidian/50 border border-white/5"
              >
                {userData.isLoggedIn ? (
                  <>
                    {/* Logged In State */}
                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="text-ascent-gray font-mono uppercase text-xs tracking-wider">FOG LEVEL</span>
                      <span className={cn(
                        "font-mono font-semibold",
                        userData.fogLevel < 30 ? "text-ascent-green" :
                        userData.fogLevel < 60 ? "text-ascent-amber" :
                        "text-ascent-red"
                      )}>
                        {userData.fogLevel}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className={cn(
                            "h-full rounded-full",
                            userData.fogLevel < 30 ? "bg-ascent-green" :
                            userData.fogLevel < 60 ? "bg-ascent-amber" :
                            "bg-ascent-red"
                          )}
                          initial={{ width: 0 }}
                          animate={{ width: `${userData.fogLevel}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                    {userData.lastLog && (
                      <p className="text-xs text-ascent-gray/60 mt-2">
                        Last log: {userData.lastLog}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    {/* Logged Out State */}
                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="text-ascent-gray font-mono uppercase text-xs tracking-wider">FOG LEVEL</span>
                      <span className="text-ascent-red font-mono font-semibold">UNKNOWN</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-ascent-red/50 to-ascent-amber/50 w-0"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-ascent-gray/60 mt-2">
                      Start logging to track your ascent
                    </p>
                  </>
                )}
              </motion.div>

              {/* NAV LINKS - Card-Based with Icons */}
              <nav className="w-full space-y-3">
                {COPY.nav.links.map((link, index) => {
                  const Icon = iconMap[link.label as keyof typeof iconMap];
                  const description = featureDescriptions[link.label as keyof typeof featureDescriptions];
                  
                  return (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + (index * 0.05) }}
                    >
                      <Link
                        href={link.href}
                        onClick={onClose}
                        className={cn(
                          "block w-full p-4",
                          "rounded-xl",
                          "bg-ascent-card/40 border border-white/5",
                          "hover:bg-ascent-card/60 hover:border-white/10",
                          "active:scale-[0.98]",
                          "transition-all duration-200",
                          "min-h-[72px]", // Extra height for icon + text
                          "group"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          {Icon && (
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-ascent-blue/10 border border-ascent-blue/20 flex items-center justify-center group-hover:bg-ascent-blue/20 transition-colors">
                              <Icon className="w-5 h-5 text-ascent-blue" />
                            </div>
                          )}
                          
                          {/* Text */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-white mb-0.5">
                              {link.label}
                            </h3>
                            {description && (
                              <p className="text-sm text-ascent-gray/70">
                                {description}
                              </p>
                            )}
                          </div>

                          {/* Arrow */}
                          <ArrowRight className="w-5 h-5 text-ascent-gray/40 group-hover:text-ascent-blue group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-2" />
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              {/* PRIMARY CTA */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35, type: "spring" }}
                className="w-full pt-2"
              >
                <Link
                  href="/sign-up"
                  onClick={onClose}
                  className={cn(
                    "flex items-center justify-center gap-2",
                    "w-full py-4 px-6",
                    "bg-ascent-blue text-white font-semibold text-base",
                    "rounded-xl",
                    "hover:bg-ascent-blue/90 active:scale-[0.98]",
                    "transition-all duration-200",
                    "shadow-[0_0_24px_rgba(59,130,246,0.3)]",
                    "border border-ascent-blue/20",
                    "min-h-[52px]"
                  )}
                >
                  START YOUR ASCENT
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>

              {/* SECONDARY ACTION - Login */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center pb-2"
              >
                <p className="text-sm text-ascent-gray/60">
                  Already climbing?{" "}
                  <Link
                    href="/login"
                    onClick={onClose}
                    className="text-ascent-blue hover:text-ascent-purple font-medium transition-colors"
                  >
                    Login
                  </Link>
                </p>
              </motion.div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}