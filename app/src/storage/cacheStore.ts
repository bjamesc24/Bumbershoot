import AsyncStorage from "@react-native-async-storage/async-storage";

/*
  Change-check metadata keys
  These values persist across app restarts.
*/

const LAST_CHANGE_CHECK_AT_KEY = "cache:lastChangeCheckAt";
const REMOTE_VERSION_KEY = "cache:remoteVersion";
const LAST_UPDATED_KEY = "cache:lastUpdated";

/* ================================
   Last Change Check Timestamp
================================ */

export async function getLastChangeCheckAt(): Promise<number | null> {
  const raw = await AsyncStorage.getItem(LAST_CHANGE_CHECK_AT_KEY);
  if (!raw) return null;

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function setLastChangeCheckAt(valueMs: number): Promise<void> {
  await AsyncStorage.setItem(LAST_CHANGE_CHECK_AT_KEY, String(valueMs));
}

/* ================================
   Remote Version
================================ */

export async function getRemoteVersion(): Promise<number | null> {
  const raw = await AsyncStorage.getItem(REMOTE_VERSION_KEY);
  if (!raw) return null;

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function setRemoteVersion(version: number): Promise<void> {
  await AsyncStorage.setItem(REMOTE_VERSION_KEY, String(version));
}

/* ================================
   Last Updated ISO String
================================ */

export async function getLastUpdated(): Promise<string | null> {
  return await AsyncStorage.getItem(LAST_UPDATED_KEY);
}

export async function setLastUpdated(lastUpdatedIso: string): Promise<void> {
  await AsyncStorage.setItem(LAST_UPDATED_KEY, lastUpdatedIso);
}