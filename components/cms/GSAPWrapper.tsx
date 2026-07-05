"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function GSAPWrapper({ children }: { children: React.ReactNode }) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(
      container.current,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
    );
  }, { scope: container });

  return (
    <div ref={container} className="h-full w-full">
      {children}
    </div>
  );
}
