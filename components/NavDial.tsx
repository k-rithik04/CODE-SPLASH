"use client";

import { MutableRefObject, RefObject } from "react";

interface NavDialProps {
  dialWindowRef: RefObject<HTMLDivElement | null>;
  dialItemsRef: MutableRefObject<(HTMLDivElement | null)[]>;
  onDialClick: (targetPercentage: number) => void;
}

const NAV_ITEMS = [
  { label: "Gateway", target: 0.0 },
  { label: "Chapters", target: 0.09 },
  { label: "Treasury", target: 0.20 },
  { label: "Journey", target: 0.29 },
  { label: "Partners", target: 0.53 },
  { label: "Creators", target: 0.62 },
  { label: "FAQ", target: 0.80 },
  { label: "Register", target: 0.95 },
  { label: "Connect", target: 0.98 },
];

export default function NavDial({ dialWindowRef, dialItemsRef, onDialClick }: NavDialProps) {
  return (
    <div
      ref={dialWindowRef}
      className="fixed bottom-0 left-0 w-screen h-[70px] md:h-[80px] overflow-x-auto hide-scrollbar z-[100] pointer-events-auto flex items-center scroll-smooth"
    >
      <nav className="flex items-center gap-[40px] md:gap-[60px] w-max px-[50vw]">
        {NAV_ITEMS.map((item, index) => (
          <div
            key={index}
            ref={(el) => { dialItemsRef.current[index] = el; }}
            className={`dial-item ${index === 0 ? "active" : ""}`}
            onClick={() => onDialClick(item.target)}
          >
            {item.label}
          </div>
        ))}
      </nav>
    </div>
  );
}
