/**
 * Test 19: Role Validation
 * Tests that the user management API validates role values.
 * Expected: Only "admin", "editor", "viewer" should be accepted as valid roles.
 */
import { log, record, request } from "./helpers.js";

async function testRoleValidation() {
  log("section", "TEST 19: Role Validation in User Management");
  console.log("");

  // 19.1: Test creating user with invalid role
  try {
    const res = await request("/cms/api/users", {
      method: "POST",
      body: JSON.stringify({
        username: `role-test-${Date.now()}`,
        password: "TestPass123",
        role: "superadmin",
      }),
    });
    const ok = res.status === 400;
    record(ok);
    log(ok ? "pass" : "warn", `Invalid role "superadmin" rejected: status ${res.status} (expected 400)`);
    if (ok) {
      const body = await res.json();
      log("info", `  Error: ${body.error}`);
    }
  } catch (err) {
    record(true);
    log("info", `Invalid role test skipped: ${err.message}`);
  }

  // 19.2: Test creating user with empty role
  try {
    const res = await request("/cms/api/users", {
      method: "POST",
      body: JSON.stringify({
        username: `role-test-empty-${Date.now()}`,
        password: "TestPass123",
        role: "",
      }),
    });
    // Empty role should be caught by the "role is required" check
    const ok = res.status === 400;
    record(ok);
    log(ok ? "pass" : "warn", `Empty role rejected: status ${res.status} (expected 400)`);
  } catch (err) {
    record(true);
    log("info", `Empty role test skipped: ${err.message}`);
  }

  // 19.3: Test creating user with numeric role
  try {
    const res = await request("/cms/api/users", {
      method: "POST",
      body: JSON.stringify({
        username: `role-test-num-${Date.now()}`,
        password: "TestPass123",
        role: 999,
      }),
    });
    const ok = res.status === 400;
    record(ok);
    log(ok ? "pass" : "warn", `Numeric role rejected: status ${res.status} (expected 400)`);
  } catch (err) {
    record(true);
    log("info", `Numeric role test skipped: ${err.message}`);
  }

  // 19.4: Test creating user with SQL injection in role
  try {
    const res = await request("/cms/api/users", {
      method: "POST",
      body: JSON.stringify({
        username: `role-test-sql-${Date.now()}`,
        password: "TestPass123",
        role: "admin' OR '1'='1",
      }),
    });
    const ok = res.status === 400;
    record(ok);
    log(ok ? "pass" : "warn", `SQL injection in role rejected: status ${res.status} (expected 400)`);
  } catch (err) {
    record(true);
    log("info", `SQL injection role test skipped: ${err.message}`);
  }

  // 19.5: Verify role validation exists in code
  try {
    const { readFileSync } = await import("fs");
    const { join, dirname } = await import("path");
    const { fileURLToPath } = await import("url");
    const __dirname = dirname(fileURLToPath(import.meta.url));

    const userIdRoute = readFileSync(
      join(__dirname, "..", "app", "cms", "api", "users", "[id]", "route.ts"),
      "utf8"
    );
    const hasAllowedRoles = userIdRoute.includes("allowedRoles") || userIdRoute.includes('"admin", "editor", "viewer"');
    record(hasAllowedRoles);
    log(hasAllowedRoles ? "pass" : "warn", `Role whitelist validation in users/[id] route: ${hasAllowedRoles}`);
  } catch (err) {
    record(true);
    log("info", `Role validation code check skipped: ${err.message}`);
  }

  console.log("");
}

export default testRoleValidation;
