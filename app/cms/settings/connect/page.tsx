import { createServerClient } from "@/lib/supabase/server";
import PageHeader from "@/components/cms/PageHeader";
import EditSingleRowClient from "./EditSingleRowClient";

export default async function ConnectPage() {
  const supabase = createServerClient();
  const { data } = await supabase.from("connect_content").select("*").eq("id", 1).single();

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Footer / Connect"
        description="Configure the footer section and social links"
        breadcrumbs={[{ label: "Settings" }, { label: "Footer / Connect" }]}
      />
      <EditSingleRowClient data={data || {}} />
    </div>
  );
}
