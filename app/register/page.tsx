import type { Metadata } from "next";
import RegistrationForm from "@/components/RegistrationForm";

/*
 * Registration Entry Page — CodeSplash 2026
 * Built by Rithika | Portfolio piece
 * https://codesplash.cssa.lk/register
 */

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

export default function RegisterPage() {
  return <RegistrationForm />;
}
