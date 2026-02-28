import * as React from "react";
import { ActivityIndicator, View, Text, StyleSheet } from "react-native";

export function LoadingState() {
  return (
    <View style={s.wrap}>
      <ActivityIndicator size="large" />
      <Text style={s.text}>Loading schedule…</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  text: { marginTop: 12, fontSize: 16 },
});