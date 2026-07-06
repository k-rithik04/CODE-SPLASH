import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register",
  description:
    "Register your team for CodeSplash 2026, the national-level university and school hackathon. Choose between school or university tracks.",
  openGraph: {
    title: "Register | CodeSplash 2026",
    description:
      "Register your team for CodeSplash 2026. School and university tracks available.",
    url: "https://codesplash.cssa.lk/register",
    images: [
      {
        url: "https://codesplash.cssa.lk/og-card.png",
        width: 1200,
        height: 630,
        alt: "CodeSplash 2026 — Register",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Register | CodeSplash 2026",
    description:
      "Register your team for CodeSplash 2026. School and university tracks available.",
    images: ["https://codesplash.cssa.lk/og-card.png"],
  },
  alternates: {
    canonical: "https://codesplash.cssa.lk/register",
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          body {
            height: auto !important;
            min-height: 100vh !important;
          }
          .dark [data-slot="label"],
          .dark label,
          .dark span,
          .dark p,
          .dark h1, .dark h2, .dark h3, .dark h4, .dark h5, .dark h6 {
            color: white !important;
          }
          .dark [data-slot="input"],
          .dark input[type="text"],
          .dark input[type="email"],
          .dark input[type="number"],
          .dark input[type="tel"],
          .dark input[type="password"],
          .dark select,
          .dark textarea {
            color: white !important;
          }
          .dark select option {
            background: #1a1a1a !important;
            color: white !important;
          }
          .dark input::placeholder {
            color: rgba(255,255,255,0.4) !important;
          }
        `,
        }}
      />
      {children}
    </>
  );
}
