"use client";

import Link from "next/link";
import { RefObject, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface CtaData {
  heading: string;
  button_text: string;
  button_link: string;
}

interface CtaSectionProps {
  ctaLayerRef: RefObject<HTMLDivElement | null>;
  ctaTextRef: RefObject<HTMLDivElement | null>;
}

export default function CtaSection({ ctaLayerRef, ctaTextRef }: CtaSectionProps) {
  const [data, setData] = useState<CtaData | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.from("cta_content").select("*").eq("id", 1).single().then(({ data }) => {
      if (data) setData(data);
    });
  }, [supabase]);

  if (!data) return null;

  return (
    <section
      ref={ctaLayerRef}
      className="fixed inset-0 w-screen h-screen opacity-0 pointer-events-none z-40 overflow-hidden"
    >
      <div
        ref={ctaTextRef}
        className="absolute top-1/2 left-1/2 w-full max-w-[700px] flex flex-col justify-center items-center px-5 will-change-transform"
        style={{ transform: "translate3d(-50%, -50%, 0)" }}
      >
        <h2 className="text-[clamp(1.5rem,4vw,3rem)] font-rebeca font-extrabold leading-[1.1] tracking-[-1px] md:tracking-[-2px] text-center">
          {data.heading}
        </h2>

        <div className="relative mt-4 flex flex-col items-center w-full max-w-[350px]">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="interactive-btn pointer-events-auto transform scale-90 md:scale-100 origin-top flex items-center justify-center w-full uppercase whitespace-nowrap"
          >
            {data.button_text}
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 w-full mt-3 pointer-events-auto shadow-[0_8px_32px_rgba(0,0,0,0.6)] bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden z-[100]">
              <div className="flex flex-col w-full text-white font-extrabold text-[0.85rem] tracking-wide uppercase">
                <Link
                  href="/register/schoolPhase"
                  className="flex items-center justify-center px-6 py-4 hover:bg-white/10 cursor-pointer transition-colors border-b border-white/10"
                >
                  School Phase
                </Link>
                <Link
                  href="/register/universityPhase"
                  className="flex items-center justify-center px-6 py-4 hover:bg-white/10 cursor-pointer transition-colors"
                >
                  University Phase
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
