-- =============================================================
-- CodeSplash CMS — Complete Database Schema
-- =============================================================
-- Run this ONCE in Supabase SQL Editor to set up everything.
-- Drops all existing tables/policies first, then creates clean.
-- =============================================================

-- =============================================================
-- 0. CLEANUP — Drop everything first
-- =============================================================

-- Drop policies
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- Drop tables (order doesn't matter with CASCADE)
DROP TABLE IF EXISTS site_settings CASCADE;
DROP TABLE IF EXISTS hero_content CASCADE;
DROP TABLE IF EXISTS chapters CASCADE;
DROP TABLE IF EXISTS prizes CASCADE;
DROP TABLE IF EXISTS timeline_entries CASCADE;
DROP TABLE IF EXISTS partners CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS faq_items CASCADE;
DROP TABLE IF EXISTS cta_content CASCADE;
DROP TABLE IF EXISTS connect_content CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS school_registrations CASCADE;
DROP TABLE IF EXISTS university_registrations CASCADE;
DROP TABLE IF EXISTS audit_log CASCADE;

-- Drop triggers
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT tgname, relname FROM pg_trigger
    WHERE tgname LIKE 'audit_%' AND NOT tgisinternal
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I', r.tgname, r.relname);
  END LOOP;
END $$;

-- Drop trigger function
DROP FUNCTION IF EXISTS log_audit_changes() CASCADE;
DROP FUNCTION IF EXISTS set_audit_user(text) CASCADE;

-- Drop storage bucket policies
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT policyname FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', r.policyname);
  END LOOP;
END $$;


-- =============================================================
-- 1. TABLES
-- =============================================================

-- Global site settings (single row)
CREATE TABLE site_settings (
  id INT PRIMARY KEY DEFAULT 1,
  site_title TEXT NOT NULL DEFAULT 'CodeSplash | National Level University Hackathon',
  site_description TEXT NOT NULL DEFAULT 'CodeSplash 2026 is the ultimate convergence of logic and creativity.',
  keywords TEXT[] DEFAULT ARRAY['hackathon', 'CodeSplash', 'university', 'coding', 'competition', 'Sri Lanka', '2026'],
  theme_color TEXT NOT NULL DEFAULT '#000000',
  og_image_url TEXT,
  CONSTRAINT single_row CHECK (id = 1)
);

-- Hero section (single row)
CREATE TABLE hero_content (
  id INT PRIMARY KEY DEFAULT 1,
  logo_url TEXT NOT NULL DEFAULT '/CodeSplash.png',
  logo_alt TEXT NOT NULL DEFAULT 'CodeSplash Logo',
  tagline TEXT NOT NULL DEFAULT 'A Nation-wide hackathon organized by CSSA university of Kelaniya, empowering innovation through inspiration from the timeless legacy of the pyramids.',
  cta_button_text TEXT NOT NULL DEFAULT 'Ongoing Challenge',
  cta_button_link TEXT NOT NULL DEFAULT '/register',
  scroll_hint_desktop TEXT NOT NULL DEFAULT 'Scroll to explore',
  scroll_hint_mobile TEXT NOT NULL DEFAULT 'Swipe to explore',
  CONSTRAINT single_row CHECK (id = 1)
);

-- Chapters
CREATE TABLE chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

-- Prizes
CREATE TABLE prizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  badge TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  amount TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

-- Timeline entries
CREATE TABLE timeline_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  position TEXT NOT NULL DEFAULT 'left',
  is_current BOOLEAN DEFAULT FALSE,
  sort_order INT NOT NULL DEFAULT 0
);

-- Partners
CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  description TEXT,
  link_url TEXT,
  sort_order INT NOT NULL DEFAULT 0
);

-- Team members
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,
  image_url TEXT,
  sort_order INT NOT NULL DEFAULT 0
);

-- FAQ items
CREATE TABLE faq_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

-- CTA section (single row)
CREATE TABLE cta_content (
  id INT PRIMARY KEY DEFAULT 1,
  heading TEXT NOT NULL DEFAULT 'Ready to dive in?',
  button_text TEXT NOT NULL DEFAULT 'Register Now',
  button_link TEXT NOT NULL DEFAULT '/register',
  is_active BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT single_row CHECK (id = 1)
);

