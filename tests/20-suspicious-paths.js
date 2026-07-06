/**
 * Test 20: Suspicious Path Blocking
 * Tests that proxy.ts blocks common attack/reconnaissance paths.
 * Expected: All suspicious paths should return 404 immediately.
 */
import { log, record, request } from "./helpers.js";

const SUSPICIOUS_PATHS = [
  { path: "/.env", label: ".env file" },
  { path: "/.env.local", label: ".env.local file" },
  { path: "/.git/config", label: ".git/config" },
  { path: "/.git/HEAD", label: ".git/HEAD" },
  { path: "/wp-admin/", label: "wp-admin" },
  { path: "/wp-login.php", label: "wp-login.php" },
  { path: "/phpmyadmin/", label: "phpmyadmin" },
  { path: "/xmlrpc.php", label: "xmlrpc.php" },
  { path: "/cgi-bin/", label: "cgi-bin" },
  { path: "/shell.php", label: "shell.php" },
  { path: "/c99.php", label: "c99.php" },
  { path: "/R57.php", label: "R57.php" },
  { path: "/cmd.exe", label: "cmd.exe" },
  { path: "/etc/passwd", label: "/etc/passwd" },
  { path: "/proc/self/environ", label: "/proc/self/environ" },
  { path: "/.svn/entries", label: ".svn" },
  { path: "/.hg/store", label: ".hg" },
  { path: "/WEB-INF/web.xml", label: "WEB-INF" },
  { path: "/.DS_Store", label: ".DS_Store" },
  { path: "/debug", label: "debug endpoint" },
  { path: "/server-info", label: "server-info" },
];

const SAFE_PATHS = [
  { path: "/", label: "Homepage" },
  { path: "/register", label: "Register page" },
  { path: "/cms/login", label: "CMS login" },
  { path: "/cms/dashboard", label: "CMS dashboard (no auth → redirect)" },
];

async function testSuspiciousPaths() {
  log("section", "TEST 20: Suspicious Path Blocking");
  console.log("");

  // Test all suspicious paths are blocked
  for (const { path, label } of SUSPICIOUS_PATHS) {
    try {
      const res = await request(path);
      const blocked = res.status === 404;
      record(blocked);
      log(blocked ? "pass" : "fail", `${label} (${path}): status ${res.status} (expected 404)`);
    } catch (err) {
      record(false);
      log("fail", `${label} (${path}): request error: ${err.message}`);
    }
  }

  console.log("");

  // Test safe paths are NOT blocked
  log("section", "Safe paths should pass through");
  for (const { path, label } of SAFE_PATHS) {
    try {
      const res = await request(path);
      const notBlocked = res.status !== 404;
      record(notBlocked);
      log(notBlocked ? "pass" : "fail", `${label} (${path}): status ${res.status} (not blocked: ${notBlocked})`);
    } catch (err) {
      record(false);
      log("fail", `${label} (${path}): request error: ${err.message}`);
    }
  }

  // Test that suspicious path check is implemented in proxy.ts
  try {
    const { readFileSync } = await import("fs");
    const { join, dirname } = await import("path");
    const { fileURLToPath } = await import("url");
    const __dirname = dirname(fileURLToPath(import.meta.url));

    const proxyCode = readFileSync(join(__dirname, "..", "proxy.ts"), "utf8");
    const hasSuspiciousCheck = proxyCode.includes("isSuspiciousPath");
    record(hasSuspiciousCheck);
    log(hasSuspiciousCheck ? "pass" : "fail", `proxy.ts has isSuspiciousPath function: ${hasSuspiciousCheck}`);

    const hasMaliciousPaths = proxyCode.includes(".env") && proxyCode.includes("wp-admin") && proxyCode.includes("phpmyadmin");
    record(hasMaliciousPaths);
    log(hasMaliciousPaths ? "pass" : "fail", `proxy.ts blocks common malicious paths: ${hasMaliciousPaths}`);
  } catch (err) {
    record(false);
    log("fail", `Could not verify proxy.ts: ${err.message}`);
  }

  console.log("");
}

export default testSuspiciousPaths;
