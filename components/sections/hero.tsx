"use client";

import { RefObject, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { imageUrl } from "@/lib/utils";

interface HeroData {
  logo_url: string;
  logo_alt: string;
  tagline: string;
  cta_button_text: string;
  cta_button_link: string;
  scroll_hint_desktop: string;
  scroll_hint_mobile: string;
}

interface HeroSectionProps {
  initialData?: HeroData | null;
  heroLayerRef: RefObject<HTMLDivElement | null>;
  heroContentRef: RefObject<HTMLDivElement | null>;
  scrollArrowRef?: RefObject<HTMLDivElement | null>;
  swipeArrowRef?: RefObject<HTMLDivElement | null>;
  onJumpToCurrentWeek: () => void;
  onRegisterClick: () => void;
}

const DEFAULT_DATA: HeroData = {
  logo_url: "",
  logo_alt: "CodeSplash",
  tagline: "A Nation-wide hackathon organized by CSSA university of Kelaniya, empowering innovation through inspiration from the timeless legacy of the pyramids.",
  cta_button_text: "Ongoing Challenge",
  cta_button_link: "",
  scroll_hint_desktop: "Scroll to explore",
  scroll_hint_mobile: "Swipe to explore",
};

export default function HeroSection({ initialData, heroLayerRef, heroContentRef, scrollArrowRef, swipeArrowRef, onJumpToCurrentWeek, onRegisterClick }: HeroSectionProps) {
  const [data, setData] = useState<HeroData | null>(initialData || null);
  const [hasLoaded, setHasLoaded] = useState(!!initialData);
  const [fetchFailed, setFetchFailed] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (initialData) return; // Skip client-side fetch if server data is present
    
    supabase.from("hero_content").select("*").eq("id", 1).single().then(({ data }) => {
      if (data) {
        setData(data);
      } else {
        setFetchFailed(true);
      }
      setHasLoaded(true);
    });
  }, [supabase, initialData]);

  const displayData = data || (fetchFailed ? DEFAULT_DATA : null);

  return (
    <div className="fixed inset-0 w-full lg:w-[50vw] h-screen overflow-hidden pointer-events-none z-10">
      <section ref={heroLayerRef} className="absolute inset-0 w-full h-screen flex flex-col justify-center items-start pl-[5%] lg:pl-[15%] opacity-0 will-change-[transform,opacity]">
        <div ref={heroContentRef} className="flex flex-col items-start w-[85%] max-w-[450px] md:max-w-[550px] lg:max-w-[650px] relative">
          {!displayData ? (
            <>
              <div className="w-[90%] md:w-[85%] aspect-[3/1] bg-white/5 rounded-lg animate-pulse mb-4" />
              <div className="w-full h-4 bg-white/5 rounded animate-pulse mb-2" />
              <div className="w-3/4 h-4 bg-white/5 rounded animate-pulse mb-6" />
              <div className="flex gap-4 mt-3">
                <div className="w-[140px] h-[48px] bg-white/5 rounded-full animate-pulse" />
                <div className="w-[140px] h-[48px] bg-white/5 rounded-full animate-pulse" />
              </div>
            </>
          ) : (
            <div
              className="w-full"
              style={{
                opacity: hasLoaded ? 1 : 0,
                transform: hasLoaded ? 'scale(1)' : 'scale(0.97)',
                transition: 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <img src={displayData.logo_url ? imageUrl(displayData.logo_url) : ''} alt={displayData.logo_alt} loading="eager" className="w-[90%] md:w-[85%] h-auto object-contain mb-4 filter drop-shadow-[0_4px_20px_rgba(255,107,0,0.15)]" />
              <p className="w-full text-[0.75rem] md:text-[0.9rem] font-normal text-white/70 leading-relaxed tracking-[0.3px] text-left max-w-[480px]">
                {displayData.tagline}
              </p>

              <div className="flex flex-col sm:flex-row gap-[10px] sm:gap-4 mt-3 pointer-events-auto z-50">
                <button
                  onClick={onRegisterClick}
                  className="jump-btn group rounded-full !border !border-[#ff6b00] !bg-gradient-to-r !from-[#ff6b00]/25 !to-transparent !via-[#ff6b00]/22 !to-[#ff6b00]/8 backdrop-blur-md !shadow-[0_0_20px_rgba(255,107,0,0.2)] hover:!from-[#ff6b00]/40 hover:!via-[#ff6b00]/35 hover:!to-[#ff6b00]/12 hover:!text-white hover:!shadow-[0_0_28px_rgba(255,107,0,0.3)] transition-all duration-300"
                >
                  <span>Register Now</span>
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <button
                  onClick={onJumpToCurrentWeek}
                  className="jump-btn group rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-[#ff8a33] hover:bg-white/10 transition-all duration-300 !mt-0 sm:!mt-6"
                >
                  <span>{displayData.cta_button_text}</span>
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div ref={swipeArrowRef} className="mt-8 transition-opacity duration-300 pointer-events-auto w-full md:hidden z-50">
                <div className="flex flex-row items-center justify-center gap-2 w-screen -ml-[5vw]">
                  <span className="text-[0.65rem] uppercase tracking-[2px] font-medium text-white/40">
                    {displayData.scroll_hint_mobile}
                  </span>
                  <svg className="w-4 h-4 text-white/40 animate-bounce-x" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path>
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>

        {displayData && (
          <div ref={scrollArrowRef} className="hidden md:flex flex-col items-center justify-center gap-2 absolute bottom-12 left-1/2 -translate-x-1/2 transition-opacity duration-300 pointer-events-auto z-50">
            <span className="text-[0.7rem] uppercase tracking-[2px] font-medium text-white/40">
              {displayData.scroll_hint_desktop}
            </span>
            <svg className="w-5 h-5 text-white/40 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        )}
      </section>
    </div>
  );
}
