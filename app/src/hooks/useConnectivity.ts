/**
 * useConnectivity.ts
 * ------------------
 * Responsibility:
 *   Detect whether the device has an active internet connection.
 *
 * Design considerations:
 *   - Returns isOnline (true = connected) rather than isOffline to match
 *     the convention used in schedule-related hooks and components.
 *   - Checks both isConnected and isInternetReachable for a more reliable result.
 */

import { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";

export function useConnectivity() {
  // Assume online until the OS reports otherwise
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Listen for connectivity changes from the OS
    const unsub = NetInfo.addEventListener((s) => {
      setIsOnline(Boolean(s.isConnected && s.isInternetReachable !== false));
    });

    // Clean up listener when the component unmounts
    return () => unsub();
  }, []);

  return { isOnline };
}