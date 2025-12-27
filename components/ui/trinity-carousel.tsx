"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, PanInfo } from "framer-motion";
import { cn } from "@/lib/utils";

interface CarouselCard {
  id: string;
  content: React.ReactNode;
}

interface TrinityCarouselProps {
  cards: CarouselCard[];
  className?: string;
}

export function TrinityCarousel({ cards, className }: TrinityCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  // Calculate card width (90% of viewport with gap)
  const cardWidth = typeof window !== "undefined" ? window.innerWidth * 0.9 : 350;
  const gap = 16; // 1rem gap

  // Constrain drag to prevent over-scrolling
  const dragConstraints = {
    left: -(cardWidth + gap) * (cards.length - 1),
    right: 0,
  };

  // Handle drag end - snap to nearest card
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    
    // Determine direction and snap
    let newIndex = currentIndex;
    
    if (Math.abs(offset) > 50 || Math.abs(velocity) > 500) {
      if (offset > 0 && currentIndex > 0) {
        // Swiped right -> go to previous card
        newIndex = currentIndex - 1;
      } else if (offset < 0 && currentIndex < cards.length - 1) {
        // Swiped left -> go to next card
        newIndex = currentIndex + 1;
      }
    }
    
    setCurrentIndex(newIndex);
    
    // Animate to position
    const targetX = -(cardWidth + gap) * newIndex;
    x.set(targetX);

    // Haptic feedback (mobile only)
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(20);
    }
  };

  // Update position when index changes (for dot navigation)
  useEffect(() => {
    const targetX = -(cardWidth + gap) * currentIndex;
    x.set(targetX);
  }, [currentIndex, cardWidth, gap, x]);

  return (
    <div className={cn("relative w-full overflow-hidden", className)}>
      {/* CAROUSEL CONTAINER */}
      <div 
        ref={containerRef}
        className="relative w-full overflow-hidden"
      >
        <motion.div
          drag="x"
          dragConstraints={dragConstraints}
          dragElastic={0.1}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleDragEnd}
          style={{ x }}
          className={cn(
            "flex gap-4",
            "cursor-grab active:cursor-grabbing"
          )}
        >
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              className={cn(
                "flex-shrink-0",
                "w-[90vw]", // 90% of viewport width
                "transition-opacity duration-300",
                isDragging ? "pointer-events-none" : "pointer-events-auto",
                // Dim non-active cards
                index !== currentIndex && "opacity-40 scale-95"
              )}
              animate={{
                scale: index === currentIndex ? 1 : 0.95,
                opacity: index === currentIndex ? 1 : 0.4,
              }}
              transition={{ duration: 0.3 }}
            >
              {card.content}
            </motion.div>
          ))}
        </motion.div>

        {/* PEEK OF NEXT CARD - Gradient overlay on right edge */}
        {currentIndex < cards.length - 1 && (
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-ascent-black/80 to-transparent pointer-events-none" />
        )}
      </div>

      {/* DOTS INDICATOR */}
      <div className="flex items-center justify-center gap-2 mt-6">
        {cards.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              index === currentIndex 
                ? "bg-ascent-blue w-8" 
                : "bg-white/20 hover:bg-white/40"
            )}
            aria-label={`Go to card ${index + 1}`}
          />
        ))}
      </div>

      {/* SWIPE HINT (shows on first load) */}
      {currentIndex === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="text-center text-sm text-ascent-gray mt-4 font-mono"
        >
          ← Swipe to explore →
        </motion.p>
      )}
    </div>
  );
}