import { createServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import PageHeader from "@/components/cms/PageHeader";
import EditSingleRowClient from "./EditSingleRowClient";

export default async function CTAPage() {
  await requireRole("editor");
  const supabase = createServerClient();
  const { data } = await supabase.from("cta_content").select("*").eq("id", 1).single();

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="CTA Section"
        description="Configure the call-to-action section"
        breadcrumbs={[{ label: "Settings" }, { label: "CTA Section" }]}
      />
      <EditSingleRowClient data={data || {}} />
    </div>
  );
}
