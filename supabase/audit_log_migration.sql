-- =============================================================
-- CodeSplash CMS — Audit Log Migration
-- =============================================================
-- Run this ONCE in Supabase SQL Editor to add the audit_log
-- table, trigger function, and triggers on all content tables.
-- =============================================================

-- 1. TABLE
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  record_id TEXT,
  old_data JSONB,
  new_data JSONB,
  username TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. RLS — read only for everyone, writes via trigger only
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read audit_log" ON audit_log FOR SELECT USING (true);
CREATE POLICY "No public writes to audit_log" ON audit_log FOR ALL USING (false) WITH CHECK (false);

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_table ON audit_log (table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_username ON audit_log (username);

-- 4. RPC function to set username in session (called by client before writes)
CREATE OR REPLACE FUNCTION set_audit_user(username text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM set_config('app.audit_user', username, true);
END;
$$;

-- 5. Trigger function — auto-log all content table changes
CREATE OR REPLACE FUNCTION log_audit_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_username text;
  v_record_id text;
  v_old jsonb;
  v_new jsonb;
BEGIN
  -- Get username from session variable (set by client via set_audit_user RPC)
  v_username := current_setting('app.audit_user', true);

  -- If not set, try JWT claims (works for service-role client operations)
  IF v_username IS NULL OR v_username = '' THEN
    BEGIN
      v_username := current_setting('request.jwt.claims', true)::json->>'username';
    EXCEPTION WHEN OTHERS THEN
      v_username := NULL;
    END;
  END IF;

  -- Determine record_id and data based on operation
  IF TG_OP = 'DELETE' THEN
    v_record_id := (OLD).id::text;
    v_old := to_jsonb(OLD);
    v_new := NULL;
  ELSIF TG_OP = 'INSERT' THEN
    v_record_id := (NEW).id::text;
    v_old := NULL;
    v_new := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    v_record_id := (NEW).id::text;
    v_old := to_jsonb(OLD);
    v_new := to_jsonb(NEW);
  END IF;

  INSERT INTO audit_log (table_name, action, record_id, old_data, new_data, username)
  VALUES (TG_TABLE_NAME, TG_OP, v_record_id, v_old, v_new, v_username);

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 6. Create triggers on all content tables
DO $$
DECLARE
  tbl text;
  tables text[] := ARRAY[
    'chapters', 'prizes', 'timeline_entries', 'partners',
    'team_members', 'faq_items', 'hero_content', 'cta_content',
    'connect_content', 'profiles'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS audit_%s_trigger ON %I',
      tbl, tbl
    );
    EXECUTE format(
      'CREATE TRIGGER audit_%s_trigger
       AFTER INSERT OR UPDATE OR DELETE ON %I
       FOR EACH ROW EXECUTE FUNCTION log_audit_changes()',
      tbl, tbl
    );
  END LOOP;
END $$;

-- Done! Check with: SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 20;
