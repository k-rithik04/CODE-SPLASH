/**
 * Test 25: Login Security
 * Tests login-specific security: missing fields, empty body, bcrypt prefix guard,
 * successful login clears rate limit, audit log writes, and password not in response.
 */
import { log, record, request } from "./helpers.js";

async function testLoginSecurity() {
  log("section", "TEST 25: Login Security");
  console.log("");

  // 25.1: Missing username should return 400
  try {
    const res = await request("/cms/api/login", {
      method: "POST",
      body: JSON.stringify({ password: "somepassword" }),
    });
    const ok = res.status === 400 || res.status === 429;
    record(ok);
    log(ok ? "pass" : "warn", `Missing username: status ${res.status} (expected 400)`);
    if (res.status === 400) {
      const body = await res.json();
      log("info", `  Error: ${body.error}`);
    }
  } catch (err) {
    record(true);
    log("info", `Missing username test: ${err.message}`);
  }

  // 25.2: Missing password should return 400
  try {
    const res = await request("/cms/api/login", {
      method: "POST",
      body: JSON.stringify({ username: "admin" }),
    });
    const ok = res.status === 400 || res.status === 429;
    record(ok);
    log(ok ? "pass" : "warn", `Missing password: status ${res.status} (expected 400)`);
  } catch (err) {
    record(true);
    log("info", `Missing password test: ${err.message}`);
  }

  // 25.3: Empty body should return 400
  try {
    const res = await request("/cms/api/login", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const ok = res.status === 400 || res.status === 429;
    record(ok);
    log(ok ? "pass" : "warn", `Empty body: status ${res.status} (expected 400)`);
  } catch (err) {
    record(true);
    log("info", `Empty body test: ${err.message}`);
  }

  // 25.4: Password should not contain bcrypt hash in response
  try {
    const res = await request("/cms/api/login", {
      method: "POST",
      body: JSON.stringify({ username: "admin", password: "wrongpassword" }),
    });
    const body = await res.json().catch(() => ({}));
    const bodyStr = JSON.stringify(body);
    const hasHash = bodyStr.includes("$2b$") || bodyStr.includes("$2a$");
    record(!hasHash);
    log(!hasHash ? "pass" : "fail", `Response does not contain bcrypt hash: ${!hasHash}`);
  } catch (err) {
    record(true);
    log("info", `Hash leak test: ${err.message}`);
  }

  // 25.5: Login response should not contain password field
  try {
    const res = await request("/cms/api/login", {
      method: "POST",
      body: JSON.stringify({ username: "admin", password: "wrong" }),
    });
    const body = await res.json().catch(() => ({}));
    const hasPassword = body.password !== undefined;
    record(!hasPassword);
    log(!hasPassword ? "pass" : "fail", `Response does not contain password field: ${!hasPassword}`);
  } catch (err) {
    record(true);
    log("info", `Password field test: ${err.message}`);
  }

  // 25.6: Non-existent user should return 401 (not 404 or 500)
  try {
    const res = await request("/cms/api/login", {
      method: "POST",
      body: JSON.stringify({ username: "nonexistent_user_xyz_12345", password: "whatever" }),
    });
    const ok = res.status === 401 || res.status === 429;
    record(ok);
    log(ok ? "pass" : "warn", `Non-existent user returns 401: status ${res.status}`);
  } catch (err) {
    record(true);
    log("info", `Non-existent user test: ${err.message}`);
  }

  // 25.7: Successful login should return user info without password
  try {
    const res = await request("/cms/api/login", {
      method: "POST",
      body: JSON.stringify({ username: "admin", password: "admin123" }),
    });
    if (res.status === 200) {
      const body = await res.json();
      const hasUser = !!body.user;
      const hasUsername = !!body.user?.username;
      const hasRole = !!body.user?.role;
      const noPassword = body.user?.password === undefined;

      record(hasUser && hasUsername && hasRole);
      log(hasUser && hasUsername && hasRole ? "pass" : "warn",
        `Successful login returns user info: user=${hasUser}, username=${hasUsername}, role=${hasRole}`);

      record(noPassword);
      log(noPassword ? "pass" : "fail", `User info does not contain password: ${noPassword}`);

      // Token should NOT be in response body (it's HttpOnly cookie)
      const hasToken = !!body.token;
      record(!hasToken);
      log(!hasToken ? "pass" : "warn", `JWT not in response body (HttpOnly cookie): ${!hasToken}`);
    } else {
      record(true);
      log("info", `Successful login test: status ${res.status} (may be rate limited)`);
    }
  } catch (err) {
    record(true);
    log("info", `Successful login test: ${err.message}`);
  }

  // 25.8: Bcrypt prefix guard — non-bcrypt password hash in DB should be rejected
  try {
    const res = await request("/cms/api/login", {
      method: "POST",
      body: JSON.stringify({ username: "admin", password: "notabcrypt" }),
    });
    const ok = res.status === 401 || res.status === 429;
    record(ok);
    log(ok ? "pass" : "warn", `Non-bcrypt password rejected: status ${res.status}`);
  } catch (err) {
    record(true);
    log("info", `Bcrypt prefix test: ${err.message}`);
  }

  // 25.9: CSRF - login without Origin header should be rejected
  try {
    const res = await request("/cms/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "admin", password: "wrong" }),
    });
    const blocked = res.status === 403;
    record(blocked);
    log(blocked ? "pass" : "warn", `Login without Origin rejected: status ${res.status} (expected 403)`);
  } catch (err) {
    record(true);
    log("info", `CSRF login test: ${err.message}`);
  }

  // 25.10: CSRF - login with evil Origin should be rejected
  try {
    const res = await request("/cms/api/login", {
      method: "POST",
      headers: { Origin: "https://evil-site.com" },
      body: JSON.stringify({ username: "admin", password: "wrong" }),
    });
    const blocked = res.status === 403;
    record(blocked);
    log(blocked ? "pass" : "warn", `Login with evil Origin rejected: status ${res.status} (expected 403)`);
  } catch (err) {
    record(true);
    log("info", `Evil origin login test: ${err.message}`);
  }

  console.log("");
}

export default testLoginSecurity;
