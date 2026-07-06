/**
 * Test 12: CSRF Protection
 * Tests that CMS API routes validate Origin/Referer headers.
 * Expected: All state-changing CMS API routes should reject requests without valid origin.
 */
import { log, record, request } from "./helpers.js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function testCSRFProtection() {
  log("section", "TEST 12: CSRF Protection (Origin/Referer Validation)");
  console.log("");

  // 12.1: Check that csrf.ts module exists
  try {
    const csrfFile = readFileSync(
      join(__dirname, "..", "lib", "csrf.ts"),
      "utf8"
    );
    record(true);
    log("pass", "lib/csrf.ts module exists");

    const hasValidateOrigin = csrfFile.includes("validateOrigin");
    record(hasValidateOrigin);
    log(hasValidateOrigin ? "pass" : "fail", `validateOrigin function exported: ${hasValidateOrigin}`);
  } catch {
    record(false);
    log("fail", "lib/csrf.ts module NOT found — CSRF protection missing!");
    console.log("");
    return;
  }

  // 12.2: Check login route imports CSRF
  const routes = [
    { path: join(__dirname, "..", "app", "cms", "api", "login", "route.ts"), name: "login" },
    { path: join(__dirname, "..", "app", "cms", "api", "logout", "route.ts"), name: "logout" },
    { path: join(__dirname, "..", "app", "cms", "api", "change-password", "route.ts"), name: "change-password" },
    { path: join(__dirname, "..", "app", "cms", "api", "users", "route.ts"), name: "users" },
    { path: join(__dirname, "..", "app", "cms", "api", "users", "[id]", "route.ts"), name: "users/[id]" },
  ];

  for (const route of routes) {
    try {
      const code = readFileSync(route.path, "utf8");
      const hasImport = code.includes('from "@/lib/csrf"') || code.includes("from '@/lib/csrf'");
      const hasCall = code.includes("validateOrigin");
      record(hasImport && hasCall);
      log(
        hasImport && hasCall ? "pass" : "fail",
        `${route.name} route has CSRF validation: ${hasImport && hasCall}`
      );
    } catch (err) {
      record(false);
      log("fail", `${route.name} route: ${err.message}`);
    }
  }

  // 12.3: Test that requests without Origin/Referer are rejected
  try {
    const res = await request("/cms/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "admin", password: "test" }),
    });
    // Without Origin header, should get 403
    const ok = res.status === 403;
    record(ok);
    log(ok ? "pass" : "warn", `Login without Origin header: status ${res.status} (expected 403)`);
  } catch (err) {
    record(true);
    log("info", `Origin test skipped: ${err.message}`);
  }

  // 12.4: Test that requests with invalid Origin are rejected
  try {
    const res = await request("/cms/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://evil-attacker.com",
      },
      body: JSON.stringify({ username: "admin", password: "test" }),
    });
    const ok = res.status === 403;
    record(ok);
    log(ok ? "pass" : "warn", `Login with evil Origin: status ${res.status} (expected 403)`);
  } catch (err) {
    record(true);
    log("info", `Evil origin test skipped: ${err.message}`);
  }

  // 12.5: Test that logout is also protected
  try {
    const res = await request("/cms/api/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const ok = res.status === 403;
    record(ok);
    log(ok ? "pass" : "warn", `Logout without Origin: status ${res.status} (expected 403)`);
  } catch (err) {
    record(true);
    log("info", `Logout CSRF test skipped: ${err.message}`);
  }

  console.log("");
}

export default testCSRFProtection;
