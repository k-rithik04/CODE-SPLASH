"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRole } from "@/app/admin/RoleProviderWrapper";
import EditList from "@/components/cms/EditList";
import { Skeleton } from "@/components/ui/skeleton";

const FIELDS = [
  { key: "badge", label: "Badge", hint: "e.g. University Phase, School Phase" },
  { key: "name", label: "Prize Name", hint: "The award title" },
  { key: "description", label: "Description", type: "textarea" as const },
  { key: "amount", label: "Amount", hint: "e.g. LKR 150,000" },
];

export default function PrizesPage() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const { canEdit } = useRole();

  const fetchData = useCallback(() => {
    supabase.from("prizes").select("*").order("sort_order").then(({ data, error }) => {
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
        title="Prize Cards"
        tableName="prizes"
        fields={FIELDS}
        items={items}
        onUpdate={fetchData}
        readOnly={!canEdit}
      />
    </div>
  );
}
