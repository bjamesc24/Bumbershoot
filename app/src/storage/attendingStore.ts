/**
 * attendingStore.ts
 * -----------------
 * Responsibility:
 *   Persist and retrieve the user's attending selections on-device.
 *
 * Design considerations:
 *   - Mirrors the structure of favoritesStore.ts for consistency.
 *   - Storage key is versioned ("v1") to allow schema evolution later.
 *   - Parsing is defensive: corrupted storage should never crash the UI.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

/** Versioned storage key for attending selections. */
export const ATTENDING_STORAGE_KEY = "attending:v1";

/**
 * Minimal record persisted for an attending selection.
 * Full event details are retrieved from the main dataset, not duplicated here.
 */
export type AttendingRecord = {
  /** Canonical, stable identifier (e.g., eventId). */
  id: string;

  /** Display fields for quick schedule rendering. */
  title?: string;
  start?: string; // ISO 8601 timestamp string
  end?: string;   // ISO 8601 timestamp string
  stage?: string;
};

/**
 * Parses persisted attending JSON into a safe, validated array.
 * If storage is missing or malformed, an empty list is returned.
 */
function safeParseAttending(json: string | null): AttendingRecord[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((x) => x && typeof x.id === "string")
      .map((x) => ({
        id: x.id,
        title: typeof x.title === "string" ? x.title : undefined,
        start: typeof x.start === "string" ? x.start : undefined,
        end: typeof x.end === "string" ? x.end : undefined,
        stage: typeof x.stage === "string" ? x.stage : undefined,
      }));
  } catch {
    return [];
  }
}

/**
 * Reads all attending selections from local storage.
 * Returns an array in all cases; never throws to the UI layer.
 */
export async function getAttending(): Promise<AttendingRecord[]> {
  const raw = await AsyncStorage.getItem(ATTENDING_STORAGE_KEY);
  return safeParseAttending(raw);
}

/**
 * Checks whether a specific id is marked as attending.
 */
export async function isAttending(id: string): Promise<boolean> {
  const attending = await getAttending();
  return attending.some((a) => a.id === id);
}

/**
 * Adds an attending selection by id (and optional display metadata).
 * If the selection already exists, the operation is a no-op.
 */
export async function addAttending(input: {
  id: string;
  title?: string;
  start?: string;
  end?: string;
  stage?: string;
}): Promise<AttendingRecord[]> {
  const attending = await getAttending();

  if (attending.some((a) => a.id === input.id)) {
    return attending;
  }

  const newRecord: AttendingRecord = {
    id: input.id,
    title: input.title,
    start: input.start,
    end: input.end,
    stage: input.stage,
  };

  const updated = [newRecord, ...attending];
  await AsyncStorage.setItem(ATTENDING_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * Removes an attending selection by id.
 */
export async function removeAttending(id: string): Promise<AttendingRecord[]> {
  const attending = await getAttending();
  const updated = attending.filter((a) => a.id !== id);
  await AsyncStorage.setItem(ATTENDING_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * Toggles attending state for an id.
 * Returns both the updated collection and the resulting boolean state.
 */
export async function toggleAttending(input: {
  id: string;
  title?: string;
  start?: string;
  end?: string;
  stage?: string;
}): Promise<{ attending: AttendingRecord[]; isNowAttending: boolean }> {
  const attending = await getAttending();
  const exists = attending.some((a) => a.id === input.id);

  if (exists) {
    const updated = await removeAttending(input.id);
    return { attending: updated, isNowAttending: false };
  } else {
    const updated = await addAttending(input);
    return { attending: updated, isNowAttending: true };
  }
}

/**
 * Removes all attending selections from local storage.
 */
export async function clearAttending(): Promise<void> {
  await AsyncStorage.removeItem(ATTENDING_STORAGE_KEY);
}