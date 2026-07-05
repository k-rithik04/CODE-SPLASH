"use client";

import React from "react";

interface TimelineProps {
  trackRef: React.RefObject<HTMLDivElement | null>;
}

const TIMELINE_NODES = [
  { date: "July 04", title: "Registration Starts", desc: "The pyramid gates are locked. Register your team and claim the key to your CodeSplash journey.", side: "left-side" },
  { date: "July 15", title: "Registration Closes", desc: "The last keys are almost gone. Register before the gates seal and the path disappears.", side: "right-side" },
  { date: "July 18", title: "Awareness Session & Proposal Opening", desc: "Learn the rules, study the map, and prepare for the adventure ahead.", side: "left-side" },
  { date: "July 26", title: "Proposal Submission Closes", desc: "Share your first discovery. Your idea could unlock hidden treasures within your team.", side: "right-side" },
  { date: "July 27", title: "Proposal Evaluation", desc: "Every idea is carefully evaluated as judges search for the brightest minds to continue the journey.", side: "left-side" },
  { date: "July 31", title: "Semi-Finalists & Development Phase Begins", desc: "The chosen explorers are revealed, earning their place deeper within the ancient pyramid.", side: "right-side" },
  { date: "August 08 - August 16", title: "Mentorship Sessions", desc: "Work with mentors to refine, improve, and strengthen your solution throughout the journey.", side: "left-side", isCurrent: true },
  { date: "August 20", title: "Project Submission Deadline", desc: "Your creation is complete. Submit your masterpiece before the final chamber closes.", side: "right-side" },
  { date: "August 22", title: "Project Evaluation", desc: "Every solution is judged on innovation, impact, and courage to face the impossible.", side: "left-side" },
  { date: "September 01", title: "Announcement of Finalists", desc: "Only the bravest remain. The guardians choose who advances to the final challenge.", side: "right-side" },
  { date: "September 02", title: "Product Pitch Session", desc: "Stand before the keepers. Share your story, defend your vision, and inspire with innovation.", side: "left-side" },
];

const Timeline = React.forwardRef<HTMLDivElement, TimelineProps>(
  ({ trackRef }, layerRef) => {
    return (
      <section ref={layerRef} className="fixed inset-0 w-screen h-screen opacity-0 pointer-events-none z-10 flex flex-col items-center overflow-hidden">
        <h3 className="absolute top-[8vh] left-0 w-full px-5 text-center italic text-[0.7rem] md:text-[0.9rem] text-white/60 tracking-[0.5px] z-30 drop-shadow-md pointer-events-none">
          &ldquo; Every milestone tells a story. <br className="block md:hidden" /> Follow the journey to the final treasure. &rdquo;
        </h3>
        <div className="w-[90%] md:w-full max-w-[900px] h-[75vh] absolute top-[14vh] overflow-hidden">
          <div ref={trackRef} className="absolute w-full flex flex-col py-[25vh] gap-3 md:gap-6 z-10">
            {TIMELINE_NODES.map((node, i) => (
              <div key={i} className={`relative w-full flex ${node.side.includes("left") ? "justify-start" : "justify-end"} timeline-node ${node.side} ${node.isCurrent ? 'current' : ''}`}>
                <div className="t-line"></div>
                <div className={`t-dot transition-all duration-300 ${node.isCurrent ? 'scale-[1.2] !bg-white z-20' : ''}`}></div>
                <div
                  className={`t-card bg-black/20 rounded-2xl p-4 md:p-6 transition-all duration-300 group relative w-full md:w-[45%] border
              ${node.isCurrent
                    ? 'border-orange/80 shadow-[0_0_20px_rgba(255,107,0,0.4)] hover:shadow-[0_0_30px_rgba(255,107,0,0.6)]'
                    : 'border-glass-border shadow-[0_4px_30px_rgba(0,0,0,0.1)] hover:border-orange/50 hover:shadow-[0_15px_30px_rgba(255,107,0,0.15)]'
                  }`}
                  style={{ backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)' }}
                >
                  {node.isCurrent && (
                    <span className="current-badge absolute -top-[12px] -left-[8px] bg-orange text-black uppercase tracking-[1px] text-[0.65rem] font-extrabold px-3 py-1 rounded-full whitespace-nowrap z-20 shadow-[0_0_10px_rgba(255,107,0,0.5)]">
                      Current Week
                    </span>
                  )}
                  <div className={`text-orange font-extrabold text-[0.6rem] md:text-[0.7rem] tracking-wider mb-0.5 text-right ${node.isCurrent ? 'mt-4 md:mt-3' : ''}`}>
                    {node.date}
                  </div>
                  <h4 className="text-sm md:text-lg font-bold text-white mb-0.5 md:mb-1 group-hover:text-orange transition-colors text-left">{node.title}</h4>
                  <p className="text-white/70 text-[0.6rem] md:text-[0.75rem] leading-tight text-left">{node.desc}</p>
                </div>
              </div>
            ))}

            <div className="relative w-full flex justify-center timeline-node center-side mt-4 pb-[20vh]">
              <div className="t-dot"></div>
              <div className="t-card !w-[80%] md:!w-[50%] relative !mt-4 bg-black/20 border-2 border-orange/50 rounded-3xl p-5 md:p-8 shadow-[0_15px_30px_rgba(255,107,0,0.2)] group" style={{ backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)' }}>
                <img src="/crown.png" alt="Crown" className="w-12 md:w-20 absolute -top-5 -right-5 md:-top-7 md:-right-7 z-20 drop-shadow-[0_0_15px_rgba(255,107,0,0.8)] rotate-[25deg] object-contain" />
                <div className="text-orange font-extrabold text-[0.6rem] md:text-[0.7rem] tracking-wider mb-1 opacity-80 mt-2 text-right">September 04</div>
                <h4 className="text-lg md:text-2xl font-bold text-white mb-1 md:mb-2 group-hover:text-orange transition-colors text-right">Grand Finale</h4>
                <p className="text-white/70 text-[0.6rem] md:text-[0.8rem] leading-tight text-center">The journey reaches its peak. Champions are crowned, legacies are forged, and CodeSplash history is made.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
);
Timeline.displayName = "Timeline";

export default Timeline;
