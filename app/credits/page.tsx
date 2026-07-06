import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Credits",
  description:
    "Credits and portfolio page for CodeSplash 2026 — built by Rithika, Pahan, and Yasiru for CSSA, University of Kelaniya.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Credits | CodeSplash 2026",
    description: "Portfolio page for CodeSplash 2026.",
    url: "https://codesplash.cssa.lk/credits",
  },
};

export default function CreditsPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">CodeSplash 2026</h1>
          <p className="text-gray-400">
            National Level University & School Hackathon
          </p>
          <p className="text-sm text-gray-500">
            Organised by CSSA, University of Kelaniya
          </p>
        </div>

        <div className="border border-white/10 rounded-lg p-6 space-y-4 bg-white/5">
          <h2 className="text-lg font-semibold text-white/80">Built by</h2>
          <ul className="space-y-3">
            <li className="flex items-center justify-between">
              <div>
                <span className="font-medium">Rithika</span>
                <span className="text-sm text-gray-400 ml-2">Lead Developer</span>
              </div>
              <a
                href="https://github.com/k-rithik04"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                GitHub
              </a>
            </li>
            <li className="flex items-center justify-between">
              <div>
                <span className="font-medium">Pahan</span>
                <span className="text-sm text-gray-400 ml-2">Developer</span>
              </div>
            </li>
            <li className="flex items-center justify-between">
              <div>
                <span className="font-medium">Yasiru</span>
                <span className="text-sm text-gray-400 ml-2">Developer</span>
              </div>
            </li>
          </ul>
        </div>

        <div className="border border-white/10 rounded-lg p-6 space-y-3 bg-white/5">
          <h2 className="text-lg font-semibold text-white/80">Tech Stack</h2>
          <div className="flex flex-wrap gap-2">
            {[
              "Next.js 16",
              "React 19",
              "TypeScript",
              "TailwindCSS v4",
              "Supabase",
              "GSAP",
              "Lenis",
              "ShadCN",
              "Vercel AI",
            ].map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 text-sm rounded-full bg-white/10 text-white/70"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            Back to CodeSplash
          </Link>
        </div>
      </div>
    </div>
  );
}
