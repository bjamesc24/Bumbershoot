/**
 * useOfflineStatus.ts
 * -------------------
 * Purpose:
 *  - Provide a simple boolean that tells the UI whether the device currently
 *    appears to be offline.
 *
 * Why we need this:
 *  - This capstone is "stability-first" and must behave predictably when
 *    connectivity is poor (common at festivals).
 *  - Screens use this hook to show an OfflineBanner, but they should still
 *    render cached/local data whenever possible.
 *
 * Implementation:
 *  - Uses @react-native-community/netinfo, which is the standard approach
 *    in React Native/Expo for network status.
 */

import { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";

export function useOfflineStatus(): boolean {
  // Default to "online" until we know otherwise.
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Subscribe to connectivity changes.
    const unsubscribe = NetInfo.addEventListener((state) => {
      // state.isConnected can be null on first load; treat null as "unknown/online"
      const connected = state.isConnected ?? true;
      setIsOffline(!connected);
    });

    return () => unsubscribe();
  }, []);

  return isOffline;
}