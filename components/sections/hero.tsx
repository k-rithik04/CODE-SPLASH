import Image from "next/image";
import { RefObject } from "react";
import { basePath } from "@/lib/utils";

interface HeroSectionProps {
  heroLayerRef: RefObject<HTMLDivElement | null>;
  heroContentRef: RefObject<HTMLDivElement | null>;
  scrollArrowRef?: RefObject<HTMLDivElement | null>;
  onJumpToCurrentWeek: () => void;
}

export default function HeroSection({ heroLayerRef, heroContentRef, scrollArrowRef, onJumpToCurrentWeek }: HeroSectionProps) {
  return (
    <div className="fixed inset-0 w-full lg:w-[50vw] h-screen overflow-hidden pointer-events-none z-10">
      <section ref={heroLayerRef} className="absolute inset-0 w-full h-screen flex flex-col justify-center items-start pl-[5%] lg:pl-[15%] opacity-0 will-change-[transform,opacity]">
        <div ref={heroContentRef} className="flex flex-col items-start w-[85%] max-w-[450px] md:max-w-[550px] lg:max-w-[650px] relative">
          {/* Removed -ml-2 logic */}
          <Image unoptimized src={`${basePath}/CodeSplash.png`} alt="CodeSplash Logo" width={800} height={200} className="w-[90%] md:w-[85%] h-auto object-contain mb-4 filter drop-shadow-[0_4px_20px_rgba(255,107,0,0.15)]" />
          {/* Changed text-justify to text-left */}
          <p className="w-full text-[0.75rem] md:text-[0.9rem] font-normal text-white/70 leading-relaxed tracking-[0.3px] text-left max-w-[480px]">
            A Nation-wide hackathon organized by CSSA university of Kelaniya, empowering innovation through inspiration from the timeless legacy of the pyramids.
          </p>
          <button onClick={onJumpToCurrentWeek} className="jump-btn group pointer-events-auto mt-6">
            <span>Ongoing Challenge</span>
            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path>
            </svg>
          </button>

          {/* Scroll / Swipe Arrow Indicator */}
          <div ref={scrollArrowRef} className="mt-8 transition-opacity duration-300 pointer-events-auto w-full md:max-w-[85%] z-50">
            <div className="hidden md:flex flex-col items-center justify-center gap-2">
              <span className="text-[0.7rem] uppercase tracking-[2px] font-medium text-white/40">
                Scroll to explore
              </span>
              <svg className="w-5 h-5 text-white/40 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
            <div className="flex md:hidden flex-row items-center justify-center gap-2 w-screen -ml-[5vw]">
              <span className="text-[0.65rem] uppercase tracking-[2px] font-medium text-white/40">
                Swipe to explore
              </span>
              <svg className="w-4 h-4 text-white/40 animate-bounce-x" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
