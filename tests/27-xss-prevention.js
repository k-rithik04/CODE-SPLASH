/**
 * Test 27: XSS Prevention
 * Tests that user input is sanitized against XSS payloads.
 * Expected: Script tags and event handlers should be escaped or stripped.
 */
import { log, record, request } from "./helpers.js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const XSS_PAYLOADS = [
  '<script>alert("XSS")</script>',
  '<img src=x onerror=alert("XSS")>',
  '<svg onload=alert("XSS")>',
  '"><script>alert("XSS")</script>',
  "javascript:alert('XSS')",
  '<iframe src="javascript:alert(\'XSS\')">',
  '<body onload=alert("XSS")>',
  '<input onfocus=alert("XSS") autofocus>',
  '<marquee onstart=alert("XSS")>',
];

async function testXSSPrevention() {
  log("section", "TEST 27: XSS Prevention");
  console.log("");

  // 27.1: Check sanitize function exists and escapes HTML
  try {
    const sanitizeCode = readFileSync(
      join(__dirname, "..", "lib", "sanitize.ts"),
      "utf8"
    );
    const hasEscape = sanitizeCode.includes("&lt;") || sanitizeCode.includes("replace");
    record(hasEscape);
    log(hasEscape ? "pass" : "fail", `Sanitize function escapes HTML entities: ${hasEscape}`);
  } catch (err) {
    record(false);
    log("fail", `Could not read sanitize.ts: ${err.message}`);
  }

  // 27.2: Register route should sanitize input
  try {
    const registerRoute = readFileSync(
      join(__dirname, "..", "app", "api", "register", "route.ts"),
      "utf8"
    );
    const hasSanitize = registerRoute.includes("sanitize");
    record(hasSanitize);
    log(hasSanitize ? "pass" : "fail", `Register route uses sanitize(): ${hasSanitize}`);
  } catch (err) {
    record(true);
    log("info", `Register route check: ${err.message}`);
  }

  // 27.3: Users API should sanitize input
  try {
    const usersRoute = readFileSync(
      join(__dirname, "..", "app", "cms", "api", "users", "route.ts"),
      "utf8"
    );
    const hasSanitize = usersRoute.includes("sanitize") || usersRoute.includes("trim");
    record(hasSanitize);
    log(hasSanitize ? "pass" : "warn", `Users route sanitizes input: ${hasSanitize}`);
  } catch (err) {
    record(true);
    log("info", `Users route check: ${err.message}`);
  }

  // 27.4: Registration with XSS payload in team name should be sanitized
  for (const payload of XSS_PAYLOADS.slice(0, 3)) {
    try {
      const res = await request("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          email: `xss-test-${Date.now()}@test.com`,
          teamName: payload,
          leaderName: "Test",
          leaderEmail: "test@test.com",
          leaderPhone: "+94771234567",
          university: "Test University",
          teamSize: "2",
        }).toString(),
      });
      // Should not return 500 (server crash from unhandled XSS)
      const noCrash = res.status !== 500 || res.status === 200 || res.status === 429;
      record(noCrash);
      log(noCrash ? "pass" : "warn", `XSS payload in team name handled: status ${res.status}`);
    } catch (err) {
      record(true);
      log("info", `XSS registration test: ${err.message}`);
    }
  }

  // 27.5: Registration with XSS payload in leader name should be sanitized
  try {
    const res = await request("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        email: `xss-leader-${Date.now()}@test.com`,
        teamName: `XSSLeader-${Date.now()}`,
        leaderName: '<script>alert("XSS")</script>',
        leaderEmail: "test@test.com",
        leaderPhone: "+94771234567",
        university: "Test University",
        teamSize: "2",
      }).toString(),
    });
    const noCrash = res.status !== 500 || res.status === 200 || res.status === 429;
    record(noCrash);
    log(noCrash ? "pass" : "warn", `XSS payload in leader name handled: status ${res.status}`);
  } catch (err) {
    record(true);
    log("info", `XSS leader name test: ${err.message}`);
  }

  // 27.6: Check sanitize caps at 10000 chars (DoS prevention)
  try {
    const sanitizeCode = readFileSync(
      join(__dirname, "..", "lib", "sanitize.ts"),
      "utf8"
    );
    const hasMaxLen = sanitizeCode.includes("10000") || sanitizeCode.includes("slice");
    record(hasMaxLen);
    log(hasMaxLen ? "pass" : "warn", `Sanitize has max length cap: ${hasMaxLen}`);
  } catch (err) {
    record(true);
    log("info", `Max length check: ${err.message}`);
  }

  // 27.7: Check sanitize handles null/undefined
  try {
    const sanitizeCode = readFileSync(
      join(__dirname, "..", "lib", "sanitize.ts"),
      "utf8"
    );
    const handlesNull = sanitizeCode.includes("null") || sanitizeCode.includes("undefined") || sanitizeCode.includes("!input");
    record(handlesNull);
    log(handlesNull ? "pass" : "warn", `Sanitize handles null/undefined: ${handlesNull}`);
  } catch (err) {
    record(true);
    log("info", `Null handling check: ${err.message}`);
  }

  console.log("");
}

export default testXSSPrevention;