-- Connect / Footer (single row)
CREATE TABLE connect_content (
  id INT PRIMARY KEY DEFAULT 1,
  quote TEXT NOT NULL DEFAULT '"Every great journey begins with a conversation"',
  email_1 TEXT NOT NULL DEFAULT 'uok.cssa@gmail.com',
  email_2 TEXT NOT NULL DEFAULT 'codesplash.cssa@gmail.com',
  linkedin_url TEXT NOT NULL DEFAULT 'https://www.linkedin.com/company/cssauok/',
  facebook_url TEXT NOT NULL DEFAULT 'https://www.facebook.com/cssa_uok',
  youtube_url TEXT NOT NULL DEFAULT 'https://youtube.com/@cssauok',
  instagram_cssa_url TEXT NOT NULL DEFAULT 'https://www.instagram.com/cssa_uok/',
  instagram_codesplash_url TEXT NOT NULL DEFAULT 'https://www.instagram.com/codesplash.cssa',
  cssa_logo_url TEXT NOT NULL DEFAULT '/CSSALogo.png',
  copyright TEXT NOT NULL DEFAULT '© CodeSplash 2026. All Rights Reserved. Organized by University of Kelaniya.',
  CONSTRAINT single_row CHECK (id = 1)
);

-- User profiles for CMS access
CREATE TABLE profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  full_name TEXT NULL,
  role TEXT NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NULL DEFAULT now(),
  password TEXT NOT NULL DEFAULT '123',
  must_change_password BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_username_unique UNIQUE (username),
  CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'editor', 'viewer'))
);

-- Admin unlock keys (hashed password + service-role key for privileged ops)
CREATE TABLE keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  password_hash TEXT NOT NULL,
  service_role_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit log — auto-populated by triggers on all content tables
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  record_id TEXT,
  old_data JSONB,
  new_data JSONB,
  username TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- School registrations
CREATE TABLE school_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  student_type INT NOT NULL DEFAULT 0,
  team_name TEXT NOT NULL,
  no_of_team_members INT NOT NULL CHECK (no_of_team_members BETWEEN 1 AND 5),
  school TEXT NOT NULL,
  school_address TEXT,
  district TEXT NOT NULL,
  teacher_name TEXT NOT NULL,
  teacher_email TEXT NOT NULL,
  teacher_phone TEXT NOT NULL,
  leader_name TEXT NOT NULL,
  leader_grade TEXT NOT NULL,
  leader_email TEXT NOT NULL,
  leader_phone TEXT NOT NULL,
  member2_name TEXT,
  member2_grade TEXT,
  member2_phone TEXT,
  member3_name TEXT,
  member3_grade TEXT,
  member3_phone TEXT,
  member4_name TEXT,
  member4_grade TEXT,
  member4_phone TEXT,
  member5_name TEXT,
  member5_grade TEXT,
  member5_phone TEXT,
  declaration TEXT
);

-- University registrations
CREATE TABLE university_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  email TEXT,
  team_name TEXT,
  university TEXT,
  faculty TEXT,
  team_size INT,
  leader_name TEXT,
  leader_gender TEXT,
  leader_email TEXT,
  leader_phone TEXT,
  leader_year TEXT,
  member2_name TEXT,
  member2_gender TEXT,
  member2_email TEXT,
  member2_phone TEXT,
  member2_year TEXT,
  member3_name TEXT,
  member3_gender TEXT,
  member3_email TEXT,
  member3_phone TEXT,
  member3_year TEXT,
  member4_name TEXT,
  member4_gender TEXT,
  member4_email TEXT,
  member4_phone TEXT,
  member4_year TEXT,
  member5_name TEXT,
  member5_gender TEXT,
  member5_email TEXT,
  member5_phone TEXT,
  member5_year TEXT,
  technologies TEXT,
  languages TEXT,
  hackathon_exp TEXT,
  hackathon_details TEXT,
  github_link TEXT,
  project_worked_on TEXT,
  problem_to_solve TEXT,
  interested_area TEXT,
  hear_about TEXT
);


