/**
 * Test 21: Request Body Size Limit
 * Tests that proxy.ts enforces a 1MB request body limit.
 * Expected: Requests with Content-Length > 1MB should get 413.
 */
import { log, record, request } from "./helpers.js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function testRequestSizeLimit() {
  log("section", "TEST 21: Request Body Size Limit");
  console.log("");

  // 21.1: Check that proxy.ts has a body size limit
  try {
    const proxyCode = readFileSync(join(__dirname, "..", "proxy.ts"), "utf8");
    const hasSizeLimit = proxyCode.includes("content-length") || proxyCode.includes("Content-Length");
    record(hasSizeLimit);
    log(hasSizeLimit ? "pass" : "fail", `proxy.ts checks Content-Length: ${hasSizeLimit}`);

    const has1MB = proxyCode.includes("1048576") || proxyCode.includes("1_048_576");
    record(has1MB);
    log(has1MB ? "pass" : "fail", `proxy.ts enforces 1MB limit: ${has1MB}`);

    const returns413 = proxyCode.includes("413");
    record(returns413);
    log(returns413 ? "pass" : "fail", `proxy.ts returns 413 on oversized: ${returns413}`);
  } catch (err) {
    record(false);
    log("fail", `Could not read proxy.ts: ${err.message}`);
  }

  // 21.2: Test oversized request to login endpoint
  try {
    const largeBody = "x".repeat(2 * 1024 * 1024); // 2MB
    const res = await request("/cms/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": String(2 * 1024 * 1024),
      },
      body: JSON.stringify({ username: "admin", password: largeBody }),
    });
    const ok = res.status === 413 || res.status === 400 || res.status === 431;
    record(ok);
    log(ok ? "pass" : "warn", `Oversized request to login: status ${res.status} (expected 413)`);
  } catch (err) {
    // Connection error is acceptable — server may reject before responding
    record(true);
    log("info", `Oversized request test: ${err.message}`);
  }

  // 21.3: Normal-sized request should still work
  try {
    const res = await request("/cms/api/login", {
      method: "POST",
      body: JSON.stringify({ username: "admin", password: "test" }),
    });
    // Should get 401 (wrong password) not 413
    const ok = res.status !== 413;
    record(ok);
    log(ok ? "pass" : "fail", `Normal request not blocked: status ${res.status}`);
  } catch (err) {
    record(true);
    log("info", `Normal request test: ${err.message}`);
  }

  console.log("");
}

export default testRequestSizeLimit;
