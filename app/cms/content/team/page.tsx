import { createServerClient } from "@/lib/supabase/server";
import PageHeader from "@/components/cms/PageHeader";
import EditListClient from "./EditListClient";

export default async function TeamPage() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("team_members")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="Team Members"
        description="Manage team member profiles"
        breadcrumbs={[{ label: "Content" }, { label: "Team" }]}
      />
      <EditListClient items={data || []} />
    </div>
  );
}
