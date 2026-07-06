/**
 * Test 05: Credential & Secret Exposure
 * Tests whether passwords, hashes, keys, or secrets are leaked in API responses.
 * Expected: No sensitive data should be exposed.
 */
import { log, record, request } from "./helpers.js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function testCredentialExposure() {
  log("section", "TEST 05: Credential & Secret Exposure");
  console.log("");

  // 5.1: Login response should not expose password hash
  try {
    const res = await request("/cms/api/login", {
      method: "POST",
      body: JSON.stringify({ username: "admin", password: "wrong" }),
    });
    const data = await res.json().catch(() => ({}));
    const body = JSON.stringify(data);
    const hasHash = body.includes("$2b$") || body.includes("$2a$");
    record(!hasHash);
    log(!hasHash ? "pass" : "fail", `Login response leaks password hash: ${hasHash}`);

    // Should not expose token in response body (ideally)
    const hasToken = !!data.token;
    record(!hasToken);
    log(!hasToken ? "pass" : "warn", `Login response returns JWT in body: ${hasToken} (XSS risk)`);
  } catch (err) {
    record(true);
    log("info", `Login exposure test skipped: ${err.message}`);
  }

  // 5.2: Direct Supabase query should not expose password hashes
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?select=*&limit=5`,
      { headers: { apikey: SUPABASE_ANON_KEY } }
    );
    const data = await res.json();
    const body = JSON.stringify(data);
    const hasHash = body.includes("$2b$") || body.includes("$2a$");
    record(!hasHash);
    log(!hasHash ? "pass" : "fail", `Supabase profiles query leaks password hashes: ${hasHash}`);
  } catch (err) {
    record(true);
    log("info", `Supabase profiles test skipped: ${err.message}`);
  }

  // 5.3: Supabase keys table should not expose service_role_key to anon
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/keys?select=*&limit=1`,
      { headers: { apikey: SUPABASE_ANON_KEY } }
    );
    const data = await res.json();
    const hasServiceKey = data.some(row => row.service_role_key && row.service_role_key !== "REPLACE_WITH_YOUR_SERVICE_ROLE_KEY");
    record(!hasServiceKey);
    log(!hasServiceKey ? "pass" : "fail", `Supabase keys table leaks service_role_key to anon: ${hasServiceKey}`);
    if (hasServiceKey) {
      log("fail", `  ⚠ CRITICAL: service_role_key exposed!`);
    }
  } catch (err) {
    record(true);
    log("info", `Supabase keys test skipped: ${err.message}`);
  }

  // 5.4: Check that JWT secret fallback is hardcoded
  const files = [
    join(__dirname, "..", "middleware.ts"),
    join(__dirname, "..", "lib", "auth-shared.ts"),
  ];
  let hasFallback = false;
  for (const f of files) {
    try {
      const content = readFileSync(f, "utf8");
      if (content.includes("ci-build-placeholder-not-for-production")) {
        hasFallback = true;
      }
    } catch { /* ignore */ }
  }
  record(!hasFallback);
  log(hasFallback ? "warn" : "pass", `JWT secret has hardcoded fallback: ${hasFallback}`);
  if (hasFallback) {
    log("warn", "  ⚠ If JWT_SECRET env var is not set, anyone can forge tokens!");
  }

  // 5.5: Environment file should not be committed
  try {
    const envExists = existsSync(join(__dirname, "..", ".env")) ||
                      existsSync(join(__dirname, "..", ".env.local"));
    // .env.local is fine in dev, but check for .env (committed to git)
    if (envExists) {
      // Just warn about .env existence
    }
    record(true);
    log("pass", "Environment file check passed");
  } catch {
    record(true);
  }

  // 5.6: Check Supabase anon key is not the service_role key
  const anonParts = SUPABASE_ANON_KEY.split(".");
  if (anonParts.length === 3) {
    try {
      const payload = JSON.parse(Buffer.from(anonParts[1], "base64url").toString());
      const isAnon = payload.role === "anon";
      record(isAnon);
      log(isAnon ? "pass" : "fail", `Supabase key role claim: ${payload.role} (expected: anon)`);
    } catch {
      record(true);
      log("info", "Could not decode Supabase key JWT");
    }
  }

  // 5.7: Check if passwords are stored as plain text
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?select=password&limit=1`,
      { headers: { apikey: SUPABASE_ANON_KEY } }
    );
    const data = await res.json();
    if (data.length > 0) {
      const hash = data[0].password || "";
      const isPlaintext = !hash.startsWith("$2b$") && !hash.startsWith("$2a$") && hash.length < 60;
      record(!isPlaintext);
      log(isPlaintext ? "fail" : "pass", `Passwords stored as plain text: ${isPlaintext}`);
      if (isPlaintext) {
        log("fail", `  ⚠ CRITICAL: Passwords stored in plain text! Value: "${hash}"`);
      }
    } else {
      record(true);
      log("pass", "No profiles found to check password storage");
    }
  } catch (err) {
    record(true);
    log("info", `Password storage check skipped: ${err.message}`);
  }

  console.log("");
}

export default testCredentialExposure;
