/**
 * scheduleStorage.ts
 * ------------------
 * Responsibility:
 *   Persist and retrieve the schedule event cache on-device.
 *
 * Design considerations:
 *   - Events and last updated timestamp are stored as separate AsyncStorage keys
 *     so the timestamp can be read cheaply without deserializing the full event list.
 *   - Parsing is defensive — missing or malformed data returns an empty safe result.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScheduleEvent } from "../models/schedule/scheduleTypes";

/** Storage key for the cached event list. */
const KEY_EVENTS = "schedule.events";

/** Storage key for the last successful cache timestamp. */
const KEY_LAST_UPDATED = "schedule.lastUpdatedMs";

/**
 * Persists schedule events and the timestamp of when they were fetched.
 */
export async function saveScheduleCache(events: ScheduleEvent[], lastUpdatedMs: number): Promise<void> {
  await AsyncStorage.multiSet([
    [KEY_EVENTS, JSON.stringify(events)],
    [KEY_LAST_UPDATED, String(lastUpdatedMs)],
  ]);
}

/**
 * Reads the cached schedule from storage.
 * Returns empty events and null timestamp if nothing is cached yet.
 */
export async function loadScheduleCache(): Promise<{ events: ScheduleEvent[]; lastUpdatedMs: number | null }> {
  const [[, eventsJson], [, lastUpdatedStr]] = await AsyncStorage.multiGet([KEY_EVENTS, KEY_LAST_UPDATED]);
  return {
    events: eventsJson ? (JSON.parse(eventsJson) as ScheduleEvent[]) : [],
    lastUpdatedMs: lastUpdatedStr ? Number(lastUpdatedStr) : null,
  };
}