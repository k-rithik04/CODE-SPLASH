"use client";

import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SpreadsheetField {
  key: string;
  label: string;
  type?: string;
}

interface SpreadsheetProps {
  title: string;
  fields: SpreadsheetField[];
  items: Record<string, unknown>[];
  onImport?: (items: Record<string, unknown>[]) => void;
  showPreview?: boolean;
}

function escapeCSV(value: unknown): string {
  const str = String(value ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let current: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        current.push(field);
        field = "";
      } else if (ch === "\n" || ch === "\r") {
        if (ch === "\r" && text[i + 1] === "\n") i++;
        current.push(field);
        field = "";
        if (current.length > 0) rows.push(current);
        current = [];
      } else {
        field += ch;
      }
    }
  }
  current.push(field);
  if (current.length > 0 && !(current.length === 1 && current[0] === "")) {
    rows.push(current);
  }
  return rows;
}

function buildSheetData(fields: SpreadsheetField[], items: Record<string, unknown>[]) {
  const header = fields.map((f) => f.label);
  const rows = items.map((item) =>
    fields.map((f) => {
      const val = item[f.key];
      if (val === null || val === undefined) return "";
      if (typeof val === "boolean") return val ? "Yes" : "No";
      return String(val);
    })
  );
  return [header, ...rows];
}

export default function Spreadsheet({ title, fields, items, onImport, showPreview: initialPreview }: SpreadsheetProps) {
  const [showPreview, setShowPreview] = useState(initialPreview ?? false);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const safeFileName = title.toLowerCase().replace(/\s+/g, "_");

  const handleExportCSV = () => {
    const data = buildSheetData(fields, items);
    const csv = data.map((row) => row.map(escapeCSV).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${safeFileName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    const data = buildSheetData(fields, items);
    const ws = XLSX.utils.aoa_to_sheet(data);

    const colWidths = fields.map((f) => ({
      wch: Math.max(f.label.length + 2, ...items.map((item) => String(item[f.key] ?? "").length).slice(0, 20), 10),
    }));
    ws["!cols"] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, title.slice(0, 31));
    XLSX.writeFile(wb, `${safeFileName}.xlsx`);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImport) return;
    setImporting(true);
    setImportMsg(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = parseCSV(text);
      if (rows.length < 2) {
        setImportMsg("CSV file is empty or has no data rows.");
        setImporting(false);
        return;
      }

      const headerRow = rows[0].map((h) => h.trim().toLowerCase());
      const fieldMap = fields.map((f) => {
        const idx = headerRow.findIndex((h) => h === f.label.toLowerCase() || h === f.key);
        return idx >= 0 ? idx : -1;
      });

      const imported: Record<string, unknown>[] = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const obj: Record<string, unknown> = { sort_order: i };
        fields.forEach((f, fi) => {
          const idx = fieldMap[fi];
          obj[f.key] = idx >= 0 ? (row[idx] ?? "") : "";
        });
        imported.push(obj);
      }

      onImport(imported);
      setImportMsg(`Imported ${imported.length} rows from CSV.`);
      setImporting(false);
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
          className="border-white/20 text-white/70 hover:text-white"
        >
          <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
          </svg>
          {showPreview ? "Hide" : "Preview"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          className="border-white/20 text-white/70 hover:text-white"
        >
          <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          CSV
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleExportExcel}
          className="border-white/20 text-emerald-400/80 hover:text-emerald-300 hover:bg-emerald-500/10"
        >
          <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" />
          </svg>
          Excel (.xlsx)
        </Button>
        {onImport && (
          <>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              onChange={handleImport}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
              disabled={importing}
              className="border-white/20 text-white/70 hover:text-white"
            >
              <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              {importing ? "Importing..." : "Import CSV"}
            </Button>
          </>
        )}
      </div>
      {importMsg && (
        <p className={cn("text-xs mt-2", importMsg.startsWith("Imported") ? "text-green-400" : "text-red-400")}>
          {importMsg}
        </p>
      )}
      {showPreview && (
        <div className="mt-3 overflow-x-auto custom-scrollbar rounded-xl border border-white/10 bg-black/40">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-3 py-2 text-left text-white/40 font-medium">#</th>
                {fields.map((f) => (
                  <th key={f.key} className="px-3 py-2 text-left text-white/40 font-medium uppercase tracking-wider">
                    {f.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-3 py-1.5 text-white/20 font-mono">{i + 1}</td>
                  {fields.map((f) => (
                    <td key={f.key} className="px-3 py-1.5 text-white/60 max-w-[200px] truncate">
                      {String(item[f.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
