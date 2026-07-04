"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

type Mode = "spreadsheet" | "bucket";
type SheetTab = "school" | "university";

interface SchoolRegistration {
  id: string;
  submitted_at: string;
  team_name: string;
  no_of_team_members: number;
  school: string;
  school_address: string | null;
  district: string;
  teacher_name: string;
  teacher_email: string;
  teacher_phone: string;
  leader_name: string;
  leader_grade: string;
  leader_email: string;
  leader_phone: string;
  member2_name: string | null;
  member2_grade: string | null;
  member2_phone: string | null;
  member3_name: string | null;
  member3_grade: string | null;
  member3_phone: string | null;
  member4_name: string | null;
  member4_grade: string | null;
  member4_phone: string | null;
  member5_name: string | null;
  member5_grade: string | null;
  member5_phone: string | null;
  declaration: string | null;
}

interface UniversityRegistration {
  id: string;
  submitted_at: string;
  email: string | null;
  team_name: string | null;
  university: string | null;
  faculty: string | null;
  team_size: number | null;
  leader_name: string | null;
  leader_gender: string | null;
  leader_email: string | null;
  leader_phone: string | null;
  leader_year: string | null;
  member2_name: string | null;
  member2_gender: string | null;
  member2_email: string | null;
  member2_phone: string | null;
  member2_year: string | null;
  member3_name: string | null;
  member3_gender: string | null;
  member3_email: string | null;
  member3_phone: string | null;
  member3_year: string | null;
  member4_name: string | null;
  member4_gender: string | null;
  member4_email: string | null;
  member4_phone: string | null;
  member4_year: string | null;
  member5_name: string | null;
  member5_gender: string | null;
  member5_email: string | null;
  member5_phone: string | null;
  member5_year: string | null;
  technologies: string | null;
  languages: string | null;
  hackathon_exp: string | null;
  hackathon_details: string | null;
  github_link: string | null;
  project_worked_on: string | null;
  problem_to_solve: string | null;
  interested_area: string | null;
  hear_about: string | null;
}

const SCHOOL_COLUMNS = [
  { col: "A", name: "Timestamp", field: "submitted_at" },
  { col: "B", name: "Team Name", field: "team_name" },
  { col: "C", name: "Members Count", field: "no_of_team_members" },
  { col: "D", name: "School Name", field: "school" },
  { col: "E", name: "School Address", field: "school_address" },
  { col: "F", name: "District / Zone", field: "district" },
  { col: "G", name: "Teacher Name", field: "teacher_name" },
  { col: "H", name: "Teacher Email", field: "teacher_email" },
  { col: "I", name: "Teacher Phone", field: "teacher_phone" },
  { col: "J", name: "Leader Name", field: "leader_name" },
  { col: "K", name: "Leader Grade", field: "leader_grade" },
  { col: "L", name: "Leader Email", field: "leader_email" },
  { col: "M", name: "Leader Phone", field: "leader_phone" },
  { col: "N", name: "Member 2 Name", field: "member2_name" },
  { col: "O", name: "Member 2 Grade", field: "member2_grade" },
  { col: "P", name: "Member 2 Phone", field: "member2_phone" },
  { col: "Q", name: "Member 3 Name", field: "member3_name" },
  { col: "R", name: "Member 3 Grade", field: "member3_grade" },
  { col: "S", name: "Member 3 Phone", field: "member3_phone" },
  { col: "T", name: "Member 4 Name", field: "member4_name" },
  { col: "U", name: "Member 4 Grade", field: "member4_grade" },
  { col: "V", name: "Member 4 Phone", field: "member4_phone" },
  { col: "W", name: "Member 5 Name", field: "member5_name" },
  { col: "X", name: "Member 5 Grade", field: "member5_grade" },
  { col: "Y", name: "Member 5 Phone", field: "member5_phone" },
  { col: "Z", name: "Declaration Statement", field: "declaration" }
];

