"use client";

import React from "react";
import Image from "next/image";
import type { ConnectContent } from "@/lib/supabase/queries";
import { getStorageUrl } from "@/lib/supabase/queries";

interface SocialLink {
  href: string;
  ariaLabel: string;
  imgSrc: string;
  alt: string;
  hasTooltip?: boolean;
}

interface ConnectProps {
  data: ConnectContent | null;
}

const LINKEDIN_SVG = "data:image/svg+xml;utf8,<svg fill='%23ff6b00' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path d='M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z'/></svg>";
const FACEBOOK_SVG = "data:image/svg+xml;utf8,<svg fill='%23ff6b00' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path d='M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z'/></svg>";
const YOUTUBE_SVG = "data:image/svg+xml;utf8,<svg fill='%23ff6b00' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path d='M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.015 3.015 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93-.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.376.55 9.376.55s7.505 0 9.377-.55a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z'/></svg>";
const INSTAGRAM_SVG = "data:image/svg+xml;utf8,<svg fill='%23ff6b00' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z'/></svg>";

const Connect = React.forwardRef<HTMLDivElement, ConnectProps>(({ data }, layerRef) => {
  const socialLinks: SocialLink[] = data ? [
    { href: data.linkedin_url, ariaLabel: "LinkedIn", imgSrc: LINKEDIN_SVG, alt: "LinkedIn" },
    { href: data.facebook_url, ariaLabel: "Facebook", imgSrc: FACEBOOK_SVG, alt: "Facebook" },
    { href: data.youtube_url, ariaLabel: "YouTube", imgSrc: YOUTUBE_SVG, alt: "YouTube" },
    { href: data.instagram_cssa_url, ariaLabel: "Instagram CSSA", imgSrc: INSTAGRAM_SVG, alt: "Instagram CSSA" },
    { href: data.instagram_codesplash_url, ariaLabel: "Instagram CodeSplash", imgSrc: INSTAGRAM_SVG, alt: "Instagram CodeSplash", hasTooltip: true },
  ] : [];

  return (
    <section
      ref={layerRef}
      className="fixed bottom-0 left-0 w-full h-[65vh] md:h-[60vh] z-30 flex flex-col justify-end pointer-events-none will-change-transform bg-gradient-to-t from-black via-black to-transparent"
      style={{ transform: "translate3d(0, 200%, 0)" }}
    >
      <div className="w-full flex-1 flex flex-col items-center justify-end px-[5%] pb-[100px] relative mt-[10vh]">
        <p className="text-[0.75rem] md:text-[0.9rem] text-white/70 italic tracking-[0.5px] mb-8 text-center">
          &ldquo;{data?.quote?.replace(/"/g, "") ?? "Every great journey begins with a conversation"}&rdquo;
        </p>

        <div className="flex flex-wrap justify-center gap-3 md:gap-4 max-w-[800px] mb-4">
          {data?.email_1 && (
            <a href={`mailto:${data.email_1}`} className="connect-btn">
              <svg className="w-4 h-4 text-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              {data.email_1}
            </a>
          )}
          {data?.email_2 && (
            <a href={`mailto:${data.email_2}`} className="connect-btn">
              <svg className="w-4 h-4 text-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              {data.email_2}
            </a>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-3 md:gap-4 max-w-[800px] mb-8">
          {socialLinks.map((link, i) => (
            <a
              key={i}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.ariaLabel}
              className={`connect-btn !px-3 md:!px-4${link.hasTooltip ? " group relative" : ""}`}
            >
              <Image
                src={link.imgSrc}
                alt={link.alt}
                width={20}
                height={20}
                unoptimized
                className="w-4 md:w-5 h-4 md:h-5 object-contain"
              />
              {link.hasTooltip && (
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[0.5rem] bg-orange text-white px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  CodeSplash
                </span>
              )}
            </a>
          ))}
        </div>

        <div className="w-full flex justify-center mb-4">
          <Image src={data?.cssa_logo_url ? getStorageUrl(data.cssa_logo_url) : "/CSSALogo.png"} alt="CSSA Logo" width={250} height={80} unoptimized className="max-w-[200px] md:max-w-[250px] h-auto object-contain opacity-90" />
        </div>

        <div className="text-[0.65rem] md:text-[0.75rem] text-white/60 tracking-[0.5px] text-center flex items-center justify-center gap-2 flex-wrap pb-4">
          <span>&copy; CodeSplash 2026.</span>
          <span className="hidden md:inline">|</span>
          <span>All Rights Reserved.</span>
          <span className="hidden md:inline">|</span>
          <span>Organized by University of Kelaniya.</span>
        </div>
      </div>
    </section>
  );
});
Connect.displayName = "Connect";

export default Connect;
