/**
 * OfflineBanner.tsx
 * -----------------
 * Responsibility:
 *   Display a non-blocking notification when the device is offline.
 *
 * Notes:
 *   This component does NOT detect connectivity itself.
 *   Network state is provided by the useOfflineStatus hook.
 */

import React from "react";
import { Text, View } from "react-native";

type Props = {
  isOffline: boolean;
};

export default function OfflineBanner({ isOffline }: Props) {
  // Do not render the banner if connectivity is available.
  if (!isOffline) return null;

  return (
    <View style={{ backgroundColor: "#222", paddingVertical: 8, paddingHorizontal: 12 }}>
      <Text style={{ color: "white", textAlign: "center" }}>
        Offline mode: some data may be unavailable...
      </Text>
    </View>
  );
}