import React from "react";
import { View, Text } from "react-native";

export default function EventDetailsScreen() {
  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "600" }}>Event Details</Text>
      <Text>Placeholder detail page</Text>
    </View>
  );
}