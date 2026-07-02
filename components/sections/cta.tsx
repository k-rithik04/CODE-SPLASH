import Link from "next/link";
import { RefObject } from "react";

interface CtaSectionProps {
  ctaLayerRef: RefObject<HTMLDivElement | null>;
  ctaTextRef: RefObject<HTMLDivElement | null>;
}

export default function CtaSection({ ctaLayerRef, ctaTextRef }: CtaSectionProps) {
  return (
    <section
      ref={ctaLayerRef}
      className="fixed inset-0 w-screen h-screen opacity-0 pointer-events-none z-20 overflow-hidden"
    >
      <div
        ref={ctaTextRef}
        className="absolute top-1/2 left-1/2 w-full max-w-[700px] flex flex-col justify-center items-center px-5 will-change-transform"
        style={{ transform: "translate3d(-50%, -50%, 0)" }}
      >
        <h2 className="text-[clamp(1.5rem,4vw,3rem)] font-extrabold leading-[1.1] tracking-[-1px] md:tracking-[-2px]">
          Ready to dive in?
        </h2>
        <Link href="/register" className="interactive-btn mt-4 transform scale-90 md:scale-100 origin-top inline-flex items-center justify-center">
          Register Now
        </Link>
      </div>
    </section>
  );
}
