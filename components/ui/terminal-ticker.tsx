"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";

export const TerminalTicker = ({
  items,
  speed = "slow",
  direction = "left",
  pauseOnHover = true,
  className,
}: {
  items: string[];
  speed?: "slow" | "normal" | "fast";
  direction?: "left" | "right";
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const hasDuplicatedRef = useRef(false);

  const [animationDuration, setAnimationDuration] = useState("40s");

  // DOM mutation only
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || hasDuplicatedRef.current) return;

    const children = Array.from(scroller.children);
    children.forEach((child) => {
      scroller.appendChild(child.cloneNode(true));
    });

    scroller.classList.add("animate-scroll-ticker");
    hasDuplicatedRef.current = true;
  }, []);

  // Duration calculation
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const speedMap: Record<typeof speed, number> = {
      slow: 50,
      normal: 75,
      fast: 100,
    };

    const width = scroller.scrollWidth / 2;
    const duration = width / speedMap[speed];

    setAnimationDuration(`${duration}s`);
  }, [speed, items]);

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
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
        style={{
          animationDuration,
          animationDirection: direction === "left" ? "normal" : "reverse",
        }}
      >
        {items.map((item, idx) => (
          <div
            key={`${item}-${idx}`}
            className={cn(
              "whitespace-nowrap font-mono text-sm md:text-base",
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
