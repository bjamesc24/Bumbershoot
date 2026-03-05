// app/src/services/scheduleService.ts

/**
 * scheduleService.ts
 * ------------------
 * Responsibility:
 *   Provide schedule/event data to the UI.
 *
 * Current state:
 *   Uses local/mock schedule data so the app functions offline and during early development.
 *
 * Future state:
 *   When Spencer's backend schedule endpoint is fully confirmed, switch
 *   getSchedule() to call getScheduleFromApi().
 */

import { apiClient } from "./apiClient";

// IMPORTANT:
// I don't know your exact schedule type names yet because this file was empty.
// If you already have a type like Event/ScheduleItem defined elsewhere,
// replace "any" with the correct type.
import { fakeSchedule } from "./fakeSchedule"; // If your fakeSchedule exports differently, tell me and I’ll adjust.

// Replace `any` with your real type once confirmed (ex: Event[] or ScheduleItem[]).
export type ScheduleResponse = any;

/**
 * Fetches schedule data from the WordPress REST API.
 * Expected endpoint (based on the wp/endpoints docs pattern):
 *   GET /wp-json/bumbershoot/v1/schedule
 *
 * Since apiClient BASE_URL already includes "/wp-json", we call:
 *   /bumbershoot/v1/schedule
 */
async function getScheduleFromApi(): Promise<ScheduleResponse> {
  return apiClient.get<ScheduleResponse>("/bumbershoot/v1/schedule");
}

/**
 * Returns schedule data for the app.
 *
 * For now: return bundled/mock data so the app works without backend.
 * Later: replace with the live API call once fully confirmed.
 */
export async function getSchedule(): Promise<ScheduleResponse> {
  // TODO: switch to live API once endpoint is confirmed working:
  // return getScheduleFromApi();

  // Offline/dev fallback:
  return fakeSchedule as ScheduleResponse;
}