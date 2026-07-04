"use client";

import Link from "next/link";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRole } from "@/app/admin/RoleProviderWrapper";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const UsersIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const AwardIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);

const SchoolIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m4 6 8-4 8 4" /><path d="m18 10 4 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8l4-2" /><path d="M14 22v-4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4" /><path d="M18 5v17" /><path d="M6 5v17" /><circle cx="12" cy="9" r="2" />
  </svg>
);

const GraduationCapIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" /><path d="M22 10v6" /><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
  </svg>
);

const RefreshCwIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" />
  </svg>
);

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const MapPinIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" /><circle cx="12" cy="10" r="3" />
  </svg>
);

const Code2Icon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m18 16 4-4-4-4" /><path d="m6 8-4 4 4 4" /><path d="m14.5 4-5 16" />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);

const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" /><path d="M12 5v14" />
  </svg>
);

const PencilIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
  </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" />
  </svg>
);

interface SchoolRegistration {
  id: string;
  team_name: string;
  no_of_team_members: number;
  school: string;
  district: string;
  submitted_at: string;
}

interface UniversityRegistration {
  id: string;
  team_name: string | null;
  team_size: number | null;
  university: string | null;
  submitted_at: string;
  technologies: string | null | string[];
}

interface TimelineEntry {
  id: string;
  date: string;
  title: string;
  description: string;
  is_current: boolean;
  sort_order: number;
}

interface PrizeEntry {
  id: string;
  badge: string;
  name: string;
  description: string;
  amount: string;
}

interface AuditLogEntry {
  id: string;
  table_name: string;
  action: string;
  record_id: string | null;
  username: string | null;
  created_at: string;
}

