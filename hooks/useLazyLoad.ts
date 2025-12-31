import { useState, useEffect, useRef} from 'react';

interface UseLazyLoadOptions {
  root?: Element | null;
  rootMargin?: string; // Pre-load distance (e.g., "200px")
  threshold?: number;
}

export function useLazyLoad(options: UseLazyLoadOptions = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentElement = elementRef.current;
    if (!currentElement || isVisible) return;

    // Defaults: Load when element is 200px away from viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Stop observing once loaded
        }
      },
      { rootMargin: "200px", ...options } 
    );

    observer.observe(currentElement);

    return () => {
      if (currentElement) observer.unobserve(currentElement);
    };
  }, [isVisible, options]);

  return { elementRef, isVisible };
}