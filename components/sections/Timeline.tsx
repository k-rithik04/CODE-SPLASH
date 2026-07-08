"use client";

import React from "react";
import type { TimelineEntry } from "@/lib/supabase/queries";
import Image from "next/image";

interface TimelineProps {
  trackRef: React.RefObject<HTMLDivElement | null>;
  data: TimelineEntry[];
}

const Timeline = React.forwardRef<HTMLDivElement, TimelineProps>(
  ({ trackRef, data }, layerRef) => {
    return (
      <section ref={layerRef} className="fixed inset-0 w-screen h-screen opacity-0 pointer-events-none z-10 flex flex-col items-center overflow-hidden">
        <h3 className="absolute top-[8vh] left-0 w-full px-5 text-center italic text-[0.7rem] md:text-[0.9rem] text-white/60 tracking-[0.5px] z-30 drop-shadow-md pointer-events-none">
          &ldquo; Every milestone tells a story. <br className="block md:hidden" /> Follow the journey to the final treasure. &rdquo;
        </h3>
        <div className="w-[90%] md:w-full max-w-[900px] h-[75vh] absolute top-[14vh] overflow-hidden">
          <div ref={trackRef} className="absolute w-full flex flex-col py-[25vh] gap-3 md:gap-6 z-10">
            {data.map((node, i) => (
              <div key={i} className={`relative w-full flex ${node.position === "center" ? "justify-center center-side mt-4 pb-[20vh]" : node.position.includes("left") ? "justify-start left-side" : "justify-end right-side"} timeline-node ${node.is_current ? 'current' : ''}`}>
                {node.position !== "center" && <div className="t-line"></div>}
                <div className={`t-dot transition-all duration-300 ${node.is_current ? 'scale-[1.2] !bg-white z-20' : ''}`}></div>
                <div
                  className={`t-card bg-black/20 relative transition-all duration-300 group
                    ${node.position === "center" 
                      ? "!w-[80%] md:!w-[50%] !mt-4 border-2 border-orange/50 rounded-3xl p-5 md:p-8 shadow-[0_15px_30px_rgba(255,107,0,0.2)]" 
                      : `rounded-2xl p-4 md:p-6 w-full md:w-[45%] border ${node.is_current ? 'border-orange/80 shadow-[0_0_20px_rgba(255,107,0,0.4)] hover:shadow-[0_0_30px_rgba(255,107,0,0.6)]' : 'border-glass-border shadow-[0_4px_30px_rgba(0,0,0,0.1)] hover:border-orange/50 hover:shadow-[0_15px_30px_rgba(255,107,0,0.15)]'}`
                    }`}
                  style={{ backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)' }}
                >
                  {node.position === "center" && (
                    <Image src="/crown.png" alt="Crown" width={80} height={80} unoptimized className="w-12 md:w-20 absolute -top-5 -right-5 md:-top-7 md:-right-7 z-20 drop-shadow-[0_0_15px_rgba(255,107,0,0.8)] rotate-[25deg] object-contain" />
                  )}
                  {node.is_current && node.position !== "center" && (
                    <span className="current-badge absolute -top-[12px] -left-[8px] bg-orange text-black uppercase tracking-[1px] text-[0.65rem] font-extrabold px-3 py-1 rounded-full whitespace-nowrap z-20 shadow-[0_0_10px_rgba(255,107,0,0.5)]">
                      Current Week
                    </span>
                  )}
                  <div className={`text-orange font-extrabold text-[0.6rem] md:text-[0.7rem] tracking-wider mb-0.5 text-right ${node.is_current && node.position !== "center" ? 'mt-4 md:mt-3' : ''} ${node.position === "center" ? 'opacity-80 mt-2 text-right mb-1' : ''}`}>
                    {node.date}
                  </div>
                  <h4 className={`text-sm md:text-lg font-bold text-white mb-0.5 md:mb-1 group-hover:text-orange transition-colors ${node.position === "center" ? 'text-lg md:text-2xl mb-1 md:mb-2 text-right' : 'text-left'}`}>
                    {node.title}
                  </h4>
                  <p className={`text-white/70 text-[0.6rem] md:text-[0.75rem] leading-tight ${node.position === "center" ? 'md:text-[0.8rem] text-center' : 'text-left'}`}>
                    {node.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
);
Timeline.displayName = "Timeline";

export default Timeline;