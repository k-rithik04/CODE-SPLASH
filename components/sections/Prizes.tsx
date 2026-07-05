"use client";

import React from "react";

interface PrizesProps {
  contentRef: React.RefObject<HTMLDivElement | null>;
  onPrizeFlip: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const PRIZES = [
  {
    badge: "University Phase",
    title: "Pharaoh's Legacy Prize",
    desc: "Awarded to the university team that demonstrates exceptional innovation, technical excellence and teamwork while conquering the toughest challenges on the journey to victory.",
    amount: "LKR 100,000",
  },
  {
    badge: "School Phase",
    title: "Rising Explorer's Prize",
    desc: "Celebrating young innovators who showcase outstanding creativity, determination and problem-solving skills as they take their first steps toward greatness.",
    amount: "LKR 65,000",
  },
  {
    badge: "Agentic AI Challenge",
    title: "Artisan of the Nile Award",
    desc: "Recognizing the innovators who build intelligent AI agents that solve real-world challenges through creativity, autonomy and technical excellence.",
    amount: "Will be out soon!",
  },
];

const Prizes = React.forwardRef<HTMLDivElement, PrizesProps>(
  ({ contentRef, onPrizeFlip }, layerRef) => {
    return (
      <section ref={layerRef} className="fixed inset-0 w-screen h-screen flex flex-col justify-center items-center opacity-0 pointer-events-none z-10 overflow-hidden">
        <div ref={contentRef} className="w-[90%] md:w-full max-w-[1150px] flex flex-col justify-center items-center">
          <h2 className="font-rebeca text-[clamp(1.5rem,5vw,3.5rem)] font-extrabold tracking-tight mb-2 [@media(min-height:750px)]:mb-6 mb-10 w-full text-center shrink-0">
            The <span className="text-orange">Prize Pool</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 [@media(min-height:750px)]:gap-4 md:gap-8 w-full">
            {PRIZES.map((prize, i) => (
              <div key={i} onClick={onPrizeFlip} className="relative bg-glass-bg border-2 border-orange/40 hover:border-orange transition-all duration-300 rounded-2xl p-3 [@media(min-height:750px)]:p-5 md:p-8 backdrop-blur-md flex flex-col items-center shadow-lg group">
                <div className="absolute -top-[14px] left-1/2 -translate-x-1/2 bg-black border border-orange text-orange uppercase tracking-[1px] text-[0.75rem] md:text-[0.85rem] font-bold px-4 py-1.5 rounded-full whitespace-nowrap z-10 shadow-md">
                  {prize.badge}
                </div>
                <h4 className="text-[0.9rem] mt-4 md:mt-5 [@media(min-height:750px)]:text-lg font-extrabold text-white mb-1 md:mb-3 text-center leading-tight">
                  {prize.title}
                </h4>
                <p className="text-[clamp(0.65rem,2vw,0.85rem)] text-white/70 text-center leading-tight md:leading-relaxed mb-2 md:mb-6">
                  {prize.desc}
                </p>
                <h3 className="text-xl [@media(min-height:750px)]:text-2xl md:text-4xl font-black text-orange drop-shadow-lg mt-auto">
                  {prize.amount}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
);
Prizes.displayName = "Prizes";

export default Prizes;
