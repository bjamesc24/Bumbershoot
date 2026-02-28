export const MAX_STALE_MS = 1000 * 60 * 15; // 15 minutes (change anytime)

export function isStale(lastUpdatedMs: number | null): boolean {
  if (!lastUpdatedMs) return true;
  return Date.now() - lastUpdatedMs > MAX_STALE_MS;
}