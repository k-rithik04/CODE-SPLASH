import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "School Registration",
  description:
    "Register your school team for CodeSplash 2026. Teams of 3-5 students from the same school can compete in Sri Lanka's national-level hackathon.",
  openGraph: {
    title: "School Registration | CodeSplash 2026",
    description:
      "Register your school team for CodeSplash 2026. Teams of 3-5 students.",
    url: "https://codesplash.cssa.lk/register/school",
    images: [
      {
        url: "https://codesplash.cssa.lk/og-card.png",
        width: 1200,
        height: 630,
        alt: "CodeSplash 2026 — School Registration",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "School Registration | CodeSplash 2026",
    description:
      "Register your school team for CodeSplash 2026. Teams of 3-5 students.",
    images: ["https://codesplash.cssa.lk/og-card.png"],
  },
  alternates: {
    canonical: "https://codesplash.cssa.lk/register/school",
  },
};

export default function SchoolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
