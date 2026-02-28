import * as React from "react";
import { ActivityIndicator, View, Text, StyleSheet } from "react-native";

type LoadingStateProps = { visible?: boolean };

export default function LoadingState({ visible = true }: LoadingStateProps) {
  if (!visible) return null;
  // ...existing loading UI
}

const s = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  text: { marginTop: 12, fontSize: 16 },
});