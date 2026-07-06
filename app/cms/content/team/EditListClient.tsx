"use client";

import EditList from "@/components/cms/EditList";

const FIELDS = [
  { key: "name", label: "Name", type: "text" as const, placeholder: "Full name" },
  { key: "role", label: "Role", type: "text" as const, placeholder: "e.g. CSSA President" },
  { key: "email", label: "Email", type: "text" as const, placeholder: "email@example.com" },
  { key: "phone", label: "Phone", type: "text" as const, placeholder: "+94 7X XXX XXXX" },
  { key: "linkedin_url", label: "LinkedIn", type: "url" as const, placeholder: "https://linkedin.com/in/..." },
  { key: "image_url", label: "Image", type: "image" as const, folder: "team", aspectRatios: ["1:1", "4:5"] },
];

export default function EditListClient({ items }: { items: Record<string, unknown>[] }) {
  return (
    <EditList
      title="Team Members"
      tableName="team_members"
      fields={FIELDS}
      items={items}
      onUpdate={() => window.location.reload()}
    />
  );
}
