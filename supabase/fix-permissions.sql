-- =============================================================
-- FIX: Grant schema permissions to anon and service_role
-- =============================================================
-- This is why ALL queries return 42501 "permission denied for schema public"
-- Tables exist, RLS policies exist, but the roles can't even see the schema.
-- =============================================================

-- Grant USAGE on public schema to all roles
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO service_role;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant SELECT on all existing tables to anon (for public reads)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grant full access to service_role (bypasses RLS anyway)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- Grant EXECUTE on all functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Grant INSERT on registration tables (anon needs to submit forms)
GRANT INSERT ON school_registrations TO anon;
GRANT INSERT ON university_registrations TO anon;

-- Also set default privileges so future tables get permissions too
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
