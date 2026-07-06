import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "University Registration",
  description:
    "Register for CodeSplash 2026 as a university student. Individual or team entries welcome — showcase your technical skills and innovation.",
  openGraph: {
    title: "University Registration | CodeSplash 2026",
    description:
      "Register for CodeSplash 2026. Individual or team entries for university students.",
    url: "https://codesplash.cssa.lk/register/university",
    images: [
      {
        url: "https://codesplash.cssa.lk/og-card.png",
        width: 1200,
        height: 630,
        alt: "CodeSplash 2026 — University Registration",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "University Registration | CodeSplash 2026",
    description:
      "Register for CodeSplash 2026. Individual or team entries for university students.",
    images: ["https://codesplash.cssa.lk/og-card.png"],
  },
  alternates: {
    canonical: "https://codesplash.cssa.lk/register/university",
  },
};

export default function UniversityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
