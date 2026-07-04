"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRole } from "@/app/admin/RoleProviderWrapper";
import ImageUpload from "@/components/cms/ImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, imageUrl } from "@/lib/utils";

interface TeamMember {
  id?: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  linkedin_url: string;
  image_url: string;
  sort_order: number;
}

const FIELDS = [
  { key: "name", label: "Name" },
  { key: "role", label: "Role" },
  { key: "email", label: "Email", type: "url" as const },
  { key: "phone", label: "Phone" },
  { key: "linkedin_url", label: "LinkedIn URL", type: "url" as const },
];

export default function TeamPage() {
  const [items, setItems] = useState<TeamMember[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const { canEdit } = useRole();

  const fetchData = useCallback(() => {
    supabase.from("team_members").select("*").order("sort_order").then(({ data, error }) => {
      if (error) setError(error.message);
      else if (data) setItems(data);
    });
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAdd = () => {
    setItems([...items, { name: "", role: "", email: "", phone: "", linkedin_url: "", image_url: "", sort_order: items.length + 1 }]);
  };

  const handleChange = (index: number, key: keyof TeamMember, value: unknown) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [key]: value };
    setItems(updated);
  };

  const handleImageUpload = async (index: number, url: string) => {
    handleChange(index, "image_url", url);
    const member = items[index];
    if (member.id) {
      await supabase.from("team_members").update({ image_url: url }).eq("id", member.id);
    }
  };

  const handleRemove = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    await supabase.from("team_members").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    const rows = items.map((item, idx) => ({
      name: item.name,
      role: item.role,
      email: item.email,
      phone: item.phone,
      linkedin_url: item.linkedin_url,
      image_url: item.image_url,
      sort_order: idx + 1,
    }));

    const { error: saveError } = await supabase.from("team_members").insert(rows);
    if (saveError) {
      setMessage({ type: "error", text: saveError.message });
    } else {
      setMessage({ type: "success", text: "Saved successfully!" });
      fetchData();
    }
    setSaving(false);
  };

  if (error) return <div className="text-red-400">Error: {error}</div>;
  if (items.length === 0 && !error) return <Skeleton className="h-64 w-full bg-white/5" />;

  return (
    <div>
      {canEdit && (
        <div className="flex justify-end gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={handleAdd} className="border-white/20 text-white/80 hover:text-white">
            + Add Member
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving} className="bg-orange hover:bg-orange/80">
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Saving...
              </span>
            ) : (
              "Save All"
            )}
          </Button>
        </div>
      )}

      {message && (
        <div
          className={cn(
            "p-3 rounded-lg text-sm mb-4",
            message.type === "success"
              ? "bg-green-500/10 border border-green-500/50 text-green-400"
              : "bg-red-500/10 border border-red-500/50 text-red-400"
          )}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, index) => (
          <div key={item.id || index} className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-md p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {item.image_url ? (
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10">
                    <img src={imageUrl(item.image_url)} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-orange/20 flex items-center justify-center text-orange font-bold">
                    {(item.name || "?").charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-white">{item.name || "New Member"}</p>
                  <p className="text-xs text-white/50">{item.role || "No role set"}</p>
                </div>
              </div>
              {canEdit && (
                <button
                  onClick={() => handleRemove(index)}
                  className="p-1 text-red-400 hover:text-red-300 transition-colors"
                >
                  &#x2715;
                </button>
              )}
            </div>

            <Separator className="bg-white/5" />

            <div className="grid grid-cols-2 gap-3">
              {FIELDS.map((field) => (
                <div key={field.key} className="space-y-1">
                  <Label className="text-xs text-white/50">{field.label}</Label>
                  <Input
                    value={(item[field.key as keyof TeamMember] as string) || ""}
                    onChange={(e) => handleChange(index, field.key as keyof TeamMember, e.target.value)}
                    disabled={!canEdit}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 text-sm"
                  />
                </div>
              ))}
            </div>

            {canEdit && (
              <div className="space-y-1">
                <Label className="text-xs text-white/50">Photo</Label>
                <ImageUpload
                  currentUrl={item.image_url}
                  onUpload={(url) => handleImageUpload(index, url)}
                  folder="team"
                  aspectRatios={["original", "1:1", "4:5"]}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
