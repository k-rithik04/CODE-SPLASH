import { SignJWT } from "jose";
import { BASE_URL, JWT_SECRET_PLACEHOLDER } from "./config.js";

const SECRET = new TextEncoder().encode(JWT_SECRET_PLACEHOLDER || "test-placeholder-for-tests-only");

let passed = 0;
let failed = 0;
let total = 0;

export function log(type, msg) {
  const colors = {
    pass: "\x1b[32m✓ PASS\x1b[0m",
    fail: "\x1b[31m✗ FAIL\x1b[0m",
    info: "\x1b[36mℹ INFO\x1b[0m",
    warn: "\x1b[33m⚠ WARN\x1b[0m",
    section: "\x1b[1m\x1b[35m━━━",
  };
  console.log(`${colors[type] || ""} ${msg}`);
}

export function record(ok) {
  total++;
  if (ok) passed++;
  else failed++;
}

export async function supabaseQuery(table, select = "*", headers = {}) {
  const url = `${BASE_URL.replace("localhost", "kcfwibhzmfwipipwbzrw.supabase.co")}/rest/v1/${table}?select=${select}`;
  return fetch(url, {
    headers: {
      apikey: process.env.SUPABASE_ANON_KEY || (await import("./config.js")).SUPABASE_ANON_KEY,
      ...headers,
    },
  });
}

export async function createForgedJWT(overrides = {}) {
  return new SignJWT({
    id: "00000000-0000-0000-0000-000000000000",
    username: "admin",
    role: "admin",
    full_name: "Attacker",
    must_change_password: false,
    ...overrides,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("codesplash-cms")
    .setExpirationTime("1h")
    .sign(SECRET);
}

export async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    redirect: "manual",
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Origin": BASE_URL,
      "Referer": BASE_URL + "/",
      ...options.headers,
    },
  });
  return res;
}

export function summary() {
  console.log("");
  console.log(`\x1b[1m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  Results: \x1b[32m${passed} passed\x1b[0m, \x1b[31m${failed} failed\x1b[0m, ${total} total`);
  console.log(`\x1b[1m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m`);
  if (failed > 0) {
    console.log(`\n  \x1b[31m⚠ Some tests failed! Review and fix the vulnerabilities.\x1b[0m\n`);
  } else {
    console.log(`\n  \x1b[32m✓ All tests passed! Security looks good.\x1b[0m\n`);
  }
  return failed === 0;
}

export { SECRET };
export const getPassed = () => passed;
export const getFailed = () => failed;
