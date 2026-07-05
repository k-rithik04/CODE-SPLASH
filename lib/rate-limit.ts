const attempts = new Map<string, { count: number; resetAt: number }>();

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of attempts) {
    if (now > value.resetAt) attempts.delete(key);
  }
}, 5 * 60 * 1000);

/**
 * Check rate limit for a given key (e.g. IP + endpoint).
 * Returns { allowed, remaining, retryAfterMs }.
 */
export function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 60_000
): { allowed: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1, retryAfterMs: 0 };
  }

  entry.count++;

  if (entry.count > maxAttempts) {
    const retryAfterMs = entry.resetAt - now;
    return { allowed: false, remaining: 0, retryAfterMs };
  }

  return { allowed: true, remaining: maxAttempts - entry.count, retryAfterMs: 0 };
}

/**
 * Reset rate limit for a key (e.g. after successful login).
 */
export function resetRateLimit(key: string): void {
  attempts.delete(key);
}
