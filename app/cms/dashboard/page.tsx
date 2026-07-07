import { createServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import Link from "next/link";
import LogoutButton from "@/components/cms/LogoutButton";

const TABLES = [
  { name: "chapters", label: "Chapters", href: "/cms/content/chapters" },
  { name: "prizes", label: "Prizes", href: "/cms/content/prizes" },
  { name: "timeline_entries", label: "Timeline", href: "/cms/content/timeline" },
  { name: "partners", label: "Partners", href: "/cms/content/partners" },
  { name: "team_members", label: "Team Members", href: "/cms/content/team" },
  { name: "faq_items", label: "FAQ", href: "/cms/content/faq" },
  { name: "school_registrations", label: "School Registrations", href: "/cms/registrations" },
  { name: "university_registrations", label: "University Registrations", href: "/cms/registrations" },
  { name: "audit_log", label: "Audit Log", href: "/cms/audit" },
];

export default async function DashboardPage() {
  await requireRole("viewer");
  const supabase = createServerClient();

  const counts: Record<string, number> = {};
  for (const table of TABLES) {
    const { count } = await supabase
      .from(table.name)
      .select("*", { count: "exact", head: true });
    counts[table.name] = count ?? 0;
  }

  const { data: recentAudit } = await supabase
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="text-sm text-white/40 mt-1">Manage your CodeSplash content</p>
        </div>
        <LogoutButton />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {TABLES.slice(0, 6).map((table) => (
          <Link
            key={table.name}
            href={table.href}
            className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 hover:border-orange/30 hover:bg-orange/[0.03] transition-all"
          >
            <div className="text-3xl font-bold text-orange">{counts[table.name]}</div>
            <div className="text-sm text-white/50 mt-1 group-hover:text-white/70 transition-colors">
              {table.label}
            </div>
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
        </div>
        {recentAudit && recentAudit.length > 0 ? (
          <div className="divide-y divide-white/[0.06]">
            {recentAudit.map((entry) => (
              <div key={entry.id} className="px-6 py-3 flex items-center gap-4 text-sm">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    entry.action === "INSERT"
                      ? "bg-green-500/10 text-green-400"
                      : entry.action === "UPDATE"
                      ? "bg-blue-500/10 text-blue-400"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {entry.action}
                </span>
                <span className="text-white/60">{entry.table_name}</span>
                <span className="text-white/30 truncate flex-1">{entry.record_id}</span>
                <span className="text-white/30 text-xs">{entry.username}</span>
                <span className="text-white/20 text-xs whitespace-nowrap">
                  {new Date(entry.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-8 text-center text-white/30 text-sm">No recent activity</div>
        )}
      </div>
    </div>
  );
}
