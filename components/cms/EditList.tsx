"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import ImageUpload from "@/components/cms/ImageUpload";

interface Field {
  key: string;
  label: string;
  type?: "text" | "textarea" | "url" | "number" | "toggle" | "image";
  placeholder?: string;
  hint?: string;
  folder?: string;
  aspectRatios?: string[];
}

interface EditListProps {
  title: string;
  tableName: string;
  fields: Field[];
  items: Record<string, unknown>[];
  onUpdate: () => void;
  readOnly?: boolean;
}

export default function EditList({ title, tableName, fields, items, onUpdate, readOnly }: EditListProps) {
  const [list, setList] = useState<Record<string, unknown>[]>(items);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [prevItems, setPrevItems] = useState(items);
  const supabase = createClient();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  if (items !== prevItems) {
    setList(items);
    setPrevItems(items);
  }

  // Animate rows when list changes (especially on initial data load)
  useEffect(() => {
    if (list.length > 0 && tableRef.current) {
      gsap.fromTo(
        ".table-row-anim",
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out", overwrite: "auto" }
      );
    }
  }, [list]);

  const handleChange = (index: number, key: string, value: unknown) => {
    const updated = [...list];
    updated[index] = { ...updated[index], [key]: value };
    setList(updated);
  };

  const handleAdd = () => {
    const newItem: Record<string, unknown> = { sort_order: list.length + 1 };
    fields.forEach((f) => {
      newItem[f.key] = f.type === "toggle" ? false : "";
    });
    setList([...list, newItem]);
  };

  const handleRemove = (index: number) => {
    setList(list.filter((_, i) => i !== index));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...list];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    setList(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === list.length - 1) return;
    const updated = [...list];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    setList(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: deleteError } = await (supabase as any).from(tableName).delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (deleteError) {
      setMessage({ type: "error", text: deleteError.message });
      setSaving(false);
      return;
    }

    const rowsToInsert = list.map((item, idx) => {
      const row: Record<string, unknown> = { ...item, sort_order: idx + 1 };
      delete row.id;
      return row;
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: insertError } = await (supabase as any).from(tableName).insert(rowsToInsert);
    if (insertError) {
      setMessage({ type: "error", text: insertError.message });
    } else {
      setMessage({ type: "success", text: "Saved successfully!" });
      onUpdate();
    }
    setSaving(false);
  };

  const inputClass = "bg-white/5 border-white/10 text-white placeholder:text-white/20 hover:border-white/20 focus:border-orange/50 focus:ring-1 focus:ring-orange/50 transition-all rounded-lg";

  return (
    <div ref={containerRef} className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl overflow-x-auto">
      <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-semibold text-white tracking-tight">{title}</h3>
          <Badge variant="outline" className="text-white/50 border-white/10 bg-white/5 px-2.5 rounded-full">
            {list.length} items
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          {!readOnly && (
            <>
              <Button variant="outline" size="sm" onClick={handleAdd} className="border-white/20 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                + Add Item
              </Button>
              <Button 
                size="sm" 
                onClick={handleSave} 
                disabled={saving} 
                className="bg-orange hover:bg-orange/80 text-white shadow-[0_0_15px_rgba(255,107,0,0.4)] rounded-xl transition-all font-medium px-5"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Saving...
                  </span>
                ) : (
                  "Save All"
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {message && (
        <div className="px-6 py-4 bg-black/20 border-b border-white/5">
          <div
            className={cn(
              "p-4 rounded-xl text-sm font-medium flex items-center gap-2",
              message.type === "success"
                ? "bg-green-500/10 border border-green-500/30 text-green-400 shadow-[inset_0_0_12px_rgba(34,197,94,0.1)]"
                : "bg-red-500/10 border border-red-500/30 text-red-400 shadow-[inset_0_0_12px_rgba(239,68,68,0.1)]"
            )}
          >
            {message.type === "success" ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            )}
            {message.text}
          </div>
        </div>
      )}

      {list.length === 0 ? (
        <div className="px-6 py-16 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
          </div>
          <p className="text-white/40 text-sm">No items yet. Click &quot;Add Item&quot; to create one.</p>
        </div>
      ) : (
        <div className="overflow-x-auto custom-scrollbar p-2">
          <Table ref={tableRef} className="w-full min-w-[900px]">
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent border-b-2">
                <TableHead className="w-12 text-white/30 font-semibold pl-4">#</TableHead>
                {fields.map((field) => (
                  <TableHead key={field.key} className="text-white/40 font-semibold text-xs uppercase tracking-wider">
                    {field.label}
                  </TableHead>
                ))}
                {!readOnly && (
                  <TableHead className="w-28 text-white/40 text-right pr-4 font-semibold text-xs uppercase tracking-wider">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((item, index) => (
                <TableRow key={(item.id as string) || index} className="table-row-anim border-white/5 hover:bg-white/[0.03] transition-colors group">
                  <TableCell className="text-white/30 font-mono text-xs align-top pt-5 pl-4">{index + 1}</TableCell>
                  {fields.map((field) => (
                   <TableCell key={field.key} className="py-3">
                      {field.type === "image" ? (
                        <ImageUpload
                          currentUrl={(item[field.key] as string) || ""}
                          onUpload={(url) => handleChange(index, field.key, url)}
                          folder={field.folder || ""}
                          aspectRatios={field.aspectRatios}
                          className="min-w-[180px]"
                        />
                      ) : field.type === "textarea" ? (
                        <Textarea
                          value={(item[field.key] as string) || ""}
                          onChange={(e) => handleChange(index, field.key, e.target.value)}
                          placeholder={field.placeholder}
                          disabled={readOnly}
                          className={`${inputClass} min-h-[60px] resize-y text-sm px-3 py-2 min-w-[200px] w-full`}
                        />
                      ) : field.type === "toggle" ? (
                        <div className="flex items-center gap-3 pt-2">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={!!item[field.key]}
                              onChange={(e) => handleChange(index, field.key, e.target.checked)}
                              disabled={readOnly}
                            />
                            <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange shadow-inner"></div>
                          </label>
                          <span className={cn("text-xs font-medium", item[field.key] ? "text-orange" : "text-white/40")}>
                            {item[field.key] ? "Enabled" : "Disabled"}
                          </span>
                        </div>
                      ) : (
                        <Input
                          type={field.type || "text"}
                          value={(item[field.key] as string) || ""}
                          onChange={(e) => handleChange(index, field.key, e.target.value)}
                          placeholder={field.placeholder}
                          disabled={readOnly}
                          className={`${inputClass} text-sm h-9 px-3 min-w-[160px] w-full`}
                        />
                      )}
                    </TableCell>
                  ))}
                  {!readOnly && (
                    <TableCell className="text-right align-top pt-4 pr-4">
                      <div className="flex items-center justify-end gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          className="p-1.5 rounded bg-white/5 text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-20 transition-all"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveDown(index)}
                          disabled={index === list.length - 1}
                          className="p-1.5 rounded bg-white/5 text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-20 transition-all"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemove(index)}
                          className="p-1.5 rounded bg-red-500/10 text-red-400 hover:text-red-300 hover:bg-red-500/20 ml-1 transition-all"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
