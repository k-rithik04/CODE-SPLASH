"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { CtaContent } from "@/lib/supabase/queries";

interface CTAProps {
  textRef: React.RefObject<HTMLDivElement | null>;
  isDropdownOpen: boolean;
  onToggleDropdown: () => void;
  data: CtaContent | null;
}

const CTA = React.forwardRef<HTMLDivElement, CTAProps>(
  ({ textRef, isDropdownOpen, onToggleDropdown, data }, layerRef) => {
    const isActive = data?.is_active ?? true;

    return (
      <section
        ref={layerRef}
        className="fixed inset-0 w-screen h-screen opacity-0 pointer-events-none z-40 overflow-hidden"
      >
        <div
          ref={textRef}
          className="absolute top-1/2 left-1/2 w-full max-w-[700px] flex flex-col justify-center items-center px-5 will-change-transform"
          style={{ transform: "translate3d(-50%, -50%, 0)" }}
        >
          <h2 className="font-rebeca text-[clamp(1.5rem,4vw,3rem)] font-extrabold leading-[1.1] tracking-[-1px] md:tracking-[-2px]">
            {data?.heading ?? "Ready to dive in?"}
          </h2>

          <div className="relative mt-4 flex flex-col items-center w-full max-w-[380px] pointer-events-auto">
            <Button
              onClick={(e) => {
                if (!isActive) return;
                e.preventDefault();
                e.stopPropagation();
                onToggleDropdown();
              }}
              className={`interactive-btn transform scale-90 md:scale-100 origin-top flex items-center justify-center w-full uppercase ${
                !isActive ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {isActive ? (data?.button_text ?? "Register Now") : "Registrations Are Closed"}
            </Button>

            {isDropdownOpen && isActive && (
              <div className="absolute top-full left-0 w-full mt-3 shadow-[0_8px_32px_rgba(0,0,0,0.6)] bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden z-[100]">
                <div className="flex flex-col w-full text-white font-extrabold text-[0.85rem] tracking-wide uppercase">
                  <Link
                    href="/register/school"
                    className="flex items-center justify-center px-6 py-4 hover:bg-white/10 active:bg-white/20 cursor-pointer transition-colors border-b border-white/10"
                  >
                    School Phase
                  </Link>
                  <Link
                    href="/register/university"
                    className="flex items-center justify-center px-6 py-4 hover:bg-white/10 active:bg-white/20 cursor-pointer transition-colors"
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
);
CTA.displayName = "CTA";

export default CTA;
