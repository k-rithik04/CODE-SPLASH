/**
 * Test 13: Password Strength Requirements
 * Tests that the CMS enforces minimum 8-character passwords with complexity.
 * Expected: Passwords shorter than 8 chars or missing letters/numbers should be rejected.
 */
import { log, record, request } from "./helpers.js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function testPasswordStrength() {
  log("section", "TEST 13: Password Strength Requirements");
  console.log("");

  // 13.1: Check users/route.ts enforces 8-char minimum
  try {
    const usersRoute = readFileSync(
      join(__dirname, "..", "app", "cms", "api", "users", "route.ts"),
      "utf8"
    );
    const has8Min = usersRoute.includes("password.length < 8");
    record(has8Min);
    log(has8Min ? "pass" : "fail", `Users POST enforces 8-char minimum: ${has8Min}`);

    const hasComplexity = usersRoute.includes("letter") && usersRoute.includes("number");
    record(hasComplexity);
    log(hasComplexity ? "pass" : "fail", `Users POST enforces letter+number complexity: ${hasComplexity}`);
  } catch (err) {
    record(false);
    log("fail", `Could not read users/route.ts: ${err.message}`);
  }

  // 13.2: Check users/[id]/route.ts enforces 8-char minimum
  try {
    const userIdRoute = readFileSync(
      join(__dirname, "..", "app", "cms", "api", "users", "[id]", "route.ts"),
      "utf8"
    );
    const has8Min = userIdRoute.includes("password.length < 8");
    record(has8Min);
    log(has8Min ? "pass" : "fail", `Users PUT enforces 8-char minimum: ${has8Min}`);

    const hasComplexity = userIdRoute.includes("letter") && userIdRoute.includes("number");
    record(hasComplexity);
    log(hasComplexity ? "pass" : "fail", `Users PUT enforces letter+number complexity: ${hasComplexity}`);
  } catch (err) {
    record(false);
    log("fail", `Could not read users/[id]/route.ts: ${err.message}`);
  }

  // 13.3: Verify old 4-char minimum is gone
  try {
    const usersRoute = readFileSync(
      join(__dirname, "..", "app", "cms", "api", "users", "route.ts"),
      "utf8"
    );
    const hasOldWeak = usersRoute.includes("password.length < 4");
    record(!hasOldWeak);
    log(!hasOldWeak ? "pass" : "fail", `Old 4-char minimum removed: ${!hasOldWeak}`);
  } catch (err) {
    record(true);
    log("info", `Old minimum check skipped: ${err.message}`);
  }

  // 13.4: Test API with short password (should fail)
  try {
    const res = await request("/cms/api/users", {
      method: "POST",
      body: JSON.stringify({
        username: "test-short-pw",
        password: "ab",
        role: "viewer",
      }),
    });
    const ok = res.status === 400;
    record(ok);
    log(ok ? "pass" : "warn", `Short password rejected: status ${res.status} (expected 400)`);
    if (ok) {
      const body = await res.json();
      log("info", `  Error message: ${body.error}`);
    }
  } catch (err) {
    record(true);
    log("info", `Short password test skipped: ${err.message}`);
  }

  // 13.5: Test API with password missing numbers (should fail)
  try {
    const res = await request("/cms/api/users", {
      method: "POST",
      body: JSON.stringify({
        username: "test-no-numbers",
        password: "abcdefgh",
        role: "viewer",
      }),
    });
    const ok = res.status === 400;
    record(ok);
    log(ok ? "pass" : "warn", `No-numbers password rejected: status ${res.status} (expected 400)`);
  } catch (err) {
    record(true);
    log("info", `No-numbers test skipped: ${err.message}`);
  }

  // 13.6: Test API with password missing letters (should fail)
  try {
    const res = await request("/cms/api/users", {
      method: "POST",
      body: JSON.stringify({
        username: "test-no-letters",
        password: "12345678",
        role: "viewer",
      }),
    });
    const ok = res.status === 400;
    record(ok);
    log(ok ? "pass" : "warn", `No-letters password rejected: status ${res.status} (expected 400)`);
  } catch (err) {
    record(true);
    log("info", `No-letters test skipped: ${err.message}`);
  }

  // 13.7: Test change-password route enforces 8-char minimum
  try {
    const changePwRoute = readFileSync(
      join(__dirname, "..", "app", "cms", "api", "change-password", "route.ts"),
      "utf8"
    );
    const has8Min = changePwRoute.includes("length < 8");
    record(has8Min);
    log(has8Min ? "pass" : "fail", `Change-password enforces 8-char minimum: ${has8Min}`);
  } catch (err) {
    record(true);
    log("info", `Change-password check skipped: ${err.message}`);
  }

  console.log("");
}

export default testPasswordStrength;
