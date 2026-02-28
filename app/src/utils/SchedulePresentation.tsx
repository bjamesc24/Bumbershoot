import { ScheduleEvent, ScheduleSection, ScheduleViewMode } from "../models/scheduleType";

function byStartTimeThenTitle(a: ScheduleEvent, b: ScheduleEvent) {
  const tA = new Date(a.startTime).getTime();
  const tB = new Date(b.startTime).getTime();
  if (tA !== tB) return tA - tB;
  return a.title.localeCompare(b.title);
}

function formatTimeBucket(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" });
}

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
          const haystack = [
            e.title,
            e.stage,
            e.category,
            e.description ?? "",
            ...(e.tags ?? []),
          ]
            .join(" ")
            .toLowerCase();
          return haystack.includes(q);
        });

  const sorted = [...filtered].sort(byStartTimeThenTitle);

  if (mode === "time") return groupByKey(sorted, (e) => formatTimeBucket(e.startTime));
  if (mode === "stage") return groupByKey(sorted, (e) => e.stage);
  return groupByKey(sorted, (e) => e.category);
}