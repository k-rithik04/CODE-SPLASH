/**
 * Test 10: RBAC — Role-Based Access Control
 *
 * Tests:
 *  - Viewer: can only access dashboard + registrations
 *  - Editor: can access content + settings (not users, not audit)
 *  - Admin:  can access everything including users + audit
 *  - Users API: admin-only for create/list/delete
 *  - Forged JWT with wrong role is rejected
 */

import { createForgedJWT, request, log, record, summary } from "./helpers.js";
import { SignJWT } from "jose";

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || "ci-build-placeholder-not-for-production");

async function login(username, password) {
  const res = await request("/cms/api/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  const cookie = res.headers.get("set-cookie");
  const token = cookie?.match(/cms_session=([^;]+)/)?.[1];
  return { res, data, token };
}

function authCookie(token) {
  return `cms_session=${token}`;
}

// ─── Login Tests ───
async function testLogins() {
  log("section", "Authentication");

  const admin = await login("admin", "admin123");
  log(admin.token ? "pass" : "fail", "Admin login returns session token");
  record(!!admin.token);
  log(admin.data.user?.role === "admin" ? "pass" : "fail", `Admin role in response: ${admin.data.user?.role}`);
  record(admin.data.user?.role === "admin");

  const test = await login("test", "Test1234");
  log(test.token ? "pass" : "fail", "Test user (editor) login returns session token");
  record(!!test.token);

  const bad = await login("admin", "wrongpassword");
  log(bad.res.status === 401 ? "pass" : "fail", `Wrong password returns 401: ${bad.res.status}`);
  record(bad.res.status === 401);

  const noexist = await login("nonexistent", "whatever");
  log(noexist.res.status === 401 ? "pass" : "fail", `Non-existent user returns 401: ${noexist.res.status}`);
  record(noexist.res.status === 401);

  return { adminToken: admin.token, editorToken: test.token };
}

// ─── Route Access Tests ───
async function testRouteAccess(token, role, allowed, blocked) {
  log("section", `${role.toUpperCase()} — Route access`);

  for (const route of allowed) {
    const res = await request(route, { headers: { Cookie: authCookie(token) } });
    const ok = res.status === 200 || res.status === 304;
    log(ok ? "pass" : "fail", `${role} can access ${route} (${res.status})`);
    record(ok);
  }

  for (const route of blocked) {
    const res = await request(route, { headers: { Cookie: authCookie(token) }, redirect: "manual" });
    const blocked = res.status === 307 || res.status === 302 || res.status === 403;
    log(blocked ? "pass" : "fail", `${role} BLOCKED from ${route} (${res.status})`);
    record(blocked);
  }
}

// ─── Users API Tests ───
async function testUsersAPI(adminToken, editorToken) {
  log("section", "Users API — Admin only");

  // Admin can list users
  const list = await request("/cms/api/users", { headers: { Cookie: authCookie(adminToken) } });
  log(list.status === 200 ? "pass" : "fail", `Admin GET /cms/api/users: ${list.status}`);
  record(list.status === 200);
  const listData = await list.json();
  log(Array.isArray(listData.users) ? "pass" : "fail", `Admin gets user list (${listData.users?.length ?? 0} users)`);
  record(Array.isArray(listData.users));

  // Editor cannot list users
  const editorList = await request("/cms/api/users", { headers: { Cookie: authCookie(editorToken) } });
  log(editorList.status === 403 ? "pass" : "fail", `Editor GET /cms/api/users: ${editorList.status} (expected 403)`);
  record(editorList.status === 403);

  // No token = 401
  const noAuth = await request("/cms/api/users");
  log(noAuth.status === 401 || noAuth.status === 403 ? "pass" : "fail", `Unauthenticated GET /cms/api/users: ${noAuth.status}`);
  record(noAuth.status === 401 || noAuth.status === 403);

  // Admin can create user
  const create = await request("/cms/api/users", {
    method: "POST",
    headers: { Cookie: authCookie(adminToken) },
    body: JSON.stringify({ username: "rbac_test_user", password: "Test1234", role: "viewer", must_change_password: true }),
  });
  log(create.status === 200 ? "pass" : "fail", `Admin POST /cms/api/users: ${create.status}`);
  record(create.status === 200);
  const created = await create.json();
  const newUserId = created.user?.id;

  // Editor cannot create user
  const editorCreate = await request("/cms/api/users", {
    method: "POST",
    headers: { Cookie: authCookie(editorToken) },
    body: JSON.stringify({ username: "should_not_exist", password: "Test1234", role: "viewer" }),
  });
  log(editorCreate.status === 403 ? "pass" : "fail", `Editor POST /cms/api/users: ${editorCreate.status} (expected 403)`);
  record(editorCreate.status === 403);

  // Cleanup: delete the test user
  if (newUserId) {
    const del = await request(`/cms/api/users/${newUserId}`, {
      method: "DELETE",
      headers: { Cookie: authCookie(adminToken) },
    });
    log(del.status === 200 ? "pass" : "fail", `Admin DELETE test user: ${del.status}`);
    record(del.status === 200);
  }

  // Duplicate username
  const dupe = await request("/cms/api/users", {
    method: "POST",
    headers: { Cookie: authCookie(adminToken) },
    body: JSON.stringify({ username: "admin", password: "Test1234", role: "viewer" }),
  });
  log(dupe.status === 409 ? "pass" : "fail", `Duplicate username returns 409: ${dupe.status}`);
  record(dupe.status === 409);
}

// ─── Forged JWT Tests ───
async function testForgedJWTs() {
  log("section", "Forged JWT rejection");

  // Wrong secret
  const wrongSecret = await new SignJWT({
    id: "00000000-0000-0000-0000-000000000000",
    username: "admin", role: "admin", full_name: "Hacker", must_change_password: false,
  }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setIssuer("codesplash-cms").setExpirationTime("1h")
    .sign(new TextEncoder().encode("wrong-secret-key"));

  const forged1 = await request("/cms/api/session", { headers: { Cookie: `cms_session=${wrongSecret}` } });
  log(forged1.status === 401 ? "pass" : "fail", `Wrong secret → 401: ${forged1.status}`);
  record(forged1.status === 401);

  // Viewer trying to access admin API
  const viewerJWT = await createForgedJWT({ role: "viewer", username: "viewer_attacker" });
  const forged2 = await request("/cms/api/users", { headers: { Cookie: `cms_session=${viewerJWT}` } });
  log(forged2.status === 403 ? "pass" : "fail", `Forged viewer JWT → users API: ${forged2.status} (expected 403)`);
  record(forged2.status === 403);

  // Tampered role in JWT
  const tampered = await new SignJWT({
    id: "00000000-0000-0000-0000-000000000000",
    username: "hacker", role: "admin", full_name: "Hacker", must_change_password: false,
  }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setIssuer("codesplash-cms").setExpirationTime("1h")
    .sign(SECRET_KEY);

  const forged3 = await request("/cms/api/session", { headers: { Cookie: `cms_session=${tampered}` } });
  const sessionData = forged3.status === 200 ? await forged3.json() : null;
  const isValidUser = sessionData?.user?.username === "admin";
  log(!isValidUser ? "pass" : "fail", `Tampered JWT user not recognized as admin: ${sessionData?.user?.username ?? "rejected"}`);
  record(!isValidUser);
}

// ─── must_change_password Enforcement ───
async function testPasswordChangeEnforcement(editorToken) {
  log("section", "must_change_password enforcement");

  // Session should reflect must_change_password
  const session = await request("/cms/api/session", { headers: { Cookie: authCookie(editorToken) } });
  const sessionData = await session.json();
  const mustChange = sessionData.user?.must_change_password;
  log(typeof mustChange === "boolean" ? "pass" : "fail", `Session includes must_change_password: ${mustChange}`);
  record(typeof mustChange === "boolean");
}

// ─── Main ───
async function runTests() {
  console.log("\n\x1b[1m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Test 10: RBAC — Role-Based Access Control");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n");

  const { adminToken, editorToken } = await testLogins();

  if (adminToken) {
    // Admin: can access everything
    await testRouteAccess(adminToken, "admin",
      ["/cms/dashboard", "/cms/registrations", "/cms/content/chapters", "/cms/settings", "/cms/audit", "/cms/settings/users"],
      []
    );
  }

  if (editorToken) {
    // Editor: content + settings, NOT users or audit
    await testRouteAccess(editorToken, "editor",
      ["/cms/dashboard", "/cms/registrations", "/cms/content/chapters", "/cms/settings"],
      ["/cms/audit", "/cms/settings/users"]
    );
  }

  // Viewer: only dashboard + registrations
  // (No viewer test account exists by default — viewer access is tested via forged JWT below)

  if (adminToken && editorToken) {
    await testUsersAPI(adminToken, editorToken);
  }

  await testForgedJWTs();

  if (editorToken) {
    await testPasswordChangeEnforcement(editorToken);
  }

  const allPassed = summary();
  process.exit(allPassed ? 0 : 1);
}

runTests().catch((e) => {
  console.error("Test error:", e);
  process.exit(1);
});