export default function DashboardPage() {
  const { user } = useRole();
  const supabase = createClient();
  const containerRef = useRef<HTMLDivElement>(null);

  const [schoolRegs, setSchoolRegs] = useState<SchoolRegistration[]>([]);
  const [uniRegs, setUniRegs] = useState<UniversityRegistration[]>([]);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [prizes, setPrizes] = useState<PrizeEntry[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [schoolRes, uniRes, timelineRes, prizesRes, auditRes] = await Promise.all([
        supabase.from("school_registrations").select("id, team_name, no_of_team_members, school, district, submitted_at"),
        supabase.from("university_registrations").select("id, team_name, team_size, university, submitted_at, technologies"),
        supabase.from("timeline_entries").select("*").order("sort_order"),
        supabase.from("prizes").select("*").order("sort_order"),
        supabase.from("audit_log").select("id, table_name, action, username, created_at").order("created_at", { ascending: false }).limit(5),
      ]);

      if (schoolRes.data) setSchoolRegs(schoolRes.data as SchoolRegistration[]);
      if (uniRes.data) setUniRegs(uniRes.data as UniversityRegistration[]);
      if (timelineRes.data) setTimeline(timelineRes.data as TimelineEntry[]);
      if (prizesRes.data) setPrizes(prizesRes.data as PrizeEntry[]);
      if (auditRes.data) setAuditLog(auditRes.data as AuditLogEntry[]);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // GSAP animations for stagger loading
  useGSAP(() => {
    if (!loading) {
      const tl = gsap.timeline();
      tl.fromTo(
        ".dashboard-anim-header",
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      )
      .fromTo(
        ".dashboard-anim-card",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: "power2.out" },
        "-=0.25"
      )
      .fromTo(
        ".dashboard-anim-section",
        { opacity: 0, x: -15 },
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" },
        "-=0.2"
      );
    }
  }, { dependencies: [loading], scope: containerRef });

  // Compute statistics
  const schoolCount = schoolRegs.length;
  const uniCount = uniRegs.length;

  const totalSchoolCoders = schoolRegs.reduce((acc, curr) => acc + (curr.no_of_team_members || 0), 0);
  const totalUniCoders = uniRegs.reduce((acc, curr) => acc + (curr.team_size || 1), 0);
  const totalCoders = totalSchoolCoders + totalUniCoders;

  const totalPrizeCash = prizes.reduce((acc, item) => {
    const val = String(item.amount || "");
    const parsed = parseInt(val.replace(/[^0-9]/g, ""), 10);
    return acc + (isNaN(parsed) ? 0 : parsed);
  }, 0);

  // Group prizes by category (badge)
  const prizesByCategory = prizes.reduce((acc: Record<string, PrizeEntry[]>, curr) => {
    const cat = curr.badge || "General Rewards";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(curr);
    return acc;
  }, {});

  // Find current timeline milestone
  const currentMilestone = timeline.find((t) => t.is_current) || timeline[0];

  // District count mapping
  const districtCounts = schoolRegs.reduce((acc: Record<string, number>, curr) => {
    const d = curr.district || "Other";
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {});
  const topDistricts = Object.entries(districtCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // University Tech counts mapping
  const techCounts = uniRegs.reduce((acc: Record<string, number>, curr) => {
    const techs = curr.technologies;
    if (!techs) return acc;
    const list = Array.isArray(techs) 
      ? techs 
      : String(techs).replace(/[\[\]"]/g, "").split(",").map(t => t.trim());
    list.forEach(t => {
      if (t) acc[t] = (acc[t] || 0) + 1;
    });
    return acc;
  }, {});
  const topTechs = Object.entries(techCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  if (loading && !refreshing) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-white/10">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 bg-white/5" />
            <Skeleton className="h-4 w-64 bg-white/5" />
          </div>
          <Skeleton className="h-10 w-24 bg-white/5" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full bg-white/5 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[400px] lg:col-span-2 bg-white/5 rounded-2xl" />
          <Skeleton className="h-[400px] bg-white/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-8 select-none pb-12">
      {/* Welcome Header */}
      <div className="dashboard-anim-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              Dashboard
            </h1>
            <Badge variant="outline" className="border-orange/30 text-orange bg-orange/5 uppercase tracking-widest text-[9px] font-bold px-2.5 py-0.5 rounded-full">
              {user?.role || "Editor"}
            </Badge>
          </div>
          <p className="text-white/40 text-sm">
            Welcome back, <span className="text-orange font-semibold text-white/90">{user?.username}</span> &middot; Managing CodeSplash CMS.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 border border-white/10 bg-white/5 hover:bg-white/10 active:bg-white/15 text-white/80 hover:text-white rounded-xl transition-all duration-300 flex items-center gap-2 text-xs font-semibold cursor-pointer shrink-0"
        >
          <RefreshCwIcon className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
          Refresh Data
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: School */}
        <Card className="dashboard-anim-card bg-black/40 border-white/10 backdrop-blur-xl rounded-2xl relative overflow-hidden group shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange/5 rounded-full blur-3xl group-hover:bg-orange/10 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs uppercase tracking-wider text-white/40 font-mono">School Registrations</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-orange/15 border border-orange/20 flex items-center justify-center">
              <SchoolIcon className="h-4.5 w-4.5 text-orange" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-white tracking-tight">{schoolCount}</div>
            <p className="text-[10px] text-white/30 mt-1 font-mono">{totalSchoolCoders} students registered</p>
          </CardContent>
        </Card>

        {/* Metric 2: University */}
        <Card className="dashboard-anim-card bg-black/40 border-white/10 backdrop-blur-xl rounded-2xl relative overflow-hidden group shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange/5 rounded-full blur-3xl group-hover:bg-orange/10 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs uppercase tracking-wider text-white/40 font-mono">University Registrations</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-orange/15 border border-orange/20 flex items-center justify-center">
              <GraduationCapIcon className="h-4.5 w-4.5 text-orange" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-white tracking-tight">{uniCount}</div>
            <p className="text-[10px] text-white/30 mt-1 font-mono">{totalUniCoders} coders registered</p>
          </CardContent>
        </Card>

        {/* Metric 3: Total Coders */}
        <Card className="dashboard-anim-card bg-black/40 border-white/10 backdrop-blur-xl rounded-2xl relative overflow-hidden group shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange/5 rounded-full blur-3xl group-hover:bg-orange/10 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs uppercase tracking-wider text-white/40 font-mono">Total Registrants</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-orange/15 border border-orange/20 flex items-center justify-center">
              <UsersIcon className="h-4.5 w-4.5 text-orange" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-white tracking-tight">{totalCoders}</div>
            <p className="text-[10px] text-white/30 mt-1 font-mono">Combined school & uni phases</p>
          </CardContent>
        </Card>

        {/* Metric 4: Prize Pool */}
        <Card className="dashboard-anim-card bg-black/40 border-white/10 backdrop-blur-xl rounded-2xl relative overflow-hidden group shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange/5 rounded-full blur-3xl group-hover:bg-orange/10 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs uppercase tracking-wider text-white/40 font-mono">Total Prize Pool</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-orange/15 border border-orange/20 flex items-center justify-center">
              <AwardIcon className="h-4.5 w-4.5 text-orange" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-white tracking-tight">LKR {totalPrizeCash.toLocaleString()}</div>
            <p className="text-[10px] text-white/30 mt-1.5 font-mono">{prizes.length} award segments active</p>
          </CardContent>
        </Card>
      </div>

      {/* Audit Log */}
      <div className="dashboard-anim-section">
        <div className="bg-black/40 border border-white/10 rounded-2xl backdrop-blur-xl shadow-lg overflow-hidden">
          <div className="flex justify-between items-center px-5 py-4 border-b border-white/5">
            <h3 className="text-sm font-semibold tracking-wide text-white/80 flex items-center gap-2">
              <ClockIcon className="h-4.5 w-4.5 text-orange" />
              Recent Changes
            </h3>
            <span className="text-[10px] font-mono text-white/30">Last 5 actions</span>
          </div>

          {auditLog.length === 0 ? (
            <p className="text-xs text-white/30 py-8 text-center">No changes recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-5 py-2.5 text-[10px] uppercase tracking-wider text-white/30 font-mono font-bold">Date</th>
                    <th className="text-left px-5 py-2.5 text-[10px] uppercase tracking-wider text-white/30 font-mono font-bold">Person</th>
                    <th className="text-left px-5 py-2.5 text-[10px] uppercase tracking-wider text-white/30 font-mono font-bold">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLog.map((entry) => (
                    <tr key={entry.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3 text-white/50 font-mono whitespace-nowrap">
                        {formatAuditDate(entry.created_at)}
                      </td>
                      <td className="px-5 py-3 text-white/70 font-medium">
                        {entry.username || "System"}
                      </td>
                      <td className="px-5 py-3">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          entry.action === "INSERT" && "bg-green-500/10 text-green-400 border border-green-500/20",
                          entry.action === "UPDATE" && "bg-blue-500/10 text-blue-400 border border-blue-500/20",
                          entry.action === "DELETE" && "bg-red-500/10 text-red-400 border border-red-500/20",
                        )}>
                          {entry.action === "INSERT" && <PlusIcon className="h-2.5 w-2.5" />}
                          {entry.action === "UPDATE" && <PencilIcon className="h-2.5 w-2.5" />}
                          {entry.action === "DELETE" && <TrashIcon className="h-2.5 w-2.5" />}
                          {formatTableName(entry.table_name)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Left Timeline/Stats & Right Prizes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Timeline Milestone + Insights */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Milestone banner */}
          {currentMilestone && (
            <div className="dashboard-anim-section bg-gradient-to-r from-orange/10 to-orange/5 border border-orange/25 p-6 rounded-2xl backdrop-blur-xl shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-orange/10 rounded-full blur-3xl" />
              <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-orange text-white text-[9px] uppercase tracking-wider font-bold">Active Milestone</Badge>
                    <span className="text-[10px] text-white/40 font-mono font-bold uppercase">{currentMilestone.date}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mt-1.5">{currentMilestone.title}</h3>
                  <p className="text-xs text-white/60 max-w-xl">{currentMilestone.description}</p>
                </div>

                <Link href="/admin/content/timeline">
                  <span className="px-3.5 py-1.5 border border-orange/30 hover:border-orange bg-orange/10 hover:bg-orange/20 text-orange hover:text-white rounded-xl transition-all duration-300 text-xs font-semibold flex items-center gap-1 cursor-pointer">
                    Timeline Page
                    <ChevronRightIcon className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </div>
            </div>
          )}

          {/* Double Insight Row (Top Districts & Top Technologies) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Districts */}
            <div className="dashboard-anim-section bg-black/40 border border-white/10 p-5 rounded-2xl backdrop-blur-xl shadow-lg space-y-4">
              <h3 className="text-sm font-semibold tracking-wide text-white/80 flex items-center gap-2">
                <MapPinIcon className="h-4.5 w-4.5 text-orange" />
                Top School Districts
              </h3>
              {topDistricts.length === 0 ? (
                <p className="text-xs text-white/30">No school registration data available.</p>
              ) : (
                <div className="space-y-3 font-mono">
                  {topDistricts.map(([district, count], idx) => (
                    <div key={district} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-white/20 text-[10px] font-bold">0{idx + 1}.</span>
                        <span className="text-white/80 font-sans font-medium">{district}</span>
                      </div>
                      <Badge variant="outline" className="border-orange/20 text-orange bg-orange/5 text-[10px] font-semibold">
                        {count} teams
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Technologies */}
            <div className="dashboard-anim-section bg-black/40 border border-white/10 p-5 rounded-2xl backdrop-blur-xl shadow-lg space-y-4">
              <h3 className="text-sm font-semibold tracking-wide text-white/80 flex items-center gap-2">
                <Code2Icon className="h-4.5 w-4.5 text-orange" />
                Top Technologies (Uni)
              </h3>
              {topTechs.length === 0 ? (
                <p className="text-xs text-white/30">No university technology stack data available.</p>
              ) : (
                <div className="space-y-3 font-mono font-medium">
                  {topTechs.map(([tech, count], idx) => (
                    <div key={tech} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-white/20 text-[10px] font-bold">0{idx + 1}.</span>
                        <span className="text-white/80 font-sans font-medium">{tech}</span>
                      </div>
                      <Badge variant="outline" className="border-orange/20 text-orange bg-orange/5 text-[10px] font-semibold">
                        {count} selections
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Calendar + Prizes Quick View */}
        <div className="space-y-6">
          <div className="dashboard-anim-section">
            <TimelineCalendar timeline={timeline} />
          </div>

          {/* Prizes Quick View (unscrollable) */}
          <div className="dashboard-anim-section bg-black/40 border border-white/10 p-5 rounded-2xl backdrop-blur-xl shadow-lg flex flex-col space-y-5">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="text-sm font-semibold tracking-wide text-white/80 flex items-center gap-2">
                <AwardIcon className="h-4.5 w-4.5 text-orange" />
                Prizes & Awards
              </h3>
              <Link href="/admin/content/prizes">
                <span className="text-[10px] uppercase font-bold text-orange hover:text-white transition-colors cursor-pointer flex items-center gap-0.5">
                  Edit
                  <ChevronRightIcon className="h-3 w-3" />
                </span>
              </Link>
            </div>

            {prizes.length === 0 ? (
              <p className="text-xs text-white/30 py-6 text-center">No prizes entries loaded.</p>
            ) : (
              <div className="space-y-4 overflow-hidden">
                {Object.entries(prizesByCategory).map(([category, items]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="text-[10px] uppercase tracking-wider text-white/30 font-bold font-mono pl-1">{category}</h4>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div key={item.id} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-xs space-y-1 hover:bg-white/[0.04] transition-all">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-white/90">{item.name}</span>
                            <span className="font-bold text-orange font-mono">{item.amount}</span>
                          </div>
                          <p className="text-[10px] text-white/40 leading-relaxed font-sans">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatAuditDate(iso: string): string {
  const d = new Date(iso);
  const month = d.toLocaleString("default", { month: "short" });
  const day = d.getDate();
  const time = d.toLocaleTimeString("default", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${month} ${day}, ${time}`;
}

function formatTableName(name: string): string {
  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function parseTimelineDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  
  const cleaned = dateStr.replace(/(\d+)(st|nd|rd|th)/i, "$1");
  const dCleaned = new Date(cleaned);
  if (!isNaN(dCleaned.getTime())) return dCleaned;

  const withYear = `${cleaned}, ${new Date().getFullYear()}`;
  const dWithYear = new Date(withYear);
  if (!isNaN(dWithYear.getTime())) return dWithYear;

  return null;
}

function TimelineCalendar({ timeline }: { timeline: TimelineEntry[] }) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 1));
  const [selectedDayEvents, setSelectedDayEvents] = useState<TimelineEntry[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  
  useEffect(() => {
    if (timeline.length > 0) {
      for (const item of timeline) {
        const parsed = parseTimelineDate(item.date);
        if (parsed) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setCurrentDate(new Date(parsed.getFullYear(), parsed.getMonth(), 1));
          break;
        }
      }
    }
  }, [timeline]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("default", { month: "long" });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayIndex }, (_, i) => i);

  const getEventsForDay = (day: number) => {
    return timeline.filter(item => {
      const parsed = parseTimelineDate(item.date);
      if (!parsed) return false;
      return parsed.getDate() === day && parsed.getMonth() === month && parsed.getFullYear() === year;
    });
  };

  const handleDayClick = (day: number, events: TimelineEntry[]) => {
    setSelectedDay(day);
    setSelectedDayEvents(events);
  };

  return (
    <div className="bg-black/40 border border-white/10 p-5 rounded-2xl backdrop-blur-xl shadow-lg space-y-4">
      <div className="flex justify-between items-center border-b border-white/5 pb-3">
        <h3 className="text-sm font-semibold tracking-wide text-white/80 flex items-center gap-2">
          <CalendarIcon className="h-4.5 w-4.5 text-orange" />
          Event Calendar
        </h3>
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <button 
            onClick={() => {
              setCurrentDate(new Date(year, month - 1, 1));
              setSelectedDay(null);
              setSelectedDayEvents([]);
            }}
            className="p-1 hover:bg-white/5 border border-white/5 rounded-lg text-white/40 hover:text-white transition-all cursor-pointer"
          >
            &lt;
          </button>
          <span className="font-bold text-white/80">{monthName} {year}</span>
          <button 
            onClick={() => {
              setCurrentDate(new Date(year, month + 1, 1));
              setSelectedDay(null);
              setSelectedDayEvents([]);
            }}
            className="p-1 hover:bg-white/5 border border-white/5 rounded-lg text-white/40 hover:text-white transition-all cursor-pointer"
          >
            &gt;
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-mono select-none">
        {["SU", "MO", "TU", "WE", "TH", "FR", "SA"].map(d => (
          <div key={d} className="text-white/20 font-bold py-1">{d}</div>
        ))}

        {emptyDays.map(i => (
          <div key={`empty-${i}`} className="py-2 text-transparent" />
        ))}

        {days.map(day => {
          const dayEvents = getEventsForDay(day);
          const hasEvents = dayEvents.length > 0;
          const isSelected = selectedDay === day;
          return (
            <div 
              key={day}
              onClick={() => handleDayClick(day, dayEvents)}
              className={cn(
                "py-1.5 rounded-lg border transition-all duration-200 flex flex-col items-center justify-center relative cursor-pointer",
                isSelected 
                  ? "bg-orange text-white border-orange shadow-[0_0_8px_rgba(255,107,0,0.3)]"
                  : hasEvents
                  ? "bg-orange/10 border-orange/20 text-orange hover:bg-orange/20 font-semibold"
                  : "bg-white/[0.01] border-transparent text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <span>{day}</span>
              {hasEvents && !isSelected && (
                <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-orange" />
              )}
            </div>
          );
        })}
      </div>

      {selectedDayEvents.length > 0 && (
        <div className="mt-2 p-3 bg-orange/5 border border-orange/20 rounded-xl space-y-1.5 animate-fadeIn">
          <span className="text-[9px] uppercase tracking-wider text-orange font-bold font-mono">
            Events on {monthName} {selectedDay}
          </span>
          {selectedDayEvents.map(ev => (
            <div key={ev.id} className="space-y-0.5">
              <h4 className="text-xs font-bold text-white">{ev.title}</h4>
              <p className="text-[10px] text-white/50 leading-relaxed font-sans">{ev.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
