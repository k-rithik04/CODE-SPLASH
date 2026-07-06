import { createServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import PageHeader from "@/components/cms/PageHeader";
import EditListClient from "./EditListClient";

export default async function PartnersPage() {
  await requireRole("editor");
  const supabase = createServerClient();
  const { data } = await supabase
    .from("partners")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="Partners"
        description="Manage sponsor and partner entries"
        breadcrumbs={[{ label: "Content" }, { label: "Partners" }]}
      />
      <EditListClient items={data || []} />
    </div>
  );
}
