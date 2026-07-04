"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRole } from "@/app/admin/RoleProviderWrapper";
import ImageUpload from "@/components/cms/ImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, imageUrl } from "@/lib/utils";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface Partner {
  id?: string;
  category: string;
  name: string;
  logo_url: string;
  sort_order: number;
}

const CATEGORIES = [
  { value: "platinum", label: "Platinum Partners", color: "text-yellow-400 border-yellow-400/30 bg-yellow-400/5 shadow-[inset_0_0_8px_rgba(250,204,21,0.05)]" },
  { value: "school_platinum", label: "School Phase Platinum Partner", color: "text-cyan-400 border-cyan-400/30 bg-cyan-400/5 shadow-[inset_0_0_8px_rgba(34,211,238,0.05)]" },
  { value: "knowledge", label: "Knowledge Partners", color: "text-blue-400 border-blue-400/30 bg-blue-400/5 shadow-[inset_0_0_8px_rgba(96,165,250,0.05)]" },
];

export default function PartnersPage() {
  const [items, setItems] = useState<Partner[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const { canEdit } = useRole();
  
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(() => {
    supabase.from("partners").select("*").order("sort_order").then(({ data, error }) => {
      if (error) setError(error.message);
      else if (data) setItems(data);
    });
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // GSAP animation to stagger the categories and cards on load
  useGSAP(() => {
    if (items.length > 0) {
      gsap.fromTo(
        ".category-card-anim",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }
      );
    }
  }, { dependencies: [items], scope: containerRef });

  const handleAdd = (category: string) => {
    setItems([...items, { category, name: "", logo_url: "", sort_order: items.length + 1 }]);
  };

  const handleChange = (index: number, key: keyof Partner, value: unknown) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [key]: value };
    setItems(updated);
  };

  const handleImageUpload = async (index: number, url: string) => {
    handleChange(index, "logo_url", url);
    const partner = items[index];
    if (partner.id) {
      await supabase.from("partners").update({ logo_url: url }).eq("id", partner.id);
    }
  };

  const handleRemove = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    await supabase.from("partners").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    const rows = items.map((item, idx) => ({
      category: item.category,
      name: item.name,
      logo_url: item.logo_url,
      sort_order: idx + 1,
    }));

    const { error: saveError } = await supabase.from("partners").insert(rows);
    if (saveError) {
      setMessage({ type: "error", text: saveError.message });
    } else {
      setMessage({ type: "success", text: "Saved successfully!" });
      fetchData();
    }
    setSaving(false);
  };

  const inputClass = "bg-white/5 border-white/10 text-white placeholder:text-white/20 hover:border-white/20 focus:border-orange/50 focus:ring-1 focus:ring-orange/50 transition-all rounded-lg";

  if (error) return <div className="text-red-400 p-4 bg-red-500/10 rounded-xl border border-red-500/20">Error: {error}</div>;
  if (items.length === 0 && !error) return <Skeleton className="h-64 w-full rounded-2xl bg-white/5" />;

  return (
    <div ref={containerRef} className="space-y-6">

      {message && (
        <div className="bg-black/20 rounded-xl border border-white/5 overflow-hidden shadow-lg">
          <div
            className={cn(
              "p-4 text-sm font-medium flex items-center gap-2.5",
              message.type === "success"
                ? "bg-green-500/10 border-l-4 border-green-500 text-green-400"
                : "bg-red-500/10 border-l-4 border-red-500 text-red-400"
            )}
          >
            {message.type === "success" ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            )}
            {message.text}
          </div>
        </div>
      )}

      {CATEGORIES.map((cat) => (
        <div key={cat.value} className="category-card-anim rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-semibold text-white tracking-tight">{cat.label}</h3>
              <Badge variant="outline" className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold", cat.color)}>
                {items.filter((i) => i.category === cat.value).length}
              </Badge>
            </div>
            {canEdit && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleAdd(cat.value)} 
                className="border-white/20 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all font-medium"
              >
                + Add Partner
              </Button>
            )}
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {items
                .filter((item) => item.category === cat.value)
                .map((item) => {
                  const globalIndex = items.indexOf(item);
                  return (
                    <div 
                      key={item.id || globalIndex} 
                      className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300 relative group"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 border border-white/10 shrink-0 flex items-center justify-center p-2 relative">
                        {item.logo_url ? (
                          <img src={imageUrl(item.logo_url)} alt={item.name || "partner logo"} className="w-full h-full object-contain filter brightness-90 group-hover:brightness-100 transition-all" />
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/20"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                        )}
                      </div>
                      
                      <div className="flex-1 grid grid-cols-1 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-white/50 uppercase tracking-wider font-semibold">Partner Name</Label>
                          <Input
                            value={item.name}
                            onChange={(e) => handleChange(globalIndex, "name", e.target.value)}
                            placeholder="Name (e.g., Google)"
                            disabled={!canEdit}
                            className={cn(inputClass, "h-10 px-3.5 text-sm")}
                          />
                        </div>
                        {canEdit && (
                          <div className="space-y-1.5">
                            <Label className="text-xs text-white/50 uppercase tracking-wider font-semibold font-mono">Upload Logo</Label>
                            <ImageUpload
                              currentUrl={item.logo_url}
                              onUpload={(url) => handleImageUpload(globalIndex, url)}
                              folder="partners"
                              aspectRatios={["original", "1:1", "16:9"]}
                            />
                          </div>
                        )}
                      </div>

                      {canEdit && (
                        <button
                          onClick={() => handleRemove(globalIndex)}
                          className="absolute top-4 right-4 p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      )}
                    </div>
                  );
                })}
            </div>

            {items.filter((i) => i.category === cat.value).length === 0 && (
              <div className="text-center py-10 flex flex-col items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/20"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                <p className="text-white/30 text-sm">No partners in this category yet.</p>
              </div>
            )}
          </div>
        </div>
      ))}

      {canEdit && (
        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleSave} 
            disabled={saving} 
            className="bg-orange hover:bg-orange/80 text-white shadow-[0_0_15px_rgba(255,107,0,0.4)] rounded-xl transition-all font-medium px-8 py-5 text-base"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Saving...
              </span>
            ) : (
              "Save All Partners"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
