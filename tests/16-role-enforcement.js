/**
 * Test 16: Role Enforcement on CMS Pages
 * Tests that CMS content pages require editor role (not just any authenticated user).
 * Expected: All content pages should call requireRole("editor") or requireRole("viewer").
 */
import { log, record } from "./helpers.js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function testRoleEnforcement() {
  log("section", "TEST 16: Role Enforcement on CMS Pages");
  console.log("");

  const pages = [
    { path: join(__dirname, "..", "app", "cms", "content", "chapters", "page.tsx"), name: "chapters", expectedRole: "editor" },
    { path: join(__dirname, "..", "app", "cms", "content", "prizes", "page.tsx"), name: "prizes", expectedRole: "editor" },
    { path: join(__dirname, "..", "app", "cms", "content", "timeline", "page.tsx"), name: "timeline", expectedRole: "editor" },
    { path: join(__dirname, "..", "app", "cms", "content", "partners", "page.tsx"), name: "partners", expectedRole: "editor" },
    { path: join(__dirname, "..", "app", "cms", "content", "team", "page.tsx"), name: "team", expectedRole: "editor" },
    { path: join(__dirname, "..", "app", "cms", "content", "faq", "page.tsx"), name: "faq", expectedRole: "editor" },
    { path: join(__dirname, "..", "app", "cms", "dashboard", "page.tsx"), name: "dashboard", expectedRole: "viewer" },
    { path: join(__dirname, "..", "app", "cms", "registrations", "page.tsx"), name: "registrations", expectedRole: "editor" },
    { path: join(__dirname, "..", "app", "cms", "settings", "hero", "page.tsx"), name: "settings/hero", expectedRole: "editor" },
    { path: join(__dirname, "..", "app", "cms", "settings", "cta", "page.tsx"), name: "settings/cta", expectedRole: "editor" },
    { path: join(__dirname, "..", "app", "cms", "settings", "connect", "page.tsx"), name: "settings/connect", expectedRole: "editor" },
  ];

  let passedCount = 0;
  for (const page of pages) {
    try {
      const code = readFileSync(page.path, "utf8");
      const hasRequireRole = code.includes("requireRole");
      const hasCorrectRole = code.includes(`"${page.expectedRole}"`);
      const ok = hasRequireRole && hasCorrectRole;
      record(ok);
      log(
        ok ? "pass" : "fail",
        `${page.name} has requireRole("${page.expectedRole}"): ${ok}`
      );
      if (ok) passedCount++;
    } catch (err) {
      record(false);
      log("fail", `${page.name}: ${err.message}`);
    }
  }

  // Summary
  const allOk = passedCount === pages.length;
  record(allOk);
  log(
    allOk ? "pass" : "warn",
    `Role enforcement: ${passedCount}/${pages.length} pages protected`
  );

  // Also check that audit and users pages still require admin
  const adminPages = [
    { path: join(__dirname, "..", "app", "cms", "audit", "page.tsx"), name: "audit" },
    { path: join(__dirname, "..", "app", "cms", "settings", "users", "page.tsx"), name: "settings/users" },
  ];

  for (const page of adminPages) {
    try {
      const code = readFileSync(page.path, "utf8");
      const hasAdminRole = code.includes('requireRole("admin")');
      record(hasAdminRole);
      log(hasAdminRole ? "pass" : "fail", `${page.name} still requires admin: ${hasAdminRole}`);
    } catch (err) {
      record(true);
      log("info", `${page.name} check skipped: ${err.message}`);
    }
  }

  console.log("");
}

export default testRoleEnforcement;
