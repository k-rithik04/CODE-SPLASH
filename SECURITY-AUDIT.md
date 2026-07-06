# CodeSplash Security Audit Report

**Date:** 2026-07-06
**Target:** https://codesplash.cssa.lk/
**Framework:** Next.js 16 (App Router, standalone output)
**Hosting:** Netlify + Cloudflare CDN

---

## Executive Summary

A comprehensive security audit of the CodeSplash 2026 hackathon landing site was performed, covering source code analysis, dependency scanning, live site probing, port scanning, and security header verification. **12 vulnerabilities were identified and fixed**, ranging from critical authentication bypass to medium-severity input validation gaps.

---

## Threats Found & Fixes Applied

### CRITICAL SEVERITY

#### 1. JWT Fallback Secret Allows Authentication Bypass
**Threat:** The JWT signing secret (`lib/auth-shared.ts:10`, `proxy.ts:5-7`) fell back to a hardcoded placeholder string `"ci-build-placeholder-not-for-production"` when `JWT_SECRET` was not set. In production, this meant anyone could forge valid admin session tokens using this known secret.

**Impact:** Full authentication bypass. Attacker can impersonate any admin user.

**Fix:** Replaced `console.error()` with `throw new Error()` so the server refuses to start without `JWT_SECRET` in production. Applied to both `lib/auth-shared.ts` and `proxy.ts`.

**Files modified:**
- `lib/auth-shared.ts` - Now throws on missing `JWT_SECRET` in production
- `proxy.ts` - Same protection added

---

#### 2. Plaintext Password Comparison Fallback
**Threat:** Login (`app/cms/api/login/route.ts:64-68`) and password change (`app/cms/api/change-password/route.ts:43-48`) routes had a fallback that compared passwords in plaintext when the stored hash didn't start with `$2` (bcrypt prefix). This bypassed all bcrypt protections.

**Impact:** If any password was stored without hashing (via direct Supabase console insertion or a bug), it would be compared in plaintext, enabling instant password verification and timing-based oracle attacks.

**Fix:** Removed the plaintext fallback. Both routes now reject non-bcrypt passwords immediately and always use `verifyPassword()` (bcrypt compare).

**Files modified:**
- `app/cms/api/login/route.ts` - Rejects non-bcrypt hashes
- `app/cms/api/change-password/route.ts` - Same protection

---

#### 3. No Server-Side Rate Limiting on Registration Endpoint
**Threat:** The public `/api/register` POST endpoint had zero server-side rate limiting. Client-side rate limiting (using `localStorage`) was trivially bypassed by calling the API directly with a script.

**Impact:** Database spam, denial of service, resource exhaustion via unlimited registration submissions.

**Fix:** Added `checkRateLimit()` from `lib/rate-limit.ts` to the registration endpoint. Limit: 5 registrations per 15 minutes per IP address. Returns HTTP 429 with retry-after information.

**Files modified:**
- `app/api/register/route.ts` - Added rate limiting with IP-based tracking

---

#### 4. Hardcoded Credentials in Git-Tracked File
**Threat:** `tests/config.js` contained the production Supabase URL, full anon key, and JWT secret placeholder in a git-tracked file. While the anon key is designed to be semi-public, coupling it with the project URL and JWT placeholder in one file aided reconnaissance.

**Impact:** Credential exposure to anyone with repository access.

**Fix:** Replaced all hardcoded values with `process.env` references. Values must now be provided via environment variables.

**Files modified:**
- `tests/config.js` - All secrets replaced with `process.env.*` references

---

### HIGH SEVERITY

#### 5. CMS Content Pages Missing Server-Side Role Checks
**Threat:** 11 CMS pages (chapters, prizes, timeline, partners, team, faq, dashboard, registrations, hero, cta, connect) did not call `requireRole()`. Only the audit and users pages had server-side role checks. Any authenticated user (including `viewer` role) could access content editing pages.

**Impact:** Privilege escalation. A viewer-role user could access and potentially modify all CMS content.

