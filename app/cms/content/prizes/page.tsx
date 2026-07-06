import { createServerClient } from "@/lib/supabase/server";
import PageHeader from "@/components/cms/PageHeader";
import EditListClient from "./EditListClient";

export default async function PrizesPage() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("prizes")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="Prizes"
        description="Manage prize categories and amounts"
        breadcrumbs={[{ label: "Content" }, { label: "Prizes" }]}
      />
      <EditListClient items={data || []} />
    </div>
  );
}
