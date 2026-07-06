"use client";

import EditList from "@/components/cms/EditList";

const FIELDS = [
  { key: "title", label: "Title", type: "text" as const, placeholder: "Chapter title" },
  { key: "description", label: "Description", type: "textarea" as const, placeholder: "Chapter description" },
];

export default function EditListClient({ items }: { items: Record<string, unknown>[] }) {
  return (
    <EditList
      title="Chapters"
      tableName="chapters"
      fields={FIELDS}
      items={items}
      onUpdate={() => window.location.reload()}
    />
  );
}
