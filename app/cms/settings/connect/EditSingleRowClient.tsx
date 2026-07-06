"use client";

import { createClient } from "@/lib/supabase/client";
import EditSingleRow from "@/components/cms/EditSingleRow";

const FIELDS = [
  { key: "quote", label: "Quote", type: "textarea" as const, placeholder: "Footer quote text" },
  { key: "email_1", label: "Email 1", type: "text" as const, placeholder: "primary@email.com" },
  { key: "email_2", label: "Email 2", type: "text" as const, placeholder: "secondary@email.com" },
  { key: "linkedin_url", label: "LinkedIn URL", type: "url" as const, placeholder: "https://linkedin.com/..." },
  { key: "facebook_url", label: "Facebook URL", type: "url" as const, placeholder: "https://facebook.com/..." },
  { key: "youtube_url", label: "YouTube URL", type: "url" as const, placeholder: "https://youtube.com/..." },
  { key: "instagram_cssa_url", label: "Instagram CSSA URL", type: "url" as const, placeholder: "https://instagram.com/..." },
  { key: "instagram_codesplash_url", label: "Instagram CodeSplash URL", type: "url" as const, placeholder: "https://instagram.com/..." },
  { key: "cssa_logo_url", label: "Logo URL", type: "text" as const, placeholder: "/CSSALogo.png" },
  { key: "copyright", label: "Copyright Text", type: "textarea" as const, placeholder: "© CodeSplash 2026..." },
];

export default function EditSingleRowClient({ data }: { data: Record<string, unknown> }) {
  const supabase = createClient();

  const handleSave = async (formData: Record<string, unknown>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("connect_content")
      .upsert({ id: 1, ...formData }, { onConflict: "id" });
    return { error: error?.message };
  };

  return (
    <EditSingleRow
      title="Footer / Connect"
      fields={FIELDS}
      data={data}
      onSave={handleSave}
    />
  );
}
