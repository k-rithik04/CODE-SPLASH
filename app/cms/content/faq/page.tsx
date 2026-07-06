import { createServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import PageHeader from "@/components/cms/PageHeader";
import EditListClient from "./EditListClient";

export default async function FAQPage() {
  await requireRole("editor");
  const supabase = createServerClient();
  const { data } = await supabase
    .from("faq_items")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="FAQ"
        description="Manage frequently asked questions"
        breadcrumbs={[{ label: "Content" }, { label: "FAQ" }]}
      />
      <EditListClient items={data || []} />
    </div>
  );
}
