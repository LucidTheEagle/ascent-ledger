"use client";

import { useState } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { COPY } from "@/lib/constants";

// Eagle Icon (simplified for mobile)
const EagleIcon = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-white opacity-30"
  >
    <path
      d="M50 20 L35 35 L30 45 L25 50 L30 55 L35 60 L40 70 L45 75 L50 80 L55 75 L60 70 L65 60 L70 55 L75 50 L70 45 L65 35 L50 20Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M35 35 L15 40 L10 45 M65 35 L85 40 L90 45"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="50" cy="28" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const [isDragging, setIsDragging] = useState(false);

  // Handle drag end to dismiss
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // If dragged down more than 150px, close the sheet
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
              "max-h-[85vh] overflow-hidden"
            )}
            style={{
              background: "rgba(59, 130, 246, 0.1)",
              backdropFilter: "blur(16px)",
            }}
          >
            {/* DRAG HANDLE */}
            <div className="flex justify-center pt-4 pb-2">
              <div className="w-12 h-1.5 rounded-full bg-white/20" />
            </div>

            {/* CONTENT */}
            <div className="px-6 pb-8 pt-2 flex flex-col items-center space-y-8">
              
              {/* HINT TEXT */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-xs text-ascent-gray font-mono uppercase tracking-wider"
              >
                ↓ Drag to dismiss
              </motion.p>

              {/* NAV LINKS - Staggered animation */}
              <nav className="w-full space-y-4">
                {COPY.nav.links.map((link, index) => (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }} // 0ms, 50ms, 100ms, 150ms
                  >
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className={cn(
                        "block w-full py-4 px-6",
                        "text-lg font-medium text-white",
                        "rounded-xl",
                        "hover:bg-white/5 active:bg-white/10",
                        "transition-all duration-200",
                        "text-center",
                        // Min tap target: 44px
                        "min-h-[44px]"
                      )}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* PRIMARY CTA */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-full"
              >
                <Link
                  href="/login"
                  onClick={onClose}
                  className={cn(
                    "flex items-center justify-center gap-2",
                    "w-full py-4 px-6",
                    "bg-ascent-blue text-white font-semibold text-base",
                    "rounded-xl",
                    "hover:bg-ascent-blue/90 active:scale-95",
                    "transition-all duration-200",
                    "shadow-[0_0_20px_rgba(59,130,246,0.3)]",
                    // Min tap target: 44px
                    "min-h-[44px]"
                  )}
                >
                  {COPY.nav.ctaLabel}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>

              {/* EAGLE ICON - Decorative */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="pt-4"
              >
                <EagleIcon />
              </motion.div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}