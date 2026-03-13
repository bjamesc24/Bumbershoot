/**
 * Announcement.ts
 * ---------------
 * Domain model aligned with Spencer's WP REST API shape.
 * Priority levels match the API: normal, important, urgent.
 * "For You" (important) is derived client-side when related_event.id
 * matches an attending record — not set by the backend.
 */

export type AnnouncementPriority = "urgent" | "important" | "normal";

export type AnnouncementRelatedEvent = {
  id: number;
  title: string;
  slug: string;
};

export type AnnouncementRelatedVenue = {
  id: number;
  title: string;
  short_name: string;
};

export type Announcement = {
  id: number;
  title: string;
  body: string;
  type: string;
  priority: AnnouncementPriority;
  is_pinned: boolean;
  published_at: string;
  expires_at: string | null;
  day: string | null;
  related_event: AnnouncementRelatedEvent | null;
  related_venue: AnnouncementRelatedVenue | null;
  external_url: string | null;
  external_url_label: string | null;
};