import { RefObject } from "react";

interface FaqSectionProps {
  faqLayerRef: RefObject<HTMLDivElement | null>;
  faqTitleRef: RefObject<HTMLHeadingElement | null>;
  faqItemsRef: React.MutableRefObject<(HTMLDetailsElement | null)[]>;
}

export default function FaqSection({ faqLayerRef, faqTitleRef, faqItemsRef }: FaqSectionProps) {
  return (
    <section
      ref={faqLayerRef}
      className="fixed inset-0 w-screen h-screen flex flex-col justify-center items-center opacity-0 pointer-events-none z-10"
    >
      <h2 ref={faqTitleRef} className="text-[clamp(1.5rem,4vw,2.5rem)] font-extrabold tracking-tight mb-6 md:mb-10 text-white relative z-10">
        Frequently Asked <span className="text-orange">Questions</span>
      </h2>

      <div className="w-[90%] max-w-[800px] flex flex-col gap-3 md:gap-4 h-[55vh] overflow-y-auto hide-scrollbar pb-10 overflow-x-hidden relative top-[2vh]">
        {[
          { q: "What is the required team size?", a: "Teams must consist of 3 to 5 members from the same institution." },
          { q: "Is there a registration fee?", a: "No, registration is completely free for all eligible students." },
          { q: "Will accommodation be provided?", a: "Yes, food and rest areas are provided for Top 20 finalists on-site." },
          { q: "Can I participate in multiple tracks?", a: "No, you may only register for one specific track to keep things fair." },
          { q: "Who owns the IP of the final product?", a: "The intellectual property remains entirely with the creators." },
          { q: "What tech stack should we use?", a: "You are free to use any languages, frameworks, or cloud platforms." },
          { q: "Are we allowed to use AI tools like Copilot?", a: "Yes, standard assistants are allowed, but blind copy-pasting is discouraged." }
        ].map((faq, i) => (

          <details key={i} ref={el => { faqItemsRef.current[i] = el; }} className="bg-black/20 border border-glass-border shadow-[0_4px_30px_rgba(0,0,0,0.1)] rounded-xl p-4 md:p-5 cursor-pointer group transition-all hover:border-orange/50 pointer-events-auto" style={{ backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)' }}>
            <summary className="font-bold text-white text-[0.85rem] md:text-[1.05rem] outline-none flex justify-between items-center group-open:text-orange transition-colors">
              {faq.q} <span className="text-xl group-open:rotate-45 transition-transform">+</span>
            </summary>
            <p className="text-[0.75rem] md:text-sm text-white/70 mt-3 leading-relaxed">{faq.a}</p>
          </details>

        ))}
      </div>
    </section>
  );
}
