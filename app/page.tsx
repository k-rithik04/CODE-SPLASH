import { createServerClient } from "@/lib/supabase/server";
import HomeClient from "./page-client";

export default async function Home() {
  const supabase = createServerClient();
  
  // Fetch hero data on the server
  const { data: heroData } = await supabase
    .from("hero_content")
    .select("*")
    .eq("id", 1)
    .single();

  return <HomeClient initialHeroData={heroData || null} />;
}