-- =============================================================
-- 2. ROW LEVEL SECURITY
-- =============================================================

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cta_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE connect_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE university_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────
-- CONTENT TABLES — public read + write (anon key)
-- ─────────────────────────────────────────────────────────────
-- For GitHub Pages (static export), the anon key is the only
-- option. Content tables have no sensitive data, so open
-- read/write is acceptable. Profiles stays locked.

CREATE POLICY "Public can read site_settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Allow CMS writes to site_settings" ON site_settings FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public can read hero_content" ON hero_content FOR SELECT USING (true);
CREATE POLICY "Allow CMS writes to hero_content" ON hero_content FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public can read chapters" ON chapters FOR SELECT USING (true);
CREATE POLICY "Allow CMS writes to chapters" ON chapters FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public can read prizes" ON prizes FOR SELECT USING (true);
CREATE POLICY "Allow CMS writes to prizes" ON prizes FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public can read timeline_entries" ON timeline_entries FOR SELECT USING (true);
CREATE POLICY "Allow CMS writes to timeline_entries" ON timeline_entries FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public can read partners" ON partners FOR SELECT USING (true);
CREATE POLICY "Allow CMS writes to partners" ON partners FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public can read team_members" ON team_members FOR SELECT USING (true);
CREATE POLICY "Allow CMS writes to team_members" ON team_members FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public can read faq_items" ON faq_items FOR SELECT USING (true);
CREATE POLICY "Allow CMS writes to faq_items" ON faq_items FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public can read cta_content" ON cta_content FOR SELECT USING (true);
CREATE POLICY "Allow CMS writes to cta_content" ON cta_content FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public can read connect_content" ON connect_content FOR SELECT USING (true);
CREATE POLICY "Allow CMS writes to connect_content" ON connect_content FOR ALL USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────
-- PROFILES — public read only (writes blocked)
-- ─────────────────────────────────────────────────────────────
-- Login needs SELECT to verify credentials. Writes go through
-- the service-role client (lib/supabase/admin.ts).

CREATE POLICY "Public can read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "No public writes to profiles" ON profiles FOR ALL USING (false) WITH CHECK (false);

-- ─────────────────────────────────────────────────────────────
-- KEYS — public read only (password verification), no writes
-- ─────────────────────────────────────────────────────────────
-- The anon key can SELECT to verify the unlock password.
-- All writes (create/update/delete keys) require SQL Editor access.

ALTER TABLE keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read keys" ON keys FOR SELECT USING (true);
CREATE POLICY "No public writes to keys" ON keys FOR ALL USING (false) WITH CHECK (false);

-- ─────────────────────────────────────────────────────────────
-- REGISTRATION TABLES — public insert + read + delete
-- ─────────────────────────────────────────────────────────────

CREATE POLICY "Anyone can submit school registration" ON school_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "CMS can read school registrations" ON school_registrations FOR SELECT USING (true);
CREATE POLICY "CMS can delete school registrations" ON school_registrations FOR DELETE USING (true);

CREATE POLICY "Anyone can submit university registration" ON university_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "CMS can read university registrations" ON university_registrations FOR SELECT USING (true);
CREATE POLICY "CMS can delete university registrations" ON university_registrations FOR DELETE USING (true);

-- ─────────────────────────────────────────────────────────────
-- AUDIT LOG — read only (writes via trigger only)
-- ─────────────────────────────────────────────────────────────
CREATE POLICY "Public can read audit_log" ON audit_log FOR SELECT USING (true);
CREATE POLICY "No public writes to audit_log" ON audit_log FOR ALL USING (false) WITH CHECK (false);


-- =============================================================
-- 3. STORAGE BUCKET
-- =============================================================
-- Upload the following images to the 'cms-images' bucket:
--   Partner logos:  Logos/sntnew.png, Logos/orysysnew.png, Logos/lakdhanavinew.png,
--                  Logos/ictfromabcnew.png, Logos/Slasscomnew.png,
--                  Logos/creativesoftware.png, Logos/derananew.png, Logos/hayleysnew.png
--   Team photos:   team/naveen.png, team/thanuj.png, team/vidmal.png,
--                  team/janishka.png, team/chathuni.png
--   Site images:   CodeSplash.png, CSSALogo.png, crown.png
--   Social icons:  LI_ICON.PNG, FB_ICON.PNG, YT_ICON.PNG, IG_ICON.PNG
-- =============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cms-images',
  'cms-images',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml']
) ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "Public can view cms images" ON storage.objects FOR SELECT USING (bucket_id = 'cms-images');
CREATE POLICY "Allow all cms image uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'cms-images');
CREATE POLICY "Allow all cms image deletes" ON storage.objects FOR DELETE USING (bucket_id = 'cms-images');


