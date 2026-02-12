import React from "react";
import { View, Text } from "react-native";

export default function FavoritesScreen() {
  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "600" }}>Favorites</Text>
      <Text>Placeholder favorites</Text>
    </View>
  );
}
