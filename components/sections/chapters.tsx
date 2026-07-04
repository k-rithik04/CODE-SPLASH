"use client";

import { RefObject, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";

interface Chapter {
  id: string;
  title: string;
  description: string;
  sort_order: number;
}

interface ChaptersSectionProps {
  chaptersLayerRef: RefObject<HTMLDivElement | null>;
  chaptersContentRef: RefObject<HTMLDivElement | null>;
  chaptersTitleRef: RefObject<HTMLHeadingElement | null>;
  chapterCardsRef: React.MutableRefObject<(HTMLDivElement | null)[]>;
}

export default function ChaptersSection({ chaptersLayerRef, chaptersContentRef, chaptersTitleRef, chapterCardsRef }: ChaptersSectionProps) {
  const [items, setItems] = useState<Chapter[]>([]);
  const supabase = createClient();

  useEffect(() => {
    supabase.from("chapters").select("*").order("sort_order").then(({ data }) => {
      if (data) setItems(data);
    });
  }, [supabase]);

  if (items.length === 0) return null;

  const dotClasses = ["dot-animate-1", "dot-animate-2", "dot-animate-3"];

  return (
    <section ref={chaptersLayerRef} className="fixed inset-0 w-screen h-screen flex flex-col justify-center items-center opacity-0 pointer-events-none z-10">
      <div ref={chaptersContentRef} className="w-[90%] md:w-full max-w-[1200px] flex flex-col justify-center text-center">
        <h2 ref={chaptersTitleRef} className="text-[clamp(1.5rem,4vw,3.5rem)] font-rebeca font-extrabold tracking-tight mb-4 md:mb-12 shrink-0">
          <span className="text-orange">Chapters</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 [@media(min-height:750px)]:gap-4 md:gap-8 pointer-events-auto">
          {items.map((chapter, i) => (
            <Card
              key={chapter.id}
              ref={el => { chapterCardsRef.current[i] = el; }}
              className="relative bg-glass-bg border-2 border-orange/40 hover:border-orange transition-all duration-300 rounded-2xl p-3 [@media(min-height:750px)]:p-5 md:p-8 backdrop-blur-md flex flex-col items-center justify-start shadow-lg hover:-translate-y-2 group overflow-visible cursor-pointer"
            >
              <span className={`absolute w-[8px] h-[8px] bg-orange rounded-full shadow-[0_0_6px_2px_rgba(255,165,0,0.5)] -translate-x-1/2 -translate-y-1/2 ${dotClasses[i % 3]} z-20 transition-transform duration-300 group-hover:scale-110 group-hover:shadow-[0_0_10px_3px_rgba(255,165,0,0.8)]`}></span>
              <h3 className="text-[clamp(1rem,3vw,1.5rem)] [@media(min-height:750px)]:text-[1.15rem] whitespace-nowrap tracking-tight font-bold text-white mb-0 [@media(min-height:750px)]:mb-1 md:mb-2 group-hover:text-orange transition-colors">
                {chapter.title}
              </h3>
              <p className="text-white/60 text-[clamp(0.75rem,2vw,1rem)] [@media(min-height:750px)]:text-[0.85rem] md:text-sm leading-tight md:leading-normal mt-0.5">
                {chapter.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
