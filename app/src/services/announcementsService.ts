/**
 * announcementsService.ts
 * -----------------------
 * Aligned to Spencer's WP REST API shape.
 *
 * "For You" logic:
 *   Announcements with a related_event.id are checked against the user's
 *   attending list. Music items use prefix "music-{id}", art items use
 *   "art-{id}". A match promotes the announcement to "important" priority.
 *
 * Sort order mirrors the API spec:
 *   1. Pinned first
 *   2. Then urgent → important → normal
 *   3. Then newest first within each priority
 */

import { apiClient } from "./apiClient";
import { getAttending } from "../storage/attendingStore";
import type { Announcement, AnnouncementPriority } from "../models/Announcement";

const PRIORITY_ORDER: Record<AnnouncementPriority, number> = {
  urgent: 0,
  important: 1,
  normal: 2,
};

function sortAnnouncements(announcements: Announcement[]): Announcement[] {
  return [...announcements].sort((a, b) => {
    const aPinned = a.is_pinned ?? false;
    const bPinned = b.is_pinned ?? false;
    if (aPinned !== bPinned) return aPinned ? -1 : 1;

    const priorityDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (priorityDiff !== 0) return priorityDiff;

    return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
  });
}

function loadSampleAnnouncements(): Announcement[] {
  const data = require("../sample-data/announcements.sample.json");
  const list = Array.isArray(data) ? data : (data?.announcements ?? []);
  return list.filter((x: any) => x != null);
}

async function getAnnouncementsFromApi(): Promise<Announcement[]> {
  const data = await apiClient.get<{ announcements: Announcement[] }>(
    "/bumbershoot/v1/announcements"
  );
  return data.announcements ?? [];
}

export async function getAnnouncements(): Promise<Announcement[]> {
  const [raw, attending] = await Promise.all([
    Promise.resolve(loadSampleAnnouncements()),
    getAttending(),
  ]);

  if (!Array.isArray(raw) || raw.length === 0) return [];

  const attendingIds = new Set(attending.map((a) => a.id));

  // Debug — remove once confirmed working
  console.log("attending ids:", [...attendingIds]);
  console.log("checking against music-103, art-338, music-203");

  const promoted = raw.map((ann) => {
    if (!ann?.related_event?.id) return ann;

    const musicId = `music-${ann.related_event.id}`;
    const artId = `art-${ann.related_event.id}`;

    console.log(`ann ${ann.id}: checking ${musicId} / ${artId}`);

    if (attendingIds.has(musicId) || attendingIds.has(artId)) {
      console.log(`ann ${ann.id}: promoted to important`);
      return { ...ann, priority: "important" as AnnouncementPriority };
    }
    return ann;
  });

  return sortAnnouncements(promoted);
}