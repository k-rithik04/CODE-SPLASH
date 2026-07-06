/**
 * Security Test Runner
 * Runs all CMS security tests.
 *
 * Usage:
 *   node tests/run-all.js                    (run all tests)
 *   node tests/run-all.js 01 02 03           (run specific tests)
 *   BASE_URL=http://localhost:3000 node tests/run-all.js
 */

import { log, summary } from "./helpers.js";
import testAuthBypass from "./01-auth-bypass.js";
import testSQLInjection from "./02-sql-injection.js";
import tamperJWT from "./03-jwt-tampering.js";
import testRateLimiting from "./04-rate-limiting.js";
import testCredentialExposure from "./05-credential-exposure.js";
import testSecurityHeaders from "./06-security-headers.js";
import testRBAC from "./07-rbac.js";
import testSessionManagement from "./08-session-management.js";
import testCMSCrud from "./09-cms-crud.js";

const TESTS = {
  "08": { name: "Session Management", fn: testSessionManagement },
  "09": { name: "CMS CRUD Propagation", fn: testCMSCrud },
  "01": { name: "Authentication Bypass", fn: testAuthBypass },
  "02": { name: "SQL Injection", fn: testSQLInjection },
  "03": { name: "JWT Token Tampering", fn: tamperJWT },
  "05": { name: "Credential Exposure", fn: testCredentialExposure },
  "06": { name: "Security Headers", fn: testSecurityHeaders },
  "07": { name: "RBAC", fn: testRBAC },
  "04": { name: "Rate Limiting", fn: testRateLimiting },
};

async function main() {
  const args = process.argv.slice(2);
  const selected = args.length > 0 ? args : Object.keys(TESTS);

  console.log("");
  console.log("\x1b[1m\x1b[35m╔════════════════════════════════════════════════════════════════════════════════════╗\x1b[0m");
  console.log("\x1b[1m\x1b[35m║           CodeSplash CMS — Security Audit Test Suite                              ║\x1b[0m");
  console.log("\x1b[1m\x1b[35m╚════════════════════════════════════════════════════════════════════════════════════╝\x1b[0m");
  console.log("");
  log("info", `Target: ${process.env.BASE_URL || "http://localhost:3000"}`);
  log("info", `Running ${selected.length} test(s)...`);
  console.log("");

  for (const key of selected) {
    const test = TESTS[key];
    if (!test) {
      log("warn", `Unknown test: ${key}`);
      continue;
    }
    try {
      await test.fn();
    } catch (err) {
      log("fail", `Test ${key} (${test.name}) crashed: ${err.message}`);
      console.log("");
    }
  }

  const allPassed = summary();
  process.exit(allPassed ? 0 : 1);
}

main();
