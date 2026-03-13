/**
 * useScheduleData.ts
 * ------------------
 * Responsibility:
 *   Load, cache, and refresh scheduled festival content using local sample data.
 *
 * Data sources:
 *   - music.sample.json -> scheduled music
 *   - art.sample.json   -> scheduled art
 *
 * Notes:
 *   - Keeps loading, refresh, stale, and cache behavior for the Schedule screen
 *   - Does NOT use events.sample.json or placeholder seeded data anymore
 *   - Offline mode keeps cached data and marks schedule as stale
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { loadScheduleCache, saveScheduleCache } from "../storage/scheduleStorage";
import { isStale as isStaleFn } from "../utils/stalePolicy";
import { ScheduleItem } from "../models/schedule/scheduleTypes";

import musicData from "../sample-data/music.sample.json";
import artData from "../sample-data/art.sample.json";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Remove HTML tags from WordPress-rendered strings
function stripHtml(str: string): string {
  return str.replace(/<[^>]+>/g, "");
}

// Build normalized schedule items from music sample data
function buildMusicScheduleItems(data: any[]): ScheduleItem[] {
  return data
    .filter((item) => item?.meta?.event_start_time && item?.meta?.event_end_time)
    .map((item) => ({
      id: `music-${item.id}`,
      title: stripHtml(item?.title?.rendered ?? "Untitled"),
      startTime: item.meta.event_start_time,
      endTime: item.meta.event_end_time,
      stage: item?.meta?.stage ?? "",
      category: item?.meta?.event_category ?? item?.meta?.genre ?? "Music",
      itemType: "musician",
      description: stripHtml(item?.content?.rendered ?? ""),
      tags: [],
      rawItem: item,
    })) as ScheduleItem[];
}

// Build normalized schedule items from art sample data
function buildArtScheduleItems(data: any[]): ScheduleItem[] {
  return data
    .filter((item) => item?.meta?.event_start_time && item?.meta?.event_end_time)
    .map((item) => ({
      id: `art-${item.id}`,
      title: stripHtml(item?.title?.rendered ?? "Untitled"),
      startTime: item.meta.event_start_time,
      endTime: item.meta.event_end_time,
      // Art schedule uses district, but we place it into stage so the
      // schedule grid/list can reuse a shared column/location field.
      stage: item?.meta?.district ?? "",
      category: item?.meta?.district ?? "Art",
      itemType: "artist",
      description: stripHtml(item?.content?.rendered ?? ""),
      tags: [],
      rawItem: item,
    })) as ScheduleItem[];
}

// Combine all scheduled content from local JSON
function buildAllScheduleItems(): ScheduleItem[] {
  const musicItems = buildMusicScheduleItems(musicData as any[]);
  const artItems = buildArtScheduleItems(artData as any[]);

  return [...musicItems, ...artItems].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
}

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

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

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

  // Load cached schedule first; if none exists, seed from local sample data
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
        const seeded = buildAllScheduleItems();
        const now = Date.now();

        await saveScheduleCache(seeded, now);

        setState((s) => ({
          ...s,
          events: seeded,
          lastUpdatedMs: now,
          hasCache: true,
          isInitialLoading: false,
          isStale: false,
        }));
      }
    })();
  }, []);

  // Refresh from local sample data
  const refresh = useCallback(async () => {
    if (!isOnline) {
      setState((s) => ({
        ...s,
        refreshError: "Offline — showing saved schedule.",
        isStale: true,
      }));
      return;
    }

    setState((s) => ({
      ...s,
      isRefreshing: true,
      refreshError: null,
    }));

    try {
      const items = buildAllScheduleItems();
      const now = Date.now();

      await saveScheduleCache(items, now);

      setState((s) => ({
        ...s,
        events: items,
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

  // Auto-refresh when online and cached data is stale
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