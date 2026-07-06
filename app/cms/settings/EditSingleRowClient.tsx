"use client";

import { createClient } from "@/lib/supabase/client";
import EditSingleRow from "@/components/cms/EditSingleRow";

const FIELDS = [
  { key: "site_title", label: "Site Title", type: "text" as const, placeholder: "CodeSplash | ..." },
  { key: "site_description", label: "Site Description", type: "textarea" as const, placeholder: "Meta description" },
  { key: "keywords", label: "Keywords", type: "textarea" as const, placeholder: "Comma-separated keywords", hint: "Used for SEO meta tags" },
  { key: "theme_color", label: "Theme Color", type: "text" as const, placeholder: "#000000" },
];

export default function EditSingleRowClient({ data }: { data: Record<string, unknown> }) {
  const supabase = createClient();

  const handleSave = async (formData: Record<string, unknown>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("site_settings")
      .upsert({ id: 1, ...formData }, { onConflict: "id" });
    return { error: error?.message };
  };

  return (
    <EditSingleRow
      title="Site Settings"
      fields={FIELDS}
      data={data}
      onSave={handleSave}
    />
  );
}
