import { RefObject } from "react";
import { basePath } from "@/lib/utils";

interface PartnersSectionProps {
  partnersLayerRef: RefObject<HTMLDivElement | null>;
  partnersContentRef: RefObject<HTMLDivElement | null>;
}

export default function PartnersSection({ partnersLayerRef, partnersContentRef }: PartnersSectionProps) {
  return (
    <section
      ref={partnersLayerRef}
      className="fixed inset-0 w-screen h-screen flex flex-col justify-center items-center opacity-0 pointer-events-none z-10"
    >
      <h3 className="absolute top-[12vh] left-0 w-full px-5 text-center italic text-[0.7rem] md:text-[0.9rem] text-white/60 tracking-[0.5px] z-20 pointer-events-none drop-shadow-md">
        &ldquo;United in purpose, building the future bright.&rdquo;
      </h3>

      <div ref={partnersContentRef} className="w-full text-center relative top-[3vh] overflow-y-auto hide-scrollbar max-h-[70vh]">
        <div className="flex flex-col gap-[50px] md:gap-[80px] w-full max-w-[1200px] mx-auto px-5 items-center">
          <div className="flex flex-col md:flex-row w-full justify-center items-start gap-12 md:gap-24">
            <div className="flex flex-col items-center w-full md:w-auto">
              <h4 className="text-orange text-[1rem] md:text-[1.2rem] font-bold uppercase tracking-[2px] mb-6 md:mb-8 drop-shadow-md">Platinum Partners</h4>
              <div className="flex flex-wrap justify-center items-center gap-[30px] md:gap-[50px]">
                <img src={`${basePath}/assets/logos/Generation%20Alpha.jpg.jpeg`} alt="Gen ALPHA" loading="lazy" className="h-auto max-h-[35px] md:max-h-[55px] object-contain transition-all hover:drop-shadow-[0_0_15px_#ff6b00]" />
                <img src={`${basePath}/assets/logos/Slasscom.png`} alt="Slasscom" loading="lazy" className="h-auto max-h-[35px] md:max-h-[55px] object-contain transition-all hover:drop-shadow-[0_0_15px_#ff6b00]" />
                <img src={`${basePath}/assets/logos/ictfromabc1.png`} alt="ictfromabc" loading="lazy" className="h-auto max-h-[45px] md:max-h-[70px] object-contain transition-all hover:drop-shadow-[0_0_15px_#ff6b00]" />
              </div>
            </div>

            <div className="flex flex-col items-center w-full md:w-auto">
              <h4 className="text-orange text-[1rem] md:text-[1.2rem] font-bold uppercase tracking-[2px] mb-6 md:mb-8 drop-shadow-md leading-tight">School Phase<br />Platinum Partner</h4>
              <div className="flex flex-wrap justify-center items-center h-full">
                <img src={`${basePath}/assets/logos/Generation%20Alpha.jpg.jpeg`} alt="Gen ALPHA" loading="lazy" className="h-auto max-h-[35px] md:max-h-[55px] object-contain transition-all hover:drop-shadow-[0_0_15px_#ff6b00]" />
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center w-full md:w-auto">
            <h4 className="text-orange text-[1rem] md:text-[1.2rem] font-bold uppercase tracking-[2px] mb-6 md:mb-8 drop-shadow-md">Knowledge Partners</h4>
            <div className="flex flex-wrap justify-center items-center gap-[40px] md:gap-[70px]">
              <img src={`${basePath}/assets/logos/Slasscom.png`} alt="Slasscom" loading="lazy" className="h-auto max-h-[35px] md:max-h-[55px] object-contain transition-all hover:drop-shadow-[0_0_15px_#ff6b00]" />
              <img src={`${basePath}/assets/logos/ictfromabc1.png`} alt="ictfromabc" loading="lazy" className="h-auto max-h-[45px] md:max-h-[70px] object-contain transition-all hover:drop-shadow-[0_0_15px_#ff6b00]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
