import { createServerClient } from "@/lib/supabase/server";
import PageHeader from "@/components/cms/PageHeader";
import EditListClient from "./EditListClient";

export default async function TimelinePage() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("timeline_entries")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="Timeline"
        description="Manage event timeline entries"
        breadcrumbs={[{ label: "Content" }, { label: "Timeline" }]}
      />
      <EditListClient items={data || []} />
    </div>
  );
}
