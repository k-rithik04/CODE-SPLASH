import { createServerClient } from "@/lib/supabase/server";
import PageHeader from "@/components/cms/PageHeader";
import EditSingleRowClient from "./EditSingleRowClient";

export default async function SiteSettingsPage() {
  const supabase = createServerClient();
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).single();

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Site Settings"
        description="Global SEO and site configuration"
        breadcrumbs={[{ label: "Settings" }, { label: "Site Settings" }]}
      />
      <EditSingleRowClient data={data || {}} />
    </div>
  );
}
