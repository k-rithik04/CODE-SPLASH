import { config } from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "..", ".env.local") });

export const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
export const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
export const JWT_SECRET_PLACEHOLDER = process.env.JWT_SECRET || "";
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
