import React from "react";
import { View, StyleSheet } from "react-native";

import Screen from "../components/Screen";
import ScreenTitle from "../components/ScreenTitle";
import ThemedText from "../components/ThemedText";
import { useAppSettings } from "../context/AppSettingsContext";

export default function ExploreScreen() {
  const { theme } = useAppSettings();

  return (
    <Screen>
      <ScreenTitle title="Explore" />

      <View style={styles.body}>
        <ThemedText variant="h3" weight="800" style={{ marginBottom: 8 }}>
          Coming Soon
        </ThemedText>

        <ThemedText
          muted
          style={{
            textAlign: "center",
            lineHeight: Math.round(theme.typography.body * 1.4),
          }}
        >
          Artists, vendors, and festival highlights will appear here.
        </ThemedText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
});