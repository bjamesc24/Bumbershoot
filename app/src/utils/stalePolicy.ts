/**
 * stalePolicy.ts
 * --------------
 * Responsibility:
 *   Define and enforce the maximum age of cached schedule data.
 *
 * Design considerations:
 *   - The stale threshold is defined as a single constant so it can be
 *     adjusted in one place without touching any screen or hook logic.
 */

/** Maximum age of cached data before it is considered stale. Currently 15 minutes. */
export const MAX_STALE_MS = 1000 * 60 * 15;

/**
 * Returns true if the cached data is older than MAX_STALE_MS or has never been fetched.
 */
export function isStale(lastUpdatedMs: number | null): boolean {
  if (!lastUpdatedMs) return true;
  return Date.now() - lastUpdatedMs > MAX_STALE_MS;
}