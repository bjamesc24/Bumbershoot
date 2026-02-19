import React from "react";
import { Text, View } from "react-native";

type Props = {
  isOffline: boolean;
};

export default function OfflineBanner({ isOffline }: Props) {
  if (!isOffline) return null;

  return (
    <View style={{ backgroundColor: "#222", paddingVertical: 8, paddingHorizontal: 12 }}>
      <Text style={{ color: "white", textAlign: "center" }}>
        Offline mode: some data may be unavailable...
      </Text>
    </View>
  );
}