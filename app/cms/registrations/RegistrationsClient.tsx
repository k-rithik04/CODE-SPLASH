"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import Spreadsheet from "@/components/cms/Spreadsheet";

interface RegistrationsClientProps {
  schoolData: Record<string, unknown>[];
  universityData: Record<string, unknown>[];
}

const SCHOOL_FIELDS = [
  { key: "team_name", label: "Team Name" },
  { key: "school", label: "School" },
  { key: "district", label: "District" },
  { key: "leader_name", label: "Leader" },
  { key: "leader_grade", label: "Grade" },
  { key: "leader_email", label: "Leader Email" },
  { key: "leader_phone", label: "Leader Phone" },
  { key: "member2_name", label: "Member 2" },
  { key: "member3_name", label: "Member 3" },
  { key: "member4_name", label: "Member 4" },
  { key: "no_of_team_members", label: "Team Size" },
  { key: "submitted_at", label: "Submitted" },
];

const UNIVERSITY_FIELDS = [
  { key: "team_name", label: "Team Name" },
  { key: "university", label: "University" },
  { key: "leader_name", label: "Leader" },
  { key: "leader_faculty", label: "Faculty" },
  { key: "leader_year", label: "Year" },
  { key: "leader_email", label: "Leader Email" },
  { key: "leader_phone", label: "Leader Phone" },
  { key: "member2_name", label: "Member 2" },
  { key: "member3_name", label: "Member 3" },
  { key: "member4_name", label: "Member 4" },
  { key: "team_size", label: "Team Size" },
  { key: "submitted_at", label: "Submitted" },
];

type Tab = "school" | "university";

export default function RegistrationsClient({ schoolData, universityData }: RegistrationsClientProps) {
  const [tab, setTab] = useState<Tab>("school");

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "school", label: "School", count: schoolData.length },
    { key: "university", label: "University", count: universityData.length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "px-5 py-2.5 rounded-lg text-sm font-medium transition-all",
              tab === t.key
                ? "bg-orange text-white shadow-lg shadow-orange/20"
                : "text-white/50 hover:text-white/80 hover:bg-white/[0.05]"
            )}
          >
            {t.label}
            <span className={cn(
              "ml-2 px-2 py-0.5 rounded-full text-xs",
              tab === t.key ? "bg-white/20" : "bg-white/5 text-white/40"
            )}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {tab === "school" && (
        <Spreadsheet
          title="School Registrations"
          fields={SCHOOL_FIELDS}
          items={schoolData}
          showPreview={true}
        />
      )}

      {tab === "university" && (
        <Spreadsheet
          title="University Registrations"
          fields={UNIVERSITY_FIELDS}
          items={universityData}
          showPreview={true}
        />
      )}
    </div>
  );
}
