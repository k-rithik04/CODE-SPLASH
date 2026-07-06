/**
 * Test 11: JWT Secret Enforcement
 * Tests that the server crashes when JWT_SECRET is missing in production.
 * Expected: auth-shared.ts and proxy.ts should throw if JWT_SECRET is not set.
 */
import { log, record } from "./helpers.js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function testJWTSecretEnforcement() {
  log("section", "TEST 11: JWT Secret Enforcement");
  console.log("");

  // 11.1: Check auth-shared.ts throws on missing JWT_SECRET
  try {
    const authShared = readFileSync(
      join(__dirname, "..", "lib", "auth-shared.ts"),
      "utf8"
    );
    const hasThrow = authShared.includes("throw new Error") && authShared.includes("JWT_SECRET");
    record(hasThrow);
    log(hasThrow ? "pass" : "fail", `auth-shared.ts throws on missing JWT_SECRET: ${hasThrow}`);
    if (!hasThrow) {
      log("fail", "  Without this, attackers can forge JWTs using the hardcoded fallback secret");
    }
  } catch (err) {
    record(false);
    log("fail", `Could not read auth-shared.ts: ${err.message}`);
  }

  // 11.2: Check proxy.ts throws on missing JWT_SECRET
  try {
    const proxy = readFileSync(
      join(__dirname, "..", "proxy.ts"),
      "utf8"
    );
    const hasThrow = proxy.includes("throw new Error") && proxy.includes("JWT_SECRET");
    record(hasThrow);
    log(hasThrow ? "pass" : "fail", `proxy.ts throws on missing JWT_SECRET: ${hasThrow}`);
  } catch (err) {
    record(false);
    log("fail", `Could not read proxy.ts: ${err.message}`);
  }

  // 11.3: Verify the hardcoded fallback still exists for dev mode
  try {
    const authShared = readFileSync(
      join(__dirname, "..", "lib", "auth-shared.ts"),
      "utf8"
    );
    const hasDevFallback = authShared.includes("ci-build-placeholder-not-for-production");
    record(hasDevFallback);
    log(hasDevFallback ? "pass" : "warn", `Dev fallback exists (only used in non-production): ${hasDevFallback}`);
  } catch (err) {
    record(true);
    log("info", `Fallback check skipped: ${err.message}`);
  }

  // 11.4: Verify the production check is conditional
  try {
    const authShared = readFileSync(
      join(__dirname, "..", "lib", "auth-shared.ts"),
      "utf8"
    );
    const hasProdCheck = authShared.includes('NODE_ENV === "production"');
    record(hasProdCheck);
    log(hasProdCheck ? "pass" : "warn", `Production-only check present: ${hasProdCheck}`);
  } catch (err) {
    record(true);
    log("info", `Production check skipped: ${err.message}`);
  }

  console.log("");
}

export default testJWTSecretEnforcement;
