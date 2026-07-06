"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import type { HeroContent } from "@/lib/supabase/queries";

interface HeroProps {
  contentRef: React.RefObject<HTMLDivElement | null>;
  scrollArrowRef: React.RefObject<HTMLDivElement | null>;
  onRegister: () => void;
  onOngoing: () => void;
  data: HeroContent | null;
}

const Hero = React.forwardRef<HTMLDivElement, HeroProps>(
  ({ contentRef, scrollArrowRef, onRegister, onOngoing, data }, layerRef) => {
    return (
      <>
        <div className="fixed inset-0 w-full lg:w-[50vw] h-screen overflow-hidden pointer-events-none z-10">
          <section
            ref={layerRef}
            className="absolute inset-0 w-full h-screen flex flex-col justify-center items-start pl-[5%] lg:pl-[15%] opacity-0 will-change-[transform,opacity]"
          >
            <div
              ref={contentRef}
              className="flex flex-col items-start w-[85%] max-w-[450px] md:max-w-[550px] lg:max-w-[650px] relative"
            >
              <Image
                src={data?.logo_url ?? "/CodeSplash.png"}
                alt={data?.logo_alt ?? "CodeSplash Logo"}
                width={520}
                height={120}
                unoptimized
                className="w-[90%] md:w-[85%] h-auto object-contain mb-4 filter drop-shadow-[0_4px_20px_rgba(255,107,0,0.15)]"
              />

              <p className="w-full text-[0.75rem] md:text-[0.9rem] font-normal text-white/70 leading-relaxed tracking-[0.3px] text-left max-w-[480px]">
                {data?.tagline ?? "A Nation-wide hackathon organized by CSSA university of Kelaniya, empowering innovation through inspiration from the timeless legacy of the pyramids."}
              </p>

              <div className="flex flex-col sm:flex-row gap-[10px] sm:gap-4 mt-3 z-50">
                <Button
                  onClick={onRegister}
                  className="jump-btn group rounded-full !border !border-[#ff6b00] !bg-gradient-to-r !from-[#ff6b00]/25 !to-transparent !via-[#ff6b00]/22 !to-[#ff6b00]/8 backdrop-blur-md !shadow-[0_0_20px_rgba(255,107,0,0.2)] hover:!from-[#ff6b00]/40 hover:!via-[#ff6b00]/35 hover:!to-[#ff6b00]/12 hover:!text-white hover:!shadow-[0_0_28px_rgba(255,107,0,0.3)] transition-all duration-300"
                >
                  <span>{data?.cta_button_text ?? "Register Now"}</span>
                  <svg
                    className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Button>

                <Button
                  onClick={onOngoing}
                  className="jump-btn group rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-[#ff8a33] hover:bg-white/10 transition-all duration-300 !mt-0 sm:!mt-6 z-50">
                  <span>{data?.cta_button_text === "Register Now" ? "Ongoing Challenge" : (data?.cta_button_text ?? "Ongoing Challenge")}</span>
                  <svg
                    className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 5l7 7-7 7M5 5l7 7-7 7"
                    />
                  </svg>
                </Button>
              </div>
            </div>
          </section>
        </div>

        <div
          ref={scrollArrowRef}
          className="fixed bottom-8 mb-12 md:bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center transition-opacity duration-300 pointer-events-auto z-50"
        >
          <div className="w-[24px] h-[40px] border-[2px] border-white/40 rounded-full flex justify-center pt-1.5">
            <div className="w-[3px] h-[10px] bg-white/40 rounded-full animate-bounce"></div>
          </div>
        </div>
      </>
    );
  }
);
Hero.displayName = "Hero";

export default Hero;