**Fix:** Added `await requireRole("editor")` to all content/settings pages and `await requireRole("viewer")` to the dashboard. Uses the existing `lib/auth-guard.ts` which checks role hierarchy and redirects unauthorized users.

**Files modified (11 pages):**
- `app/cms/content/chapters/page.tsx`
- `app/cms/content/prizes/page.tsx`
- `app/cms/content/timeline/page.tsx`
- `app/cms/content/partners/page.tsx`
- `app/cms/content/team/page.tsx`
- `app/cms/content/faq/page.tsx`
- `app/cms/dashboard/page.tsx`
- `app/cms/registrations/page.tsx`
- `app/cms/settings/hero/page.tsx`
- `app/cms/settings/cta/page.tsx`
- `app/cms/settings/connect/page.tsx`

---

#### 6. Weak Minimum Password Length (4 Characters)
**Threat:** CMS user creation (`app/cms/api/users/route.ts:36`) accepted passwords as short as 4 characters with no complexity requirements (no uppercase, digit, or special character checks).

**Impact:** Weak admin/editor passwords are easy to brute-force.

**Fix:** Increased minimum password length to 8 characters. Added complexity requirement: must contain at least one letter and one number. Applied to both POST (create) and PUT (update) user routes.

**Files modified:**
- `app/cms/api/users/route.ts` - 8-char minimum + letter+number required
- `app/cms/api/users/[id]/route.ts` - Same validation on password update

---

#### 7. No CSRF Protection on CMS API Routes
**Threat:** None of the CMS API routes (`/cms/api/logout`, `/cms/api/change-password`, `/cms/api/users`) validated `Origin` or `Referer` headers. The application relied solely on `SameSite: strict` cookies, which doesn't protect against subdomain attacks or older browsers.

**Impact:** Logout CSRF, unauthorized user creation/deletion, password changes via crafted cross-origin requests.

**Fix:** Created `lib/csrf.ts` with a `validateOrigin()` helper that checks the `Origin` or `Referer` header against allowed origins (`codesplash.cssa.lk`). Added this check to all CMS API POST/PUT/DELETE handlers.

**New file:** `lib/csrf.ts`
**Files modified:**
- `app/cms/api/login/route.ts`
- `app/cms/api/logout/route.ts`
- `app/cms/api/change-password/route.ts`
- `app/cms/api/users/route.ts`
- `app/cms/api/users/[id]/route.ts`

---

#### 8. User Management API Accepts Invalid Roles
**Threat:** The PUT endpoint (`app/cms/api/users/[id]/route.ts:21`) accepted a `role` field from the request body and passed it directly to the database update without validation. An admin could set an arbitrary role string.

**Impact:** Potential for role value injection (non-standard roles that bypass hierarchy checks).

**Fix:** Added validation that the role must be one of `["admin", "editor", "viewer"]`. Returns HTTP 400 for invalid roles.

**Files modified:**
- `app/cms/api/users/[id]/route.ts` - Role whitelist validation

---

### MEDIUM SEVERITY

#### 9. No Input Validation on Registration API
**Threat:** The public registration endpoint performed no server-side input validation. All fields passed directly from `URLSearchParams` to Supabase `.insert()` with no email format, phone format, or max-length checks.

**Impact:** Malformed or malicious data can be inserted into the database. Could be used for storage abuse or to insert content that gets rendered unsafely elsewhere.

