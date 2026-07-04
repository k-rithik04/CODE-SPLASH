"use client";

import { RefObject, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { STORAGE_BASE_URL } from "@/lib/utils";

interface TimelineEntry {
  id: string;
  date: string;
  title: string;
  description: string;
  position: string;
  is_current: boolean;
  sort_order: number;
}

interface TimelineSectionProps {
  timelineLayerRef: RefObject<HTMLDivElement | null>;
  timelineTrackRef: RefObject<HTMLDivElement | null>;
}

export default function TimelineSection({ timelineLayerRef, timelineTrackRef }: TimelineSectionProps) {
  const [items, setItems] = useState<TimelineEntry[]>([]);
  const supabase = createClient();

  useEffect(() => {
    supabase.from("timeline_entries").select("*").order("sort_order").then(({ data }) => {
      if (data) setItems(data);
    });
  }, [supabase]);

  if (items.length === 0) return null;

  const regularItems = items.filter((item) => item.position !== "center");
  const centerItem = items.find((item) => item.position === "center");

  return (
    <section ref={timelineLayerRef} className="fixed inset-0 w-screen h-screen opacity-0 pointer-events-none z-10 flex flex-col items-center overflow-hidden">
      <h3 className="absolute top-[8vh] left-0 w-full px-5 text-center italic text-[0.7rem] md:text-[0.9rem] text-white/60 tracking-[0.5px] z-30 drop-shadow-md pointer-events-none">
        &ldquo; Every milestone tells a story. <br className="block md:hidden" /> Follow the journey to the final treasure. &rdquo;
      </h3>
      <div
        className="w-[90%] md:w-full max-w-[900px] h-[75vh] absolute top-[14vh] overflow-hidden timeline-mask"
      >

        <div ref={timelineTrackRef} className="absolute w-full flex flex-col py-[25vh] gap-3 md:gap-6 z-10">
          {regularItems.map((node) => {
            const side = node.position === "left" ? "left-side" : "right-side";
            const sideClass = node.is_current ? `${side} current-week` : side;
            return (
              <div key={node.id} className={`relative w-full flex ${side === "left-side" ? "justify-start" : "justify-end"} timeline-node ${sideClass}`}>
                <div className="t-line"></div> <div className="t-dot"></div>

                <div className="t-card bg-black/20 border border-glass-border rounded-2xl p-4 md:p-6 shadow-[0_4px_30px_rgba(0,0,0,0.1)] transition-all duration-300 hover:border-orange/50 hover:shadow-[0_15px_30px_rgba(255,107,0,0.15)] group pointer-events-auto relative w-full md:w-[45%]" style={{ backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)' }}>
                  {node.is_current && <span className="current-badge">Current Week</span>}
                  <div className="text-orange font-extrabold text-[0.6rem] md:text-[0.7rem] tracking-wider mb-0.5 text-right">{node.date}</div>
                  <h4 className="text-sm md:text-lg font-bold text-white mb-0.5 md:mb-1 group-hover:text-orange transition-colors">{node.title}</h4>
                  <p className="text-white/70 text-[0.6rem] md:text-[0.75rem] leading-tight">{node.description}</p>
                </div>
              </div>
            );
          })}

          {centerItem && (
            <div className="relative w-full flex justify-center timeline-node center-side mt-4 pb-[20vh]">
              <div className="t-dot"></div>
              <div className="t-card !w-[80%] md:!w-[50%] relative !mt-4 bg-black/20 border-2 border-orange/50 rounded-3xl p-5 md:p-8 shadow-[0_15px_30px_rgba(255,107,0,0.2)] pointer-events-auto group" style={{ backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)' }}>
                <img src={`${STORAGE_BASE_URL}/assets/crown.webp`} alt="Crown" loading="lazy" className="w-12 md:w-20 absolute -top-5 -right-5 md:-top-7 md:-right-7 z-20 drop-shadow-[0_0_15px_rgba(255,107,0,0.8)] rotate-[25deg] object-contain" />
                <div className="text-orange font-extrabold text-[0.6rem] md:text-[0.7rem] tracking-wider mb-1 opacity-80 mt-2">{centerItem.date}</div>
                <h4 className="text-lg md:text-2xl font-bold text-white mb-1 md:mb-2 group-hover:text-orange transition-colors">{centerItem.title}</h4>
                <p className="text-white/70 text-[0.6rem] md:text-[0.8rem] leading-tight">{centerItem.description}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
