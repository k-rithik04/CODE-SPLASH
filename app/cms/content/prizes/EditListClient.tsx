"use client";

import EditList from "@/components/cms/EditList";

const FIELDS = [
  { key: "badge", label: "Badge", type: "text" as const, placeholder: "e.g. University Phase" },
  { key: "name", label: "Prize Name", type: "text" as const, placeholder: "e.g. Pharaoh's Legacy Prize" },
  { key: "description", label: "Description", type: "textarea" as const, placeholder: "Prize description" },
  { key: "amount", label: "Amount", type: "text" as const, placeholder: "e.g. LKR 100,000" },
];

export default function EditListClient({ items }: { items: Record<string, unknown>[] }) {
  return (
    <EditList
      title="Prizes"
      tableName="prizes"
      fields={FIELDS}
      items={items}
      onUpdate={() => window.location.reload()}
    />
  );
}