const UNI_COLUMNS = [
  { col: "A", name: "Timestamp", field: "submitted_at" },
  { col: "B", name: "Contact Email", field: "email" },
  { col: "C", name: "Team Name", field: "team_name" },
  { col: "D", name: "University", field: "university" },
  { col: "E", name: "Faculty", field: "faculty" },
  { col: "F", name: "Team Size", field: "team_size" },
  { col: "G", name: "Leader Name", field: "leader_name" },
  { col: "H", name: "Leader Gender", field: "leader_gender" },
  { col: "I", name: "Leader Email", field: "leader_email" },
  { col: "J", name: "Leader Phone", field: "leader_phone" },
  { col: "K", name: "Leader Year", field: "leader_year" },
  { col: "L", name: "Member 2 Name", field: "member2_name" },
  { col: "M", name: "Member 2 Gender", field: "member2_gender" },
  { col: "N", name: "Member 2 Email", field: "member2_email" },
  { col: "O", name: "Member 2 Phone", field: "member2_phone" },
  { col: "P", name: "Member 2 Year", field: "member2_year" },
  { col: "Q", name: "Member 3 Name", field: "member3_name" },
  { col: "R", name: "Member 3 Gender", field: "member3_gender" },
  { col: "S", name: "Member 3 Email", field: "member3_email" },
  { col: "T", name: "Member 3 Phone", field: "member3_phone" },
  { col: "U", name: "Member 3 Year", field: "member3_year" },
  { col: "V", name: "Member 4 Name", field: "member4_name" },
  { col: "W", name: "Member 4 Gender", field: "member4_gender" },
  { col: "X", name: "Member 4 Email", field: "member4_email" },
  { col: "Y", name: "Member 4 Phone", field: "member4_phone" },
  { col: "Z", name: "Member 4 Year", field: "member4_year" },
  { col: "AA", name: "Member 5 Name", field: "member5_name" },
  { col: "AB", name: "Member 5 Gender", field: "member5_gender" },
  { col: "AC", name: "Member 5 Email", field: "member5_email" },
  { col: "AD", name: "Member 5 Phone", field: "member5_phone" },
  { col: "AE", name: "Member 5 Year", field: "member5_year" },
  { col: "AF", name: "Technologies", field: "technologies" },
  { col: "AG", name: "Languages", field: "languages" },
  { col: "AH", name: "Hackathon Experience", field: "hackathon_exp" },
  { col: "AI", name: "Experience Details", field: "hackathon_details" },
  { col: "AJ", name: "GitHub Link", field: "github_link" },
  { col: "AK", name: "Projects", field: "project_worked_on" },
  { col: "AL", name: "Problem Statement", field: "problem_to_solve" },
  { col: "AM", name: "Area of Interest", field: "interested_area" },
  { col: "AN", name: "Heard About Us", field: "hear_about" }
];

interface SpreadsheetColumn {
  col: string;
  name: string;
  field: string;
}

