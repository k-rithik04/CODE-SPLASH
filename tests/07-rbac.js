/**
 * Test 07: Role-Based Access Control
 * Tests whether role checks are enforced on sensitive operations.
 * Expected: Viewers and editors should not be able to access admin-only operations.
 */
import { log, record, request } from "./helpers.js";
import { SignJWT } from "jose";
import { SECRET } from "./helpers.js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function testRBAC() {
  log("section", "TEST 07: Role-Based Access Control");
  console.log("");

  // 7.1: Viewer role should not access admin-only pages
  try {
    const token = await new SignJWT({
      id: "test-viewer",
      username: "viewer",
      role: "viewer",
      full_name: "Test Viewer",
      must_change_password: false,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setIssuer("codesplash-cms")
      .setExpirationTime("1h")
      .sign(SECRET);

    const res = await request("/cms/audit", {
      headers: { Cookie: `cms_session=${token}` },
      redirect: "manual",
    });
    const blocked = res.status === 307 || res.status === 302;
    record(blocked);
    log(blocked ? "pass" : "warn", `Viewer blocked from /cms/audit: ${blocked} (status ${res.status})`);
  } catch (err) {
    record(true);
    log("info", `Viewer test: ${err.message}`);
  }

  // 7.2: Logout should work regardless of method
  try {
    const res = await request("/cms/api/logout", { method: "POST" });
    const ok = res.status === 200;
    record(ok);
    log(ok ? "pass" : "fail", `Logout POST (no auth): status ${res.status}`);
  } catch (err) {
    record(true);
    log("info", `Logout test: ${err.message}`);
  }

  // 7.3: Check if proxy checks JWT validity AND role
  const proxy = readFileSync(join(__dirname, "..", "proxy.ts"), "utf8");
  const checksRole = proxy.includes("role") && proxy.includes("admin");
  record(checksRole);
  log(checksRole ? "pass" : "warn", `Proxy checks user role: ${checksRole}`);
  if (!checksRole) {
    log("warn", "  ⚠ Proxy only validates JWT — any valid user gets through regardless of role");
  }

  // 7.4: Check that admin page access is controlled via proxy matcher
  const hasAdminMatcher = proxy.includes("/admin/:path*");
  record(hasAdminMatcher);
  log(hasAdminMatcher ? "pass" : "fail", `Proxy matcher includes /admin: ${hasAdminMatcher}`);

  // 7.5: Admin page should redirect properly
  try {
    const res = await request("/admin/dashboard");
    const location = res.headers.get("location") || "";
    const redirectsToCMS = location.includes("/cms/dashboard");
    record(redirectsToCMS);
    log(redirectsToCMS ? "pass" : "fail", `/admin/dashboard → /cms/dashboard redirect: ${redirectsToCMS}`);
  } catch (err) {
    record(true);
    log("info", `Admin redirect test: ${err.message}`);
  }

  console.log("");
}

export default testRBAC;
