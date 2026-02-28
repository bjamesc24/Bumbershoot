import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScheduleEvent } from "../../types/schedule/scheduleTypes";

const KEY_EVENTS = "schedule.events";
const KEY_LAST_UPDATED = "schedule.lastUpdatedMs";

export async function saveScheduleCache(events: ScheduleEvent[], lastUpdatedMs: number) {
  await AsyncStorage.multiSet([
    [KEY_EVENTS, JSON.stringify(events)],
    [KEY_LAST_UPDATED, String(lastUpdatedMs)],
  ]);
}

export async function loadScheduleCache(): Promise<{ events: ScheduleEvent[]; lastUpdatedMs: number | null }> {
  const [[, eventsJson], [, lastUpdatedStr]] = await AsyncStorage.multiGet([KEY_EVENTS, KEY_LAST_UPDATED]);
  return {
    events: eventsJson ? (JSON.parse(eventsJson) as ScheduleEvent[]) : [],
    lastUpdatedMs: lastUpdatedStr ? Number(lastUpdatedStr) : null,
  };
}