-- =============================================================
-- 4. INDEXES
-- =============================================================

CREATE INDEX idx_school_reg_submitted ON school_registrations (submitted_at DESC);
CREATE INDEX idx_school_reg_school ON school_registrations (school);
CREATE INDEX idx_school_reg_district ON school_registrations (district);
CREATE INDEX idx_school_reg_team ON school_registrations (team_name);

CREATE INDEX idx_uni_reg_submitted ON university_registrations (submitted_at DESC);
CREATE INDEX idx_uni_reg_university ON university_registrations (university);
CREATE INDEX idx_uni_reg_team ON university_registrations (team_name);

CREATE INDEX idx_partners_category ON partners (category);
CREATE INDEX idx_partners_sort ON partners (sort_order);


-- =============================================================
-- 5. SEED DATA
-- =============================================================

INSERT INTO site_settings (id, site_title, site_description, keywords, theme_color)
VALUES (
  1,
  'CodeSplash | National Level University Hackathon',
  'CodeSplash 2026 is the ultimate convergence of logic and creativity.',
  ARRAY['hackathon', 'CodeSplash', 'university', 'coding', 'competition', 'Sri Lanka', '2026'],
  '#000000'
);

INSERT INTO hero_content (id, logo_url, logo_alt, tagline, cta_button_text, cta_button_link, scroll_hint_desktop, scroll_hint_mobile)
VALUES (
  1,
  '/CodeSplash.png',
  'CodeSplash Logo',
  'A Nation-wide hackathon organized by CSSA university of Kelaniya, empowering innovation through inspiration from the timeless legacy of the pyramids.',
  'Ongoing Challenge',
  '/register',
  'Scroll to explore',
  'Swipe to explore'
);

INSERT INTO chapters (title, description, sort_order) VALUES
('University Hackathon', 'The University Hackathon is an inter-university competition where students solve real-world challenges. The top 15 teams receive mentorship and present their solutions at the Grand Finale.', 1),
('School Hackathon', 'The School Ideathon gives school students a chance to present innovative ideas for real-world challenges. With expert guidance, participants improve their ideas and pitch them to a panel of judges.', 2),
('Agentic AI Challenge', 'The Agentic AI Challenge invites participants to build intelligent AI agents using modern technologies, solve real-world problems and gain practical experience in artificial intelligence.', 3);

INSERT INTO prizes (badge, name, description, amount, sort_order) VALUES
('University Phase', 'Pharaoh''s Legacy Prize', 'Awarded to the university team that demonstrates exceptional innovation, technical excellence and teamwork while conquering the toughest challenges on the journey to victory.', 'LKR 100,000', 1),
('School Phase', 'Rising Explorer''s Prize', 'Celebrating young innovators who showcase outstanding creativity, determination and problem-solving skills as they take their first steps toward greatness.', 'LKR 65,000', 2),
('Agentic AI Challenge', 'Artisan of the Nile Award', 'Recognizing the innovators who build intelligent AI agents that solve real-world challenges through creativity, autonomy and technical excellence.', 'Will be out soon!', 3);

