export const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
export const SUPABASE_URL = "https://kcfwibhzmfwipipwbzrw.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjZndpYmh6bWZ3aXBpcHdienJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyNTA2OTAsImV4cCI6MjA5ODgyNjY5MH0.l2sjzMqzaFIjn-dM86EoYwbpQA29WEzaG_riyyHUuBs";
export const JWT_SECRET_PLACEHOLDER = "ci-build-placeholder-not-for-production";
export const CMS_PROTECTED_ROUTES = [
  "/cms/dashboard",
  "/cms/content/chapters",
  "/cms/content/prizes",
  "/cms/content/timeline",
  "/cms/content/partners",
  "/cms/content/team",
  "/cms/content/faq",
  "/cms/registrations",
  "/cms/audit",
  "/cms/settings",
  "/cms/settings/hero",
  "/cms/settings/cta",
  "/cms/settings/connect",
];
