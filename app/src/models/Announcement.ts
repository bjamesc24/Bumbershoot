/**
 * Announcement.ts
 * ---------------
 * Domain model representing a festival announcement.
 *
 * Priority levels:
 *   - urgent:   Safety alerts, cancellations, or time-sensitive festival-wide information.
 *   - personal: Directly impacts the user because it relates to one of their favorited events.
 *   - general:  Casual festival updates, vendor info, or general interest posts.
 *
 * Design considerations:
 *   - The optional eventId field links an announcement to a specific event.
 *     This is used to promote an announcement to "personal" priority when the
 *     referenced event appears in the user's favorites.
 */

export type AnnouncementPriority = "urgent" | "personal" | "general";

export type Announcement = {
  /** Canonical, stable identifier for the announcement. */
  id: string;

  /** Short headline displayed at the top of the card. */
  title: string;

  /** Full announcement message. */
  message: string;

  /** Controls sort order and visual treatment in the list. */
  priority: AnnouncementPriority;

  /** ISO 8601 timestamp string indicating when the announcement was published. */
  publishedAt: string;

  /**
   * Optional reference to a specific event.
   * When present and the event is in the user's favorites,
   * this announcement should be treated as personal priority.
   */
  eventId?: string;
};