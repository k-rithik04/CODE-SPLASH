"use client";

import { createClient } from "@/lib/supabase/client";
import EditSingleRow from "@/components/cms/EditSingleRow";

const FIELDS = [
  { key: "logo_url", label: "Logo URL", type: "url" as const, placeholder: "/CodeSplash.png" },
  { key: "logo_alt", label: "Logo Alt Text", type: "text" as const, placeholder: "CodeSplash Logo" },
  { key: "tagline", label: "Tagline", type: "textarea" as const, placeholder: "Hero tagline text" },
  { key: "cta_button_text", label: "CTA Button Text", type: "text" as const, placeholder: "Register Now" },
  { key: "cta_button_link", label: "CTA Button Link", type: "url" as const, placeholder: "/register" },
  { key: "scroll_hint_desktop", label: "Desktop Scroll Hint", type: "text" as const, placeholder: "Scroll to explore" },
  { key: "scroll_hint_mobile", label: "Mobile Scroll Hint", type: "text" as const, placeholder: "Swipe to explore" },
];

export default function EditSingleRowClient({ data }: { data: Record<string, unknown> }) {
  const supabase = createClient();

  const handleSave = async (formData: Record<string, unknown>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("hero_content")
      .upsert({ id: 1, ...formData }, { onConflict: "id" });
    return { error: error?.message };
  };

  return (
    <EditSingleRow
      title="Hero Section"
      fields={FIELDS}
      data={data}
      onSave={handleSave}
    />
  );
}
