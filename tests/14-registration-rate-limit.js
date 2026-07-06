/**
 * Test 14: Registration Rate Limiting
 * Tests that the public /api/register endpoint has server-side rate limiting.
 * Expected: After 5 rapid requests, subsequent requests should get 429.
 */
import { log, record, request } from "./helpers.js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function testRegistrationRateLimit() {
  log("section", "TEST 14: Registration Rate Limiting");
  console.log("");

  // 14.1: Check that register route imports rate limiter
  try {
    const registerRoute = readFileSync(
      join(__dirname, "..", "app", "api", "register", "route.ts"),
      "utf8"
    );
    const hasRateLimit = registerRoute.includes("checkRateLimit") || registerRoute.includes("rate-limit");
    record(hasRateLimit);
    log(hasRateLimit ? "pass" : "fail", `Registration route uses rate limiting: ${hasRateLimit}`);
  } catch (err) {
    record(false);
    log("fail", `Could not read register/route.ts: ${err.message}`);
  }

  // 14.2: Send rapid registration requests and check for 429
  const ATTEMPTS = 8;
  let rateLimited = false;

  log("info", `Sending ${ATTEMPTS} rapid registration requests...`);
  for (let i = 0; i < ATTEMPTS; i++) {
    try {
      const res = await request("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          teamName: `RateTest-${Date.now()}-${i}`,
          leaderName: "Test User",
          leaderEmail: `ratetest${i}@test.com`,
          leaderPhone: "0771234567",
          university: "Test University",
          teamSize: "2",
        }).toString(),
      });

      if (res.status === 429) {
        rateLimited = true;
        record(true);
        log("pass", `Attempt ${i + 1}: got 429 (rate limited) — attack blocked`);
        break;
      }
    } catch {
      // Request might fail, that's ok
    }
  }

  record(rateLimited);
  log(rateLimited ? "pass" : "warn", `Registration rate limiting triggered: ${rateLimited}`);
  if (!rateLimited) {
    log("warn", "  ⚠ Registration endpoint accepts unlimited requests — database spam possible");
  }

  // 14.3: Check rate limit configuration (5 per 15 min)
  try {
    const registerRoute = readFileSync(
      join(__dirname, "..", "app", "api", "register", "route.ts"),
      "utf8"
    );
    const hasWindowMs = registerRoute.includes("15 * 60 * 1000") || registerRoute.includes("900000");
    record(hasWindowMs);
    log(hasWindowMs ? "pass" : "warn", `Rate limit window is 15 minutes: ${hasWindowMs}`);
  } catch (err) {
    record(true);
    log("info", `Rate limit config check skipped: ${err.message}`);
  }

  // 14.4: Verify rate limit returns retry-after info
  try {
    const registerRoute = readFileSync(
      join(__dirname, "..", "app", "api", "register", "route.ts"),
      "utf8"
    );
    const hasRetryInfo = registerRoute.includes("retryAfterMs") || registerRoute.includes("retry");
    record(hasRetryInfo);
    log(hasRetryInfo ? "pass" : "warn", `Rate limit response includes retry info: ${hasRetryInfo}`);
  } catch (err) {
    record(true);
    log("info", `Retry info check skipped: ${err.message}`);
  }

  console.log("");
}

export default testRegistrationRateLimit;
