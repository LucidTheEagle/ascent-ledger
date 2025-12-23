"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

type EncryptedTextProps = {
  text: string;
  className?: string;
  revealDelayMs?: number;
  charset?: string;
  flipDelayMs?: number;
  encryptedClassName?: string;
  revealedClassName?: string;
};

const DEFAULT_CHARSET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-={}[];:,.<>/?";

function randomChar(charset: string) {
  return charset[Math.floor(Math.random() * charset.length)];
}

function generateInitialScramble(text: string, charset: string) {
  return text.split("").map((ch) => (ch === " " ? " " : randomChar(charset)));
}

export const EncryptedText: React.FC<EncryptedTextProps> = ({
  text,
  className,
  revealDelayMs = 50,
  charset = DEFAULT_CHARSET,
  flipDelayMs = 50,
  encryptedClassName,
  revealedClassName,
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  const scrambleRef = useRef<string[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);
  const lastFlipTimeRef = useRef(0);

  const [revealCount, setRevealCount] = useState(0);
  const [scrambledText, setScrambledText] = useState<string[]>([]);

  useEffect(() => {
    if (!isInView || !text) return;

    scrambleRef.current = generateInitialScramble(text, charset);
    setScrambledText([...scrambleRef.current]);

    startTimeRef.current = performance.now();
    lastFlipTimeRef.current = startTimeRef.current;
    setRevealCount(0);

    const update = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const nextRevealCount = Math.min(
        text.length,
        Math.floor(elapsed / Math.max(1, revealDelayMs)),
      );

      setRevealCount(nextRevealCount);

      if (nextRevealCount < text.length) {
        if (now - lastFlipTimeRef.current >= flipDelayMs) {
          for (let i = nextRevealCount; i < text.length; i++) {
            scrambleRef.current[i] =
              text[i] === " " ? " " : randomChar(charset);
          }

          lastFlipTimeRef.current = now;
          setScrambledText([...scrambleRef.current]);
        }

        animationFrameRef.current = requestAnimationFrame(update);
      }
    };

    animationFrameRef.current = requestAnimationFrame(update);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isInView, text, revealDelayMs, flipDelayMs, charset]);

  if (!text) return null;

  return (
    <motion.span
      ref={ref}
      className={cn(className)}
      aria-label={text}
      role="text"
    >
      {text.split("").map((char, index) => {
        const isRevealed = index < revealCount;
        const displayChar = isRevealed
          ? char
          : scrambledText[index] ?? " ";

        return (
          <span
            key={index}
            className={cn(isRevealed ? revealedClassName : encryptedClassName)}
          >
            {displayChar}
          </span>
        );
      })}
    </motion.span>
  );
};
