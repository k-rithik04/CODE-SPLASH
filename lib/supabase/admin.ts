import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@/lib/supabase/server";

// Fetch the service_role_key from the `keys` table at runtime.
// The anon client has SELECT permission on `keys`, so this works
// without any env var. The key is only held in memory for the
// duration of the request and garbage-collected after.
export async function getServiceRoleKey(): Promise<string | null> {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("keys")
      .select("service_role_key")
      .limit(1)
      .maybeSingle();

    if (error || !data?.service_role_key) {
      console.error("[ADMIN] Failed to fetch service_role_key from keys table");
      return null;
    }

    return data.service_role_key;
  } catch {
    return null;
  }
}

// Create a temporary admin client from a provided service-role key.
// The key lives only in this closure and is GC'd when the request ends.
export function createAdminClientForKey(serviceKey: string): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Convenience: fetch key + create client in one call.
// Returns null if the key isn't configured yet.
export async function createAdminClient(): Promise<SupabaseClient | null> {
  const key = await getServiceRoleKey();
  if (!key) return null;
  return createAdminClientForKey(key);
}
