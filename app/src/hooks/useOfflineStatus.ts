/**
 * useOfflineStatus.ts
 * -------------------
 * Responsibility:
 *   Detect whether the device currently has network connectivity.
 * 
 * Implementation notes:
 *   Uses @react-native-community/netinfo, the standard React Native API for
 *   monitoring connectivity changes.
 */

import { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";

export function useOfflineStatus(): boolean {
  // Assume online until a network state is reported.
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Listen for connectivity updates from the OS.
    const unsubscribe = NetInfo.addEventListener((state) => {
      // Some platforms may report null initially; treat as connected.
      const connected = state.isConnected ?? true;
      setIsOffline(!connected);
    });

    // Clean up the listener when the component unmounts.
    return () => unsubscribe();
  }, []);

  return isOffline;
}