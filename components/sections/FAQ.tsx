"use client";

import React from "react";

interface FAQProps {
  titleRef: React.RefObject<HTMLHeadingElement | null>;
  itemsRef: React.MutableRefObject<(HTMLDetailsElement | null)[]>;
}

const FAQ_ITEMS = [
  { q: "What is CodeSplash '26 ?", a: "CodeSplash is the flagship inter-university hackathon conducted by computer science students' association (CSSA) of the University of Kelaniya. At CodeSplash, you get to push your limits in idea generation, build under pressure and create a solution that will work no matter what field it is in." },
  { q: "Who can participate?", a: "The hackathon will be conducted under two main categories: the inter-school phase and the inter-university phase. The inter-university will be open for islandwide university students. The inter-school phase will be open to school students representing various grades and academic levels across the island who are interested in technology, innovation and problem-solving." },
  { q: "How can participate in this hackathon?", a: "Once registration opens on our official website, fill out the registration form and you'll be ready to join the CodeSplash hackathon." },
  { q: "What is the competition format?", a: "CodeSplash'26 is conducted in multiple stages, guiding participants from idea generation to solution development and final presentations. Each stage is designed to evaluate creativity, technical skills and problem-solving ability." },
  { q: "When do registrations open?", a: "Registration dates will be announced through the official website and social media platforms. Stay tuned for the latest updates and important deadlines." },
  { q: "Is participation free?", a: "Yes! Participation in CodeSplash'26 is completely free, providing every eligible student with an equal opportunity to compete and innovate." },
  { q: "What rewards can winners expect?", a: "Winning teams will receive exciting prizes, certificates, exclusive recognition and opportunities to showcase their innovations to industry professionals." },
];

const FAQ = React.forwardRef<HTMLDivElement, FAQProps>(
  ({ titleRef, itemsRef }, layerRef) => {
    return (
      <section
        ref={layerRef}
        className="fixed inset-0 w-full h-full z-10 flex justify-center items-center opacity-0 pointer-events-none p-3 sm:p-6 md:p-8 transition-opacity duration-500 ease-in-out"
      >
        <div className="w-full max-w-[800px] flex flex-col justify-center">
          <h2
            ref={titleRef}
            className="font-rebeca text-[clamp(1.25rem,4vw,2.5rem)] font-extrabold tracking-tight mb-3 md:mb-8 text-white text-center transition-opacity duration-500"
          >
            Frequently Asked <span className="text-orange">Questions</span>
          </h2>
          <div className="w-full flex flex-col gap-1.5 sm:gap-2 md:gap-4">
            {FAQ_ITEMS.map((faq, i) => (
              <details
                key={i}
                ref={(el) => { itemsRef.current[i] = el; }}
                className="w-full bg-glass-bg backdrop-blur-[40px] border border-glass-border shadow-lg rounded-xl p-2.5 sm:p-3 md:p-5 cursor-pointer group hover:border-orange/50 transition-all duration-500"
              >
                <summary className="font-bold text-white text-[0.75rem] sm:text-[0.85rem] md:text-[1.05rem] outline-none flex justify-between items-center group-open:text-orange transition-colors">
                  {faq.q}
                  <span className="text-base md:text-xl flex items-center justify-center w-5 h-5 shrink-0 origin-center group-open:rotate-45 transition-transform duration-300">
                    +
                  </span>
                </summary>
                <div className="text-[0.65rem] sm:text-[0.75rem] md:text-sm text-white/70 mt-1.5 md:mt-3 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    );
  }
);
FAQ.displayName = "FAQ";

export default FAQ;
