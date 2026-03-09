/**
 * useScheduleData.ts
 * ------------------
 * Responsibility:
 *   Load, cache, and refresh all schedule items (events, workshops,
 *   vendors, food trucks, artists).
 *
 * Design considerations:
 *   - On mount, loads from AsyncStorage cache first for instant display.
 *   - If cache is empty, seeds from sample data so the schedule is never
 *     blank during development before the API is live.
 *   - Vendors/food trucks without set times default to festival open/close.
 *   - When API is live, replace seedAllItems() with real fetch calls.
 *   - FR-07.3: after refresh, diff old vs new items and notify of reschedules.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { loadScheduleCache, saveScheduleCache } from "../storage/scheduleStorage";
import { isStale as isStaleFn } from "../utils/stalePolicy";
import { ScheduleItem, FESTIVAL_OPEN, FESTIVAL_CLOSE } from "../models/schedule/scheduleTypes";

// ---------------------------------------------------------------------------
// Festival date helper — attaches open/close time to a date string
// ---------------------------------------------------------------------------

function festivalDate(isoDate: string, timeStr: string): string {
  return isoDate.split("T")[0] + timeStr;
}

// ---------------------------------------------------------------------------
// Sample data seed
// ---------------------------------------------------------------------------

function seedAllItems(): ScheduleItem[] {
  const items: ScheduleItem[] = [];

  // --- Events from Spencer's sample data ---
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const rawEvents = require("../sample-data/events.sample.json") as any[];
  rawEvents.forEach((item) => {
    items.push({
      id: String(item.id),
      title: item.title?.rendered ?? item.title ?? "Untitled",
      startTime: item.meta?.event_start_time ?? item.date,
      endTime: item.meta?.event_end_time ?? item.date,
      stage: item.meta?.stage ?? "",
      category: item.meta?.event_category ?? "Event",
      itemType: "event",
      description: item.content?.rendered?.replace(/<[^>]+>/g, "") ?? "",
      tags: [],
    });
  });

  // --- Placeholder workshops ---
  const workshops = [
    { id: "workshop-1", name: "Screen Printing 101", location: "Arts Pavilion", start: "2026-03-14T11:00:00", end: "2026-03-07T12:30:00", category: "Arts & Crafts" },
    { id: "workshop-2", name: "Comedy Workshop", location: "Comedy Stage", start: "2026-03-14T13:00:00", end: "2026-03-07T14:30:00", category: "Comedy" },
    { id: "workshop-3", name: "Aerial Silks Demo", location: "Aerial Stage", start: "2026-03-14T15:00:00", end: "2026-03-07T16:00:00", category: "Aerial" },
    { id: "workshop-4", name: "Fashion Showcase", location: "Fashion Stage", start: "2026-03-14T12:00:00", end: "2026-03-07T13:30:00", category: "Fashion" },
    { id: "workshop-5", name: "Gravity Park Open Session", location: "Gravity Park", start: "2026-03-15T10:00:00", end: "2026-03-07T18:00:00", category: "Gravity Park" },
  ];
  workshops.forEach((w) => {
    items.push({
      id: w.id,
      title: w.name,
      startTime: w.start,
      endTime: w.end,
      stage: w.location,
      category: w.category,
      itemType: "workshop",
    });
  });

  // --- Placeholder vendors (default to festival hours) ---
  const vendors = [
    { id: "vendor-1", name: "Vinyl Revival Records", type: "vendor", category: "Merchandise" },
    { id: "vendor-2", name: "Pacific NW Crafts", type: "vendor", category: "Arts & Crafts" },
    { id: "vendor-3", name: "Bumbershoot Merch", type: "vendor", category: "Merchandise" },
  ];
  vendors.forEach((v) => {
    const dateBase = "2026-03-07";
    items.push({
      id: v.id,
      title: v.name,
      startTime: festivalDate(dateBase, FESTIVAL_OPEN),
      endTime: festivalDate(dateBase, FESTIVAL_CLOSE),
      stage: "Vendor Row",
      category: v.category,
      itemType: "vendor",
    });
  });

  // --- Placeholder food trucks (default to festival hours) ---
  const foodTrucks = [
    { id: "food-1", name: "Noodle Box", category: "Food & Drink" },
    { id: "food-2", name: "Smoke & Barrel BBQ", category: "Food & Drink" },
    { id: "food-3", name: "The Arepa Lady", category: "Food & Drink" },
    { id: "food-4", name: "Bubble Tea Bar", category: "Beverages" },
  ];
  foodTrucks.forEach((f) => {
    const dateBase = "2026-03-07";
    items.push({
      id: f.id,
      title: f.name,
      startTime: festivalDate(dateBase, FESTIVAL_OPEN),
      endTime: festivalDate(dateBase, FESTIVAL_CLOSE),
      stage: "Food Court",
      category: f.category,
      itemType: "food_truck",
    });
  });

  // --- Placeholder artists with set times ---
  const artists = [
    { id: "artist-1", name: "The Vera Saints", stage: "Vera Stage", start: "2026-03-07T19:00:00", end: "2026-03-07T20:00:00", genre: "Indie Rock" },
    { id: "artist-2", name: "DJ Cascade", stage: "Fountain Stage", start: "2026-03-07T20:30:00", end: "2026-03-07T21:30:00", genre: "Electronic" },
    { id: "artist-3", name: "Blue Mountain Choir", stage: "Mural Stage", start: "2026-03-08T14:00:00", end: "2026-03-08T15:00:00", genre: "Folk" },
  ];
  artists.forEach((a) => {
    items.push({
      id: a.id,
      title: a.name,
      startTime: a.start,
      endTime: a.end,
      stage: a.stage,
      category: a.genre,
      itemType: "artist",
    });
  });

  return items;
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

  // Load from cache on mount; seed sample data if cache is empty
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
        const seeded = seedAllItems();
        await saveScheduleCache(seeded, Date.now());
        setState((s) => ({
          ...s,
          events: seeded,
          lastUpdatedMs: Date.now(),
          hasCache: true,
          isInitialLoading: false,
          isStale: false,
        }));
      }
    })();
  }, []);

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
      // TODO: Replace with real API fetch when Aaron's WordPress URL is available
      const items = seedAllItems();
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

  // Auto-refresh when online and stale
  useEffect(() => {
    if (isOnline && state.hasCache && state.isStale) refresh();
  }, [isOnline, state.hasCache, state.isStale, refresh]);

  const lastUpdatedText = useMemo(() => {
    if (!state.lastUpdatedMs) return "Never";
    return new Date(state.lastUpdatedMs).toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  }, [state.lastUpdatedMs]);

  return { ...state, refresh, lastUpdatedText };
}