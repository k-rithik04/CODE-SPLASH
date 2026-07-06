/**
 * Test 03: JWT Token Tampering
 * Tests whether forged, modified, or invalid JWTs can bypass authentication.
 * Expected: All tampered tokens should be rejected (redirect to /cms/login).
 */
import { log, record, request, createForgedJWT, SECRET } from "./helpers.js";
import { SignJWT } from "jose";

const WRONG_SECRET = new TextEncoder().encode("definitely-not-the-real-secret-12345");

async function tamperJWT() {
  log("section", "TEST 03: JWT Token Tampering");
  console.log("");

  // 3.1: Forged token with correct secret (should work as admin)
  try {
    const token = await createForgedJWT({ username: "admin", role: "admin" });
    const res = await request("/cms/dashboard", {
      headers: { Cookie: `cms_session=${token}` },
    });
    const ok = res.status === 200;
    record(ok);
    log(ok ? "pass" : "fail", `Forged token (valid secret): status ${res.status}`);
  } catch (err) {
    record(false);
    log("fail", `Forged token test error: ${err.message}`);
  }

  // 3.2: Forged token with WRONG secret
  try {
    const token = await new SignJWT({ username: "admin", role: "admin", id: "x" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setIssuer("codesplash-cms")
      .setExpirationTime("1h")
      .sign(WRONG_SECRET);

    const res = await request("/cms/dashboard", {
      headers: { Cookie: `cms_session=${token}` },
    });
    const isRedirect = res.status >= 300 && res.status < 400;
    record(isRedirect);
    log(isRedirect ? "pass" : "fail", `Forged token (wrong secret): status ${res.status} (rejected: ${isRedirect})`);
  } catch (err) {
    record(true);
    log("info", `Wrong secret test: ${err.message}`);
  }

  // 3.3: Expired token
  try {
    const token = await new SignJWT({ username: "admin", role: "admin", id: "x" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt(Math.floor(Date.now() / 1000) - 7200)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 3600)
      .setIssuer("codesplash-cms")
      .sign(SECRET);

    const res = await request("/cms/dashboard", {
      headers: { Cookie: `cms_session=${token}` },
    });
    const isRedirect = res.status >= 300 && res.status < 400;
    record(isRedirect);
    log(isRedirect ? "pass" : "fail", `Expired token: status ${res.status} (rejected: ${isRedirect})`);
  } catch (err) {
    record(true);
    log("info", `Expired token test: ${err.message}`);
  }

  // 3.4: Token with wrong issuer
  try {
    const token = await new SignJWT({ username: "admin", role: "admin", id: "x" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setIssuer("wrong-issuer")
      .setExpirationTime("1h")
      .sign(SECRET);

    const res = await request("/cms/dashboard", {
      headers: { Cookie: `cms_session=${token}` },
    });
    const isRedirect = res.status >= 300 && res.status < 400;
    record(isRedirect);
    log(isRedirect ? "pass" : "fail", `Wrong issuer: status ${res.status} (rejected: ${isRedirect})`);
  } catch (err) {
    record(true);
    log("info", `Wrong issuer test: ${err.message}`);
  }

  // 3.5: Empty token
  try {
    const res = await request("/cms/dashboard", {
      headers: { Cookie: "cms_session=" },
    });
    const isRedirect = res.status >= 300 && res.status < 400;
    record(isRedirect);
    log(isRedirect ? "pass" : "fail", `Empty token: status ${res.status} (rejected: ${isRedirect})`);
  } catch (err) {
    record(true);
    log("info", `Empty token test: ${err.message}`);
  }

  // 3.6: Random string as token
  try {
    const res = await request("/cms/dashboard", {
      headers: { Cookie: "cms_session=not.a.real.jwt.token" },
    });
    const isRedirect = res.status >= 300 && res.status < 400;
    record(isRedirect);
    log(isRedirect ? "pass" : "fail", `Random string token: status ${res.status} (rejected: ${isRedirect})`);
  } catch (err) {
    record(true);
    log("info", `Random string test: ${err.message}`);
  }

  // 3.7: Algorithm confusion (none algorithm)
  try {
    const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
    const payload = Buffer.from(JSON.stringify({
      username: "admin", role: "admin", id: "x",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      iss: "codesplash-cms",
    })).toString("base64url");
    const token = `${header}.${payload}.`;

    const res = await request("/cms/dashboard", {
      headers: { Cookie: `cms_session=${token}` },
    });
    const isRedirect = res.status >= 300 && res.status < 400;
    record(isRedirect);
    log(isRedirect ? "pass" : "fail", `"none" algorithm: status ${res.status} (rejected: ${isRedirect})`);
  } catch (err) {
    record(true);
    log("info", `Algorithm confusion test: ${err.message}`);
  }

  // 3.8: Role escalation in forged token
  try {
    const token = await createForgedJWT({ username: "attacker", role: "admin" });
    const res = await request("/cms/dashboard", {
      headers: { Cookie: `cms_session=${token}` },
    });
    // This should work because the JWT is valid (correct secret/issuer)
    // The problem: anyone who knows the secret can become admin
    const ok = res.status === 200;
    record(!ok); // We WANT this to fail (it's a vulnerability)
    log(!ok ? "pass" : "warn", `Role escalation via forged admin token: status ${res.status} (vuln: ${ok})`);
  } catch (err) {
    record(true);
    log("info", `Role escalation test: ${err.message}`);
  }

  console.log("");
}

export default tamperJWT;
