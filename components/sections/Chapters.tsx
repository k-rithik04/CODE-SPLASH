"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import type { Chapter } from "@/lib/supabase/queries";

const DOT_CLASSES = ["dot-animate-1", "dot-animate-2", "dot-animate-3"];

interface ChaptersProps {
  contentRef: React.RefObject<HTMLDivElement | null>;
  titleRef: React.RefObject<HTMLHeadingElement | null>;
  cardsRef: React.MutableRefObject<(HTMLDivElement | null)[]>;
  data: Chapter[];
}

const Chapters = React.forwardRef<HTMLDivElement, ChaptersProps>(
  ({ contentRef, titleRef, cardsRef, data }, layerRef) => {
    return (
      <section ref={layerRef} className="fixed inset-0 w-screen h-screen opacity-0 pointer-events-none z-10 flex justify-center items-center overflow-hidden">
        <div ref={contentRef} className="w-[90%] md:w-full max-w-[1200px] flex flex-col justify-center text-center pb-[10vh] md:pb-0">
          <h2 ref={titleRef} className="font-rebeca text-[clamp(1.5rem,4vw,3.5rem)] font-extrabold tracking-tight mb-4 md:mb-12 shrink-0">
            <span className="text-orange font-rebeca">Chapters</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            {data.map((ch, i) => (
              <Card
                key={i}
                ref={(el) => { cardsRef.current[i] = el; }}
                className="relative bg-glass-bg border-2 border-orange/40 hover:border-orange transition-all duration-300 rounded-2xl p-3 [@media(min-height:750px)]:p-5 md:p-8 backdrop-blur-md flex flex-col items-center justify-start shadow-lg hover:-translate-y-2 group overflow-visible cursor-pointer"
              >
                <span className={`absolute w-[8px] h-[8px] bg-orange rounded-full shadow-[0_0_6px_2px_rgba(255,165,0,0.5)] -translate-x-1/2 -translate-y-1/2 ${DOT_CLASSES[i] ?? DOT_CLASSES[0]} z-20 transition-transform duration-300 group-hover:scale-110 group-hover:shadow-[0_0_10px_3px_rgba(255,165,0,0.8)]`}></span>
                <h3 className="text-[clamp(1rem,3vw,1.5rem)] [@media(min-height:750px)]:text-[1.15rem] whitespace-nowrap tracking-tight font-bold text-white mb-0 [@media(min-height:750px)]:mb-1 md:mb-2 group-hover:text-orange transition-colors">
                  {ch.title}
                </h3>
                <p className="text-white/60 text-[clamp(0.75rem,2vw,1rem)] [@media(min-height:750px)]:text-[0.85rem] md:text-sm leading-tight md:leading-normal mt-0.5">
                  {ch.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }
);
Chapters.displayName = "Chapters";

export default Chapters;
