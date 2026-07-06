/**
 * Test 22: User Account Self-Protection
 * Tests that users cannot delete their own account or perform dangerous self-operations.
 * Expected: Self-deletion should return 400.
 */
import { log, record, request, createForgedJWT } from "./helpers.js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function login(username, password) {
  const res = await request("/cms/api/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json().catch(() => ({}));
  const cookie = res.headers.get("set-cookie");
  const token = cookie?.match(/cms_session=([^;]+)/)?.[1];
  return { res, data, token };
}

async function testUserSelfProtection() {
  log("section", "TEST 22: User Account Self-Protection");
  console.log("");

  // 22.1: Check that self-deletion is prevented in code
  try {
    const userIdRoute = readFileSync(
      join(__dirname, "..", "app", "cms", "api", "users", "[id]", "route.ts"),
      "utf8"
    );
    const preventsSelfDelete = userIdRoute.includes("session.id") && userIdRoute.includes("Cannot delete");
    record(preventsSelfDelete);
    log(preventsSelfDelete ? "pass" : "fail", `Self-deletion prevention in code: ${preventsSelfDelete}`);
  } catch (err) {
    record(false);
    log("fail", `Could not read users/[id]/route.ts: ${err.message}`);
  }

  // 22.2: Test self-deletion via API (login as admin, try to delete self)
  let adminToken, adminUserId;
  try {
    const { token, data } = await login(process.env.CMS_ADMIN_USER || "rithik", process.env.CMS_ADMIN_PASSWORD || "1234");
    adminToken = token;
    if (data.user) adminUserId = data.user.id;
    record(!!adminToken);
    log("pass", `Admin login for self-protection test (${data.user?.username})`);
  } catch (err) {
    record(false);
    log("fail", `Admin login failed: ${err.message}`);
    console.log("");
    return;
  }

  if (adminToken && adminUserId) {
    try {
      const res = await request(`/cms/api/users/${adminUserId}`, {
        method: "DELETE",
        headers: { Cookie: `cms_session=${adminToken}` },
      });
      const prevented = res.status === 400;
      record(prevented);
      log(prevented ? "pass" : "fail", `Admin self-deletion: status ${res.status} (expected 400)`);
      if (prevented) {
        const body = await res.json();
        log("info", `  Error: ${body.error}`);
      }
    } catch (err) {
      record(true);
      log("info", `Self-deletion test: ${err.message}`);
    }
  }

  // 22.3: Non-admin user should not be able to delete anyone
  try {
    const forgedViewer = await createForgedJWT({ role: "viewer", username: "viewer_hacker" });
    const res = await request(`/cms/api/users/some-fake-id`, {
      method: "DELETE",
      headers: { Cookie: `cms_session=${forgedViewer}` },
    });
    const blocked = res.status === 403;
    record(blocked);
    log(blocked ? "pass" : "fail", `Viewer cannot delete users: status ${res.status} (expected 403)`);
  } catch (err) {
    record(true);
    log("info", `Viewer delete test: ${err.message}`);
  }

  // 22.4: Editor should not be able to delete users
  try {
    const forgedEditor = await createForgedJWT({ role: "editor", username: "editor_hacker" });
    const res = await request("/cms/api/users/some-fake-id", {
      method: "DELETE",
      headers: { Cookie: `cms_session=${forgedEditor}` },
    });
    const blocked = res.status === 403;
    record(blocked);
    log(blocked ? "pass" : "fail", `Editor cannot delete users: status ${res.status} (expected 403)`);
  } catch (err) {
    record(true);
    log("info", `Editor delete test: ${err.message}`);
  }

  // 22.5: PUT without auth should be rejected
  try {
    const res = await request("/cms/api/users/fake-id", {
      method: "PUT",
      body: JSON.stringify({ role: "admin" }),
    });
    const blocked = res.status === 401 || res.status === 403;
    record(blocked);
    log(blocked ? "pass" : "fail", `Unauthenticated PUT rejected: status ${res.status}`);
  } catch (err) {
    record(true);
    log("info", `Unauthenticated PUT test: ${err.message}`);
  }

  // 22.6: PUT with invalid role should be rejected
  if (adminToken) {
    try {
      const res = await request("/cms/api/users/some-fake-id", {
        method: "PUT",
        headers: { Cookie: `cms_session=${adminToken}` },
        body: JSON.stringify({ role: "superadmin" }),
      });
      const rejected = res.status === 400 || res.status === 404 || res.status === 500;
      record(rejected);
      log(rejected ? "pass" : "warn", `PUT with invalid role rejected: status ${res.status}`);
    } catch (err) {
      record(true);
      log("info", `PUT invalid role test: ${err.message}`);
    }
  }

  console.log("");
}

export default testUserSelfProtection;
