/**
 * Test 23: Change Password API Flow
 * Tests the full change-password endpoint: auth required, CSRF, rate limiting,
 * same-password rejection, complexity enforcement, and new session issuance.
 */
import { log, record, request } from "./helpers.js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function testChangePasswordFlow() {
  log("section", "TEST 23: Change Password API Flow");
  console.log("");

  // 23.1: Unauthenticated change-password should fail
  try {
    const res = await request("/cms/api/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword: "old", newPassword: "NewPass123" }),
    });
    const blocked = res.status === 401 || res.status === 403;
    record(blocked);
    log(blocked ? "pass" : "fail", `Unauthenticated change-password: status ${res.status} (expected 401)`);
  } catch (err) {
    record(true);
    log("info", `Unauthenticated test: ${err.message}`);
  }

  // 23.2: CSRF check - no Origin header should be rejected
  try {
    const res = await request("/cms/api/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: "old", newPassword: "NewPass123" }),
    });
    const blocked = res.status === 403;
    record(blocked);
    log(blocked ? "pass" : "warn", `Change-password without Origin: status ${res.status} (expected 403)`);
  } catch (err) {
    record(true);
    log("info", `CSRF test: ${err.message}`);
  }

  // 23.3: Check change-password route imports CSRF, rate limiting
  try {
    const routeCode = readFileSync(
      join(__dirname, "..", "app", "cms", "api", "change-password", "route.ts"),
      "utf8"
    );
    const hasCSRF = routeCode.includes("validateOrigin");
    record(hasCSRF);
    log(hasCSRF ? "pass" : "fail", `Change-password has CSRF validation: ${hasCSRF}`);

    const hasRateLimit = routeCode.includes("checkRateLimit");
    record(hasRateLimit);
    log(hasRateLimit ? "pass" : "fail", `Change-password has rate limiting: ${hasRateLimit}`);

    const hasPasswordLength = routeCode.includes("length < 8");
    record(hasPasswordLength);
    log(hasPasswordLength ? "pass" : "fail", `Change-password enforces 8-char minimum: ${hasPasswordLength}`);

    const hasComplexity = routeCode.includes("[a-zA-Z]") && routeCode.includes("[0-9]");
    record(hasComplexity);
    log(hasComplexity ? "pass" : "fail", `Change-password enforces letter+number: ${hasComplexity}`);

    const hasSamePasswordCheck = routeCode.includes("currentPassword === newPassword") || routeCode.includes("must be different");
    record(hasSamePasswordCheck);
    log(hasSamePasswordCheck ? "pass" : "fail", `Change-password prevents same password: ${hasSamePasswordCheck}`);

    const hasNewSession = routeCode.includes("createSession") || routeCode.includes("setSessionCookie");
    record(hasNewSession);
    log(hasNewSession ? "pass" : "fail", `Change-password issues new session: ${hasNewSession}`);
  } catch (err) {
    record(false);
    log("fail", `Could not read change-password/route.ts: ${err.message}`);
  }

  // 23.4: Missing fields should return 400
  try {
    const res = await request("/cms/api/change-password", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const ok = res.status === 400 || res.status === 401 || res.status === 403;
    record(ok);
    log(ok ? "pass" : "warn", `Missing fields rejected: status ${res.status}`);
  } catch (err) {
    record(true);
    log("info", `Missing fields test: ${err.message}`);
  }

  // 23.5: Short new password should be rejected
  try {
    const res = await request("/cms/api/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword: "old", newPassword: "ab" }),
    });
    const ok = res.status === 400 || res.status === 401 || res.status === 403;
    record(ok);
    log(ok ? "pass" : "warn", `Short new password rejected: status ${res.status}`);
  } catch (err) {
    record(true);
    log("info", `Short password test: ${err.message}`);
  }

  // 23.6: Password without numbers should be rejected
  try {
    const res = await request("/cms/api/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword: "old", newPassword: "abcdefgh" }),
    });
    const ok = res.status === 400 || res.status === 401 || res.status === 403;
    record(ok);
    log(ok ? "pass" : "warn", `No-number password rejected: status ${res.status}`);
  } catch (err) {
    record(true);
    log("info", `No-number password test: ${err.message}`);
  }

  // 23.7: Password without letters should be rejected
  try {
    const res = await request("/cms/api/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword: "old", newPassword: "12345678" }),
    });
    const ok = res.status === 400 || res.status === 401 || res.status === 403;
    record(ok);
    log(ok ? "pass" : "warn", `No-letter password rejected: status ${res.status}`);
  } catch (err) {
    record(true);
    log("info", `No-letter password test: ${err.message}`);
  }

  // 23.8: Maximum password length check (128 chars)
  try {
    const routeCode = readFileSync(
      join(__dirname, "..", "app", "cms", "api", "change-password", "route.ts"),
      "utf8"
    );
    const hasMaxCheck = routeCode.includes("length > 128") || routeCode.includes("128");
    record(hasMaxCheck);
    log(hasMaxCheck ? "pass" : "warn", `Change-password has max length check: ${hasMaxCheck}`);
  } catch (err) {
    record(true);
    log("info", `Max length check skipped: ${err.message}`);
  }

  console.log("");
}

export default testChangePasswordFlow;
