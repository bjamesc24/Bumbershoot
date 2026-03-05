// app/src/storage/schemaVersion.ts
//
// Purpose:
// - Persist lightweight sync metadata in local storage.
// - Used by useAutoRefresh() to enforce intervals and track last successful sync.
//
// Stores:
// - last successful sync timestamp (ISO string)
// - last change-check time (milliseconds since epoch)

import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  LAST_SUCCESSFUL_SYNC_AT: "sync:lastSuccessfulSyncAt", // ISO string
  LAST_CHANGE_CHECK_MS: "sync:lastChangeCheckMs", // number as string
};

/**
 * Returns the ISO timestamp of the last successful full refresh.
 * If never synced, returns null.
 */
export async function getLastSuccessfulSyncAt(): Promise<string | null> {
  const value = await AsyncStorage.getItem(KEYS.LAST_SUCCESSFUL_SYNC_AT);
  return value ?? null;
}

/**
 * Saves the ISO timestamp of the last successful full refresh.
 */
export async function setLastSuccessfulSyncAt(iso: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.LAST_SUCCESSFUL_SYNC_AT, iso);
}

/**
 * Returns the last time we attempted a /changes check, as ms since epoch.
 * If never checked, returns null.
 */
export async function getLastChangeCheckMs(): Promise<number | null> {
  const value = await AsyncStorage.getItem(KEYS.LAST_CHANGE_CHECK_MS);
  if (!value) return null;

  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * Saves the time we attempted a /changes check.
 * Accepts an ISO timestamp; we store it as ms for fast interval comparisons.
 */
export async function setLastChangeCheckAt(iso: string): Promise<void> {
  const ms = new Date(iso).getTime();
  await AsyncStorage.setItem(KEYS.LAST_CHANGE_CHECK_MS, String(ms));
}