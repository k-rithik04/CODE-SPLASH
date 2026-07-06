import { createServerClient } from "@/lib/supabase/server";
import PageHeader from "@/components/cms/PageHeader";
import EditListClient from "./EditListClient";

export default async function ChaptersPage() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("chapters")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="Chapters"
        description="Manage hackathon chapter descriptions"
        breadcrumbs={[{ label: "Content" }, { label: "Chapters" }]}
      />
      <EditListClient items={data || []} />
    </div>
  );
}
