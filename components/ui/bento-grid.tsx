// ============================================
// components/ui/bento-grid.tsx
// UPDATED: CP16 - Mobile stack fixes, min-h-0, overflow protection
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
        // Grid system — 1 col mobile, 2 col tablet, 3 col desktop
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        "gap-4 md:gap-6",
        "w-full max-w-7xl mx-auto",
        // Prevent child overflow bleeding outside grid
        "overflow-hidden",
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
        "glass-panel rounded-2xl border border-white/10",
        "p-4 md:p-6",
        "transition-all duration-300 hover:border-white/20",
        // Flex column — min-h-0 prevents flex children from overflowing
        // on Safari and older Chromium when content is taller than the cell
        "flex flex-col min-h-0",
        // Mobile: always full width (grid-cols-1 handles this)
        // Tablet (md): 2-col grid
        // Desktop (lg): 3-col grid
        colSpan === 2 && "md:col-span-2 lg:col-span-2",
        colSpan === 3 && "md:col-span-2 lg:col-span-3",
        // Row spans — only apply at md+, no row spanning on mobile
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
      <div className="flex items-center gap-2 min-w-0">
        {icon && (
          <div className="text-blue-400 shrink-0" aria-hidden="true">
            {icon}
          </div>
        )}
        {/* min-w-0 + truncate prevents long titles breaking layout */}
        <h2 className="text-lg md:text-xl font-semibold text-white truncate">
          {title}
        </h2>
      </div>
      {action && <div className="shrink-0 ml-2">{action}</div>}
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
    // min-h-0 here too — nested flex columns need it at every level
    <div className={cn("flex-1 flex flex-col min-h-0", className)}>
      {children}
    </div>
  );
}