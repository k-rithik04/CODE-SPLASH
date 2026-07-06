"use client";

import EditList from "@/components/cms/EditList";

const FIELDS = [
  { key: "question", label: "Question", type: "text" as const, placeholder: "FAQ question" },
  { key: "answer", label: "Answer", type: "textarea" as const, placeholder: "FAQ answer" },
];

export default function EditListClient({ items }: { items: Record<string, unknown>[] }) {
  return (
    <EditList
      title="FAQ"
      tableName="faq_items"
      fields={FIELDS}
      items={items}
      onUpdate={() => window.location.reload()}
    />
  );
}
