"use client";

import { RefObject, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
}

interface FaqSectionProps {
  faqLayerRef: RefObject<HTMLDivElement | null>;
  faqTitleRef: RefObject<HTMLHeadingElement | null>;
  faqItemsRef: React.MutableRefObject<(HTMLDetailsElement | null)[]>;
}

export default function FaqSection({ faqLayerRef, faqTitleRef, faqItemsRef }: FaqSectionProps) {
  const [items, setItems] = useState<FaqItem[]>([]);
  const supabase = createClient();

  useEffect(() => {
    supabase.from("faq_items").select("*").order("sort_order").then(({ data }) => {
      if (data) setItems(data);
    });
  }, [supabase]);

  if (items.length === 0) return null;

  return (
    <section
      ref={faqLayerRef}
      className="fixed inset-0 w-full h-full z-10 flex justify-center items-center opacity-0 pointer-events-none p-3 sm:p-6 md:p-8 transition-opacity duration-500 ease-in-out"
    >
      <div className="w-full max-w-[800px] flex flex-col justify-center pointer-events-auto">
        <h2
          ref={faqTitleRef}
          className="text-[clamp(1.25rem,4vw,2.5rem)] font-rebeca font-extrabold tracking-tight mb-3 md:mb-8 text-white text-center transition-opacity duration-500"
        >
          Frequently Asked <span className="text-orange">Questions</span>
        </h2>
        <div className="w-full flex flex-col gap-1.5 sm:gap-2 md:gap-4">
          {items.map((faq, i) => (
            <details
              key={faq.id}
              ref={el => { faqItemsRef.current[i] = el; }}
              className="w-full bg-glass-bg backdrop-blur-[40px] border border-glass-border shadow-lg rounded-xl p-2.5 sm:p-3 md:p-5 cursor-pointer group hover:border-orange/50 transition-all duration-500"
            >
              <summary className="font-bold text-white text-[0.75rem] sm:text-[0.85rem] md:text-[1.05rem] outline-none flex justify-between items-center group-open:text-orange transition-colors">
                {faq.question}
                <span className="text-base md:text-xl flex items-center justify-center w-5 h-5 shrink-0 origin-center group-open:rotate-45 transition-transform duration-300">
                  +
                </span>
              </summary>
              <div className="text-[0.65rem] sm:text-[0.75rem] md:text-sm text-white/70 mt-1.5 md:mt-3 leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