**Fix:** Added validation helpers:
- Email format validation (regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
- Phone format validation (regex: `/^\+?[\d\s\-()]{7,20}$/`)
- Max text length: 255 characters (via `sanitize()` function)
- Applied to all school and university registration fields

**Files modified:**
- `app/api/register/route.ts` - Full input validation suite

---

#### 10. Login Selects All Profile Columns
**Threat:** The login route (`app/cms/api/login/route.ts:52`) used `.select("*")` which loaded all columns from the `profiles` table including the password hash into memory unnecessarily.

**Impact:** Unnecessary data exposure in server memory. If any sensitive fields exist or are added later, they would be fetched unnecessarily.

**Fix:** Changed to `.select("id, username, full_name, role, password, must_change_password")` to fetch only the fields actually needed.

**Files modified:**
- `app/cms/api/login/route.ts` - Explicit column selection

---

#### 11. Deprecated `lib/auth-client.ts` Still in Codebase
**Threat:** The `lib/auth-client.ts` module stored JWT tokens in `localStorage` (XSS-vulnerable). It was marked as deprecated but still existed in the codebase. If any code path still imported it, JWT tokens stored in localStorage could be stolen via XSS.

**Impact:** Potential JWT token theft via XSS if the module was imported.

**Fix:** Deleted `lib/auth-client.ts` entirely. Confirmed via grep that no files import it.

**Files deleted:**
- `lib/auth-client.ts`

---

### LOW SEVERITY

#### 12. CSP Allows `unsafe-eval`
**Threat:** The Content Security Policy (`next.config.ts:13`) included `unsafe-eval` for scripts, which weakens XSS protections by allowing `eval()` in the browser context.

**Impact:** Reduced XSS protection in the browser.

**Fix:** Removed `unsafe-eval` from the `script-src` directive. Kept `unsafe-inline` (required by Next.js for inline scripts in framework code).

**Files modified:**
- `next.config.ts` - CSP updated

---

#### 13. Logout Redirects to Legacy Route
**Threat:** The logout page (`app/cms/logout/page.tsx:12,24`) redirected to `/admin/login` instead of `/cms/login`. While the proxy middleware handles the redirect, this was an inconsistency.

**Impact:** Inconsistent user experience, potential confusion.

**Fix:** Changed both redirect locations to `/cms/login`.

**Files modified:**
- `app/cms/logout/page.tsx` - Fixed redirect URL

---

## Infrastructure Analysis

### SSL/TLS Configuration
- **Certificate:** Valid, Cloudflare-issued (HTTPS enforced)
- **HSTS:** Present (`max-age=31536000`)
- **Protocol:** HTTP/2 + HTTP/3 (h3) supported

### Port Scan Results
| Port | Status | Notes |
|------|--------|-------|
| 21 (FTP) | OPEN | Unusual - verify if intentional (possibly Cloudflare edge) |
| 80 (HTTP) | OPEN | Expected (redirects to HTTPS) |
| 443 (HTTPS) | OPEN | Expected |
| 8080 | OPEN | Possible staging - investigate |
| 8443 | OPEN | Possible alternate HTTPS - investigate |
| 22, 25, 53, 3000, 3306, 5432, 9090 | Closed/Filtered | Good |

**Note:** Ports 21, 8080, 8443 being open are unusual for a Netlify-hosted site. These may be Cloudflare edge ports or need investigation on the Netlify/Cloudflare dashboard.

### Security Headers (Verified)
| Header | Status |
|--------|--------|
| `Strict-Transport-Security` | Present (Cloudflare) |
| `X-Content-Type-Options: nosniff` | Present |
| `X-Frame-Options: DENY` | Configured |
| `X-XSS-Protection: 1; mode=block` | Configured |
| `Referrer-Policy: strict-origin-when-cross-origin` | Configured |
| `Permissions-Policy: camera=(), microphone=(), geolocation=()` | Configured |
| `Content-Security-Policy` | Configured (updated) |
| `X-Powered-By` | Removed via `poweredByHeader: false` |

### Dependency Vulnerabilities
| Package | Severity | Issue | Status |
|---------|----------|-------|--------|
| `xlsx` | HIGH | Prototype Pollution + ReDoS | No fix available - consider replacing |
| `postcss` (<8.5.10) | MODERATE | XSS via unescaped `</style>` | Fix requires breaking Next.js upgrade |

### Path Traversal / Information Disclosure
| Path | Result |
|------|--------|
| `/.env` | 404 (not exposed) |
| `/.git/config` | 404 (not exposed) |
| `/.git/HEAD` | 404 (not exposed) |
| `/package.json` | 404 (not exposed) |
| `/server-info` | 404 (not exposed) |
| `/debug` | 404 (not exposed) |
| `/health` | 404 (not exposed) |
| `/metrics` | 404 (not exposed) |
| `/phpmyadmin` | 404 (not exposed) |
| `/wp-admin` | 404 (not exposed) |

### SQL Injection Testing
- Tested with `teamName=test' OR 1=1--` payload
- Result: Inserted as literal string (parameterized queries working correctly)
- **No SQL injection vulnerabilities found**

### Bot Protection
- Cloudflare bot protection active (challenge platform scripts detected)
- AI crawlers blocked via `robots.txt` (GPTBot, ClaudeBot, Bytespider, etc.)

---

## Positive Security Findings

These security measures were already in place before the audit:

1. **No SQL injection** - All queries use Supabase parameterized methods
2. **HttpOnly + SameSite=strict cookies** for session management
3. **JWT tokens never returned in response body** (cookie-only)
4. **Timing attack prevention** via dummy bcrypt hash on unknown users
5. **Audit logging** for login success/failure
6. **Self-deletion prevention** in user management
7. **`.env.local` is gitignored**
8. **`poweredByHeader: false`** removes X-Powered-By header
9. **Cloudflare CDN** provides DDoS protection and edge caching
10. **No `eval()` or `new Function()` calls** in application code

---

## Remaining Recommendations

1. **Replace `xlsx` dependency** - The SheetJS library has unpatched prototype pollution and ReDoS vulnerabilities. Consider migrating to a safer alternative like `exceljs` or `openpyxl` (via API).

2. **Upgrade PostCSS** - When Next.js supports it, upgrade to PostCSS 8.5.10+ to fix the XSS vulnerability.

3. **Investigate open ports** - Ports 21, 8080, 8443 should be investigated on the Netlify/Cloudflare dashboard to confirm they're expected.

4. **Add sitemap.xml** - Currently returns 404. Important for SEO.

5. **Consider adding `__Host-` prefix to session cookie** - Provides additional security by binding the cookie to the host.

6. **Add Content-Security-Policy report-uri** - For monitoring CSP violations in production.

---

## Files Modified Summary

| File | Change |
|------|--------|
| `lib/auth-shared.ts` | JWT secret throws in production |
| `proxy.ts` | JWT secret throws in production |
| `lib/csrf.ts` | **NEW** - Origin/Referer validation |
| `lib/auth-client.ts` | **DELETED** - Deprecated localStorage session |
| `tests/config.js` | Secrets moved to env vars |
| `next.config.ts` | Removed `unsafe-eval` from CSP |
| `app/cms/api/login/route.ts` | CSRF check, bcrypt-only, specific columns |
| `app/cms/api/logout/route.ts` | CSRF check |
| `app/cms/api/change-password/route.ts` | CSRF check, bcrypt-only |
| `app/cms/api/users/route.ts` | CSRF check, 8-char min, complexity |
| `app/cms/api/users/[id]/route.ts` | CSRF check, role validation, password validation |
| `app/api/register/route.ts` | Rate limiting, input validation, sanitization |
| `app/cms/content/chapters/page.tsx` | `requireRole("editor")` |
| `app/cms/content/prizes/page.tsx` | `requireRole("editor")` |
| `app/cms/content/timeline/page.tsx` | `requireRole("editor")` |
| `app/cms/content/partners/page.tsx` | `requireRole("editor")` |
| `app/cms/content/team/page.tsx` | `requireRole("editor")` |
| `app/cms/content/faq/page.tsx` | `requireRole("editor")` |
| `app/cms/dashboard/page.tsx` | `requireRole("viewer")` |
| `app/cms/registrations/page.tsx` | `requireRole("editor")` |
| `app/cms/settings/hero/page.tsx` | `requireRole("editor")` |
| `app/cms/settings/cta/page.tsx` | `requireRole("editor")` |
| `app/cms/settings/connect/page.tsx` | `requireRole("editor")` |
| `app/cms/logout/page.tsx` | Fixed redirect to `/cms/login` |
