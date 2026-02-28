/**
 * schedulePresentation.ts
 * -----------------------
 * Responsibility:
 *   Transform a flat list of schedule events into grouped sections
 *   suitable for rendering in a SectionList.
 *
 * Design considerations:
 *   - Grouping mode (time, stage, category) is determined by the calling screen.
 *   - Search filtering is applied before grouping so section headers only appear
 *     when they have matching events.
 *   - Sorting within sections is always by start time then title for consistency.
 */

import { ScheduleEvent, ScheduleSection, ScheduleViewMode } from "../models/schedule/scheduleTypes";

/**
 * Sorts events by start time ascending, then alphabetically by title as a tiebreaker.
 */
function byStartTimeThenTitle(a: ScheduleEvent, b: ScheduleEvent) {
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
  return d.toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" });
}

/**
 * Groups a flat event list into sections using the provided key function.
 * Sections are sorted alphabetically by their title.
 * Events within each section are sorted by start time then title.
 */
function groupByKey(events: ScheduleEvent[], getKey: (e: ScheduleEvent) => string): ScheduleSection[] {
  const map = new Map<string, ScheduleEvent[]>();

  for (const e of events) {
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
 * Builds grouped schedule sections from a flat event list.
 * Applies keyword search filtering before grouping.
 */
export function buildScheduleSections(
  events: ScheduleEvent[],
  mode: ScheduleViewMode,
  searchText: string
): ScheduleSection[] {
  const q = searchText.trim().toLowerCase();

  const filtered =
    q.length === 0
      ? events
      : events.filter((e) => {
          const haystack = [e.title, e.stage, e.category, e.description ?? "", ...(e.tags ?? [])]
            .join(" ")
            .toLowerCase();
          return haystack.includes(q);
        });

  const sorted = [...filtered].sort(byStartTimeThenTitle);

  if (mode === "time") return groupByKey(sorted, (e) => formatTimeBucket(e.startTime));
  if (mode === "stage") return groupByKey(sorted, (e) => e.stage);
  return groupByKey(sorted, (e) => e.category);
}