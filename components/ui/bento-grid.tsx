// ============================================
// components/ui/bento-grid.tsx
// UPDATED: Checkpoint 10 - Enhanced mobile responsiveness
// ============================================

import { cn } from "@/lib/utils";

interface BentoGridProps {
  children: React.ReactNode;
  className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6",
        "w-full max-w-7xl mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
}

interface BentoGridItemProps {
  children: React.ReactNode;
  className?: string;
  colSpan?: 1 | 2 | 3;
  rowSpan?: 1 | 2;
}

export function BentoGridItem({
  children,
  className,
  colSpan = 1,
  rowSpan = 1,
}: BentoGridItemProps) {
  return (
    <div
      className={cn(
        // Base styles
        "glass-panel rounded-2xl border border-white/10 p-4 md:p-6",
        "transition-all duration-300 hover:border-white/20",
        "flex flex-col",
        // Column spans (desktop only, mobile always full width)
        colSpan === 2 && "md:col-span-2 lg:col-span-2",
        colSpan === 3 && "md:col-span-2 lg:col-span-3",
        // Row spans
        rowSpan === 2 && "md:row-span-2",
        className
      )}
    >
      {children}
    </div>
  );
}

interface BentoCardHeaderProps {
  icon?: React.ReactNode;
  title: string;
  action?: React.ReactNode;
  className?: string;
}

export function BentoCardHeader({
  icon,
  title,
  action,
  className,
}: BentoCardHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      <div className="flex items-center gap-2">
        {icon && <div className="text-blue-400">{icon}</div>}
        <h2 className="text-lg md:text-xl font-semibold text-white">{title}</h2>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

interface BentoCardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function BentoCardContent({
  children,
  className,
}: BentoCardContentProps) {
  return (
    <div className={cn("flex-1 flex flex-col", className)}>
      {children}
    </div>
  );
}