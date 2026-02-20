/**
 * favoritesStore.ts
 * ------------------
 * Purpose:
 *  - Provide a small, reliable API for saving and loading user favorites locally.
 *  - Favorites must work with NO user accounts and must remain available offline.
 *
 * Why this exists:
 *  - The app is "stability-first" and "offline-first".
 *  - We store favorites on-device (AsyncStorage) so the user’s plan survives:
 *      - poor connectivity
 *      - app restarts
 *      - festival day usage
 *
 * What we store:
 *  - We store only IDs + minimal metadata (title/start time) to keep storage small.
 *  - The full event details always come from the schedule dataset.
 *
 * Storage key is versioned ("v1") so we can evolve the schema later without breaking users.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

export const FAVORITES_STORAGE_KEY = "favorites:v1";

/**
 * Minimal favorite record stored on-device.
 * (We purposely do NOT store the full event object.)
 */
export type FavoriteRecord = {
  /** Stable canonical ID for the favorited item (event ID for Week 1). */
  id: string;

  /** Optional minimal metadata for display, so Favorites can render quickly. */
  title?: string;
  start?: string; // ISO timestamp string recommended (e.g., "2026-09-02T19:30:00Z")

  /** When the user favorited it (useful later for debugging and ordering). */
  savedAt: string; // ISO timestamp
};

/**
 * Safely parse JSON into FavoriteRecord[].
 * If something goes wrong (corrupted storage), we fall back to an empty list.
 */
function safeParseFavorites(json: string | null): FavoriteRecord[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];

    // Basic shape validation
    return parsed
      .filter((x) => x && typeof x.id === "string")
      .map((x) => ({
        id: x.id,
        title: typeof x.title === "string" ? x.title : undefined,
        start: typeof x.start === "string" ? x.start : undefined,
        savedAt: typeof x.savedAt === "string" ? x.savedAt : new Date().toISOString(),
      }));
  } catch {
    return [];
  }
}

/**
 * Load favorites from AsyncStorage.
 * Always returns an array (never throws).
 */
export async function getFavorites(): Promise<FavoriteRecord[]> {
  const raw = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
  return safeParseFavorites(raw);
}

/**
 * Returns true if an ID is currently favorited.
 */
export async function isFavorited(id: string): Promise<boolean> {
  const favorites = await getFavorites();
  return favorites.some((f) => f.id === id);
}

/**
 * Add a favorite (id + optional metadata).
 * If it already exists, this is a no-op.
 */
export async function addFavorite(input: {
  id: string;
  title?: string;
  start?: string;
}): Promise<FavoriteRecord[]> {
  const favorites = await getFavorites();

  // No duplicates
  if (favorites.some((f) => f.id === input.id)) {
    return favorites;
  }

  const newRecord: FavoriteRecord = {
    id: input.id,
    title: input.title,
    start: input.start,
    savedAt: new Date().toISOString(),
  };

  const updated = [newRecord, ...favorites];
  await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * Remove a favorite by ID.
 */
export async function removeFavorite(id: string): Promise<FavoriteRecord[]> {
  const favorites = await getFavorites();
  const updated = favorites.filter((f) => f.id !== id);
  await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * Toggle favorite status.
 * Returns the updated list and the new boolean state.
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
 * Utility: clear favorites (useful for testing/demo).
 * Do NOT expose this in production UI, but it’s helpful for development.
 */
export async function clearFavorites(): Promise<void> {
  await AsyncStorage.removeItem(FAVORITES_STORAGE_KEY);
}