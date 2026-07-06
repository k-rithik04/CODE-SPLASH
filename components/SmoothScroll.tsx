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
    });

    lenisInstance = instance;
    listeners.forEach((l) => l());

    function raf(time: number) {
      instance.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
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
