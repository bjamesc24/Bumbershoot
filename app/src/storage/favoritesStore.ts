/**
 * favoritesStore.ts
 * -----------------
 * Responsibility:
 *   Persist and retrieve the user's favorites on-device.
 *
 * Design considerations:
 *   - Storage key is versioned ("v1") to allow schema evolution later.
 *   - Parsing is defensive: corrupted storage should never crash the UI.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

/** Versioned storage key for favorites (supports future schema changes). */
export const FAVORITES_STORAGE_KEY = "favorites:v1";

/**
 * Minimal record persisted for a favorited entity.
 * (Full entity details are retrieved from the main dataset, not duplicated here.)
 */
export type FavoriteRecord = {
  /** Canonical, stable identifier (e.g., eventId). */
  id: string;

  /** Display fields for quick list rendering. */
  title?: string;
  start?: string; // ISO 8601 timestamp string
};

/**
 * Parses persisted favorites JSON into a safe, validated array.
 * If storage is missing or malformed, an empty list is returned.
 */
function safeParseFavorites(json: string | null): FavoriteRecord[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];

    // Minimal shape validation: id must exist and be a string.
    return parsed
      .filter((x) => x && typeof x.id === "string")
      .map((x) => ({
        id: x.id,
        title: typeof x.title === "string" ? x.title : undefined,
        start: typeof x.start === "string" ? x.start : undefined,
      }));
  } catch {
    return [];
  }
}

/**
 * Reads all favorites from local storage.
 * Returns an array in all cases; never throws to the UI layer.
 */
export async function getFavorites(): Promise<FavoriteRecord[]> {
  const raw = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
  return safeParseFavorites(raw);
}

/**
 * Checks whether a specific id is currently favorited.
 */
export async function isFavorited(id: string): Promise<boolean> {
  const favorites = await getFavorites();
  return favorites.some((f) => f.id === id);
}

/**
 * Adds a favorite by id (and optional display metadata).
 * If the favorite already exists, the operation is a no-op.
 */
export async function addFavorite(input: {
  id: string;
  title?: string;
  start?: string;
}): Promise<FavoriteRecord[]> {
  const favorites = await getFavorites();

  // Prevent duplicates
  if (favorites.some((f) => f.id === input.id)) {
    return favorites;
  }

  const newRecord: FavoriteRecord = {
    id: input.id,
    title: input.title,
    start: input.start,
  };

  const updated = [newRecord, ...favorites];
  await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * Removes a favorite by id.
 */
export async function removeFavorite(id: string): Promise<FavoriteRecord[]> {
  const favorites = await getFavorites();
  const updated = favorites.filter((f) => f.id !== id);
  await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * Toggles favorite state for an id.
 * Returns both the updated collection and the resulting boolean state.
 */
export async function toggleFavorite(input: {
  id: string;
  title?: string;
  start?: string;
}): Promise<{ favorites: FavoriteRecord[]; isNowFavorited: boolean }> {
  const favorites = await getFavorites();
  const exists = favorites.some((f) => f.id === input.id);

  if (exists) {
    const updated = await removeFavorite(input.id);
    return { favorites: updated, isNowFavorited: false };
  } else {
    const updated = await addFavorite(input);
    return { favorites: updated, isNowFavorited: true };
  }
}

/**
 * Removes all favorites from local storage.
 * Useful for development/testing and for resetting state.
 */
export async function clearFavorites(): Promise<void> {
  await AsyncStorage.removeItem(FAVORITES_STORAGE_KEY);
}