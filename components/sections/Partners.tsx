"use client";

import React, { useState } from "react";
import Image from "next/image";
import type { PartnerRow } from "@/lib/supabase/queries";
import { getStorageUrl } from "@/lib/supabase/queries";

const LOCAL_LOGO_MAP: Record<string, string> = {
  "creative software": "/Logos/creative software.png",
};

function getLocalFallback(name: string): string | null {
  const key = name.toLowerCase();
  for (const [pattern, path] of Object.entries(LOCAL_LOGO_MAP)) {
    if (key.includes(pattern)) return path;
  }
  return null;
}

function PartnerLogo({ src, alt, width, height, className, style }: {
  src: string; alt: string; width: number; height: number; className?: string; style?: React.CSSProperties;
}) {
  const [imgSrc, setImgSrc] = useState(src);
  const localFallback = getLocalFallback(alt);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      unoptimized
      className={className}
      style={style}
      onError={() => {
        if (localFallback && imgSrc !== localFallback) setImgSrc(localFallback);
      }}
    />
  );
}

interface PartnersProps {
  contentRef: React.RefObject<HTMLDivElement | null>;
  data: PartnerRow[];
}

interface PartnerItem {
  logo: string;
  name: string;
  desc: string;
  link: string;
}

interface PartnerNode {
  cat: string;
  badgeColor: string;
  isGroup: boolean;
  logo?: string;
  name?: string;
  desc?: string;
  link?: string;
  items?: PartnerItem[];
}

function groupPartners(rows: PartnerRow[]): PartnerNode[] {
  const groups = new Map<string, PartnerRow[]>();
  for (const row of rows) {
    if (!groups.has(row.category)) groups.set(row.category, []);
    groups.get(row.category)!.push(row);
  }

  const CATEGORY_LABELS: Record<string, string> = {
    platinum: "Platinum Partners",
    school_platinum: "School Phase Platinum Partner",
    knowledge: "Knowledge Partners",
    media: "Media Partner",
    bronze: "Bronze Partner",
  };

  const nodes: PartnerNode[] = [];
  for (const [category, items] of groups) {
    const label = CATEGORY_LABELS[category] ?? category;
    const badgeColor = items[0]?.badge_color ?? "";
    if (items.length === 1) {
      nodes.push({
        cat: label,
        badgeColor,
        isGroup: false,
        logo: getStorageUrl(items[0].logo_url),
        name: items[0].name,
        desc: items[0].description,
        link: items[0].link_url,
      });
    } else {
      nodes.push({
        cat: label,
        badgeColor,
        isGroup: true,
        items: items.map((p) => ({
          logo: getStorageUrl(p.logo_url),
          name: p.name,
          desc: p.description,
          link: p.link_url,
        })),
      });
    }
  }
  return nodes;
}

const Partners = React.forwardRef<HTMLDivElement, PartnersProps>(
  ({ contentRef, data }, layerRef) => {
    const nodes = groupPartners(data);

    return (
      <section ref={layerRef} className="fixed inset-0 w-screen h-screen opacity-0 pointer-events-none z-10 flex flex-col items-center overflow-hidden">
        <h3 className="absolute top-[8vh] left-0 w-full px-5 text-center italic text-[0.85rem] md:text-[1.1rem] text-white/60 tracking-[0.5px] z-30 drop-shadow-md pointer-events-none">
          &ldquo; These are the guardians whose strength carried every explorer this far. &rdquo;
        </h3>

        <div className="w-[90%] md:w-full max-w-[900px] h-[75vh] absolute top-[14vh] overflow-hidden">
          <div ref={contentRef} className="absolute w-full flex flex-col py-[25vh] gap-8 md:gap-12 z-10 items-center">
            {nodes.map((node, i) => (
              <div
                key={i}
                className="relative bg-white/5 border border-white/20 shadow-[0_8px_32px_rgba(255,255,255,0.05)] rounded-3xl p-6 md:p-8 flex flex-col items-center gap-3 md:gap-5 w-full max-w-[800px] mt-4"
                style={{ backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)' }}
              >
                <div className={`absolute -top-[14px] md:-top-[16px] left-1/2 -translate-x-1/2 bg-black border ${node.badgeColor} uppercase tracking-[2px] text-[0.75rem] md:text-[0.9rem] font-extrabold px-6 py-1.5 md:py-2 rounded-full whitespace-nowrap z-20`}>
                  {node.cat}
                </div>

                {node.isGroup ? (
                  <div className="w-full flex flex-col">
                    {node.items?.map((partner, idx) => (
                      <a
                        key={idx}
                        href={partner.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col md:flex-row items-center gap-4 md:gap-6 hover:bg-white/5 p-3 rounded-2xl transition-colors cursor-pointer group/item"
                      >
                        <div className="w-full md:w-[30%] flex justify-center items-center bg-white/40 rounded-2xl p-4 min-h-[90px]">
                          <PartnerLogo src={partner.logo} alt={partner.name} width={75} height={60} className="object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.1)] group-hover/item:drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-300 group-hover/item:scale-105" style={{ width: "auto", height: "60px" }} />
                        </div>
                        <div className="w-full md:w-[70%] flex flex-col text-center md:text-left">
                          <h4 className="text-xl md:text-2xl font-bold text-white mb-1 group-hover/item:text-orange transition-colors">{partner.name}</h4>
                          <p className="text-white/70 text-[0.8rem] md:text-[0.85rem] leading-relaxed">
                            {partner.desc}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <a
                    href={node.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col md:flex-row items-center gap-6 md:gap-10 w-full hover:bg-white/5 p-3 rounded-2xl transition-colors cursor-pointer group/single"
                  >
                    <div className="w-full md:w-[35%] flex justify-center items-center bg-white/40 rounded-2xl p-4 min-h-[120px]">
                      <PartnerLogo src={node.logo || ""} alt={node.name || ""} width={100} height={80} className="object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover/single:drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-300 group-hover/single:scale-105" style={{ width: "auto", height: "80px" }} />
                    </div>
                    <div className="w-full md:w-[65%] flex flex-col text-center md:text-left">
                      <h4 className="text-2xl md:text-3xl font-bold text-white mb-2 md:mb-3 group-hover/single:text-orange transition-colors">{node.name}</h4>
                      <p className="text-white/70 text-[0.85rem] md:text-[1rem] leading-relaxed">
                        {node.desc}
                      </p>
                    </div>
                  </a>
                )}
              </div>
            ))}

            <div className="w-full max-w-[800px] mt-4 mb-[10vh] text-center py-3 px-6 md:py-4 md:px-8">
              <p className="text-white/80 text-[0.9rem] md:text-[1.1rem] tracking-[0.5px]">
                Interested in exploring a partnership? <br className="block sm:hidden" />
                Reach out to us at <a href="tel:+94742159229" className="text-orange font-bold hover:text-white transition-colors duration-300 ml-1">+94 74 215 9229 (Manula)</a>
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }
);
Partners.displayName = "Partners";

export default Partners;
