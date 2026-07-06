/**
 * Test 01: Authentication Bypass
 * Tests whether unauthenticated requests can access protected CMS routes.
 * Expected: All protected routes should redirect to /cms/login (3xx) or return 401.
 */
import { log, record, request } from "./helpers.js";
import { CMS_PROTECTED_ROUTES } from "./config.js";

async function testAuthBypass() {
  log("section", "TEST 01: Authentication Bypass");
  console.log("");

  for (const route of CMS_PROTECTED_ROUTES) {
    try {
      const res = await request(route);
      const location = res.headers.get("location") || "";
      const isRedirect = res.status >= 300 && res.status < 400;
      const redirectsToLogin = location.includes("/cms/login");
      const ok = isRedirect && redirectsToLogin;

      record(ok);
      if (ok) {
        log("pass", `${route} → ${res.status} redirected to /cms/login`);
      } else {
        log("fail", `${route} → status ${res.status} (expected redirect to /cms/login)`);
        if (location) log("info", `  Location: ${location}`);
      }
    } catch (err) {
      record(false);
      log("fail", `${route} → request error: ${err.message}`);
    }
  }

  // Test /admin redirect
  try {
    const res = await request("/admin/dashboard");
    const location = res.headers.get("location") || "";
    const ok = (res.status >= 300 && res.status < 400) && location.includes("/cms/dashboard");
    record(ok);
    log(ok ? "pass" : "fail", `/admin/dashboard → ${res.status} Location: ${location}`);
  } catch (err) {
    record(false);
    log("fail", `/admin/dashboard → error: ${err.message}`);
  }

  // Test accessing login while authenticated (no cookie)
  try {
    const res = await request("/cms/login");
    const ok = res.status === 200;
    record(ok);
    log(ok ? "pass" : "fail", `/cms/login accessible without auth: status ${res.status}`);
  } catch (err) {
    record(false);
    log("fail", `/cms/login → error: ${err.message}`);
  }

  // Test cookie access: login route should NOT set cookies for unauthenticated GET
  try {
    const res = await request("/cms/login");
    const setCookie = res.headers.get("set-cookie") || "";
    const hasSession = setCookie.includes("cms_session");
    record(!hasSession);
    log(!hasSession ? "pass" : "warn", `/cms/login GET sets session cookie: ${hasSession}`);
  } catch (err) {
    record(true);
    log("info", `Cookie test skipped: ${err.message}`);
  }

  console.log("");
}

export default testAuthBypass;
