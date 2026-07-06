"use client";

import EditList from "@/components/cms/EditList";

const FIELDS = [
  { key: "date", label: "Date", type: "text" as const, placeholder: "e.g. July 04" },
  { key: "title", label: "Title", type: "text" as const, placeholder: "Event title" },
  { key: "description", label: "Description", type: "textarea" as const, placeholder: "Event description" },
  { key: "position", label: "Position", type: "text" as const, placeholder: "left / right / center" },
  { key: "is_current", label: "Current", type: "toggle" as const },
];

export default function EditListClient({ items }: { items: Record<string, unknown>[] }) {
  return (
    <EditList
      title="Timeline"
      tableName="timeline_entries"
      fields={FIELDS}
      items={items}
      onUpdate={() => window.location.reload()}
    />
  );
}
