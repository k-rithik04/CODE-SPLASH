import { createServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import PageHeader from "@/components/cms/PageHeader";
import EditSingleRowClient from "./EditSingleRowClient";

export default async function HeroPage() {
  await requireRole("editor");
  const supabase = createServerClient();
  const { data } = await supabase.from("hero_content").select("*").eq("id", 1).single();

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Hero Section"
        description="Configure the hero section content"
        breadcrumbs={[{ label: "Settings" }, { label: "Hero Section" }]}
      />
      <EditSingleRowClient data={data || {}} />
    </div>
  );
}
