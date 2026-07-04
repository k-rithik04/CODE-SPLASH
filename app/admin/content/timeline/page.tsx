"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRole } from "@/app/admin/RoleProviderWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface TimelineEntry {
  id: string;
  date: string;
  title: string;
  description: string;
  position: string;
  is_current: boolean;
  sort_order: number;
}

export default function TimelinePage() {
  const [items, setItems] = useState<TimelineEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const { canEdit } = useRole();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  const fetchData = useCallback(() => {
    supabase.from("timeline_entries").select("*").order("sort_order").then(({ data, error: fetchErr }) => {
      if (fetchErr) {
        console.error("Fetch error:", fetchErr);
        setError(fetchErr.message);
      } else if (data) {
        setItems(data);
      }
    });
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Animate rows when items change
  useGSAP(() => {
    if (items.length > 0 && tableRef.current) {
      gsap.fromTo(
        ".timeline-row-anim",
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out", overwrite: "auto" }
      );
    }
  }, { dependencies: [items], scope: containerRef });

  const handleChange = (index: number, key: keyof TimelineEntry, value: unknown) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [key]: value };
    setItems(updated);
  };

  const handleSetCurrent = (index: number) => {
    setItems(items.map((item, i) => ({
      ...item,
      is_current: i === index ? true : false,
    })));
  };

  const handleAdd = () => {
    setItems([...items, {
      id: "",
      date: "",
      title: "",
      description: "",
      position: "left",
      is_current: false,
      sort_order: items.length + 1,
    }]);
  };

  const handleRemove = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...items];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    setItems(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return;
    const updated = [...items];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    setItems(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    // Step 1: Delete ALL existing rows
    const { error: delErr } = await supabase
      .from("timeline_entries")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (delErr) {
      console.error("Delete error:", delErr);
      setMessage({ type: "error", text: "Failed to clear table: " + delErr.message });
      setSaving(false);
      return;
    }

    // Step 2: Insert all rows fresh (no id = auto-generate UUIDs)
    if (items.length === 0) {
      setMessage({ type: "success", text: "Saved (all entries removed)." });
      setSaving(false);
      return;
    }

    const rows = items.map((item, idx) => ({
      date: item.date,
      title: item.title,
      description: item.description,
      position: item.position,
      is_current: item.is_current,
      sort_order: idx + 1,
    }));

    const { error: insErr } = await supabase
      .from("timeline_entries")
      .insert(rows);

    if (insErr) {
      console.error("Insert error:", insErr);
      setMessage({ type: "error", text: "Failed to insert: " + insErr.message });
    } else {
      setMessage({ type: "success", text: "Saved successfully!" });
      fetchData();
    }
    setSaving(false);
  };

  const inputClass = "bg-white/5 border-white/10 text-white placeholder:text-white/20 hover:border-white/20 focus:border-orange/50 focus:ring-1 focus:ring-orange/50 transition-all rounded-lg";

  if (error) return <div className="text-red-400">Error: {error}</div>;
  if (items.length === 0 && !error) return <Skeleton className="h-64 w-full rounded-2xl bg-white/5" />;

  return (
    <div ref={containerRef}>

      {message && (
        <div className="mb-6 bg-black/20 rounded-xl border border-white/5">
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

      <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-semibold text-white tracking-tight">Timeline Entries</h3>
            <Badge variant="outline" className="text-white/50 border-white/10 bg-white/5 px-2.5 rounded-full">
              {items.length} items
            </Badge>
            {items.some((i) => i.is_current) && (
              <Badge variant="outline" className="text-orange border-orange/50 bg-orange/10 px-2.5 rounded-full shadow-[inset_0_0_8px_rgba(255,107,0,0.1)]">
                Active: {items.find((i) => i.is_current)?.title}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3">
            {canEdit && (
              <>
                <Button variant="outline" size="sm" onClick={handleAdd} className="border-white/20 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                  + Add Entry
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saving} className="bg-orange hover:bg-orange/80 text-white shadow-[0_0_15px_rgba(255,107,0,0.4)] rounded-xl transition-all font-medium px-5">
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

        <div className="overflow-x-auto custom-scrollbar p-2">
          <Table ref={tableRef}>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent border-b-2">
                <TableHead className="w-12 text-white/30 font-semibold pl-4">#</TableHead>
                <TableHead className="text-white/40 font-semibold text-xs uppercase tracking-wider">Date</TableHead>
                <TableHead className="text-white/40 font-semibold text-xs uppercase tracking-wider">Title</TableHead>
                <TableHead className="text-white/40 font-semibold text-xs uppercase tracking-wider">Description</TableHead>
                <TableHead className="text-white/40 font-semibold text-xs uppercase tracking-wider">Position</TableHead>
                <TableHead className="text-white/40 font-semibold text-xs uppercase tracking-wider">Active</TableHead>
                {canEdit && (
                  <TableHead className="w-28 text-white/40 text-right pr-4 font-semibold text-xs uppercase tracking-wider">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow
                  key={item.id || `new-${index}`}
                  className={cn(
                    "timeline-row-anim border-white/5 transition-colors group",
                    item.is_current ? "bg-orange/5 hover:bg-orange/10" : "hover:bg-white/[0.03]"
                  )}
                >
                  <TableCell className="text-white/30 font-mono text-xs align-top pt-5 pl-4">{index + 1}</TableCell>
                  <TableCell className="py-3">
                    <Input
                      value={item.date}
                      onChange={(e) => handleChange(index, "date", e.target.value)}
                      placeholder="Mar 05"
                      disabled={!canEdit}
                      className={`${inputClass} text-sm w-24 h-9 px-3`}
                    />
                  </TableCell>
                  <TableCell className="py-3">
                    <Input
                      value={item.title}
                      onChange={(e) => handleChange(index, "title", e.target.value)}
                      placeholder="Event title"
                      disabled={!canEdit}
                      className={`${inputClass} text-sm h-9 px-3`}
                    />
                  </TableCell>
                  <TableCell className="py-3">
                    <Textarea
                      value={item.description}
                      onChange={(e) => handleChange(index, "description", e.target.value)}
                      placeholder="Brief description"
                      disabled={!canEdit}
                      className={`${inputClass} min-h-[60px] resize-y text-sm px-3 py-2`}
                    />
                  </TableCell>
                  <TableCell className="py-3">
                    <Select
                      value={item.position}
                      onValueChange={(v) => handleChange(index, "position", v)}
                      disabled={!canEdit}
                    >
                      <SelectTrigger className={`${inputClass} text-sm w-28 h-9`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black/95 border-white/10 text-white rounded-xl">
                        <SelectItem value="left" className="focus:bg-white/10">Left</SelectItem>
                        <SelectItem value="right" className="focus:bg-white/10">Right</SelectItem>
                        <SelectItem value="center" className="focus:bg-white/10">Center</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="py-3 align-top pt-3">
                    <button
                      type="button"
                      onClick={() => handleSetCurrent(index)}
                      disabled={!canEdit}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border",
                        item.is_current
                          ? "bg-orange text-white border-orange/50 shadow-[0_0_15px_rgba(255,107,0,0.4)]"
                          : "bg-white/5 border-transparent text-white/50 hover:bg-white/10 hover:text-white hover:border-white/10"
                      )}
                    >
                      {item.is_current ? "Active" : "Set Active"}
                    </button>
                  </TableCell>
                  {canEdit && (
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
                          disabled={index === items.length - 1}
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
      </div>
    </div>
  );
}
