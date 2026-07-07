"use client";

import { useEffect, useState } from "react";
import {
  fetchHeroContent,
  fetchChapters,
  fetchPrizes,
  fetchTimelineEntries,
  fetchPartners,
  fetchTeamMembers,
  fetchFaqItems,
  fetchCtaContent,
  fetchConnectContent,
  type HeroContent,
  type Chapter,
  type Prize,
  type TimelineEntry,
  type PartnerRow,
  type TeamMember,
  type FaqItem,
  type CtaContent,
  type ConnectContent,
} from "@/lib/supabase/queries";

export interface CMSData {
  hero: HeroContent | null;
  chapters: Chapter[];
  prizes: Prize[];
  timeline: TimelineEntry[];
  partners: PartnerRow[];
  team: TeamMember[];
  faq: FaqItem[];
  cta: CtaContent | null;
  connect: ConnectContent | null;
  isLoaded: boolean;
}

export function useCMSData(): CMSData {
  const [data, setData] = useState<CMSData>({
    hero: null,
    chapters: [],
    prizes: [],
    timeline: [],
    partners: [],
    team: [],
    faq: [],
    cta: null,
    connect: null,
    isLoaded: false,
  });

  useEffect(() => {
    Promise.all([
      fetchHeroContent(),
      fetchChapters(),
      fetchPrizes(),
      fetchTimelineEntries(),
      fetchPartners(),
      fetchTeamMembers(),
      fetchFaqItems(),
      fetchCtaContent(),
      fetchConnectContent(),
    ]).then(([hero, chapters, prizes, timeline, partners, team, faq, cta, connect]) => {
      setData({ hero, chapters, prizes, timeline, partners, team, faq, cta, connect, isLoaded: true });
    });
  }, []);

  return data;
}
