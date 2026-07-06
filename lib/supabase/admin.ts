import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Fetch the service_role_key from environment variables securely.
export async function getServiceRoleKey(): Promise<string | null> {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    console.error("[ADMIN] SUPABASE_SERVICE_ROLE_KEY environment variable is not set");
    return null;
  }
  return key;
}

// Create a temporary admin client from a provided service-role key.
export function createAdminClientForKey(serviceKey: string): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
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
