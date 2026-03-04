import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

import OfflineBanner from "../components/OfflineBanner";
import { useOfflineStatus } from "../hooks/useOfflineStatus";
import { ThemePalette, ThemeColor, useAppSettings } from "../context/AppSettingsContext";

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const isOffline = useOfflineStatus();

  const {
    themeColorKey,
    themeColorHex,
    tabTextSize,
    setThemeColorKey,
    setTabTextSize,
  } = useAppSettings();

  const SIZES = [10, 12, 14, 16, 18];

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <OfflineBanner isOffline={isOffline} />

      <View style={styles.safeHeader}>
        <Pressable
          onPress={() => navigation.navigate("Tabs", { screen: "ScheduleTab" })}
          style={styles.closeButton}
          hitSlop={10}
        >
          <Text style={styles.closeText}>×</Text>
        </Pressable>

        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
       
        <Text style={styles.sectionTitle}>Theme color</Text>
        <Text style={styles.sectionSub}>Changes active tab highlight color.</Text>

        <View style={styles.rowWrap}>
          {(Object.keys(ThemePalette) as ThemeColor[]).map((key) => {
            const isSelected = key === themeColorKey;
            return (
              <Pressable
                key={key}
                onPress={() => setThemeColorKey(key)}
                style={[
                  styles.colorChip,
                  { borderColor: isSelected ? themeColorHex : "#ddd" },
                ]}
              >
                <View
                  style={[
                    styles.colorDot,
                    { backgroundColor: ThemePalette[key] },
                  ]}
                />
                <Text style={styles.chipText}>{key}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ height: 18 }} />

        <Text style={styles.sectionTitle}>Tab text size</Text>
        <Text style={styles.sectionSub}>Adjust label size on bottom tabs.</Text>

        <View style={styles.sizeRow}>
          {SIZES.map((s) => {
            const isSelected = s === tabTextSize;
            return (
              <Pressable
                key={s}
                onPress={() => setTabTextSize(s)}
                style={[
                  styles.sizeChip,
                  {
                    borderColor: isSelected ? themeColorHex : "#ddd",
                    backgroundColor: isSelected ? "rgba(0,0,0,0.04)" : "#fff",
                  },
                ]}
              >
                <Text style={[styles.sizeText, { fontSize: s }]}>{s}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={{ marginTop: 12, opacity: 0.6 }}>
          Tip: choose 12–14 for normal, 16–18 for accessibility.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeHeader: {
    paddingTop: 50, 
    paddingHorizontal: 16,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    marginTop: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
  },
  sectionSub: {
    opacity: 0.6,
    marginBottom: 12,
  },
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  colorChip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 8,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  sizeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  sizeChip: {
    borderWidth: 2,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  sizeText: {
    fontWeight: "800",
  },
});