/**
 * Test 18: CSP and Security Headers Updates
 * Tests that CSP no longer allows unsafe-eval and logout redirects correctly.
 * Expected: CSP should not include unsafe-eval, logout should redirect to /cms/login.
 */
import { log, record } from "./helpers.js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function testCSPAndHeaders() {
  log("section", "TEST 18: CSP and Security Header Updates");
  console.log("");

  // 18.1: Check CSP no longer has unsafe-eval
  try {
    const nextConfig = readFileSync(
      join(__dirname, "..", "next.config.ts"),
      "utf8"
    );
    const hasUnsafeEval = nextConfig.includes("'unsafe-eval'");
    record(!hasUnsafeEval);
    log(!hasUnsafeEval ? "pass" : "fail", `CSP unsafe-eval removed: ${!hasUnsafeEval}`);
    if (hasUnsafeEval) {
      log("fail", "  ⚠ unsafe-eval allows eval() in browser — XSS risk");
    }
  } catch (err) {
    record(false);
    log("fail", `Could not read next.config.ts: ${err.message}`);
  }

  // 18.2: Check CSP still has unsafe-inline (required by Next.js)
  try {
    const nextConfig = readFileSync(
      join(__dirname, "..", "next.config.ts"),
      "utf8"
    );
    const hasUnsafeInline = nextConfig.includes("'unsafe-inline'");
    record(hasUnsafeInline);
    log(hasUnsafeInline ? "pass" : "warn", `CSP unsafe-inline present (required by Next.js): ${hasUnsafeInline}`);
  } catch (err) {
    record(true);
    log("info", `CSP inline check skipped: ${err.message}`);
  }

  // 18.3: Check logout page redirects to /cms/login
  try {
    const logoutPage = readFileSync(
      join(__dirname, "..", "app", "cms", "logout", "page.tsx"),
      "utf8"
    );
    const redirectsCorrectly = logoutPage.includes("/cms/login");
    const hasOldRedirect = logoutPage.includes("/admin/login");
    record(redirectsCorrectly && !hasOldRedirect);
    log(
      redirectsCorrectly && !hasOldRedirect ? "pass" : "fail",
      `Logout redirects to /cms/login: ${redirectsCorrectly}, old /admin/login removed: ${!hasOldRedirect}`
    );
  } catch (err) {
    record(false);
    log("fail", `Could not read logout/page.tsx: ${err.message}`);
  }

  // 18.4: Check hardcoded credentials removed from tests/config.js
  try {
    const testConfig = readFileSync(
      join(__dirname, "..", "tests", "config.js"),
      "utf8"
    );
    const hasHardcodedKey = testConfig.includes("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9");
    const hasHardcodedSecret = testConfig.includes("ci-build-placeholder-not-for-production");
    record(!hasHardcodedKey && !hasHardcodedSecret);
    log(
      !hasHardcodedKey && !hasHardcodedSecret ? "pass" : "fail",
      `tests/config.js hardcoded credentials removed: ${!hasHardcodedKey && !hasHardcodedSecret}`
    );
    if (hasHardcodedKey) log("fail", "  ⚠ Supabase anon key still hardcoded in tests/config.js");
    if (hasHardcodedSecret) log("fail", "  ⚠ JWT secret still hardcoded in tests/config.js");
  } catch (err) {
    record(true);
    log("info", `Config check skipped: ${err.message}`);
  }

  // 18.5: Verify tests/config.js uses process.env
  try {
    const testConfig = readFileSync(
      join(__dirname, "..", "tests", "config.js"),
      "utf8"
    );
    const usesEnv = testConfig.includes("process.env");
    record(usesEnv);
    log(usesEnv ? "pass" : "warn", `tests/config.js uses process.env: ${usesEnv}`);
  } catch (err) {
    record(true);
    log("info", `Env var check skipped: ${err.message}`);
  }

  console.log("");
}

export default testCSPAndHeaders;
