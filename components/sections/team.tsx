import { RefObject } from "react";

interface TeamSectionProps {
  teamLayerRef: RefObject<HTMLDivElement | null>;
  teamTrackRef: RefObject<HTMLDivElement | null>;
}

export default function TeamSection({ teamLayerRef, teamTrackRef }: TeamSectionProps) {
  return (
    <section
      ref={teamLayerRef}
      className="fixed inset-0 w-screen h-screen flex flex-col justify-center items-center opacity-0 pointer-events-none z-10 overflow-hidden"
    >
      <h3 className="absolute top-[10vh] md:top-[12vh] left-0 w-full px-5 text-center italic text-[0.7rem] md:text-[0.9rem] text-white/60 tracking-[0.5px] z-20 pointer-events-none drop-shadow-md">
        &ldquo;Logic on their minds, passion in their soul.&rdquo;
      </h3>

      <div ref={teamTrackRef} className="flex gap-8 md:gap-16 absolute left-[50%] items-center h-[70vh] top-[15vh]">
        {[
          {
            name: "Naveen Jayathissa",
            role: "CSSA President",
            email: "naveenjayathis@gmail.com",
            phone: "+94 70 246 6805",
            linkedin: "www.linkedin.com/in/naveenjayathissa99",
            linkedinLink: "https://www.linkedin.com/in/naveenjayathissa99",
            image: "/naveen.png"
          },
          {
            name: "Thanuj Abeyrathne",
            role: "CSSA Secretary",
            email: "thanujabeyrathne06@gmail.com",
            phone: "+94 71 307 3108",
            linkedin: "www.linkedin.com/in/thanuj-abeyrathne-096614242",
            linkedinLink: "https://www.linkedin.com/in/thanuj-abeyrathne-096614242",
            image: "/thanuj.png"
          },
          {
            name: "Vidmal Senanayake",
            role: "Co-Chair",
            email: "vidmalsenanayake@gmail.com",
            phone: "+94 74 107 4448",
            linkedin: "www.linkedin.com/in/vidmal-senanayake",
            linkedinLink: "https://www.linkedin.com/in/vidmal-senanayake",
            image: "/vidmal.png"
          },
          {
            name: "Janishka Madushan",
            role: "Co-Chair",
            email: "janishkaofficial@gmail.com",
            phone: "+94 76 782 6947",
            linkedin: "www.linkedin.com/in/janishka",
            linkedinLink: "https://www.linkedin.com/in/janishka",
            image: "/janishka.png"
          },
          {
            name: "Chathuni Fernando",
            role: "Delegates Team Lead",
            email: "chathunifernando88@gmail.com",
            phone: "+94 75 275 3568",
            linkedin: "www.linkedin.com/in/chathuni-fernando-26a1a0383",
            linkedinLink: "https://www.linkedin.com/in/chathuni-fernando-26a1a0383",
            image: "/chathuni.png"
          }
        ].map((member, i) => (
          <div key={i} className="w-[260px] md:w-[300px] h-[380px] md:h-[420px] shrink-0 rounded-2xl flex flex-col overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.5)] bg-glass-bg backdrop-blur-[40px] border border-glass-border pointer-events-auto transition-transform hover:-translate-y-2 group">

            <div className="h-[60%] w-full bg-cover bg-center bg-no-repeat relative" style={{ backgroundImage: `url('${member.image}')` }}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            </div>

            <div className="h-[40%] w-full p-4 flex flex-col">
              <div className="text-center mb-3">
                <h4 className="font-bold text-white text-md md:text-xl leading-tight mb-1">{member.name}</h4>
                <p className="text-orange text-[0.65rem] md:text-[0.75rem] uppercase tracking-[1.5px] font-semibold">{member.role}</p>
              </div>

              <div className="flex flex-col gap-[6px] text-[0.65rem] md:text-[0.7rem] text-white/70 w-full px-2">
                <span className="flex items-center gap-3">
                  <svg className="w-3.5 h-3.5 text-orange flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path></svg>
                  {member.email}
                </span>
                <span className="flex items-center gap-3">
                  <svg className="w-3.5 h-3.5 text-orange flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>
                  {member.phone}
                </span>
                <span className="flex items-center gap-3">
                  <svg className="w-3.5 h-3.5 text-orange flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                  <a href={member.linkedinLink} target="_blank" rel="noopener noreferrer" className="hover:text-orange transition-colors">
                    {member.linkedin}
                  </a>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
