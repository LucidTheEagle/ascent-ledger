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

  // Footer link structure - 3 columns
  const footerColumns = {
    product: [
      { label: "Vision Canvas", href: "/vision-canvas" },
      { label: "Strategic Log", href: "/log" },
      { label: "Fog Check", href: "/fog-check" },
    ],
    resources: [
      { label: "Manifesto", href: "/manifesto" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
    connect: [
      { label: "GitHub", href: "https://github.com/lucidtheeagle/ascent-ledger" },
      { label: "Twitter", href: "https://twitter.com/ascentledger" },
    ],
  };

  return (
    <footer className="relative w-full py-16 md:py-20 lg:py-24 overflow-hidden bg-ascent-black border-t border-white/5">
      
      {/* ENHANCED BACKGROUND - Gradient Horizon with Grid */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gradient horizon */}
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(
              180deg,
              transparent 0%,
              rgba(59, 130, 246, 0.05) 50%,
              rgba(139, 92, 246, 0.05) 100%
            )`
          }}
        />
        
        {/* Subtle grid pattern (radar) */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(59,130,246,0.3) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(59,130,246,0.3) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Fade in effect */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2 }}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-ascent-blue/10 blur-[120px]"
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* QUOTE SECTION - With Attribution */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={viewportConfig}
          variants={prefersReducedMotion ? undefined : fadeInVariants}
          className="max-w-3xl mx-auto text-center mb-12 md:mb-16"
        >
          <blockquote className="text-white/80 text-lg md:text-xl lg:text-2xl font-light leading-relaxed italic font-serif mb-4">
            &quot;<TypingQuote text={COPY.footer.quote} delay={500} />&quot;
          </blockquote>
          
          {/* Attribution */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={viewportConfig}
            transition={{ delay: prefersReducedMotion ? 0 : 1.5 }}
            className="text-ascent-gray/60 text-sm md:text-base mb-6"
          >
            — Marcus Aurelius, <em>Meditations</em>
          </motion.p>

          {/* Manifesto CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportConfig}
            transition={{ delay: prefersReducedMotion ? 0 : 2 }}
          >
            <Link 
              href="/manifesto"
              className="inline-flex items-center gap-2 text-ascent-blue hover:text-ascent-purple text-sm md:text-base font-medium transition-colors group"
            >
              Read the Full Manifesto
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </motion.div>
        </motion.div>

        {/* FOOTER GRID - 3 Columns */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={viewportConfig}
          transition={{ delay: prefersReducedMotion ? 0 : 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12 mb-12 md:mb-16 text-center sm:text-left"
        >
          
          {/* Column 1: Product */}
          <div>
            <h3 className="text-xs md:text-sm font-mono uppercase tracking-wider text-white/60 mb-4">
              Product
            </h3>
            <div className="space-y-3">
              {footerColumns.product.map((link, index) => (
                <AnimatedLink
                  key={link.href}
                  href={link.href}
                  delay={0.6 + index * 0.05}
                >
                  {link.label}
                </AnimatedLink>
              ))}
            </div>
          </div>

          {/* Column 2: Resources */}
          <div>
            <h3 className="text-xs md:text-sm font-mono uppercase tracking-wider text-white/60 mb-4">
              Resources
            </h3>
            <div className="space-y-3">
              {footerColumns.resources.map((link, index) => (
                <AnimatedLink
                  key={link.href}
                  href={link.href}
                  delay={0.7 + index * 0.05}
                >
                  {link.label}
                </AnimatedLink>
              ))}
            </div>
          </div>

          {/* Column 3: Connect */}
          <div>
            <h3 className="text-xs md:text-sm font-mono uppercase tracking-wider text-white/60 mb-4">
              Connect
            </h3>
            <div className="space-y-3">
              {footerColumns.connect.map((link, index) => (
                <AnimatedLink
                  key={link.href}
                  href={link.href}
                  delay={0.8 + index * 0.05}
                >
                  {link.label}
                </AnimatedLink>
              ))}
            </div>
          </div>

        </motion.div>

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
          className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8"
        />

        {/* ENHANCED BOTTOM BAR - With Active Users + Built in Public */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: prefersReducedMotion ? 0 : 1.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs md:text-sm text-ascent-gray/50 font-mono"
        >
          {/* Copyright */}
          <span className="uppercase tracking-widest">
            © {new Date().getFullYear()} {COPY.footer.copyright}
          </span>

          {/* Separator */}
          <span className="hidden sm:inline">•</span>

          {/* Active Climbers Count */}
          <span className="flex items-center gap-2">
            <span className="text-ascent-blue font-semibold">847 ACTIVE CLIMBERS</span>
          </span>

          {/* Separator */}
          <span className="hidden sm:inline">•</span>

          {/* Built in Public */}
          <span className="uppercase tracking-wider">
            BUILT IN PUBLIC
          </span>
        </motion.div>

      </div>
    </footer>
  );
}