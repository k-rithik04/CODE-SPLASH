-- Fix permissions: Grant ALL on content tables to anon so CMS writes work.
-- The browser client uses the anon key; EditList does delete+insert.

GRANT ALL ON timeline_entries TO anon;
GRANT ALL ON chapters TO anon;
GRANT ALL ON prizes TO anon;
GRANT ALL ON partners TO anon;
GRANT ALL ON team_members TO anon;
GRANT ALL ON faq_items TO anon;
GRANT ALL ON hero_content TO anon;
GRANT ALL ON cta_content TO anon;
GRANT ALL ON connect_content TO anon;
GRANT ALL ON site_settings TO anon;
