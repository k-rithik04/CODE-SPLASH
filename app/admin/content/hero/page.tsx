"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRole } from "@/app/admin/RoleProviderWrapper";
import EditSingleRow from "@/components/cms/EditSingleRow";
import ImageUpload from "@/components/cms/ImageUpload";
import { Skeleton } from "@/components/ui/skeleton";

const FIELDS = [
  { key: "logo_alt", label: "Logo Alt Text", hint: "Accessibility text for the logo" },
  { key: "tagline", label: "Tagline", type: "textarea" as const, hint: "Main hero tagline shown below logo" },
  { key: "cta_button_text", label: "CTA Button Text" },
  { key: "cta_button_link", label: "CTA Button Link" },
  { key: "scroll_hint_desktop", label: "Scroll Hint (Desktop)" },
  { key: "scroll_hint_mobile", label: "Scroll Hint (Mobile)" },
];

export default function HeroPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const { canEdit } = useRole();

  const fetchData = useCallback(() => {
    supabase.from("hero_content").select("*").eq("id", 1).single().then(({ data, error }) => {
      if (error) setError(error.message);
      else if (data) setData(data);
    });
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (error) return <div className="text-red-400">Error: {error}</div>;
  if (!data) return <Skeleton className="h-64 w-full bg-white/5" />;

  const updateLogo = async (url: string) => {
    setData({ ...data, logo_url: url });
    await supabase.from("hero_content").upsert({ id: 1, logo_url: url });
    fetchData();
  };

  return (
    <div>
      <div className="space-y-6">
        <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-md">
          <div className="px-6 py-4 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white">Logo Image</h3>
          </div>
          <div className="p-6">
            {canEdit ? (
              <ImageUpload
                currentUrl={(data.logo_url as string) || ""}
                onUpload={updateLogo}
                folder="hero"
                aspectRatios={["original", "1:1"]}
              />
            ) : (
              (data.logo_url as string) && (
                <div className="w-full h-40 rounded-lg overflow-hidden border border-white/10 bg-white/5">
                  <img src={data.logo_url as string} alt="Logo" className="w-full h-full object-contain" />
                </div>
              )
            )}
          </div>
        </div>

        <EditSingleRow
          title="Hero Content"
          fields={FIELDS}
          data={data}
          readOnly={!canEdit}
          onSave={async (formData) => {
            const { error } = await supabase.from("hero_content").upsert({ id: 1, ...formData });
            return { error: error?.message };
          }}
        />
      </div>
    </div>
  );
}
