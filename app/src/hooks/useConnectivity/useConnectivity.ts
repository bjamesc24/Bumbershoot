import { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";

export function useConnectivity() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsub = NetInfo.addEventListener((s) => {
      setIsOnline(Boolean(s.isConnected && s.isInternetReachable !== false));
    });
    return () => unsub();
  }, []);

  return { isOnline };
}