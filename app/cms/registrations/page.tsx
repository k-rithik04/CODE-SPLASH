import { createServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth-guard";
import PageHeader from "@/components/cms/PageHeader";
import RegistrationsClient from "./RegistrationsClient";

export default async function RegistrationsPage() {
  await requireRole("viewer");
  const supabase = createServerClient();

  const { data: schoolData } = await supabase
    .from("school_registrations")
    .select("*")
    .order("submitted_at", { ascending: false });

  const { data: uniData } = await supabase
    .from("university_registrations")
    .select("*")
    .order("submitted_at", { ascending: false });

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Registrations"
        description={`${(schoolData?.length || 0) + (uniData?.length || 0)} total submissions`}
        breadcrumbs={[{ label: "Registrations" }]}
      />

      <RegistrationsClient
        schoolData={schoolData || []}
        universityData={uniData || []}
      />
    </div>
  );
}
