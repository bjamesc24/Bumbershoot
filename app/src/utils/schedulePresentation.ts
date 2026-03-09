/**
 * schedulePresentation.ts
 * -----------------------
 * Responsibility:
 *   Transform a flat list of schedule items into grouped sections
 *   suitable for rendering in a SectionList.
 *
 * Design considerations:
 *   - Grouping mode (time, stage, category) is determined by the calling screen.
 *   - Search filtering is applied before grouping so section headers only appear
 *     when they have matching items.
 *   - Type filtering is applied before grouping.
 *   - Sorting within sections is always by start time then title for consistency.
 */

import {
  ScheduleItem,
  ScheduleSection,
  ScheduleViewMode,
  ScheduleSortMode,
  ScheduleTypeFilter,
} from "../models/schedule/scheduleTypes";

/**
 * Sorts items by start time ascending, then alphabetically by title as a tiebreaker.
 */
function byStartTimeThenTitle(a: ScheduleItem, b: ScheduleItem) {
  const tA = new Date(a.startTime).getTime();
  const tB = new Date(b.startTime).getTime();
  if (tA !== tB) return tA - tB;
  return a.title.localeCompare(b.title);
}

/**
 * Formats an ISO timestamp into a human-readable time bucket label.
 * Example: "Sat 2:00 PM"
 */
function formatTimeBucket(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Human-readable label for itemType filter chips.
 */
export function itemTypeLabel(type: ScheduleTypeFilter | string | undefined): string {
  switch (type) {
    case "all": return "All";
    case "event": return "Events";
    case "workshop": return "Workshops";
    case "vendor": return "Vendors";
    case "food_truck": return "Food Trucks";
    case "artist": return "Artists";
    default: return type ? String(type) : "Other";
  }
}

/**
 * Groups a flat item list into sections using the provided key function.
 * Sections are sorted alphabetically by their title.
 * Items within each section are sorted by start time then title.
 */
function groupByKey(
  items: ScheduleItem[],
  getKey: (e: ScheduleItem) => string
): ScheduleSection[] {
  const map = new Map<string, ScheduleItem[]>();

  for (const e of items) {
    const key = (getKey(e) || "Other").trim();
    const arr = map.get(key) ?? [];
    arr.push(e);
    map.set(key, arr);
  }

  const sections: ScheduleSection[] = [];
  for (const [title, data] of map.entries()) {
    sections.push({ title, data: data.sort(byStartTimeThenTitle) });
  }

  sections.sort((a, b) => a.title.localeCompare(b.title));
  return sections;
}

/**
 * Builds grouped schedule sections from a flat item list.
 * Applies keyword search and type filter before grouping.
 */
export function buildScheduleSections(
  items: ScheduleItem[],
  mode: ScheduleViewMode,
  searchText: string,
  typeFilter: ScheduleTypeFilter = "all"
): ScheduleSection[] {
  const q = searchText.trim().toLowerCase();

  // Type filter
  let filtered = typeFilter === "all"
    ? items
    : items.filter((e) => e.itemType === typeFilter);

  // Search filter
  if (q.length > 0) {
    filtered = filtered.filter((e) => {
      const haystack = [
        e.title,
        e.stage,
        e.category,
        e.itemType,
        e.description ?? "",
        ...(e.tags ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  const sorted = [...filtered].sort(byStartTimeThenTitle);

  if (mode === "time") return groupByKey(sorted, (e) => formatTimeBucket(e.startTime));
  if (mode === "stage") return groupByKey(sorted, (e) => e.stage);
  return groupByKey(sorted, (e) => e.category);
}