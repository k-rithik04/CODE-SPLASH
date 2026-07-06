"use client";

import { useEffect, useRef } from "react";

interface LoaderProps {
  loadProgress: number;
  loadingText: string;
  isLoaderVisible: boolean;
}

export default function Loader({ loadProgress, loadingText, isLoaderVisible }: LoaderProps) {
  const displayProgress = useRef(0);
  const progressRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);
  const rafRef = useRef<number>(0);
  const currentDisplay = useRef(0);

  useEffect(() => {
    const animate = () => {
      const target = loadProgress;
      const current = currentDisplay.current;
      // Smooth interpolation towards target
      const diff = target - current;
      const step = diff * 0.15;
      if (Math.abs(diff) < 0.5) {
        currentDisplay.current = target;
      } else {
        currentDisplay.current = current + step;
      }
      const val = Math.floor(currentDisplay.current);
      displayProgress.current = val;
      if (progressRef.current) {
        progressRef.current.style.width = `${val}%`;
      }
      if (numberRef.current) {
        numberRef.current.textContent = `${val}%`;
      }
      if (Math.abs(diff) > 0.1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [loadProgress]);

  return (
    <div
      className="fixed inset-0 bg-bg z-[200] flex flex-col justify-center items-center gap-4 font-bold tracking-[3px] text-[0.9rem] transition-opacity duration-600"
      style={{ opacity: isLoaderVisible ? 1 : 0 }}
    >
      <div className="text-[0.75rem] text-white/50 font-medium tracking-[2px] mb-5 uppercase transition-opacity duration-300">
        {loadingText}
      </div>
      <div>CODESPLASH SYSTEM STARTING</div>
      <div className="w-[200px] md:w-[250px] h-[3px] bg-white/5 relative overflow-hidden rounded">
        <div
          ref={progressRef}
          className="absolute top-0 left-0 h-full bg-orange shadow-[0_0_15px_#ff6b00,0_0_30px_#ff6b00] rounded"
          style={{ width: `${Math.floor(loadProgress)}%`, transition: "none" }}
        ></div>
      </div>
      <div className="text-orange mt-2 text-[1.2rem]">
        <span ref={numberRef}>{Math.floor(loadProgress)}%</span>
      </div>
    </div>
  );
}
