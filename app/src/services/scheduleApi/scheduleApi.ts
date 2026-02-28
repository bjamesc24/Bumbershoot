import { ScheduleEvent } from "../../types/schedule/scheduleTypes";

const SCHEDULE_URL = "replace"; // TODO replace

export async function fetchSchedule(): Promise<ScheduleEvent[]> {
  const res = await fetch(SCHEDULE_URL);            
    if (!res.ok) {
        throw new Error(`Failed to fetch schedule: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    if (!Array.isArray(data)) {
        throw new Error("Invalid schedule data format: expected an array");
    }
    return data.map((item) => ({
        id: String(item.id),
        title: String(item.title),
        startTime: String(item.startTime),
        endTime: String(item.endTime),
        stage: String(item.stage),
        category: String(item.category),
        description: item.description ? String(item.description) : undefined,
        tags: Array.isArray(item.tags) ? item.tags.map(String) : undefined,
    }));
}