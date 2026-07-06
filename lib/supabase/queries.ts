import { createClient } from "@/lib/supabase/client";

export function getStorageUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const cleanPath = path.replace(/^\/+/, "");
  return `${base}/storage/v1/object/public/cms-images/${cleanPath}`;
}

export type HeroContent = {
  logo_url: string;
  logo_alt: string;
  tagline: string;
  cta_button_text: string;
  cta_button_link: string;
  scroll_hint_desktop: string;
  scroll_hint_mobile: string;
};

export type Chapter = {
  title: string;
  description: string;
  sort_order: number;
};

export type Prize = {
  badge: string;
  name: string;
  description: string;
  amount: string;
  sort_order: number;
};

export type TimelineEntry = {
  date: string;
  title: string;
  description: string;
  position: string;
  is_current: boolean;
  sort_order: number;
};

export type PartnerRow = {
  category: string;
  name: string;
  logo_url: string;
  description: string;
  link_url: string;
  badge_color: string;
  sort_order: number;
};

export type TeamMember = {
  name: string;
  role: string;
  email: string;
  phone: string;
  linkedin_url: string;
  image_url: string;
  sort_order: number;
};

export type FaqItem = {
  question: string;
  answer: string;
  sort_order: number;
};

export type CtaContent = {
  heading: string;
  button_text: string;
  button_link: string;
  is_active: boolean;
};

export type ConnectContent = {
  quote: string;
  email_1: string;
  email_2: string;
  linkedin_url: string;
  facebook_url: string;
  youtube_url: string;
  instagram_cssa_url: string;
  instagram_codesplash_url: string;
  cssa_logo_url: string;
  copyright: string;
};

export async function fetchHeroContent(): Promise<HeroContent | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from("hero_content").select("*").limit(1).maybeSingle();
  if (error) console.error("[CMS] hero_content:", error.message, error.code);
  return data;
}

export async function fetchChapters(): Promise<Chapter[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("chapters").select("*").order("sort_order");
  if (error) console.error("[CMS] chapters:", error.message, error.code);
  return data ?? [];
}

export async function fetchPrizes(): Promise<Prize[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("prizes").select("*").order("sort_order");
  if (error) console.error("[CMS] prizes:", error.message, error.code);
  return data ?? [];
}

export async function fetchTimelineEntries(): Promise<TimelineEntry[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("timeline_entries").select("*").order("sort_order");
  if (error) console.error("[CMS] timeline:", error.message, error.code);
  return data ?? [];
}

export async function fetchPartners(): Promise<PartnerRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("partners").select("*").order("sort_order");
  if (error) console.error("[CMS] partners:", error.message, error.code);
  return data ?? [];
}

export async function fetchTeamMembers(): Promise<TeamMember[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("team_members").select("*").order("sort_order");
  if (error) console.error("[CMS] team_members:", error.message, error.code);
  return data ?? [];
}

export async function fetchFaqItems(): Promise<FaqItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("faq_items").select("*").order("sort_order");
  if (error) console.error("[CMS] faq_items:", error.message, error.code);
  return data ?? [];
}

export async function fetchCtaContent(): Promise<CtaContent | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from("cta_content").select("*").limit(1).maybeSingle();
  if (error) console.error("[CMS] cta_content:", error.message, error.code);
  return data;
}

export async function fetchConnectContent(): Promise<ConnectContent | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from("connect_content").select("*").limit(1).maybeSingle();
  if (error) console.error("[CMS] connect_content:", error.message, error.code);
  return data;
}
