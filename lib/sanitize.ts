/**
 * Strip HTML tags and dangerous characters from user input.
 * Prevents stored XSS in CMS fields.
 */
export function sanitizeInput(input: string | null | undefined): string {
  if (!input) return "";
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .trim()
    .slice(0, 10000); // Cap at 10KB
}

/**
 * Sanitize all string values in a record (for DB inserts).
 */
export function sanitizeRecord<T extends Record<string, unknown>>(record: T): T {
  const sanitized = { ...record };
  for (const [key, value] of Object.entries(sanitized)) {
    if (typeof value === "string") {
      (sanitized as Record<string, unknown>)[key] = sanitizeInput(value);
    }
  }
  return sanitized;
}

/**
 * Validate request Content-Type to prevent abuse.
 */
export function isValidContentType(request: Request, allowed: string[]): boolean {
  const contentType = request.headers.get("content-type") || "";
  return allowed.some((type) => contentType.includes(type));
}

/**
 * Get client IP from request headers (best-effort).
 */
export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
