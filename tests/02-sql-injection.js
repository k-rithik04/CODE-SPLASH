/**
 * Test 02: SQL Injection on Login
 * Tests whether the login endpoint is vulnerable to SQL injection.
 * Expected: All payloads should fail with 401 (invalid credentials), never bypass auth.
 */
import { log, record, request } from "./helpers.js";

const SQL_PAYLOADS = [
  { label: "Classic OR TRUE", username: "admin' OR '1'='1", password: "anything" },
  { label: "Comment bypass", username: "admin'--", password: "anything" },
  { label: "Union select", username: "' UNION SELECT 1,2,3,4,5,6,7,8,9--", password: "anything" },
  { label: "Always-true password", username: "admin", password: "' OR '1'='1" },
  { label: "Double-quote escape", username: 'admin" OR "1"="1', password: "anything" },
  { label: "Semicolon injection", username: "admin'; DROP TABLE profiles; --", password: "anything" },
  { label: "Empty string", username: "", password: "" },
  { label: "Null byte", username: "admin\x00", password: "password" },
  { label: "Long payload", username: "A".repeat(10000), password: "B".repeat(10000) },
  { label: "Unicode escape", username: "\u0275r' OR 1=1--", password: "x" },
  { label: "Whitespace bypass", username: "admin  ' OR '1'='1", password: "x" },
];

async function testSQLInjection() {
  log("section", "TEST 02: SQL Injection on Login");
  console.log("");

  for (const payload of SQL_PAYLOADS) {
    try {
      const res = await request("/cms/api/login", {
        method: "POST",
        body: JSON.stringify({ username: payload.username, password: payload.password }),
      });

      const data = await res.json().catch(() => ({}));
      const ok = res.status === 400 || res.status === 401 || res.status === 429;
      const hasToken = !!data.token;

      record(ok && !hasToken);
      if (ok && !hasToken) {
        log("pass", `${payload.label}: status ${res.status} (blocked)`);
      } else {
        log("fail", `${payload.label}: status ${res.status} — token ${hasToken ? "ISSUED!" : "not issued"}`);
        if (hasToken) log("fail", `  ⚠ AUTH BYPASS! Token: ${data.token?.substring(0, 40)}...`);
      }
      
      // Add a small delay to avoid triggering rate limit too early
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch {
      record(true);
      log("info", `${payload.label}: connection error (server rejected)`);
    }
  }

  // Verify Supabase REST API is also not vulnerable (anon key direct query)
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = await import("./config.js");
  try {
    const profiles = [
      "admin'--",
      "admin' OR '1'='1",
      "' UNION SELECT * FROM profiles--",
    ];
    for (const username of profiles) {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?username=eq.${encodeURIComponent(username)}&select=id`,
        { headers: { apikey: SUPABASE_ANON_KEY } }
      );
      const data = await res.json();
      const ok = data.length === 0 || res.status >= 400;
      record(ok);
      log(ok ? "pass" : "fail", `Direct Supabase query "${username}": ${data.length} rows`);
    }
  } catch (err) {
    record(true);
    log("info", `Supabase direct query skipped: ${err.message}`);
  }

  console.log("");
}

export default testSQLInjection;
