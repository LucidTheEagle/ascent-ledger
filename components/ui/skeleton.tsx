// components/ui/skeleton.tsx
// UPDATED: CP20 - Fixed bg-accent (light mode token, wrong on dark theme)
// Now uses data-loading="true" which maps to the shimmer animation
// already defined in globals.css — no new CSS needed

import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      // data-loading="true" triggers the shimmer keyframe from globals.css:
      // background: linear-gradient(obsidian → card → obsidian)
      // animation: loading 1.5s ease-in-out infinite
      // This matches the dark theme perfectly — no bg-accent needed
      data-loading="true"
      className={cn(
        "rounded-md",
        // Explicit fallback color in case data-loading CSS isn't applied
        "bg-ascent-card/40",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }