"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";

export const TerminalTicker = ({
  items,
  speed = "slow", // slow = 50px/s, normal = 75px/s, fast = 100px/s
  pauseOnHover = true,
  className,
}: {
  items: string[];
  speed?: "slow" | "normal" | "fast";
  pauseOnHover?: boolean;
  className?: string;
  direction?: string;
}) => {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDuration, setAnimationDuration] = useState("40s");

  useEffect(() => {
    if (!scrollerRef.current) return;

    // Duplicate items for seamless loop
    const scroller = scrollerRef.current;
    const items = Array.from(scroller.children);
    
    items.forEach((item) => {
      const clone = item.cloneNode(true);
      scroller.appendChild(clone);
    });

    // Calculate animation duration based on speed
    const width = scroller.scrollWidth / 2; // Half because we duplicated
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    
    const speedMap = {
      slow: isMobile ? 40 : 50,    // Mobile: 40px/s, Desktop: 50px/s
      normal: 75,                   // 75px per second
      fast: 100,                    // 100px per second
    };
    
    const pixelsPerSecond = speedMap[speed];
    const duration = width / pixelsPerSecond;
    
    setAnimationDuration(`${duration}s`);
    setIsAnimating(true);

    // Recalculate on window resize (for mobile/desktop switch)
    const handleResize = () => {
      if (!scrollerRef.current) return;
      const newWidth = scrollerRef.current.scrollWidth / 2;
      const newIsMobile = window.innerWidth < 768;
      const newSpeed = speedMap[speed];
      const newDuration = newWidth / (newIsMobile && speed === "slow" ? 40 : newSpeed);
      setAnimationDuration(`${newDuration}s`);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [speed]);

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        "[mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]",
        className
      )}
    >
      <div
        ref={scrollerRef}
        className={cn(
          "flex w-max gap-8",
          isAnimating && "animate-scroll-ticker",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
        style={{
          animationDuration: animationDuration,
        }}
      >
        {items.map((item, idx) => (
          <div
            key={idx}
            className={cn(
              "whitespace-nowrap font-mono text-sm md:text-base",
              // Alternate colors
              idx % 2 === 0 ? "text-ascent-blue" : "text-ascent-green"
            )}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};