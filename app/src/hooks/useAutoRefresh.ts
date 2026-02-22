import { useCallback, useRef, useState } from "react";

import { getChanges } from "../services/changesService";
import { MIN_CHANGE_CHECK_INTERVAL_MS } from "../constants/refresh";
import {
  getLastChangeCheckAt,
  setLastChangeCheckAt,
  getRemoteVersion,
  setRemoteVersion,
  setLastUpdated,
} from "../storage/cacheStore";

// Week-1 hook: change-check only (no full refetch)
export function useAutoRefresh() {
  const inFlightRef = useRef(false);
  const [needsRefresh, setNeedsRefresh] = useState(false);

  const runChangeCheck = useCallback(async () => {
    // 1) One request in flight
    if (inFlightRef.current) {
      console.log("[AutoRefresh] Skipping: change-check already in flight");
      return { needsRefresh: false, skipped: true, reason: "in_flight" as const };
    }

    inFlightRef.current = true;

    try {
      const now = Date.now();

      // 2) Enforce minimum interval
      const lastCheckAt = await getLastChangeCheckAt();
      if (lastCheckAt && now - lastCheckAt < MIN_CHANGE_CHECK_INTERVAL_MS) {
        console.log("[AutoRefresh] Skipping: within min interval");
        return {
          needsRefresh: false,
          skipped: true,
          reason: "min_interval" as const,
        };
      }

      console.log("[AutoRefresh] Checking /changes...");

      // 3) Call getChanges()
      const changes = await getChanges();

      // 4) Compare remote vs cached version
      const localVersion = (await getRemoteVersion()) ?? 0;
      const remoteVersion = changes.version;

      const shouldRefresh = remoteVersion > localVersion;

      console.log(
        `[AutoRefresh] localVersion=${localVersion}, remoteVersion=${remoteVersion}, shouldRefresh=${shouldRefresh}`
      );

      // 5) Store always: lastChangeCheckAt + remote version (if received) + lastUpdated
      await setLastChangeCheckAt(now);
      await setRemoteVersion(remoteVersion);
      if (changes.lastUpdated) {
        await setLastUpdated(changes.lastUpdated);
      }

      // 6) Flag only (no dataset refetch this week)
      if (shouldRefresh) {
        setNeedsRefresh(true);
      }

      return { needsRefresh: shouldRefresh, skipped: false };
    } catch (err) {
      console.log("[AutoRefresh] /changes failed, using cache", err);

      // Week-1 rule: keep cache, do not crash, do not spam retry loops
      // (We also purposely do NOT update lastChangeCheckAt on failure)
      return { needsRefresh: false, skipped: false, error: true as const };
    } finally {
      inFlightRef.current = false;
    }
  }, []);

  return {
    needsRefresh,
    runChangeCheck,
    setNeedsRefresh, // allows UI to clear the flag after user refreshes
  };
}