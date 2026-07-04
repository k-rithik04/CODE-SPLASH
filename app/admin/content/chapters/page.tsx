"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRole } from "@/app/admin/RoleProviderWrapper";
import EditList from "@/components/cms/EditList";
import { Skeleton } from "@/components/ui/skeleton";

const FIELDS = [
  { key: "title", label: "Title" },
  { key: "description", label: "Description", type: "textarea" as const },
];

export default function ChaptersPage() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const { canEdit } = useRole();

  const fetchData = useCallback(() => {
    supabase.from("chapters").select("*").order("sort_order").then(({ data, error }) => {
      if (error) setError(error.message);
      else if (data) setItems(data);
    });
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (error) return <div className="text-red-400">Error: {error}</div>;
  if (items.length === 0 && !error) return <Skeleton className="h-64 w-full bg-white/5" />;

  return (
    <div>
      <EditList
        title="Chapter Cards"
        tableName="chapters"
        fields={FIELDS}
        items={items}
        onUpdate={fetchData}
        readOnly={!canEdit}
      />
    </div>
  );
}