INSERT INTO timeline_entries (date, title, description, position, is_current, sort_order) VALUES
('July 04', 'Registration Starts', 'The pyramid gates are locked. Register your team and claim the key to your CodeSplash journey.', 'left', false, 1),
('July 15', 'Registration Closes', 'The last keys are almost gone. Register before the gates seal and the path disappears.', 'right', false, 2),
('July 18', 'Awareness Session & Proposal Opening', 'Learn the rules, study the map, and prepare for the adventure ahead.', 'left', false, 3),
('July 26', 'Proposal Submission Closes', 'Share your first discovery. Your idea could unlock hidden treasures within your team.', 'right', false, 4),
('July 27', 'Proposal Evaluation', 'Every idea is carefully evaluated as judges search for the brightest minds to continue the journey.', 'left', false, 5),
('July 31', 'Semi-Finalists & Development Phase Begins', 'The chosen explorers are revealed, earning their place deeper within the ancient pyramid.', 'right', false, 6),
('August 08 - August 16', 'Mentorship Sessions', 'Work with mentors to refine, improve, and strengthen your solution throughout the journey.', 'left', true, 7),
('August 20', 'Project Submission Deadline', 'Your creation is complete. Submit your masterpiece before the final chamber closes.', 'right', false, 8),
('August 22', 'Project Evaluation', 'Every solution is judged on innovation, impact, and courage to face the impossible.', 'left', false, 9),
('September 01', 'Announcement of Finalists', 'Only the bravest remain. The guardians choose who advances to the final challenge.', 'right', false, 10),
('September 02', 'Product Pitch Session', 'Stand before the keepers. Share your story, defend your vision, and inspire with innovation.', 'left', false, 11),
('September 04', 'Grand Finale', 'The journey reaches its peak. Champions are crowned, legacies are forged, and CodeSplash history is made.', 'center', false, 12);

INSERT INTO partners (category, name, logo_url, description, link_url, sort_order) VALUES
('platinum', 'Super Neat Technology', '/Logos/sntnew.png', 'As our expedition drifted helplessly along the Nile, Super Neat Technology pulled us ashore with their software engineering expertise, giving our journey the strong technological foundation it needed.', 'https://superneat.lk/', 1),
('platinum', 'Orysys', '/Logos/orysysnew.png', 'Just when the desert seemed endless, Orysys emerged like an oasis, guiding us with their expertise in digital innovation and empowering us to keep building for the next generation of developers.', 'https://orysys.com/', 2),
('platinum', 'Lakdhanavi', '/Logos/lakdhanavinew.png', 'Lost without a map through the ancient sands, we found Lakdhanavi. As our knowledge partner, they charted the path ahead with industry expertise, helping every step of our journey stay on course.', 'https://lakdhanavi.lk/', 3),
('school_platinum', 'ICT from ABC', '/Logos/ictfromabcnew.png', 'When we wandered through the towering pyramids, Ravindu Bandaranayake became our trusted guide. Through ICT from ABC, his passion for ICT education continues to inspire and direct future innovators.', 'https://www.ictfromabc.com/', 4),
('knowledge', 'SLASSCOM', '/Logos/Slasscomnew.png', 'Navigating the digital frontier, SLASSCOM equipped our explorers with essential industry insights, bridging the gap between academic theory and real-world technological environments.', 'https://slasscom.lk/', 5),
('knowledge', 'Creative Software', '/Logos/creativesoftware.png', 'Bringing decades of software engineering wisdom to our expedition, Creative Software served as a beacon of knowledge, guiding our challengers to build robust and scalable solutions.', 'https://www.creativesoftware.com/', 6),
('media', 'TV Derana', '/Logos/derananew.png', 'After uncovering the treasures of our expedition, we needed the world to hear our story. TV Derana amplified our message, bringing our journey to audiences across the island through its media network.', 'https://www.derana.lk/', 7),
('bronze', 'Hayleys Solar', '/Logos/hayleysnew.png', 'When the blazing desert sun tested our resolve, Hayleys Solar became our shelter, harnessing the power of sunlight to energize our expedition with sustainable solar solutions for a brighter future.', 'https://www.hayleyssolar.com/', 8);

INSERT INTO team_members (name, role, email, phone, linkedin_url, image_url, sort_order) VALUES
('Naveen Jayathissa', 'CSSA President', 'naveenjayathis@gmail.com', '+94 70 246 6805', 'https://www.linkedin.com/in/naveenjayathissa99', '/assets/team/naveen.png', 1),
('Thanuj Abeyrathne', 'CSSA Secretary', 'thanujabeyrathne06@gmail.com', '+94 71 307 3108', 'https://www.linkedin.com/in/thanuj-abeyrathne-096614242', '/assets/team/thanuj.png', 2),
('Vidmal Senanayake', 'Co-Chair', 'vidmalsenanayake@gmail.com', '+94 74 107 4448', 'https://www.linkedin.com/in/vidmal-senanayake', '/assets/team/vidmal.png', 3),
('Janishka Madushan', 'Co-Chair', 'janishkaofficial@gmail.com', '+94 76 782 6947', 'https://www.linkedin.com/in/janishka', '/assets/team/janishka.png', 4),
('Chathuni Fernando', 'Delegates Team Lead', 'chathunifernando88@gmail.com', '+94 75 275 3568', 'https://www.linkedin.com/in/chathuni-fernando-26a1a0383', '/assets/team/chathuni.png', 5);

