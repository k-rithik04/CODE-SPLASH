"use client";

import React from "react";

interface PartnersProps {
  contentRef: React.RefObject<HTMLDivElement | null>;
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

const PARTNERS: PartnerNode[] = [
  {
    cat: "Platinum Partners",
    badgeColor: "text-orange border-orange shadow-[0_0_12px_rgba(255,107,0,0.4)]",
    isGroup: true,
    items: [
      { logo: "/logos/sntnew.png", name: "Super Neat Technology", desc: "As our expedition drifted helplessly along the Nile, Super Neat Technology pulled us ashore with their software engineering expertise, giving our journey the strong technological foundation it needed.", link: "https://superneat.lk/" },
      { logo: "/logos/orysysnew.png", name: "Orysys", desc: "Just when the desert seemed endless, Orysys emerged like an oasis, guiding us with their expertise in digital innovation and empowering us to keep building for the next generation of developers.", link: "https://orysys.com/" },
      { logo: "/logos/lakdhanavinew.png", name: "Lakdhanavi", desc: "Lost without a map through the ancient sands, we found Lakdhanavi. As our knowledge partner, they charted the path ahead with industry expertise, helping every step of our journey stay on course.", link: "https://lakdhanavi.lk/" },
    ],
  },
  {
    cat: "School Face Platinum Partner",
    badgeColor: "text-yellow-400 border-yellow-400/80 shadow-[0_0_12px_rgba(250,204,21,0.4)]",
    isGroup: false,
    logo: "/logos/ictfromabcnew.png",
    name: "ICT from ABC",
    desc: "When we wandered through the towering pyramids, Ravindu Bandaranayake became our trusted guide. Through ICT from ABC, his passion for ICT education continues to inspire and direct future innovators.",
    link: "https://www.ictfromabc.com/",
  },
  {
    cat: "Knowledge Partners",
    badgeColor: "text-green-400 border-green-500/80 shadow-[0_0_12px_rgba(34,197,94,0.4)]",
    isGroup: true,
    items: [
      { logo: "/logos/Slasscomnew.png", name: "SLASSCOM", desc: "Navigating the digital frontier, SLASSCOM equipped our explorers with essential industry insights, bridging the gap between academic theory and real-world technological environments.", link: "https://slasscom.lk/" },
      { logo: "/logos/creativesoftware.png", name: "Creative Software", desc: "Bringing decades of software engineering wisdom to our expedition, Creative Software served as a beacon of knowledge, guiding our challengers to build robust and scalable solutions.", link: "https://www.creativesoftware.com/" },
    ],
  },
  {
    cat: "Media Partner",
    badgeColor: "text-red-400 border-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.4)]",
    isGroup: false,
    logo: "/logos/derananew.png",
    name: "TV Derana",
    desc: "After uncovering the treasures of our expedition, we needed the world to hear our story. TV Derana amplified our message, bringing our journey to audiences across the island through its media network.",
    link: "https://www.derana.lk/",
  },
  {
    cat: "Bronze Partner",
    badgeColor: "text-gray-300 border-gray-400/80 shadow-[0_0_12px_rgba(255,255,255,0.3)]",
    isGroup: false,
    logo: "/logos/Hayleysnew.png",
    name: "Hayleys Solar",
    desc: "When the blazing desert sun tested our resolve, Hayleys Solar became our shelter, harnessing the power of sunlight to energize our expedition with sustainable solar solutions for a brighter future.",
    link: "https://www.hayleyssolar.com/",
  },
];

const Partners = React.forwardRef<HTMLDivElement, PartnersProps>(
  ({ contentRef }, layerRef) => {
    return (
      <section ref={layerRef} className="fixed inset-0 w-screen h-screen opacity-0 pointer-events-none z-10 flex flex-col items-center overflow-hidden">
        <h3 className="absolute top-[8vh] left-0 w-full px-5 text-center italic text-[0.85rem] md:text-[1.1rem] text-white/60 tracking-[0.5px] z-30 drop-shadow-md pointer-events-none">
          &ldquo; These are the guardians whose strength carried every explorer this far. &rdquo;
        </h3>

        <div className="w-[90%] md:w-full max-w-[900px] h-[75vh] absolute top-[14vh] overflow-hidden">
          <div ref={contentRef} className="absolute w-full flex flex-col py-[25vh] gap-8 md:gap-12 z-10 items-center">
            {PARTNERS.map((node, i) => (
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
                        <div className="w-full md:w-[30%] flex justify-center items-center bg-white/10 rounded-2xl p-4 min-h-[90px]">
                          <img src={partner.logo} alt={partner.name} className="max-h-[60px] md:max-h-[75px] w-auto object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.1)] group-hover/item:drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-300 group-hover/item:scale-105" />
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
                    <div className="w-full md:w-[35%] flex justify-center items-center bg-white/10 rounded-2xl p-4 min-h-[120px]">
                      <img src={node.logo} alt={node.name} className="max-h-[80px] md:max-h-[100px] w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] group-hover/single:drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-300 group-hover/single:scale-105" />
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
                Reach out to us at <a href="tel:+94702466805" className="text-orange font-bold hover:text-white transition-colors duration-300 ml-1">+94 74 215 9229 (Manula)</a>
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
