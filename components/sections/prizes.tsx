"use client";

import { RefObject, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Prize {
  id: string;
  badge: string;
  name: string;
  description: string;
  amount: string;
  sort_order: number;
}

interface PrizesSectionProps {
  prizesLayerRef: RefObject<HTMLDivElement | null>;
  prizesContentRef: RefObject<HTMLDivElement | null>;
  onPrizeFlip: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export default function PrizesSection({ prizesLayerRef, prizesContentRef, onPrizeFlip }: PrizesSectionProps) {
  const [items, setItems] = useState<Prize[]>([]);
  const supabase = createClient();

  useEffect(() => {
    supabase.from("prizes").select("*").order("sort_order").then(({ data }) => {
      if (data) setItems(data);
    });
  }, [supabase]);

  if (items.length === 0) return null;

  return (
    <section
      ref={prizesLayerRef}
      className="fixed inset-0 w-screen h-screen flex flex-col justify-center items-center opacity-0 pointer-events-none z-10 overflow-hidden"
    >
      <div ref={prizesContentRef} className="w-[90%] md:w-full max-w-[1150px] flex flex-col justify-center items-center">
        <h2 className="text-[clamp(1.5rem,5vw,3.5rem)] font-extrabold tracking-tight mb-2 [@media(min-height:750px)]:mb-6 mb-10 w-full text-center shrink-0">
          The <span className="text-orange">Prize Pool</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 [@media(min-height:750px)]:gap-4 md:gap-8 w-full pointer-events-auto">
          {items.map((prize) => (
            <div key={prize.id} onClick={onPrizeFlip} className="relative bg-glass-bg border-2 border-orange/40 hover:border-orange transition-all duration-300 rounded-2xl p-3 [@media(min-height:750px)]:p-5 md:p-8 backdrop-blur-md flex flex-col items-center shadow-lg group">
              <div className="absolute -top-[14px] left-1/2 -translate-x-1/2 bg-black border border-orange text-orange uppercase tracking-[1px] text-[0.75rem] md:text-[0.85rem] font-bold px-4 py-1.5 rounded-full whitespace-nowrap z-10 shadow-md">
                {prize.badge}
              </div>
              <h4 className="text-[0.9rem] mt-4 [@media(min-height:750px)]:text-lg font-extrabold text-white mb-1 md:mb-3 text-center leading-tight">
                {prize.name}
              </h4>
              <p className="text-[clamp(0.65rem,2vw,0.85rem)] text-white/70 text-center leading-tight md:leading-relaxed mb-2 md:mb-6">
                {prize.description}
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
