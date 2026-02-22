/**
 * announcementsService.ts
 * -----------------------
 * Responsibility:
 *   Provide announcement data to be displayed in the AnnouncementsScreen.
 *
 * Design considerations:
 *   - Announcements are sorted by priority before being returned: urgent first,
 *     then personal, then general. This ordering is enforced here so no screen
 *     component needs to handle it.
 *   - Data currently loads from a local bundled file so announcements are visible
 *     without a network connection.
 *   - When the backend API is ready, swap getAnnouncements() to call
 *     getAnnouncementsFromApi() instead of loadSampleAnnouncements() —
 *     no screen components need to change.
 */

import { apiClient } from "./apiClient";
import type { Announcement, AnnouncementPriority } from "../models/Announcement";

/** Priority sort order — lower number appears first in the list. */
const PRIORITY_ORDER: Record<AnnouncementPriority, number> = {
  urgent: 0,
  personal: 1,
  general: 2,
};

/**
 * Sorts announcements by priority (urgent → personal → general).
 * Announcements of equal priority are sorted newest first by publishedAt.
 */
function sortAnnouncements(announcements: Announcement[]): Announcement[] {
  return [...announcements].sort((a, b) => {
    const priorityDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // Equal priority: sort newest first
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
}

/**
 * Reads announcement data from the local bundled dataset.
 * The require call allows the data to be packaged with the mobile app build.
 * Handles both a bare array and an object with an announcements property.
 */
function loadSampleAnnouncements(): Announcement[] {
  const data = require("../sample-data/announcements.sample.json");
  return Array.isArray(data) ? data : data.announcements ?? [];
}

/**
 * Fetches announcement data from the WordPress REST API.
 * Expected endpoint: GET /bumbershoot/v1/announcements
 *
 * Not yet active — call this from getAnnouncements() once Spencer's endpoint is confirmed working.
 */
async function getAnnouncementsFromApi(): Promise<Announcement[]> {
  return apiClient.get<Announcement[]>("/bumbershoot/v1/announcements");
}

/**
 * Returns all announcements sorted by priority.
 * Currently resolves immediately from local sample data.
 *
 * To switch to live data, replace loadSampleAnnouncements() with getAnnouncementsFromApi() below.
 */
export async function getAnnouncements(): Promise<Announcement[]> {
  const data = loadSampleAnnouncements();
  // TODO: switch to live API once Spencer's endpoint is ready:
  // const data = await getAnnouncementsFromApi();
  return sortAnnouncements(data);
}