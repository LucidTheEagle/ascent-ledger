"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { COPY } from "@/lib/constants";
import { fadeInVariants, viewportConfig } from "@/lib/animations";

// Typing effect for the quote
const TypingQuote = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    
    let i = 0;
    const typing = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typing);
      }
    }, 60); // 60ms per character as per spec
    
    return () => clearInterval(typing);
  }, [started, text]);

  return <span>{displayedText}</span>;
};

// Animated underline link component
const AnimatedLink = ({ href, children, delay = 0 }: { href: string; children: React.ReactNode; delay?: number }) => {
  return (
    <motion.div
      initial="initial"
      whileInView="animate"
      viewport={viewportConfig}
      variants={fadeInVariants}
      transition={{ delay }}
      className="relative group"
    >
      <Link 
        href={href}
        className="text-ascent-gray hover:text-white transition-colors duration-300 text-sm md:text-base min-h-[44px] flex items-center"
      >
        {children}
      </Link>
      {/* Animated underline */}
      <motion.div
        className="absolute bottom-0 left-0 h-px bg-ascent-blue"
        initial={{ width: 0 }}
        whileHover={{ width: "100%" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      />
    </motion.div>
  );
};

export function Footer() {
    const footerLinks = [
      { label: "Manifesto", href: "/manifesto" },
      { label: "GitHub", href: "https://github.com/lucidtheeagle/ascent-ledger" },
      { label: "Login", href: "/login" },
    ];
  
    return (
      <footer className="relative w-full py-12 md:py-20 lg:py-24 overflow-hidden bg-ascent-black border-t border-white/5">
        {/* SUBTLE GLOW BEHIND FOOTER */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-48 md:h-64 bg-ascent-blue/5 blur-[100px] md:blur-[120px] pointer-events-none" />
  
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center space-y-8 md:space-y-10">
  
          {/* QUOTE - Responsive sizing */}
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={viewportConfig}
            variants={fadeInVariants}
            className="max-w-2xl px-4"
          >
            <p className="text-white/80 text-base md:text-lg lg:text-xl font-light leading-relaxed italic font-serif">
              <TypingQuote text={COPY.footer.quote} delay={500} />
            </p>
          </motion.div>
  
          {/* NAVIGATION LINKS - Stack on mobile, horizontal on desktop */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-10 lg:gap-12 w-full">
            {footerLinks.map((link, index) => (
              <AnimatedLink 
                key={link.href} 
                href={link.href}
                delay={0.6 + (index * 0.1)}
              >
                {link.label}
              </AnimatedLink>
            ))}
          </div>
  
          {/* DIVIDER - The horizon line */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={viewportConfig}
            transition={{ delay: 0.9, duration: 1.5, ease: "circOut" }}
            className="w-full max-w-[200px] md:max-w-xs h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />
  
          {/* COPYRIGHT */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="text-ascent-gray/50 text-xs md:text-sm tracking-widest uppercase pt-2"
          >
            © {new Date().getFullYear()} — {COPY.footer.copyright}
          </motion.p>
        </div>
      </footer>
    );
}