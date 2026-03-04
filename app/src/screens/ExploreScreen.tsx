import React from "react";
import { View, Text, StyleSheet } from "react-native";
import ScreenTitle from "../components/ScreenTitle";

export default function ExploreScreen() {
  return (
    <View style={styles.wrap}>
      <ScreenTitle title="Explore" />
      <View style={styles.body}>
        <Text style={styles.heading}>Coming Soon</Text>
        <Text style={styles.sub}>
          Artists, vendors, and festival highlights will appear here.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: "#fff" },
  body: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  heading: { fontSize: 22, fontWeight: "800", marginBottom: 8 },
  sub: { fontSize: 15, opacity: 0.6, textAlign: "center", lineHeight: 22 },
});