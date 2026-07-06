import { createServerClient } from "@/lib/supabase/server";
import PageHeader from "@/components/cms/PageHeader";

export default async function AuditPage() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="Audit Log"
        description="Track all content changes"
        breadcrumbs={[{ label: "Audit Log" }]}
      />

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Action</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Table</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Record ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {data?.map((entry) => (
                <tr key={entry.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-white/30 text-xs whitespace-nowrap">
                    {new Date(entry.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
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
                  </td>
                  <td className="px-4 py-3 text-white/60">{entry.table_name}</td>
                  <td className="px-4 py-3 text-white/40 text-xs font-mono truncate max-w-[200px]">{entry.record_id}</td>
                  <td className="px-4 py-3 text-white/40">{entry.username}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(!data || data.length === 0) && (
          <div className="px-6 py-12 text-center text-white/30 text-sm">No audit entries yet</div>
        )}
      </div>
    </div>
  );
}
