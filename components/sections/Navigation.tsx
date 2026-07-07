"use client";

import React from "react";

interface NavigationProps {
  dialWindowRef: React.RefObject<HTMLDivElement | null>;
  dialItemsRef: React.MutableRefObject<(HTMLDivElement | null)[]>;
  onDialClick: (target: number) => void;
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
];

export default function Navigation({ dialWindowRef, dialItemsRef, onDialClick }: NavigationProps) {
  return (
    <div
      ref={dialWindowRef}
      className="fixed bottom-0 left-0 w-full h-[70px] md:h-[80px] overflow-x-auto hide-scrollbar z-[100] pointer-events-auto flex items-center scroll-smooth"
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
