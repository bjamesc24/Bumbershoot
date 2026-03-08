// app/src/services/changesService.ts
//
// Purpose:
// - Calls the backend /changes endpoint to learn whether cached data is outdated.
// - Supports optional `since` query param (timestamp of last successful sync).

import { apiClient } from "./apiClient";

/**
 * What the backend returns from GET /changes
 * - lastUpdated: when the server data last changed
 * - version: server version number (monotonic)
 * - has_changes: whether there are changes since the provided `since` timestamp (if backend supports it)
 */
export type ChangesResponse = {
  lastUpdated: string;
  version: number;
  has_changes?: boolean;
};

/**
 * GET /changes (optionally /changes?since=...)
 *
 * @param since ISO timestamp (example: "2026-02-22T18:30:00Z")
 */
export async function getChanges(since?: string | null): Promise<ChangesResponse> {
  // Build URL safely
  const url =
    since && since.trim().length > 0
      ? `/changes?since=${encodeURIComponent(since)}`
      : "/changes";

  try {
    // NOTE:
    // Depending on how apiClient is written, it might return either:
    // - the raw response object (like AxiosResponse), OR
    // - the data directly.
    // This line handles BOTH patterns safely.
    const res: any = await apiClient.get<ChangesResponse>(url);
    return (res?.data ?? res) as ChangesResponse;
  } catch (error) {
    console.error(`[changesService] Failed to fetch ${url}:`, error);
    throw error;
  }
}