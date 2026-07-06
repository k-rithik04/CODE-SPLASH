"use client";

import EditList from "@/components/cms/EditList";

const FIELDS = [
  { key: "category", label: "Category", type: "text" as const, placeholder: "e.g. platinum" },
  { key: "name", label: "Name", type: "text" as const, placeholder: "Partner name" },
  { key: "logo_url", label: "Logo", type: "image" as const, folder: "partners", aspectRatios: ["1:1", "Original"] },
  { key: "description", label: "Description", type: "textarea" as const, placeholder: "Partner description" },
  { key: "link_url", label: "Website", type: "url" as const, placeholder: "https://..." },
];

export default function EditListClient({ items }: { items: Record<string, unknown>[] }) {
  return (
    <EditList
      title="Partners"
      tableName="partners"
      fields={FIELDS}
      items={items}
      onUpdate={() => window.location.reload()}
    />
  );
}
