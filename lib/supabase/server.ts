import { createClient } from "@supabase/supabase-js";

// Direct Supabase client for server-side API routes.
// Does NOT use @supabase/ssr (which requires Supabase Auth).
// Uses the anon key directly — RLS policies handle access control.
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder"
  );
}
