import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import Breadcrumbs from "@/components/Breadcrumbs";

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

export const dynamic = "force-dynamic";

export default async function SchoolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("cta_content")
    .select("is_active")
    .eq("id", 1)
    .single();

  if (data && !data.is_active) {
    redirect("/register");
  }

  return (
    <>
      <Breadcrumbs
        items={[
          { name: "Register", url: "https://codesplash.cssa.lk/register" },
          { name: "School", url: "https://codesplash.cssa.lk/register/school" },
        ]}
      />
      {children}
    </>
  );
}
