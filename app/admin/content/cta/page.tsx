"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRole } from "@/app/admin/RoleProviderWrapper";
import EditSingleRow from "@/components/cms/EditSingleRow";
import { Skeleton } from "@/components/ui/skeleton";

const FIELDS = [
  { key: "heading", label: "Heading" },
  { key: "button_text", label: "Button Text" },
  { key: "button_link", label: "Button Link" },
];

export default function CtaPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const { canEdit } = useRole();

  useEffect(() => {
    supabase.from("cta_content").select("*").eq("id", 1).single().then(({ data, error }) => {
      if (error) setError(error.message);
      else if (data) setData(data);
    });
  }, [supabase]);

  if (error) return <div className="text-red-400">Error: {error}</div>;
  if (!data) return <Skeleton className="h-64 w-full bg-white/5" />;

  return (
    <div>
      <EditSingleRow
        title="CTA Content"
        fields={FIELDS}
        data={data}
        readOnly={!canEdit}
        onSave={async (formData) => {
          const { error } = await supabase.from("cta_content").upsert({ id: 1, ...formData });
          return { error: error?.message };
        }}
      />
    </div>
  );
}
