/**
 * scheduleTypes.ts
 * ----------------
 * Responsibility:
 *   Define the unified ScheduleItem type used across the schedule screens.
 *
 * Current app model:
 *   - Music schedule items come from music.sample.json
 *   - Art schedule items come from art.sample.json
 *   - Vendors, stages, and districts are handled elsewhere in the app
 *
 * Design considerations:
 *   - ScheduleItem is now focused on scheduled content only
 *   - itemType distinguishes whether the scheduled item opens a musician
 *     or artist detail screen
 *   - rawItem preserves the original source object for navigation
 */

export type ScheduleItemType =
  | "musician"
  | "artist";

export type ScheduleItem = {
  /** Stable unique identifier used in schedule + My Plan */
  id: string;

  /** Display title */
  title: string;

  /** ISO 8601 start time */
  startTime: string;

  /** ISO 8601 end time */
  endTime: string;

  /**
   * Shared display/location field for schedule views.
   * - Music items use the stage name
   * - Art items use the district name
   */
  stage: string;

  /** Broad category label such as genre, event category, or art category */
  category: string;

  /** Specific scheduled content type */
  itemType: ScheduleItemType;

  /** Optional long description */
  description?: string;

  /** Optional search tags */
  tags?: string[];

  /** Original source object from local sample-data */
  rawItem?: any;
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
  | "musician"
  | "artist";