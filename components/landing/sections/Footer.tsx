"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { COPY } from "@/lib/constants";
import { fadeInVariants, viewportConfig } from "@/lib/animations";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/* --------------------------------
   Typing Quote (Reduced-Motion Safe)
--------------------------------- */
function TypingQuote({
  text,
  delay = 0,
}: {
  text: string;
  delay?: number;
}) {
  const prefersReducedMotion = useReducedMotion();

  // Derive initial state correctly
  const [displayedText, setDisplayedText] = useState(
    prefersReducedMotion ? text : ""
  );

  useEffect(() => {
    if (prefersReducedMotion) return;

    let typingInterval: NodeJS.Timeout;

    const startTimer = setTimeout(() => {
      let i = 0;
      typingInterval = setInterval(() => {
        i++;
        setDisplayedText(text.slice(0, i));
        if (i >= text.length) clearInterval(typingInterval);
      }, 60);
    }, delay);

    return () => {
      clearTimeout(startTimer);
      if (typingInterval) clearInterval(typingInterval);
    };
  }, [delay, prefersReducedMotion, text]);

  return <span>{displayedText}</span>;
}

/* --------------------------------
   Animated Link
--------------------------------- */
function AnimatedLink({
  href,
  children,
  delay = 0,
}: {
  href: string;
  children: React.ReactNode;
  delay?: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const isExternal = href.startsWith("http");

  return (
    <motion.div
      initial="initial"
      whileInView="animate"
      viewport={viewportConfig}
      variants={prefersReducedMotion ? undefined : fadeInVariants}
      transition={{ delay: prefersReducedMotion ? 0 : delay }}
      className="relative group"
    >
      <Link
        href={href}
        {...(isExternal && {
          target: "_blank",
          rel: "noopener noreferrer",
        })}
        className="text-ascent-gray hover:text-white transition-colors duration-300 text-sm md:text-base min-h-[44px] flex items-center"
      >
        {children}
      </Link>

      {!prefersReducedMotion && (
        <motion.div
          className="absolute bottom-0 left-0 h-px bg-ascent-blue"
          initial={{ width: 0 }}
          whileHover={{ width: "100%" }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
      )}
    </motion.div>
  );
}

/* --------------------------------
   Footer
--------------------------------- */
export function Footer() {
  const prefersReducedMotion = useReducedMotion();

  const footerLinks = [
    { label: "Manifesto", href: "/manifesto" },
    { label: "GitHub", href: "https://github.com/lucidtheeagle/ascent-ledger" },
    { label: "Login", href: "/login" },
  ];

  return (
    <footer className="relative w-full py-12 md:py-20 lg:py-24 overflow-hidden bg-ascent-black border-t border-white/5">
      {/* Subtle Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-48 md:h-64 bg-ascent-blue/5 blur-[100px] md:blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center space-y-8 md:space-y-10">
        {/* Quote */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={viewportConfig}
          variants={prefersReducedMotion ? undefined : fadeInVariants}
          className="max-w-2xl px-4"
        >
          <p className="text-white/80 text-base md:text-lg lg:text-xl font-light leading-relaxed italic font-serif">
            <TypingQuote text={COPY.footer.quote} delay={500} />
          </p>
        </motion.div>

        {/* Links */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-10 lg:gap-12 w-full">
          {footerLinks.map((link, index) => (
            <AnimatedLink
              key={link.href}
              href={link.href}
              delay={0.6 + index * 0.1}
            >
              {link.label}
            </AnimatedLink>
          ))}
        </div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={viewportConfig}
          transition={{
            delay: prefersReducedMotion ? 0 : 0.9,
            duration: prefersReducedMotion ? 0.3 : 1.5,
            ease: "circOut",
          }}
          style={{
            willChange: prefersReducedMotion ? "auto" : "transform, opacity",
          }}
          className="w-full max-w-[200px] md:max-w-xs h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
        />

        {/* Copyright */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: prefersReducedMotion ? 0 : 1.4 }}
          className="text-ascent-gray/50 text-xs md:text-sm tracking-widest uppercase pt-2"
        >
          © {new Date().getFullYear()} — {COPY.footer.copyright}
        </motion.p>
      </div>
    </footer>
  );
}