function DialogSpreadsheetView({ 
  columns, 
  data, 
  rowIndex,
  totalRows,
  sheetName,
  onClose 
}: { 
  columns: SpreadsheetColumn[]; 
  data: SchoolRegistration | UniversityRegistration; 
  rowIndex: number;
  totalRows: number;
  sheetName: string;
  onClose: () => void;
}) {
  const [activeCell, setActiveCell] = useState<SpreadsheetColumn>(columns[1] || columns[0]);

  const d = data as unknown as Record<string, unknown>;
  const activeValue = d[activeCell.field] !== null && d[activeCell.field] !== undefined 
    ? String(d[activeCell.field]) 
    : "";

  const filledCount = columns.filter(c => {
    const val = d[c.field];
    return val !== null && val !== undefined && String(val).trim() !== "";
  }).length;

  return (
    <div className="space-y-4">
      {/* Excel Stats Header Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white/[0.02] border border-white/5 rounded-xl p-3 text-[11px] font-mono select-none">
        <div className="space-y-0.5">
          <span className="text-white/30 block uppercase tracking-wider text-[9px]">File Name</span>
          <span className="text-white/95 font-semibold">codesplash_database_2026.xlsx</span>
        </div>
        <div className="space-y-0.5">
          <span className="text-white/30 block uppercase tracking-wider text-[9px]">Active Sheet</span>
          <span className="text-orange font-semibold flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
            {sheetName}
          </span>
        </div>
        <div className="space-y-0.5">
          <span className="text-white/30 block uppercase tracking-wider text-[9px]">Sheet Size</span>
          <span className="text-white/80 font-semibold">{totalRows} rows × {columns.length} cols</span>
        </div>
        <div className="space-y-0.5">
          <span className="text-white/30 block uppercase tracking-wider text-[9px]">Cell Populated</span>
          <span className="text-white/80 font-semibold">
            {filledCount} of {columns.length} ({Math.round((filledCount / columns.length) * 100)}%)
          </span>
        </div>
      </div>

      {/* Formula Bar */}
      <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1.5 font-mono text-xs shadow-[inset_0_0_12px_rgba(255,255,255,0.02)]">
        <div className="px-3 py-1 bg-white/5 border border-white/5 text-orange font-bold rounded-lg uppercase select-none tracking-wider flex items-center justify-center min-w-[50px]">
          {activeCell.col}{rowIndex}
        </div>
        <div className="text-white/30 px-1 select-none font-bold">fx</div>
        <div className="h-4 w-[1px] bg-white/10 mx-1" />
        <input
          type="text"
          readOnly
          value={activeValue}
          className="flex-1 bg-transparent border-0 outline-none text-white/90 px-2 font-sans text-sm placeholder:text-white/10"
          placeholder="(Empty cell)"
        />
      </div>

      {/* Spreadsheet Grid container */}
      <div className="overflow-x-auto border border-white/10 rounded-2xl bg-black/60 custom-scrollbar shadow-inner relative max-w-full">
        <table className="min-w-full border-collapse text-left font-mono text-xs select-none">
          <thead>
            {/* Column letters A, B, C */}
            <tr className="bg-white/5 border-b border-white/10">
              <th className="w-12 px-3 py-2 text-center text-white/30 border-r border-white/10 font-bold bg-white/5 sticky left-0 z-20"></th>
              {columns.map((c) => (
                <th 
                  key={c.col} 
                  className={cn(
                    "px-4 py-2 text-center border-r border-white/10 text-[10px] font-bold tracking-wide select-none min-w-[150px] transition-colors",
                    activeCell.col === c.col ? "text-orange bg-orange/5" : "text-white/40"
                  )}
                >
                  {c.col}
                </th>
              ))}
            </tr>
            {/* Field names Row 1 */}
            <tr className="bg-white/[0.01] border-b border-white/5">
              <td className="px-3 py-2.5 text-center text-white/30 border-r border-white/10 font-bold bg-white/5 sticky left-0 z-20">1</td>
              {columns.map((c) => (
                <td 
                  key={c.col} 
                  onClick={() => setActiveCell(c)}
                  className={cn(
                    "px-4 py-2.5 border-r border-white/5 text-white/60 font-sans font-medium whitespace-nowrap cursor-pointer transition-all duration-200 text-center",
                    activeCell.col === c.col ? "bg-orange/5 font-semibold text-white/80" : "hover:bg-white/[0.02]"
                  )}
                >
                  {c.name}
                </td>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Values Row [rowIndex] */}
            <tr className="border-b border-white/10 bg-transparent">
              <td className="px-3 py-3.5 text-center text-white/30 border-r border-white/10 font-bold bg-white/5 sticky left-0 z-20">{rowIndex}</td>
              {columns.map((c) => {
                const val = d[c.field];
                const strVal = val !== null && val !== undefined ? String(val) : "";
                const isSelected = activeCell.col === c.col;
                return (
                  <td 
                    key={c.col} 
                    onClick={() => setActiveCell(c)}
                    className={cn(
                      "px-4 py-3.5 border-r border-white/5 text-white/90 whitespace-nowrap max-w-[280px] truncate cursor-pointer transition-all duration-200 select-all text-center",
                      isSelected 
                        ? "bg-orange/15 border border-orange shadow-[0_0_15px_rgba(255,107,0,0.15)] text-white font-semibold outline-none" 
                        : "hover:bg-white/[0.02]"
                    )}
                  >
                    {strVal === "" ? <span className="text-white/10 italic font-sans text-[11px]">(Empty)</span> : strVal}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Mini Sheet details info footer */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 text-xs text-white/40 pt-2 border-t border-white/5">
        <div>
          Selected Field: <span className="text-orange font-bold font-mono">{activeCell.name}</span> (<code className="text-white/60">{activeCell.field}</code>)
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] uppercase font-bold text-white/50 border-white/10">
            Grid View Mode
          </Badge>
          <Button 
            onClick={onClose} 
            size="sm" 
            className="bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl px-4 py-1 text-xs"
          >
            Close Sheet
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function DatabasePage() {
  const [mode, setMode] = useState<Mode>("spreadsheet");
  const [sheetTab, setSheetTab] = useState<SheetTab>("school");
  const [schoolRegs, setSchoolRegs] = useState<SchoolRegistration[]>([]);
  const [uniRegs, setUniRegs] = useState<UniversityRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchool, setSelectedSchool] = useState<SchoolRegistration | null>(null);
  const [selectedUni, setSelectedUni] = useState<UniversityRegistration | null>(null);
  const [viewSheet, setViewSheet] = useState<SheetTab | null>(null);

  const supabase = createClient();
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchSchool = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("school_registrations")
      .select("*")
      .order("submitted_at", { ascending: false });
    if (error) console.error("Error fetching school registrations:", error);
    else if (data) setSchoolRegs(data);
    setLoading(false);
  }, [supabase]);

  const fetchUni = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("university_registrations")
      .select("*")
      .order("submitted_at", { ascending: false });
    if (error) console.error("Error fetching university registrations:", error);
    else if (data) setUniRegs(data);
    setLoading(false);
  }, [supabase]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [schoolRes, uniRes] = await Promise.all([
      supabase.from("school_registrations").select("*").order("submitted_at", { ascending: false }),
      supabase.from("university_registrations").select("*").order("submitted_at", { ascending: false }),
    ]);
    if (schoolRes.data) setSchoolRegs(schoolRes.data);
    if (uniRes.data) setUniRegs(uniRes.data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAll();
  }, [fetchAll]);

  useGSAP(() => {
    gsap.fromTo(
      ".db-card-anim",
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: "power2.out", overwrite: "auto" }
    );
  }, { dependencies: [mode, sheetTab, loading], scope: containerRef });

  const handleExport = () => {
    const isSchool = sheetTab === "school";
    const columns = isSchool ? SCHOOL_COLUMNS : UNI_COLUMNS;
    const data = isSchool ? schoolRegs : uniRegs;

    if (data.length === 0) {
      alert("No data available to export.");
      return;
    }

    const headers = columns.map(c => `"${c.name.replace(/"/g, '""')}"`).join(",");

    const rows = data.map(item => {
      return columns.map(c => {
        const val = (item as unknown as Record<string, unknown>)[c.field];
        const strVal = val !== null && val !== undefined ? String(val) : "";
        return `"${strVal.replace(/"/g, '""')}"`;
      }).join(",");
    });

    const csvString = [headers, ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${isSchool ? "school" : "university"}_registrations_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Top bar: mode toggle + refresh */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-white tracking-tight">Database</h2>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => (sheetTab === "school" ? fetchSchool() : fetchUni())}
            size="sm"
            className="bg-orange hover:bg-orange/80 text-white shadow-[0_0_12px_rgba(255,107,0,0.2)] rounded-xl font-semibold text-xs"
          >
            Refresh
          </Button>

          <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 p-1.5 rounded-2xl backdrop-blur-xl shadow-lg">
            <button
              onClick={() => setMode("spreadsheet")}
              className={cn(
                "px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300",
                mode === "spreadsheet"
                  ? "bg-orange text-white shadow-[0_0_12px_rgba(255,107,0,0.3)]"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              Spreadsheet
            </button>
            <button
              onClick={() => setMode("bucket")}
              className={cn(
                "px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300",
                mode === "bucket"
                  ? "bg-orange text-white shadow-[0_0_12px_rgba(255,107,0,0.3)]"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              Bucket
            </button>
          </div>
        </div>
      </div>

      {mode === "spreadsheet" ? (
        <div className="space-y-6">
          {/* Sub-toggle: School / University + Export */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 p-1.5 rounded-2xl backdrop-blur-xl shadow-lg self-start">
              <button
                onClick={() => setSheetTab("school")}
                className={cn(
                  "px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 cursor-pointer",
                  sheetTab === "school"
                    ? "bg-orange text-white shadow-[0_0_12px_rgba(255,107,0,0.3)]"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                )}
              >
                School Registrations
              </button>
              <button
                onClick={() => setSheetTab("university")}
                className={cn(
                  "px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 cursor-pointer",
                  sheetTab === "university"
                    ? "bg-orange text-white shadow-[0_0_12px_rgba(255,107,0,0.3)]"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                )}
              >
                University Registrations
              </button>
            </div>

            <button
              onClick={handleExport}
              className="px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 text-orange border border-orange/20 hover:border-orange hover:bg-orange/10 hover:text-white flex items-center gap-1.5 cursor-pointer shadow-sm self-start sm:self-center bg-black/40 backdrop-blur-xl"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Export
            </button>
          </div>

          {sheetTab === "school" ? (
            <SchoolTable
              loading={loading}
              data={schoolRegs}
              onSelect={setSelectedSchool}
              onViewSheet={() => setViewSheet("school")}
            />
          ) : (
            <UniversityTable
              loading={loading}
              data={uniRegs}
              onSelect={setSelectedUni}
              onViewSheet={() => setViewSheet("university")}
            />
          )}
        </div>
      ) : (
        <BucketExplorer />
      )}

      {/* School detail dialog */}
      <Dialog open={selectedSchool !== null} onOpenChange={(open) => !open && setSelectedSchool(null)}>
        {selectedSchool && (
          <DialogContent className="sm:max-w-none w-[95vw] h-[90vh] overflow-y-auto bg-black/95 border border-white/10 text-white rounded-2xl backdrop-blur-2xl p-6 custom-scrollbar">
            <DialogHeader className="pb-4 border-b border-white/5">
              <DialogTitle className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                Google Sheets Viewer - School Registration
              </DialogTitle>
              <DialogDescription className="text-white/40">
                Viewing details of Team: {selectedSchool.team_name} in spreadsheet-aligned view.
              </DialogDescription>
            </DialogHeader>

            <DialogSpreadsheetView 
              columns={SCHOOL_COLUMNS} 
              data={selectedSchool} 
              rowIndex={schoolRegs.indexOf(selectedSchool) + 2}
              totalRows={schoolRegs.length + 1}
              sheetName="School Registrations"
              onClose={() => setSelectedSchool(null)} 
            />
          </DialogContent>
        )}
      </Dialog>

      {/* University detail dialog */}
      <Dialog open={selectedUni !== null} onOpenChange={(open) => !open && setSelectedUni(null)}>
        {selectedUni && (
          <DialogContent className="sm:max-w-none w-[95vw] h-[90vh] overflow-y-auto bg-black/95 border border-white/10 text-white rounded-2xl backdrop-blur-2xl p-6 custom-scrollbar">
            <DialogHeader className="pb-4 border-b border-white/5">
              <DialogTitle className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                Google Sheets Viewer - University Registration
              </DialogTitle>
              <DialogDescription className="text-white/40">
                Viewing details of {selectedUni.team_name || selectedUni.leader_name} in spreadsheet-aligned view.
              </DialogDescription>
            </DialogHeader>

            <DialogSpreadsheetView 
              columns={UNI_COLUMNS} 
              data={selectedUni} 
              rowIndex={uniRegs.indexOf(selectedUni) + 2}
              totalRows={uniRegs.length + 1}
              sheetName="University Registrations"
              onClose={() => setSelectedUni(null)} 
            />
          </DialogContent>
        )}
      </Dialog>

      {/* Full Sheet View Dialog */}
      <Dialog open={viewSheet !== null} onOpenChange={(open) => !open && setViewSheet(null)}>
        {viewSheet && (
          <DialogContent className="sm:max-w-none w-[97vw] h-[95vh] overflow-hidden bg-black/95 border border-white/10 text-white rounded-2xl backdrop-blur-2xl p-6 custom-scrollbar flex flex-col">
            <DialogHeader className="pb-4 border-b border-white/5 shrink-0">
              <DialogTitle className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                {viewSheet === "school" ? "School" : "University"} Registrations — Full Sheet
              </DialogTitle>
              <DialogDescription className="text-white/40">
                Complete spreadsheet view of all {viewSheet === "school" ? schoolRegs.length : uniRegs.length} records.
              </DialogDescription>
            </DialogHeader>

            {/* Insight cards */}
            {viewSheet === "school" ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
                {[
                  { label: "Total Teams", value: schoolRegs.length, color: "text-orange" },
                  { label: "Districts", value: new Set(schoolRegs.map((r) => r.district)).size, color: "text-blue-400" },
                  { label: "Schools", value: new Set(schoolRegs.map((r) => r.school)).size, color: "text-green-400" },
                  { label: "Columns", value: SCHOOL_COLUMNS.length, color: "text-purple-400" },
                ].map((s, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">{s.label}</p>
                    <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
                {[
                  { label: "Total Registrations", value: uniRegs.length, color: "text-orange" },
                  { label: "Universities", value: new Set(uniRegs.map((r) => r.university).filter(Boolean)).size, color: "text-blue-400" },
                  { label: "Faculties", value: new Set(uniRegs.map((r) => r.faculty).filter(Boolean)).size, color: "text-green-400" },
                  { label: "Columns", value: UNI_COLUMNS.length, color: "text-purple-400" },
                ].map((s, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">{s.label}</p>
                    <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Export button bar */}
            <div className="flex items-center justify-between shrink-0">
              <p className="text-xs text-white/40">
                Showing <span className="text-white/70 font-semibold">{viewSheet === "school" ? schoolRegs.length : uniRegs.length}</span> rows &times; <span className="text-white/70 font-semibold">{viewSheet === "school" ? SCHOOL_COLUMNS.length : UNI_COLUMNS.length}</span> columns
              </p>
              <Button
                size="sm"
                onClick={handleExport}
                className="bg-orange hover:bg-orange/80 text-white shadow-[0_0_12px_rgba(255,107,0,0.2)] rounded-xl font-semibold text-xs flex items-center gap-1.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Export CSV
              </Button>
            </div>

            {/* Full spreadsheet grid */}
            {(() => {
              const columns = viewSheet === "school" ? SCHOOL_COLUMNS : UNI_COLUMNS;
              const rows = viewSheet === "school" ? schoolRegs : uniRegs;
              return (
                <div className="flex-1 overflow-auto border border-white/10 rounded-xl bg-black/60 custom-scrollbar">
                  <table className="min-w-full border-collapse text-left font-mono text-[11px] select-none">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-white/5 border-b border-white/10">
                        <th className="w-12 px-3 py-2 text-center text-white/30 border-r border-white/10 font-bold bg-white/[0.08] sticky left-0 z-20">#</th>
                        {columns.map((c) => (
                          <th key={c.col} className="px-3 py-2 text-center border-r border-white/10 text-[10px] font-bold text-white/40 tracking-wide min-w-[130px]">
                            <span className="text-orange/70 mr-1">{c.col}</span> {c.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((item, rowIdx) => (
                        <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="px-3 py-2 text-center text-white/25 border-r border-white/10 font-bold bg-white/[0.02] sticky left-0 z-10">{rowIdx + 1}</td>
                          {columns.map((c) => {
                            const val = (item as unknown as Record<string, unknown>)[c.field];
                            const strVal = val !== null && val !== undefined ? String(val) : "";
                            return (
                              <td key={c.col} className="px-3 py-2 border-r border-white/5 text-white/80 whitespace-nowrap max-w-[200px] truncate text-center">
                                {strVal === "" ? <span className="text-white/10 italic text-[10px]">—</span> : strVal}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

/* ---------- School Table ---------- */
function SchoolTable({ loading, data, onSelect, onViewSheet }: { loading: boolean; data: SchoolRegistration[]; onSelect: (r: SchoolRegistration) => void; onViewSheet: () => void }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden">
      <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
        <h3 className="text-xl font-semibold text-white tracking-tight">School Registrations List</h3>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-white/50 border-white/10 bg-white/5 px-2.5 rounded-full">
            {data.length} Teams
          </Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={onViewSheet}
            className="border-orange/30 text-orange hover:bg-orange/10 hover:text-white hover:border-orange/60 transition-all duration-300 rounded-xl flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
            View Sheet
          </Button>
        </div>
      </div>
      {loading ? (
        <div className="p-6 space-y-3">
          <Skeleton className="h-10 w-full bg-white/5 rounded-xl" />
          <Skeleton className="h-10 w-full bg-white/5 rounded-xl animate-pulse" />
          <Skeleton className="h-10 w-full bg-white/5 rounded-xl" />
        </div>
      ) : data.length === 0 ? (
        <div className="px-6 py-16 text-center flex flex-col items-center justify-center gap-3">
          <p className="text-white/40 text-sm">No school registrations yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto custom-scrollbar p-2">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent border-b-2">
                <TableHead className="w-12 text-white/30 font-semibold pl-4">#</TableHead>
                <TableHead className="text-white/40 font-semibold text-xs uppercase tracking-wider">Team Name</TableHead>
                <TableHead className="text-white/40 font-semibold text-xs uppercase tracking-wider">School</TableHead>
                <TableHead className="text-white/40 font-semibold text-xs uppercase tracking-wider">District</TableHead>
                <TableHead className="text-white/40 font-semibold text-xs uppercase tracking-wider">Leader</TableHead>
                <TableHead className="text-white/40 font-semibold text-xs uppercase tracking-wider">Members</TableHead>
                <TableHead className="text-white/40 font-semibold text-xs uppercase tracking-wider">Submitted</TableHead>
                <TableHead className="w-20 text-white/40 text-right pr-4 font-semibold text-xs uppercase tracking-wider">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
                <TableRow
                  key={item.id}
                  className="border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer"
                  onClick={() => onSelect(item)}
                >
                  <TableCell className="text-white/30 font-mono text-xs pl-4">{index + 1}</TableCell>
                  <TableCell className="text-sm font-semibold text-white">{item.team_name}</TableCell>
                  <TableCell className="text-sm text-white/70">{item.school}</TableCell>
                  <TableCell className="text-sm text-white/60">{item.district}</TableCell>
                  <TableCell className="text-sm text-white/75">{item.leader_name}</TableCell>
                  <TableCell className="text-sm">
                    <Badge variant="outline" className="border-orange/30 text-orange bg-orange/5 px-2 rounded-full font-mono text-xs">
                      {item.no_of_team_members}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-white/40 font-mono">
                    {new Date(item.submitted_at).toLocaleDateString("en-US", { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </TableCell>
                  <TableCell className="text-right pr-4">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-orange/20 hover:border-orange/60 text-orange hover:text-white hover:bg-orange/15 transition-all duration-300 rounded-lg flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold shadow-sm ml-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(item);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line></svg>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

/* ---------- University Table ---------- */
function UniversityTable({ loading, data, onSelect, onViewSheet }: { loading: boolean; data: UniversityRegistration[]; onSelect: (r: UniversityRegistration) => void; onViewSheet: () => void }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden">
      <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
        <h3 className="text-xl font-semibold text-white tracking-tight">University Registrations List</h3>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-white/50 border-white/10 bg-white/5 px-2.5 rounded-full">
            {data.length} Registrations
          </Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={onViewSheet}
            className="border-orange/30 text-orange hover:bg-orange/10 hover:text-white hover:border-orange/60 transition-all duration-300 rounded-xl flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
            View Sheet
          </Button>
        </div>
      </div>
      {loading ? (
        <div className="p-6 space-y-3">
          <Skeleton className="h-10 w-full bg-white/5 rounded-xl" />
          <Skeleton className="h-10 w-full bg-white/5 rounded-xl animate-pulse" />
          <Skeleton className="h-10 w-full bg-white/5 rounded-xl" />
        </div>
      ) : data.length === 0 ? (
        <div className="px-6 py-16 text-center flex flex-col items-center justify-center gap-3">
          <p className="text-white/40 text-sm">No university registrations yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto custom-scrollbar p-2">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent border-b-2">
                <TableHead className="w-12 text-white/30 font-semibold pl-4">#</TableHead>
                <TableHead className="text-white/40 font-semibold text-xs uppercase tracking-wider">Team Name</TableHead>
                <TableHead className="text-white/40 font-semibold text-xs uppercase tracking-wider">University</TableHead>
                <TableHead className="text-white/40 font-semibold text-xs uppercase tracking-wider">Faculty</TableHead>
                <TableHead className="text-white/40 font-semibold text-xs uppercase tracking-wider">Leader</TableHead>
                <TableHead className="text-white/40 font-semibold text-xs uppercase tracking-wider">Members</TableHead>
                <TableHead className="text-white/40 font-semibold text-xs uppercase tracking-wider">Submitted</TableHead>
                <TableHead className="w-20 text-white/40 text-right pr-4 font-semibold text-xs uppercase tracking-wider">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
                <TableRow
                  key={item.id}
                  className="border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer"
                  onClick={() => onSelect(item)}
                >
                  <TableCell className="text-white/30 font-mono text-xs pl-4">{index + 1}</TableCell>
                  <TableCell className="text-sm font-semibold text-white">{item.team_name || "—"}</TableCell>
                  <TableCell className="text-sm text-white/70">{item.university}</TableCell>
                  <TableCell className="text-sm text-white/60">{item.faculty || "—"}</TableCell>
                  <TableCell className="text-sm text-white/75">{item.leader_name}</TableCell>
                  <TableCell className="text-sm">
                    <Badge variant="outline" className="border-orange/30 text-orange bg-orange/5 px-2 rounded-full font-mono text-xs">
                      {item.team_size}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-white/40 font-mono">
                    {new Date(item.submitted_at).toLocaleDateString("en-US", { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </TableCell>
                  <TableCell className="text-right pr-4">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-orange/20 hover:border-orange/60 text-orange hover:text-white hover:bg-orange/15 transition-all duration-300 rounded-lg flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold shadow-sm ml-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(item);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line></svg>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

/* ---------- Bucket Explorer (live from Supabase Storage) ---------- */
interface BucketFile {
  name: string;
  path: string;
  url: string;
  type: string;
}

function BucketExplorer() {
  const [files, setFiles] = useState<BucketFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterFolder, setFilterFolder] = useState("all");
  const supabase = createClient();

  useEffect(() => {
    let cancelled = false;
    async function walk(prefix: string): Promise<BucketFile[]> {
      const { data, error } = await supabase.storage.from("cms-images").list(prefix, {
        limit: 500,
        sortBy: { column: "name", order: "asc" },
      });
      if (error || !data) return [];
      const results: BucketFile[] = [];
      for (const item of data) {
        const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
        if (item.id === null) {
          results.push(...(await walk(fullPath)));
        } else {
          const ext = item.name.split(".").pop()?.toLowerCase() || "";
          const { data: urlData } = supabase.storage.from("cms-images").getPublicUrl(fullPath);
          results.push({
            name: item.name,
            path: fullPath,
            url: urlData?.publicUrl || "",
            type: ext,
          });
        }
      }
      return results;
    }
    (async () => {
      const all = await walk("");
      if (!cancelled) {
        setFiles(all);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [supabase]);

  const folders = ["all", ...Array.from(new Set(files.map((f) => f.path.split("/").length > 1 ? f.path.split("/")[0] : "root")))];

  const filtered = files.filter((f) => {
    const matchesSearch = !search || f.name.toLowerCase().includes(search.toLowerCase()) || f.path.toLowerCase().includes(search.toLowerCase());
    const matchesFolder = filterFolder === "all" || (filterFolder === "root" && !f.path.includes("/")) || f.path.startsWith(filterFolder + "/");
    return matchesSearch && matchesFolder;
  });

  const typeCounts = files.reduce<Record<string, number>>((acc, f) => {
    acc[f.type] = (acc[f.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* File list */}
      <div className="db-card-anim lg:col-span-3 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h3 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path></svg>
            Bucket Explorer
          </h3>
          <Badge variant="outline" className="text-white/50 border-white/10 bg-white/5 px-2.5 rounded-full">
            {files.length} Files
          </Badge>
        </div>

        {/* Search + folder filter */}
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Search files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 outline-none focus:border-orange/50 transition-colors"
          />
          <select
            value={filterFolder}
            onChange={(e) => setFilterFolder(e.target.value)}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white/80 outline-none focus:border-orange/50 transition-colors appearance-none cursor-pointer"
          >
            {folders.map((f) => (
              <option key={f} value={f} className="bg-black text-white">
                {f === "all" ? "All Folders" : f}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full bg-white/5 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-white/40 text-sm">No files found.</div>
        ) : (
          <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
            {filtered.map((file, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.01] border border-white/5 hover:border-white/10 hover:bg-white/[0.02] transition-all group">
                <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 font-semibold text-[10px] shrink-0 uppercase">
                  {file.type}
                </div>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <p className="text-sm font-semibold text-white truncate">{file.name}</p>
                  <p className="text-[11px] text-white/35 font-mono truncate">{file.path}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 text-[11px] font-semibold bg-white/5 border border-white/10 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
                  >
                    Open
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sidebar — bucket config */}
      <div className="db-card-anim lg:col-span-1 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-6 shadow-xl space-y-6">
        <h3 className="text-lg font-semibold text-white tracking-tight">Bucket Info</h3>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/40 font-semibold uppercase tracking-wider">Name</span>
              <span className="text-xs text-white font-mono">cms-images</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/40 font-semibold uppercase tracking-wider">Privacy</span>
              <Badge variant="outline" className="border-green-500/50 text-green-400 bg-green-500/10 text-[10px] font-bold">PUBLIC</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/40 font-semibold uppercase tracking-wider">Total Files</span>
              <span className="text-xs text-white font-semibold">{files.length}</span>
            </div>
          </div>

          {/* Type breakdown */}
          <div className="space-y-2">
            <label className="text-xs text-white/50 uppercase tracking-wider font-semibold">File Types</label>
            {Object.entries(typeCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([type, count]) => (
                <div key={type} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.01] border border-white/5">
                  <span className="text-xs text-white/60 font-mono uppercase">.{type}</span>
                  <Badge variant="outline" className="text-[10px] border-white/10 text-white/50 bg-white/5">{count}</Badge>
                </div>
              ))}
          </div>

          {/* Folder structure */}
          <div className="space-y-2">
            <label className="text-xs text-white/50 uppercase tracking-wider font-semibold">Folders</label>
            {folders.filter((f) => f !== "all").map((folder) => {
              const count = files.filter((f) => f.path.startsWith(folder + "/") || (folder === "root" && !f.path.includes("/"))).length;
              return (
                <div key={folder} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.01] border border-white/5">
                  <span className="text-xs text-white/60 font-mono">{folder}/</span>
                  <Badge variant="outline" className="text-[10px] border-white/10 text-white/50 bg-white/5">{count}</Badge>
                </div>
              );
            })}
          </div>

          <a
            href="https://supabase.com/dashboard/project/gcymcwaocowoczvvsaxw/storage/files/buckets/cms-images"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-orange hover:bg-orange/80 text-white shadow-[0_0_12px_rgba(255,107,0,0.2)] rounded-xl py-3 font-semibold text-sm transition-all"
          >
            Open in Supabase
          </a>
        </div>
      </div>
    </div>
  );
}
