/**
 * useScheduleData.ts
 * ------------------
 * Responsibility:
 *   Manage schedule data lifecycle including cache loading, staleness detection,
 *   and refresh triggering.
 *
 * Design considerations:
 *   - On mount, loads cached events from AsyncStorage immediately so the screen
 *     is never blank while waiting for a network response.
 *   - Automatically triggers a refresh when online and cached data is stale.
 *   - Refresh is a no-op when offline — sets an informational error message instead.
 *   - The actual API fetch will be wired in once Spencer's endpoint is confirmed.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { loadScheduleCache, saveScheduleCache } from "../storage/scheduleStorage";
import { isStale as isStaleFn } from "../utils/stalePolicy";
import { ScheduleEvent } from "../models/schedule/scheduleTypes";

type State = {
  events: ScheduleEvent[];
  lastUpdatedMs: number | null;
  hasCache: boolean;
  isInitialLoading: boolean;
  isRefreshing: boolean;
  isStale: boolean;
  refreshError: string | null;
};

export default function useScheduleData(isOnline: boolean) {
  const [state, setState] = useState<State>({
    events: [],
    lastUpdatedMs: null,
    hasCache: false,
    isInitialLoading: true,
    isRefreshing: false,
    isStale: true,
    refreshError: null,
  });

  // Load cached schedule from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      const cached = await loadScheduleCache();
      setState((s) => ({
        ...s,
        events: cached.events,
        lastUpdatedMs: cached.lastUpdatedMs,
        hasCache: cached.events.length > 0,
        isInitialLoading: false,
        isStale: isStaleFn(cached.lastUpdatedMs),
      }));
    })();
  }, []);

  /**
   * Attempts to fetch fresh schedule data from the API.
   * Falls back gracefully when offline or when the request fails.
   * TODO: wire in the real API call once Spencer's endpoint is confirmed.
   */
  const refresh = useCallback(async () => {
    if (!isOnline) {
      setState((s) => ({
        ...s,
        refreshError: "Offline — showing saved schedule.",
        isStale: true,
      }));
      return;
    }

    setState((s) => ({ ...s, isRefreshing: true, refreshError: null }));

    try {
      const now = Date.now();

      // TODO: replace with real API call when Spencer's endpoint is ready:
      // const events = await scheduleService.getSchedule();
      // await saveScheduleCache(events, now);
      // setState((s) => ({ ...s, events, lastUpdatedMs: now, isRefreshing: false, isStale: false, refreshError: null }));

      setState((s) => ({
        ...s,
        isRefreshing: false,
        isStale: false,
        refreshError: null,
      }));
    } catch (e: any) {
      // Keep existing cached data — just flag the refresh as failed
      setState((s) => ({
        ...s,
        isRefreshing: false,
        isStale: true,
        refreshError: e?.message ?? "Refresh failed — showing saved schedule.",
      }));
    }
  }, [isOnline]);

  // Automatically refresh when online and cached data is stale
  useEffect(() => {
    if (isOnline && state.hasCache && state.isStale) refresh();
  }, [isOnline, state.hasCache, state.isStale, refresh]);

  // Format the last updated timestamp for display in the status banner
  const lastUpdatedText = useMemo(() => {
    if (!state.lastUpdatedMs) return "Never";
    return new Date(state.lastUpdatedMs).toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  }, [state.lastUpdatedMs]);

  return { ...state, refresh, lastUpdatedText };
}