"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRole } from "@/app/admin/RoleProviderWrapper";
import EditSingleRow from "@/components/cms/EditSingleRow";
import { Skeleton } from "@/components/ui/skeleton";

const FIELDS = [
  { key: "quote", label: "Quote" },
  { key: "email_1", label: "Primary Email" },
  { key: "email_2", label: "Secondary Email" },
  { key: "linkedin_url", label: "LinkedIn URL", type: "url" as const },
  { key: "facebook_url", label: "Facebook URL", type: "url" as const },
  { key: "youtube_url", label: "YouTube URL", type: "url" as const },
  { key: "instagram_cssa_url", label: "Instagram (CSSA)", type: "url" as const },
  { key: "instagram_codesplash_url", label: "Instagram (CodeSplash)", type: "url" as const },
  { key: "copyright", label: "Copyright Text", type: "textarea" as const },
];

export default function ConnectPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const { canEdit } = useRole();

  useEffect(() => {
    supabase.from("connect_content").select("*").eq("id", 1).single().then(({ data, error }) => {
      if (error) setError(error.message);
      else if (data) setData(data);
    });
  }, [supabase]);

  if (error) return <div className="text-red-400">Error: {error}</div>;
  if (!data) return <Skeleton className="h-64 w-full bg-white/5" />;

  return (
    <div>
      <EditSingleRow
        title="Footer Content"
        fields={FIELDS}
        data={data}
        readOnly={!canEdit}
        onSave={async (formData) => {
          const { error } = await supabase.from("connect_content").upsert({ id: 1, ...formData });
          return { error: error?.message };
        }}
      />
    </div>
  );
}
