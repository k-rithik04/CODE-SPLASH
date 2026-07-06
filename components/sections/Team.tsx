"use client";

import React, { useState } from "react";
import Image from "next/image";
import type { TeamMember } from "@/lib/supabase/queries";
import { getStorageUrl } from "@/lib/supabase/queries";

function getOptimizedUrl(path: string, width: number, height: number, quality = 80): string {
  const raw = getStorageUrl(path);
  if (!raw) return "";
  if (raw.startsWith("http") && raw.includes("/storage/v1/object/public/")) {
    return raw
      .replace("/storage/v1/object/public/", "/storage/v1/render/image/public/")
      + `?width=${width}&height=${height}&quality=${quality}&resize=cover`;
  }
  return raw;
}

interface TeamProps {
  trackRef: React.RefObject<HTMLDivElement | null>;
  data: TeamMember[];
}

const Team = React.forwardRef<HTMLDivElement, TeamProps>(
  ({ trackRef, data }, layerRef) => {
    return (
      <section ref={layerRef} className="fixed inset-0 w-screen h-screen flex flex-col justify-center items-center opacity-0 pointer-events-none z-10 overflow-hidden">
        <h3 className="absolute top-[10vh] md:top-[12vh] left-0 w-full px-5 text-center italic text-[0.7rem] md:text-[0.9rem] text-white/60 tracking-[0.5px] z-20 pointer-events-none drop-shadow-md">
          &ldquo;Logic on their minds, passion in their soul.&rdquo;
        </h3>

        <div ref={trackRef} className="flex gap-8 md:gap-16 absolute left-[50%] items-center h-[70vh] top-[15vh]">
          {data.map((member, i) => (
            <TeamCard key={i} member={member} />
          ))}
        </div>
      </section>
    );
  }
);

function TeamCard({ member }: { member: TeamMember }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const src = getOptimizedUrl(member.image_url, 720, 900, 80);

  return (
    <div className="w-[280px] md:w-[320px] h-[380px] md:h-[420px] shrink-0 rounded-2xl flex flex-col overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.5)] bg-glass-bg backdrop-blur-[40px] border border-glass-border transition-transform hover:-translate-y-2 group">
      <div className="h-[65%] w-full border-b border-white/10 relative overflow-hidden bg-white/5">
        {!loaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 border-3 border-white/10 border-t-orange rounded-full animate-spin" />
          </div>
        )}
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center text-white/30 text-sm">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
        ) : (
          <Image
            src={src}
            alt={member.name}
            width={200}
            height={200}
            loading="lazy"
            unoptimized
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
            style={{ width: "auto", height: "auto" }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10"></div>
        <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" className="absolute bottom-4 right-4 flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-black/40 hover:bg-black/60 rounded-full text-white/90 transition-all duration-300 hover:scale-110 hover:text-orange z-50 drop-shadow-md cursor-pointer">
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
          </svg>
        </a>
      </div>

      <div className="h-[35%] w-full p-4 flex flex-col justify-center">
        <div className="text-center mb-3.5 md:mb-4">
          <h4 className="font-bold text-white text-md md:text-xl leading-tight mb-1">{member.name}</h4>
          <p className="text-orange text-[0.7rem] md:text-[0.8rem] uppercase tracking-[1.5px] font-semibold">{member.role}</p>
        </div>

        <div className="flex flex-col gap-2 md:gap-2.5 text-[0.8rem] md:text-[0.9rem] text-white/80 w-fit mx-auto">
          <span className="flex items-center gap-3">
            <svg className="w-4 h-4 md:w-5 md:h-5 text-orange flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
            </svg>
            {member.email}
          </span>
          <span className="flex items-center gap-3">
            <svg className="w-4 h-4 md:w-5 md:h-5 text-orange flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path>
            </svg>
            {member.phone}
          </span>
        </div>
      </div>
    </div>
  );
}

Team.displayName = "Team";

export default Team;
