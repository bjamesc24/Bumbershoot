// app/src/hooks/useAutoRefresh.ts
//
// What this hook does (Week 2 scope):
// 1) Lightweight change detection using GET /changes?since=... (FR-11.3 / FR-11.4)
// 2) Enforce a minimum check interval (FR-11.6)
// 3) Ensure one request in flight (FR-11.7)
// 4) If changes detected -> set needsRefresh (FR-11.8)
// 5) Full refresh function to pull datasets + record last successful sync (FR-11.1)
// 6) If anything fails -> keep cache + mark stale (FR-11.10 / FR-11.11)

import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

import { getChanges } from "../services/changesService";
import { MIN_CHANGE_CHECK_INTERVAL_MS } from "../constants/refresh";

import {
  getLastSuccessfulSyncAt,
  setLastSuccessfulSyncAt,
  getLastChangeCheckMs,
  setLastChangeCheckAt,
} from "../storage/schemaVersion";

import { getSchedule } from "../services/scheduleService";
import { getVenues } from "../services/venuesService";
import { getAnnouncements } from "../services/announcementsService";

/** Return shape for change checks */
type ChangeCheckResult = {
  needsRefresh: boolean;
  skipped: boolean;
  reason?: "in_flight" | "min_interval";
  error?: true;
};

/** Return shape for dataset refresh */
type RefreshResult = {
  ok: boolean;
  skipped: boolean;
  error?: true;
};

export function useAutoRefresh() {
  // Prevent duplicate requests (FR-11.7)
  const inFlightRef = useRef(false);

  // UI can show "data may be stale" without blocking app (FR-11.11)
  const [isStale, setIsStale] = useState(false);

  // If true, UI can prompt user to refresh (or refresh automatically)
  const [needsRefresh, setNeedsRefresh] = useState(false);

  /**
   * Conservative retry helper (3 attempts, small backoff)
   * Helps with flaky networks without spamming the backend.
   */
  const withRetry = useCallback(async <T,>(fn: () => Promise<T>, label: string): Promise<T> => {
    let lastErr: unknown;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        return await fn();
      } catch (err) {
        lastErr = err;
        console.log(`[AutoRefresh] ${label} failed (attempt ${attempt}/3)`, err);
        await new Promise((r) => setTimeout(r, 300 * attempt)); // 300, 600, 900ms
      }
    }

    throw lastErr;
  }, []);

  /**
   * Lightweight /changes check
   * - Skips if in flight
   * - Skips if within min interval
   * - Calls /changes?since=<lastSuccessfulSyncAt>
   * - Sets needsRefresh if server indicates changes
   */
  const runChangeCheck = useCallback(async (): Promise<ChangeCheckResult> => {
    // 1) One request in flight
    if (inFlightRef.current) {
      console.log("[AutoRefresh] Skipping: change-check already in flight");
      return { needsRefresh: false, skipped: true, reason: "in_flight" };
    }

    inFlightRef.current = true;

    try {
      const now = Date.now();

      // 2) Enforce minimum interval (FR-11.6)
      const lastCheckMs = await getLastChangeCheckMs();
      if (lastCheckMs && now - lastCheckMs < MIN_CHANGE_CHECK_INTERVAL_MS) {
        console.log("[AutoRefresh] Skipping: within min interval");
        return { needsRefresh: false, skipped: true, reason: "min_interval" };
      }

      // Record we attempted a check (even if no changes)
      await setLastChangeCheckAt(new Date(now).toISOString());

      // 3) Read "since" timestamp from last successful sync (FR-11.1)
      const since = await getLastSuccessfulSyncAt();
      console.log(`[AutoRefresh] Checking /changes since=${since ?? "(none)"}`);

      // 4) Call /changes?since=...
      const changes = await withRetry(() => getChanges(since), "getChanges");

      // 5) Decide if refresh is needed
      // Preferred: backend provides has_changes
      // Fallback: if backend only provides version, compare elsewhere later
      const shouldRefresh = Boolean(changes?.has_changes);

      console.log(`[AutoRefresh] /changes result => has_changes=${shouldRefresh}, version=${changes?.version}`);

      setNeedsRefresh(shouldRefresh);

      // If nothing changed, data is NOT stale
      if (!shouldRefresh) setIsStale(false);

      return { needsRefresh: shouldRefresh, skipped: false };
    } catch (err) {
      console.log("[AutoRefresh] /changes failed, falling back to cache", err);

      // Keep cache (FR-11.10), mark stale (FR-11.11)
      setIsStale(true);

      return { needsRefresh: false, skipped: false, error: true };
    } finally {
      inFlightRef.current = false;
    }
  }, [withRetry]);

  /**
   * Full refresh:
   * - Pull schedule, venues, announcements
   * - If all succeed -> record last successful sync timestamp (FR-11.1)
   * - Clear flags
   */
  const refreshDatasets = useCallback(async (): Promise<RefreshResult> => {
    if (inFlightRef.current) {
      console.log("[AutoRefresh] Skipping: refresh already in flight");
      return { ok: false, skipped: true };
    }

    inFlightRef.current = true;

    try {
      console.log("[AutoRefresh] Refreshing datasets (schedule/venues/announcements)…");

      await withRetry(() => getSchedule(), "getSchedule");
      await withRetry(() => getVenues(), "getVenues");
      await withRetry(() => getAnnouncements(), "getAnnouncements");

      // ✅ This is where it goes:
      // AFTER all dataset fetches succeed, we mark the sync as successful.
      await setLastSuccessfulSyncAt(new Date().toISOString());

      setNeedsRefresh(false);
      setIsStale(false);

      console.log("[AutoRefresh] Refresh complete");
      return { ok: true, skipped: false };
    } catch (err) {
      console.log("[AutoRefresh] Refresh failed; keeping cache", err);
      setIsStale(true);
      return { ok: false, skipped: false, error: true };
    } finally {
      inFlightRef.current = false;
    }
  }, [withRetry]);

  /**
   * FR-11.4: Check on resume (app returns to foreground)
   */
  useEffect(() => {
    const onAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === "active") {
        runChangeCheck();
      }
    };

    const sub = AppState.addEventListener("change", onAppStateChange);
    return () => sub.remove();
  }, [runChangeCheck]);

  return {
    needsRefresh,
    isStale,
    runChangeCheck,
    refreshDatasets,
    setNeedsRefresh,
  };
}