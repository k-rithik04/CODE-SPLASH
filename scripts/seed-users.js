/**
 * Seed the profiles table with default accounts.
 * Run: node scripts/seed-users.js
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function hash(pw) {
  return bcrypt.hash(pw, 12);
}

const users = [
  { username: "admin", full_name: "Administrator", role: "admin", password: "admin123", must_change_password: false },
  { username: "test", full_name: "", role: "editor", password: "Test1234", must_change_password: true },
  { username: "viewer", full_name: "Viewer User", role: "viewer", password: "View1234", must_change_password: true },
];

async function seed() {
  for (const u of users) {
    const hashed = await hash(u.password);
    const { error } = await supabase
      .from("profiles")
      .upsert(
        { username: u.username, full_name: u.full_name, role: u.role, password: hashed, must_change_password: u.must_change_password },
        { onConflict: "username" }
      );
    if (error) {
      console.error(`  ✗ ${u.username}: ${error.message}`);
    } else {
      console.log(`  ✓ ${u.username} (${u.role}) — password: ${u.password}, must_change: ${u.must_change_password}`);
    }
  }
}

console.log("Seeding profiles table...");
await seed();

const { data } = await supabase.from("profiles").select("username, role, must_change_password");
console.log("\nCurrent users:");
data?.forEach((u) => console.log(`  ${u.username} [${u.role}] force_change=${u.must_change_password}`));
