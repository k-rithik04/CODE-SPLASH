-- =============================================================
-- Fix RLS Policies — Run this in Supabase SQL Editor
-- Ensures all public read policies exist for content tables.
-- Idempotent: safe to run multiple times.
-- =============================================================

-- Content tables — public read + write
DO $$
DECLARE
  tbl TEXT;
  r RECORD;
  tables TEXT[] := ARRAY[
    'site_settings', 'hero_content', 'chapters', 'prizes',
    'timeline_entries', 'partners', 'team_members', 'faq_items',
    'cta_content', 'connect_content'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);

    FOR r IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = tbl
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, tbl);
    END LOOP;

    EXECUTE format(
      'CREATE POLICY "Public can read %I" ON %I FOR SELECT USING (true)',
      tbl, tbl
    );
    EXECUTE format(
      'CREATE POLICY "Allow CMS writes to %I" ON %I FOR ALL USING (true) WITH CHECK (true)',
      tbl, tbl
    );
  END LOOP;
END $$;

-- Profiles — read only
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read profiles" ON profiles;
DROP POLICY IF EXISTS "No public writes to profiles" ON profiles;
CREATE POLICY "Public can read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "No public writes to profiles" ON profiles FOR ALL USING (false) WITH CHECK (false);

-- Keys — read only
ALTER TABLE keys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read keys" ON keys;
DROP POLICY IF EXISTS "No public writes to keys" ON keys;
CREATE POLICY "Public can read keys" ON keys FOR SELECT USING (true);
CREATE POLICY "No public writes to keys" ON keys FOR ALL USING (false) WITH CHECK (false);

-- Registration tables — public insert + read + delete
ALTER TABLE school_registrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can submit school registration" ON school_registrations;
DROP POLICY IF EXISTS "CMS can read school registrations" ON school_registrations;
DROP POLICY IF EXISTS "CMS can delete school registrations" ON school_registrations;
CREATE POLICY "Anyone can submit school registration" ON school_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "CMS can read school registrations" ON school_registrations FOR SELECT USING (true);
CREATE POLICY "CMS can delete school registrations" ON school_registrations FOR DELETE USING (true);

ALTER TABLE university_registrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can submit university registration" ON university_registrations;
DROP POLICY IF EXISTS "CMS can read university registrations" ON university_registrations;
DROP POLICY IF EXISTS "CMS can delete university registrations" ON university_registrations;
CREATE POLICY "Anyone can submit university registration" ON university_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "CMS can read university registrations" ON university_registrations FOR SELECT USING (true);
CREATE POLICY "CMS can delete university registrations" ON university_registrations FOR DELETE USING (true);

-- Audit log — read only
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read audit_log" ON audit_log;
DROP POLICY IF EXISTS "No public writes to audit_log" ON audit_log;
CREATE POLICY "Public can read audit_log" ON audit_log FOR SELECT USING (true);
CREATE POLICY "No public writes to audit_log" ON audit_log FOR ALL USING (false) WITH CHECK (false);
