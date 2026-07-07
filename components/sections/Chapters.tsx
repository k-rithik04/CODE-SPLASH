"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Download } from "lucide-react";
import type { Chapter } from "@/lib/supabase/queries";

const BOOKLET_URLS: Record<string, string> = {
  "University Hackathon": "https://drive.google.com/file/d/1LXyuuJ-osS4hzOMwXFqd62KYLr-MkNPP/view?usp=sharing",
  "School Hackathon": "https://drive.google.com/file/d/1oGqWq-rDDwHzlrdjbuwif1hEVCwyUKmt/view?usp=sharing",
};

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
      <section ref={layerRef} className="fixed inset-0 w-screen h-screen opacity-0 pointer-events-none z-10 flex flex-col justify-center items-center overflow-hidden">
        <div ref={contentRef} className="w-[90%] md:w-full max-w-[1200px] flex flex-col justify-center items-center text-center pb-0">
          <h2 ref={titleRef} className="font-rebeca text-[clamp(1.25rem,4vw,3.5rem)] font-extrabold tracking-tight !mt-0 !mb-1 md:!mb-10 w-full shrink-0">
            <span className="text-orange font-rebeca">Chapters</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5 md:gap-8 w-full">
            {data.map((ch, i) => (
              <Card
                key={i}
                ref={(el) => { cardsRef.current[i] = el; }}
                className="relative bg-glass-bg border-2 border-orange/40 hover:border-orange transition-all duration-300 rounded-xl md:rounded-2xl !py-2 !px-4 md:!p-8 backdrop-blur-md flex flex-col items-center justify-start gap-1 md:gap-0 shadow-lg hover:-translate-y-2 group overflow-visible cursor-pointer pointer-events-auto h-fit md:h-full"
              >
                <span className={`absolute w-[8px] h-[8px] bg-orange rounded-full shadow-[0_0_6px_2px_rgba(255,165,0,0.5)] -translate-x-1/2 -translate-y-1/2 ${DOT_CLASSES[i] ?? DOT_CLASSES[0]} z-20 transition-transform duration-300 group-hover:scale-110 group-hover:shadow-[0_0_10px_3px_rgba(255,165,0,0.8)]`}></span>
                <h3 className="text-[1.1rem] md:text-[1.35rem] whitespace-nowrap tracking-tight font-bold text-white mt-1 mb-2 group-hover:text-orange transition-colors">
                  {ch.title}
                </h3>
                <p className="text-white/60 text-[0.8rem] md:text-sm leading-tight md:leading-normal mt-1 mb-4 md:mb-4">
                  {ch.description}
                </p>
                {BOOKLET_URLS[ch.title] && (
                  <a
                    href={BOOKLET_URLS[ch.title]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="!m-0 md:!mt-auto inline-flex items-center gap-1.5 md:gap-2 rounded-full bg-orange px-3 py-1.5 md:px-4 md:py-2 text-[0.7rem] md:text-xs font-semibold text-black hover:bg-orange/80 transition-colors pointer-events-auto"
                  >
                    <Download className="h-3 md:h-3.5 w-3 md:w-3.5" />
                    Download Booklet
                  </a>
                )}
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