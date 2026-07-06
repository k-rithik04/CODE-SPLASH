"use client";

import { createClient } from "@/lib/supabase/client";
import EditSingleRow from "@/components/cms/EditSingleRow";

const FIELDS = [
  { key: "heading", label: "Heading", type: "text" as const, placeholder: "Ready to dive in?" },
  { key: "button_text", label: "Button Text", type: "text" as const, placeholder: "Register Now" },
  { key: "button_link", label: "Button Link", type: "text" as const, placeholder: "/register" },
  { key: "is_active", label: "Active", type: "toggle" as const },
];

export default function EditSingleRowClient({ data }: { data: Record<string, unknown> }) {
  const supabase = createClient();

  const handleSave = async (formData: Record<string, unknown>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("cta_content")
      .upsert({ id: 1, ...formData }, { onConflict: "id" });
    return { error: error?.message };
  };

  return (
    <EditSingleRow
      title="CTA Section"
      fields={FIELDS}
      data={data}
      onSave={handleSave}
    />
  );
}
