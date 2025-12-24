"use client";

import React, { useMemo } from "react";
import { motion, useMotionTemplate, useMotionValue, MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

/* ------------------ Types ------------------ */

type EvervaultCardProps = {
  text?: string;
  className?: string;
};

type CardPatternProps = {
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  randomString: string;
};

type IconProps = React.SVGProps<SVGSVGElement>;

/* ------------------ Helpers ------------------ */

const CHARACTERS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

const generateRandomString = (length: number): string => {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += CHARACTERS.charAt(
      Math.floor(Math.random() * CHARACTERS.length)
    );
  }
  return result;
};

/* ------------------ Components ------------------ */

export const EvervaultCard = ({ text, className }: EvervaultCardProps) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // 
  const randomString = useMemo(() => generateRandomString(1500), []);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  };

  return (
    <div
      className={cn(
        "p-0.5 bg-transparent aspect-square flex items-center justify-center w-full h-full relative",
        className
      )}
    >
      <div
        onMouseMove={onMouseMove}
        className="group/card rounded-3xl w-full relative overflow-hidden bg-transparent flex items-center justify-center h-full"
      >
        <CardPattern
          mouseX={mouseX}
          mouseY={mouseY}
          randomString={randomString}
        />

        <div className="relative z-10 flex items-center justify-center">
          <div className="relative h-44 w-44 rounded-full flex items-center justify-center text-white font-bold text-4xl">
            <div className="absolute w-full h-full bg-white/[0.8] dark:bg-black/[0.8] blur-sm rounded-full" />
            <span className="dark:text-white text-black z-20">
              {text}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CardPattern = ({
  mouseX,
  mouseY,
  randomString,
}: CardPatternProps) => {
  const maskImage = useMotionTemplate`
    radial-gradient(
      250px at ${mouseX}px ${mouseY}px,
      white,
      transparent
    )
  `;

  const style = {
    maskImage,
    WebkitMaskImage: maskImage,
  };

  return (
    <div className="pointer-events-none">
      <div className="absolute inset-0 rounded-2xl mask-[linear-gradient(white,transparent)] group-hover/card:opacity-50" />

      <motion.div
        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500 to-blue-700 opacity-0 group-hover/card:opacity-100 backdrop-blur-xl transition duration-500"
        style={style}
      />

      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 mix-blend-overlay group-hover/card:opacity-100"
        style={style}
      >
        <p className="absolute inset-x-0 text-xs h-full break-words whitespace-pre-wrap text-white font-mono font-bold transition duration-500">
          {randomString}
        </p>
      </motion.div>
    </div>
  );
};

export const Icon = ({ className, ...rest }: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
      {...rest}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v12m6-6H6"
      />
    </svg>
  );
};
