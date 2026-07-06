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

        <div className="border border-white/10 rounded-lg p-6 space-y-4 bg-white/5">
          <h2 className="text-lg font-semibold text-white/80">Development History</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-blue-400 shrink-0" />
              <div>
                <p className="font-medium text-white/90">Original Idea & Base Code</p>
                <p className="text-sm text-gray-400">
                  Concept and initial implementation by{" "}
                  <a
                    href="https://github.com/JanishkaM"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    JanishkaM
                  </a>
                </p>
                <div className="flex gap-2 mt-1">
                  <a
                    href="https://github.com/JanishkaM/code-splash-web/tree/pahan-demo2"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    pahan-demo2 branch
                  </a>
                  <span className="text-gray-600">|</span>
                  <a
                    href="https://github.com/JanishkaM/code-splash-web/tree/performance-updates"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    performance-updates branch
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-orange shrink-0" />
              <div>
                <p className="font-medium text-white/90">Personal Development</p>
                <p className="text-sm text-gray-400">
                  Full-stack rebuild, CMS admin, RBAC, security hardening by{" "}
                  <a
                    href="https://github.com/k-rithik04"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Rithika
                  </a>
                </p>
                <a
                  href="https://github.com/k-rithik04/CODE-SPLASH"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  k-rithik04/CODE-SPLASH
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-green-400 shrink-0" />
              <div>
                <p className="font-medium text-white/90">University Contribution</p>
                <p className="text-sm text-gray-400">
                  Production deployment for CSSA, University of Kelaniya
                </p>
                <a
                  href="https://github.com/cssa-uok/code-splash"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  cssa-uok/code-splash
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-purple-400 shrink-0" />
              <div>
                <p className="font-medium text-white/90">Live Production</p>
                <p className="text-sm text-gray-400">
                  Deployed and running at{" "}
                  <a
                    href="https://codesplash.cssa.lk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    codesplash.cssa.lk
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-white/10 rounded-lg p-6 space-y-4 bg-white/5">
          <h2 className="text-lg font-semibold text-white/80">Development History</h2>
          <div className="space-y-4 text-sm text-gray-300">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-blue-400 flex-shrink-0" />
              <div>
                <p className="font-medium text-white">Original Development</p>
                <p>Initially built and iterated in a personal repository.</p>
                <a
                  href="https://github.com/k-rithik04/CODE-SPLASH"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  github.com/k-rithik04/CODE-SPLASH
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-green-400 flex-shrink-0" />
              <div>
                <p className="font-medium text-white">University Contribution</p>
                <p>Contributed to the CSSA organisation repository for production hosting.</p>
                <a
                  href="https://github.com/cssa-uok/code-splash"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  github.com/cssa-uok/code-splash
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-orange-400 flex-shrink-0" />
              <div>
                <p className="font-medium text-white">Production Deployment</p>
                <p>Live at <span className="text-white">codesplash.cssa.lk</span> on Netlify + Cloudflare.</p>
              </div>
            </div>
          </div>
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
