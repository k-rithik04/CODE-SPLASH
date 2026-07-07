"use client";

import { createContext, useEffect, useSyncExternalStore, ReactNode } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

const LenisContext = createContext<Lenis | null>(null);

let lenisInstance: Lenis | null = null;
let listeners: Array<() => void> = [];

function subscribe(callback: () => void) {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
}

function getSnapshot() {
  return lenisInstance;
}

function getServerSnapshot() {
  return null;
}

export function useLenis() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isCMS = pathname.startsWith("/cms");

  useEffect(() => {
    if (isCMS) {
      lenisInstance = null;
      listeners.forEach((l) => l());
      return () => {
        lenisInstance = null;
        listeners.forEach((l) => l());
      };
    }

    const instance = new Lenis({
      duration: 1.0,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
      infinite: false,
      gestureOrientation: "both",
    });

    lenisInstance = instance;
    listeners.forEach((l) => l());

    function raf(time: number) {
      instance.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // --- Horizontal swipe → vertical scroll conversion ---
    function handleWheel(e: WheelEvent) {
      const dx = Math.abs(e.deltaX);
      const dy = Math.abs(e.deltaY);
      if (dx > dy * 2) {
        e.preventDefault();
        let delta: number;
        if (e.deltaMode === 1) {
          delta = e.deltaX * 40;
        } else if (e.deltaMode === 2) {
          delta = e.deltaX * 800;
        } else {
          delta = e.deltaX;
        }
        instance.scrollTo(instance.scroll + delta, { duration: 0.15 });
      }
    }

    let touchStartX = 0;
    let touchStartY = 0;
    let swiping = false;

    function handleTouchStart(e: TouchEvent) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      swiping = false;
    }

    function handleTouchMove(e: TouchEvent) {
      const dx = e.touches[0].clientX - touchStartX;
      const dy = e.touches[0].clientY - touchStartY;

      if (!swiping) {
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
          swiping = true;
          // Don't preventDefault on first detection — let browser verify gesture
          return;
        } else if (Math.abs(dy) > 10) {
          return;
        } else {
          return;
        }
      }

      // Only preventDefault once confirmed horizontal swipe is in progress
      e.preventDefault();
      instance.scrollTo(instance.scroll - dx * 1.5, { duration: 0.05 });
      touchStartX = e.touches[0].clientX;
    }

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      instance.destroy();
      lenisInstance = null;
      listeners.forEach((l) => l());
    };
  }, [isCMS]);

  return (
    <LenisContext.Provider value={lenisInstance}>
      {children}
    </LenisContext.Provider>
  );
}
