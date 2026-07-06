import { createServerClient } from "@/lib/supabase/server";
import PageHeader from "@/components/cms/PageHeader";
import { Badge } from "@/components/ui/badge";

export default async function UniversityRegistrationsPage() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("university_registrations")
    .select("*")
    .order("submitted_at", { ascending: false });

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="University Registrations"
        description={`${data?.length || 0} total submissions`}
        breadcrumbs={[{ label: "Registrations" }, { label: "University" }]}
      />

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Team</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">University</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Leader</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Members</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {data?.map((reg) => (
                <tr key={reg.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{reg.team_name || "Individual"}</td>
                  <td className="px-4 py-3 text-white/60">{reg.university}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-white/50 border-white/10 text-xs">{reg.team_name ? "Team" : "Individual"}</Badge>
                  </td>
                  <td className="px-4 py-3 text-white/60">{reg.leader_name}</td>
                  <td className="px-4 py-3 text-white/40">{reg.team_size || "1"}</td>
                  <td className="px-4 py-3 text-white/30 text-xs">{new Date(reg.submitted_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(!data || data.length === 0) && (
          <div className="px-6 py-12 text-center text-white/30 text-sm">No registrations yet</div>
        )}
      </div>
    </div>
  );
}
