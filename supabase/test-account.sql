-- =============================================================
-- Test account for must_change_password flow
-- Run in Supabase SQL Editor
-- =============================================================

-- Test user: username = testeditor, password = Test1234
-- must_change_password = TRUE → forces change-password page on login
-- Role: editor (lower privilege than admin)

INSERT INTO profiles (username, full_name, role, password, must_change_password)
VALUES (
  'testeditor',
  'Test Editor',
  'editor',
  '$2b$12$wDJjLxgaKOdYh1xqHAnOnuEOFIuO4yhKCs7AEMwChKwj47xUVbKhC',
  true
)
ON CONFLICT (username) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  password = EXCLUDED.password,
  must_change_password = true;

-- Verify the insert
SELECT id, username, full_name, role, must_change_password, created_at
FROM profiles
WHERE username = 'testeditor';
