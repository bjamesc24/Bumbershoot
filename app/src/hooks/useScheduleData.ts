/**
 * useScheduleData.ts
 * ------------------
 * Responsibility:
 *   Load, cache, and refresh scheduled festival content.
 *
 * Data source:
 *   - Delegates to scheduleService (which handles sample vs. real API)
 *   - Persists to scheduleStorage for offline access
 *
 * Sync integration:
 *   - Reads/writes lastUpdatedMs via scheduleStorage
 *   - isStale is derived from stalePolicy
 *   - Designed to be driven by useAutoRefresh for change-triggered refreshes
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { loadScheduleCache, saveScheduleCache } from "../storage/scheduleStorage";
import { getSchedule } from "../services/scheduleService";
import { isStale as isStaleFn } from "../utils/stalePolicy";
import { ScheduleItem } from "../models/schedule/scheduleTypes";

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

type State = {
  events: ScheduleItem[];
  lastUpdatedMs: number | null;
  hasCache: boolean;
  isInitialLoading: boolean;
  isRefreshing: boolean;
  isStale: boolean;
  refreshError: string | null;
};

const INITIAL_STATE: State = {
  events: [],
  lastUpdatedMs: null,
  hasCache: false,
  isInitialLoading: true,
  isRefreshing: false,
  isStale: true,
  refreshError: null,
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export default function useScheduleData(isOnline: boolean) {
  const [state, setState] = useState<State>(INITIAL_STATE);

  // On mount: load cache first, seed from service if cache is empty
  useEffect(() => {
    (async () => {
      const cached = await loadScheduleCache();

      if (cached.events.length > 0) {
        setState((s) => ({
          ...s,
          events: cached.events,
          lastUpdatedMs: cached.lastUpdatedMs,
          hasCache: true,
          isInitialLoading: false,
          isStale: isStaleFn(cached.lastUpdatedMs),
        }));
      } else {
        // No cache — seed from service (sample data or API)
        try {
          const items = await getSchedule();
          const now = Date.now();

          // scheduleService returns ScheduleResponse; cast to ScheduleItem[]
          // The shapes are compatible: id, title, startTime, endTime, stage,
          // category, tags, description, rawItem are all present.
          const events = items as unknown as ScheduleItem[];

          await saveScheduleCache(events, now);

          setState((s) => ({
            ...s,
            events,
            lastUpdatedMs: now,
            hasCache: true,
            isInitialLoading: false,
            isStale: false,
          }));
        } catch {
          setState((s) => ({
            ...s,
            isInitialLoading: false,
            isStale: true,
            refreshError: "Could not load schedule.",
          }));
        }
      }
    })();
  }, []);

  // Refresh: fetch from service, persist, update state
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
      const items = await getSchedule();
      const now = Date.now();
      const events = items as unknown as ScheduleItem[];

      await saveScheduleCache(events, now);

      setState((s) => ({
        ...s,
        events,
        lastUpdatedMs: now,
        hasCache: true,
        isRefreshing: false,
        isStale: false,
        refreshError: null,
      }));
    } catch (e: any) {
      setState((s) => ({
        ...s,
        isRefreshing: false,
        isStale: true,
        refreshError: e?.message ?? "Refresh failed — showing saved schedule.",
      }));
    }
  }, [isOnline]);

  // Auto-refresh when online and stale
  useEffect(() => {
    if (isOnline && state.hasCache && state.isStale) {
      refresh();
    }
  }, [isOnline, state.hasCache, state.isStale, refresh]);

  // Human-readable last updated label
  const lastUpdatedText = useMemo(() => {
    if (!state.lastUpdatedMs) return "Never";
    return new Date(state.lastUpdatedMs).toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  }, [state.lastUpdatedMs]);

  return {
    ...state,
    refresh,
    lastUpdatedText,
  };
}