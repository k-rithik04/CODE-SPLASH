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
import testJWTSecretEnforcement from "./11-jwt-secret-enforcement.js";
import testCSRFProtection from "./12-csrf-protection.js";
import testPasswordStrength from "./13-password-strength.js";
import testRegistrationRateLimit from "./14-registration-rate-limit.js";
import testInputValidation from "./15-input-validation.js";
import testRoleEnforcement from "./16-role-enforcement.js";
import testPlaintextPassword from "./17-plaintext-password.js";
import testCSPAndHeaders from "./18-csp-and-headers.js";
import testRoleValidation from "./19-role-validation.js";
import testSuspiciousPaths from "./20-suspicious-paths.js";
import testRequestSizeLimit from "./21-request-size-limit.js";
import testUserSelfProtection from "./22-user-self-protection.js";
import testChangePasswordFlow from "./23-change-password-flow.js";
import testRegistrationFlow from "./24-registration-flow.js";
import testLoginSecurity from "./25-login-security.js";
import testApiMethodRestriction from "./26-api-method-restriction.js";
import testXSSPrevention from "./27-xss-prevention.js";
import testAuditLogging from "./28-audit-logging.js";
const TESTS = {
  "01": { name: "Authentication Bypass", fn: testAuthBypass },
  "02": { name: "SQL Injection", fn: testSQLInjection },
  "03": { name: "JWT Token Tampering", fn: tamperJWT },
  "04": { name: "Rate Limiting on Login", fn: testRateLimiting },
  "05": { name: "Credential Exposure", fn: testCredentialExposure },
  "06": { name: "Security Headers", fn: testSecurityHeaders },
  "07": { name: "RBAC", fn: testRBAC },
  "08": { name: "Session Management", fn: testSessionManagement },
  "09": { name: "CMS CRUD Propagation", fn: testCMSCrud },
  "11": { name: "JWT Secret Enforcement", fn: testJWTSecretEnforcement },
  "12": { name: "CSRF Protection", fn: testCSRFProtection },
  "13": { name: "Password Strength", fn: testPasswordStrength },
  "14": { name: "Registration Rate Limiting", fn: testRegistrationRateLimit },
  "15": { name: "Input Validation", fn: testInputValidation },
  "16": { name: "Role Enforcement", fn: testRoleEnforcement },
  "17": { name: "Plaintext Password Prevention", fn: testPlaintextPassword },
  "18": { name: "CSP and Headers Updates", fn: testCSPAndHeaders },
  "19": { name: "Role Validation", fn: testRoleValidation },
  "20": { name: "Suspicious Path Blocking", fn: testSuspiciousPaths },
  "21": { name: "Request Size Limit", fn: testRequestSizeLimit },
  "22": { name: "User Self-Protection", fn: testUserSelfProtection },
  "23": { name: "Change Password Flow", fn: testChangePasswordFlow },
  "24": { name: "Registration Flow", fn: testRegistrationFlow },
  "25": { name: "Login Security", fn: testLoginSecurity },
  "26": { name: "API Method Restriction", fn: testApiMethodRestriction },
  "27": { name: "XSS Prevention", fn: testXSSPrevention },
  "28": { name: "Audit Logging", fn: testAuditLogging },
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
