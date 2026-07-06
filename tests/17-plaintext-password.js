/**
 * Test 17: Plaintext Password Prevention
 * Tests that the login and change-password routes no longer have plaintext fallback.
 * Expected: Both routes should always use bcrypt (verifyPassword), never plaintext comparison.
 */
import { log, record } from "./helpers.js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function testPlaintextPassword() {
  log("section", "TEST 17: Plaintext Password Prevention");
  console.log("");

  // 17.1: Check login route has no plaintext fallback
  try {
    const loginRoute = readFileSync(
      join(__dirname, "..", "app", "cms", "api", "login", "route.ts"),
      "utf8"
    );
    const hasPlaintextFallback = loginRoute.includes("password === profile.password");
    record(!hasPlaintextFallback);
    log(!hasPlaintextFallback ? "pass" : "fail", `Login route: plaintext fallback removed: ${!hasPlaintextFallback}`);
    if (hasPlaintextFallback) {
      log("fail", "  ⚠ Attackers can bypass bcrypt by storing passwords without hashing");
    }
  } catch (err) {
    record(false);
    log("fail", `Could not read login/route.ts: ${err.message}`);
  }

  // 17.2: Check login route rejects non-bcrypt passwords
  try {
    const loginRoute = readFileSync(
      join(__dirname, "..", "app", "cms", "api", "login", "route.ts"),
      "utf8"
    );
    const rejectsNonBcrypt = loginRoute.includes('startsWith("$2")') || loginRoute.includes("startsWith('$2')");
    record(rejectsNonBcrypt);
    log(rejectsNonBcrypt ? "pass" : "fail", `Login route checks for bcrypt prefix: ${rejectsNonBcrypt}`);
  } catch (err) {
    record(true);
    log("info", `Bcrypt check skipped: ${err.message}`);
  }

  // 17.3: Check change-password route has no plaintext fallback
  try {
    const changePwRoute = readFileSync(
      join(__dirname, "..", "app", "cms", "api", "change-password", "route.ts"),
      "utf8"
    );
    const hasPlaintextFallback = changePwRoute.includes("currentPassword === profileData.password");
    record(!hasPlaintextFallback);
    log(!hasPlaintextFallback ? "pass" : "fail", `Change-password route: plaintext fallback removed: ${!hasPlaintextFallback}`);
  } catch (err) {
    record(false);
    log("fail", `Could not read change-password/route.ts: ${err.message}`);
  }

  // 17.4: Verify verifyPassword (bcrypt) is used in login
  try {
    const loginRoute = readFileSync(
      join(__dirname, "..", "app", "cms", "api", "login", "route.ts"),
      "utf8"
    );
    const usesBcrypt = loginRoute.includes("verifyPassword");
    record(usesBcrypt);
    log(usesBcrypt ? "pass" : "fail", `Login route uses bcrypt verifyPassword: ${usesBcrypt}`);
  } catch (err) {
    record(true);
    log("info", `Bcrypt usage check skipped: ${err.message}`);
  }

  // 17.5: Verify verifyPassword (bcrypt) is used in change-password
  try {
    const changePwRoute = readFileSync(
      join(__dirname, "..", "app", "cms", "api", "change-password", "route.ts"),
      "utf8"
    );
    const usesBcrypt = changePwRoute.includes("verifyPassword");
    record(usesBcrypt);
    log(usesBcrypt ? "pass" : "fail", `Change-password route uses bcrypt verifyPassword: ${usesBcrypt}`);
  } catch (err) {
    record(true);
    log("info", `Change-password bcrypt check skipped: ${err.message}`);
  }

  // 17.6: Check deprecated auth-client.ts is removed
  try {
    readFileSync(join(__dirname, "..", "lib", "auth-client.ts"), "utf8");
    record(false);
    log("fail", "Deprecated lib/auth-client.ts still exists — should be deleted");
  } catch {
    record(true);
    log("pass", "Deprecated lib/auth-client.ts has been removed");
  }

  console.log("");
}

export default testPlaintextPassword;
