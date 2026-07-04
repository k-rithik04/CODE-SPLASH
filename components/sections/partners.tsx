"use client";

import { RefObject, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { imageUrl } from "@/lib/utils";

interface Partner {
  id: string;
  category: string;
  name: string;
  logo_url: string;
  sort_order: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  platinum: "Platinum Partners",
  school_platinum: "School Phase Platinum Partner",
  knowledge: "Knowledge Partners",
};

interface PartnersSectionProps {
  partnersLayerRef: RefObject<HTMLDivElement | null>;
  partnersContentRef: RefObject<HTMLDivElement | null>;
}

export default function PartnersSection({ partnersLayerRef, partnersContentRef }: PartnersSectionProps) {
  const [items, setItems] = useState<Partner[]>([]);
  const supabase = createClient();

  useEffect(() => {
    supabase.from("partners").select("*").order("sort_order").then(({ data }) => {
      if (data) setItems(data);
    });
  }, [supabase]);

  if (items.length === 0) return null;

  const grouped = items.reduce<Record<string, Partner[]>>((acc, partner) => {
    if (!acc[partner.category]) acc[partner.category] = [];
    acc[partner.category].push(partner);
    return acc;
  }, {});

  const categories = Object.keys(grouped);

  return (
    <section
      ref={partnersLayerRef}
      className="fixed inset-0 w-screen h-screen flex flex-col justify-center items-center opacity-0 pointer-events-none z-10"
    >
      <h3 className="absolute top-[12vh] left-0 w-full px-5 text-center italic text-[0.7rem] md:text-[0.9rem] text-white/60 tracking-[0.5px] z-20 pointer-events-none drop-shadow-md">
        &ldquo; These are the guardians whose strength carried every explorer this far. &rdquo;
      </h3>

      <div ref={partnersContentRef} className="w-full text-center relative top-[3vh] overflow-y-auto hide-scrollbar max-h-[70vh] px-4 md:px-8">
        <div className="flex flex-col gap-[50px] md:gap-[80px] w-full max-w-[1200px] mx-auto px-5 py-8 md:py-12 items-center bg-glass-bg backdrop-blur-[40px] border border-glass-border shadow-lg rounded-3xl pointer-events-auto">
          {categories.map((cat) => (
            <div key={cat} className="flex flex-col items-center w-full md:w-auto">
              <h4 className="text-orange text-[1rem] md:text-[1.2rem] font-bold uppercase tracking-[2px] mb-6 md:mb-8 drop-shadow-md">
                {CATEGORY_LABELS[cat] || cat}
              </h4>
              <div className="flex flex-wrap justify-center items-center gap-[30px] md:gap-[50px]">
                {grouped[cat].map((partner) => (
                  <img
                    key={partner.id}
                    src={imageUrl(partner.logo_url)}
                    alt={partner.name}
                    loading="lazy"
                    className="h-auto max-h-[35px] md:max-h-[55px] object-contain transition-all hover:drop-shadow-[0_0_15px_#ff6b00]"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
