/**
 * scheduleTypes.ts
 * ----------------
 * Responsibility:
 *   Define the unified ScheduleItem type used across the schedule screens.
 *
 * Design considerations:
 *   - ScheduleItem replaces ScheduleEvent and covers all item types:
 *     events, workshops, vendors, food trucks, artists.
 *   - itemType distinguishes the source so UI can style/filter accordingly.
 *   - Vendors/food trucks without set times default to festival open/close hours
 *     at the data mapping layer (useScheduleData).
 *   - ScheduleEvent is kept as a type alias for backward compatibility.
 */

export type ScheduleItemType =
  | "event"
  | "workshop"
  | "vendor"
  | "food_truck"
  | "artist";

export type ScheduleItem = {
  /** Stable unique identifier */
  id: string;

  /** Display title */
  title: string;

  /** ISO 8601 start time */
  startTime: string;

  /** ISO 8601 end time */
  endTime: string;

  /** Stage name or physical location */
  stage: string;

  /** Broad category label e.g. "Music", "Food", "Workshop" */
  category: string;

  /** Specific item type for filtering */
  itemType: ScheduleItemType;

  /** Optional long description */
  description?: string;

  /** Optional search tags */
  tags?: string[];
};

/** Backward-compatible alias used by existing components */
export type ScheduleEvent = ScheduleItem;

export type ScheduleSection = {
  title: string;
  data: ScheduleItem[];
};

export type ScheduleViewMode = "time" | "stage" | "category";

export type ScheduleSortMode = "time" | "category" | "type";

export type ScheduleTypeFilter =
  | "all"
  | "event"
  | "workshop"
  | "vendor"
  | "food_truck"
  | "artist";

/** Festival open/close defaults for vendors and food trucks without set times */
export const FESTIVAL_OPEN = "T10:00:00";
export const FESTIVAL_CLOSE = "T22:00:00";