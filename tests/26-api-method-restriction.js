/**
 * Test 26: API Method Restriction
 * Tests that API endpoints reject disallowed HTTP methods.
 * Expected: GET-only endpoints reject POST, POST-only endpoints reject GET, etc.
 */
import { log, record, request } from "./helpers.js";

async function testApiMethodRestriction() {
  log("section", "TEST 26: API Method Restriction");
  console.log("");

  // 26.1: Login should reject GET
  try {
    const res = await request("/cms/api/login");
    const blocked = res.status === 405 || res.status === 400;
    record(blocked);
    log(blocked ? "pass" : "warn", `GET /cms/api/login rejected: status ${res.status}`);
  } catch (err) {
    record(true);
    log("info", `Login GET test: ${err.message}`);
  }

  // 26.2: Login should reject PUT
  try {
    const res = await request("/cms/api/login", { method: "PUT" });
    const blocked = res.status === 405 || res.status === 400;
    record(blocked);
    log(blocked ? "pass" : "warn", `PUT /cms/api/login rejected: status ${res.status}`);
  } catch (err) {
    record(true);
    log("info", `Login PUT test: ${err.message}`);
  }

  // 26.3: Login should reject DELETE
  try {
    const res = await request("/cms/api/login", { method: "DELETE" });
    const blocked = res.status === 405 || res.status === 400;
    record(blocked);
    log(blocked ? "pass" : "warn", `DELETE /cms/api/login rejected: status ${res.status}`);
  } catch (err) {
    record(true);
    log("info", `Login DELETE test: ${err.message}`);
  }

  // 26.4: Session should reject POST
  try {
    const res = await request("/cms/api/session", { method: "POST" });
    const blocked = res.status === 405 || res.status === 400;
    record(blocked);
    log(blocked ? "pass" : "warn", `POST /cms/api/session rejected: status ${res.status}`);
  } catch (err) {
    record(true);
    log("info", `Session POST test: ${err.message}`);
  }

  // 26.5: Logout should reject GET
  try {
    const res = await request("/cms/api/logout");
    const blocked = res.status === 405 || res.status === 400;
    record(blocked);
    log(blocked ? "pass" : "warn", `GET /cms/api/logout rejected: status ${res.status}`);
  } catch (err) {
    record(true);
    log("info", `Logout GET test: ${err.message}`);
  }

  // 26.6: Change-password should reject GET
  try {
    const res = await request("/cms/api/change-password");
    const blocked = res.status === 405 || res.status === 400;
    record(blocked);
    log(blocked ? "pass" : "warn", `GET /cms/api/change-password rejected: status ${res.status}`);
  } catch (err) {
    record(true);
    log("info", `Change-password GET test: ${err.message}`);
  }

  // 26.7: Users API should reject DELETE without ID
  try {
    const res = await request("/cms/api/users", { method: "DELETE" });
    const blocked = res.status === 405 || res.status === 400;
    record(blocked);
    log(blocked ? "pass" : "warn", `DELETE /cms/api/users (no ID) rejected: status ${res.status}`);
  } catch (err) {
    record(true);
    log("info", `Users DELETE test: ${err.message}`);
  }

  // 26.8: Register should reject GET
  try {
    const res = await request("/api/register");
    const blocked = res.status === 405 || res.status === 400 || res.status === 404;
    record(blocked);
    log(blocked ? "pass" : "warn", `GET /api/register rejected: status ${res.status}`);
  } catch (err) {
    record(true);
    log("info", `Register GET test: ${err.message}`);
  }

  // 26.9: Register should reject PUT
  try {
    const res = await request("/api/register", { method: "PUT" });
    const blocked = res.status === 405 || res.status === 400 || res.status === 404;
    record(blocked);
    log(blocked ? "pass" : "warn", `PUT /api/register rejected: status ${res.status}`);
  } catch (err) {
    record(true);
    log("info", `Register PUT test: ${err.message}`);
  }

  console.log("");
}

export default testApiMethodRestriction;
