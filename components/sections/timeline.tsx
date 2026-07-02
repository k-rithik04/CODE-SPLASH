import Image from "next/image";
import { RefObject } from "react";
import { basePath } from "@/lib/utils";

interface TimelineSectionProps {
  timelineLayerRef: RefObject<HTMLDivElement | null>;
  timelineTrackRef: RefObject<HTMLDivElement | null>;
}

export default function TimelineSection({ timelineLayerRef, timelineTrackRef }: TimelineSectionProps) {
  return (
    <section ref={timelineLayerRef} className="fixed inset-0 w-screen h-screen opacity-0 pointer-events-none z-10 flex flex-col items-center overflow-hidden">
      <h3 className="absolute top-[8vh] left-0 w-full px-5 text-center italic text-[0.7rem] md:text-[0.9rem] text-white/60 tracking-[0.5px] z-30 drop-shadow-md pointer-events-none">
        &ldquo; Every milestone tells a story. <br className="block md:hidden" /> Follow the journey to the final treasure. &rdquo;
      </h3>
      <div
        className="w-[90%] md:w-full max-w-[900px] h-[75vh] absolute top-[14vh] overflow-hidden"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)'
        }}
      >

        <div ref={timelineTrackRef} className="absolute w-full flex flex-col py-[25vh] gap-3 md:gap-6 z-10">
          {[
            { date: "Feb 01", title: "Inception", desc: "CodeSplash reveal.", side: "left-side" },
            { date: "Feb 16", title: "Registrations Open", desc: "Form your squad.", side: "right-side" },
            { date: "Feb 23", title: "Teams Growing", desc: "Institution list grows.", side: "left-side" },
            { date: "Mar 01", title: "Entries Close", desc: "Gates close.", side: "right-side" },
            { date: "Mar 03", title: "Preliminary Prep", desc: "Mentors assign.", side: "left-side" },
            { date: "Mar 05", title: "Prelims Kick-off", desc: "Hacking starts.", side: "right-side current-week" },
            { date: "Mar 15", title: "Prelims Judging", desc: "Experts evaluate.", side: "left-side" },
            { date: "Mar 20", title: "Finalists Revealed", desc: "Top teams advance.", side: "right-side" },
            { date: "Mar 22", title: "Finalist Mentorship", desc: "Intensive sessions.", side: "left-side" },
            { date: "Mar 26", title: "Finalist Submission", desc: "Last polish.", side: "right-side" },
            { date: "Mar 27", title: "Grand Finale Prep", desc: "Last checklists.", side: "left-side" }
          ].map((node, i) => (
            <div key={i} className={`relative w-full flex ${node.side.includes("left") ? "justify-start" : "justify-end"} timeline-node ${node.side}`}>
              <div className="t-line"></div> <div className="t-dot"></div>

              <div className="t-card bg-black/20 border border-glass-border rounded-2xl p-4 md:p-6 shadow-[0_4px_30px_rgba(0,0,0,0.1)] transition-all duration-300 hover:border-orange/50 hover:shadow-[0_15px_30px_rgba(255,107,0,0.15)] group pointer-events-auto relative w-full md:w-[45%]" style={{ backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)' }}>
                {node.side.includes("current") && <span className="current-badge">Current</span>}
                <div className="text-orange font-extrabold text-[0.6rem] md:text-[0.7rem] tracking-wider mb-0.5">{node.date}</div>
                <h4 className="text-sm md:text-lg font-bold text-white mb-0.5 md:mb-1 group-hover:text-orange transition-colors">{node.title}</h4>
                <p className="text-white/70 text-[0.6rem] md:text-[0.75rem] leading-tight">{node.desc}</p>
              </div>
            </div>
          ))}

          {/* last card */}
          <div className="relative w-full flex justify-center timeline-node center-side mt-4 pb-[20vh]">
            <div className="t-dot"></div>
            <div className="t-card !w-[80%] md:!w-[50%] relative !mt-4 bg-black/20 border-2 border-orange/50 rounded-3xl p-5 md:p-8 shadow-[0_15px_30px_rgba(255,107,0,0.2)] pointer-events-auto group" style={{ backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)' }}>
              <Image src={`${basePath}/crown.png`} alt="Crown" width={80} height={80} className="w-12 md:w-20 absolute -top-5 -right-5 md:-top-7 md:-right-7 z-20 drop-shadow-[0_0_15px_rgba(255,107,0,0.8)] rotate-[25deg] object-contain" style={{ width: 'auto', height: 'auto' }} />
              <div className="text-orange font-extrabold text-[0.6rem] md:text-[0.7rem] tracking-wider mb-1 opacity-80 mt-2">Mar 28</div>
              <h4 className="text-lg md:text-2xl font-bold text-white mb-1 md:mb-2 group-hover:text-orange transition-colors">Grand Finale</h4>
              <p className="text-white/70 text-[0.6rem] md:text-[0.8rem] leading-tight">24-hour hackathon.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