INSERT INTO faq_items (question, answer, sort_order) VALUES
('What is CodeSplash ''26 ?', 'CodeSplash is the flagship inter-university hackathon conducted by computer science students'' association (CSSA) of the University of Kelaniya. At CodeSplash, you get to push your limits in idea generation, build under pressure and create a solution that will work no matter what field it is in.', 1),
('Who can participate?', 'The hackathon will be conducted under two main categories: the inter-school phase and the inter-university phase. The inter-university will be open for islandwide university students. The inter-school phase will be open to school students representing various grades and academic levels across the island who are interested in technology, innovation and problem-solving.', 2),
('How can participate in this hackathon?', 'Once registration opens on our official website, fill out the registration form and you''ll be ready to join the CodeSplash hackathon.', 3),
('What is the competition format?', 'CodeSplash''26 is conducted in multiple stages, guiding participants from idea generation to solution development and final presentations. Each stage is designed to evaluate creativity, technical skills and problem-solving ability.', 4),
('When do registrations open?', 'Registration dates will be announced through the official website and social media platforms. Stay tuned for the latest updates and important deadlines.', 5),
('Is participation free?', 'Yes! Participation in CodeSplash''26 is completely free, providing every eligible student with an equal opportunity to compete and innovate.', 6),
('What rewards can winners expect?', 'Winning teams will receive exciting prizes, certificates, exclusive recognition and opportunities to showcase their innovations to industry professionals.', 7);

INSERT INTO cta_content (id, heading, button_text, button_link, is_active)
VALUES (1, 'Ready to dive in?', 'Register Now', '/register', true);

INSERT INTO connect_content (id, quote, email_1, email_2, linkedin_url, facebook_url, youtube_url, instagram_cssa_url, instagram_codesplash_url, cssa_logo_url, copyright)
VALUES (
  1,
  '"Every great journey begins with a conversation"',
  'uok.cssa@gmail.com',
  'codesplash.cssa@gmail.com',
  'https://www.linkedin.com/company/cssauok/',
  'https://www.facebook.com/cssa_uok',
  'https://youtube.com/@cssauok',
  'https://www.instagram.com/cssa_uok/',
  'https://www.instagram.com/codesplash.cssa',
  '/CSSALogo.png',
  '© CodeSplash 2026. All Rights Reserved. Organized by University of Kelaniya.'
);

-- Default admin user (username: admin, password: admin123)
-- Password is bcrypt-hashed. must_change_password = false.
INSERT INTO profiles (username, full_name, role, password, must_change_password)
VALUES ('admin', 'Administrator', 'admin', '$2b$12$JBvjDMT3t8NPoCRhtM3.OOCfxZ18XpHRJcZGB1sdNjbZjVvs426ku', false);

-- Default unlock key (password: admin123, change via SQL Editor)
-- service_role_key is a placeholder — replace with your actual key via SQL:
--   UPDATE keys SET service_role_key = 'your-actual-service-role-key' WHERE id = '<id>';
INSERT INTO keys (password_hash, service_role_key)
VALUES ('$2b$12$bnHx5I/1bolEAghgC.v./OIcNfHNqutYzwqzZLA9jGPu/Mg4w44MC', 'REPLACE_WITH_YOUR_SERVICE_ROLE_KEY');


-- =============================================================
-- 6. AUDIT LOG — RPC + TRIGGER
-- =============================================================

-- RPC: set username in session (client calls this before writes)
CREATE OR REPLACE FUNCTION set_audit_user(username text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM set_config('app.audit_user', username, true);
END;
$$;

-- Trigger function — auto-log all content table changes
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

-- Audit log indexes
CREATE INDEX idx_audit_log_created ON audit_log (created_at DESC);
CREATE INDEX idx_audit_log_table ON audit_log (table_name);
CREATE INDEX idx_audit_log_username ON audit_log (username);

-- Create triggers on all content tables
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
