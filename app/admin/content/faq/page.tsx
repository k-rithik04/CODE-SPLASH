"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRole } from "@/app/admin/RoleProviderWrapper";
import EditList from "@/components/cms/EditList";
import { Skeleton } from "@/components/ui/skeleton";

const FIELDS = [
  { key: "question", label: "Question" },
  { key: "answer", label: "Answer", type: "textarea" as const },
];

export default function FaqPage() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const { canEdit } = useRole();

  const fetchData = useCallback(() => {
    supabase.from("faq_items").select("*").order("sort_order").then(({ data, error }) => {
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
        title="FAQ Items"
        tableName="faq_items"
        fields={FIELDS}
        items={items}
        onUpdate={fetchData}
        readOnly={!canEdit}
      />
    </div>
  );
}
