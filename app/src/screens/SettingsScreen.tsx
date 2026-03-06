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
    setThemeColorKey,

    // NEW (you add in context)
    colorMode,
    setColorMode,
    contrastMode,
    setContrastMode,
    textScale,
    setTextScale,

    // NEW (derived tokens)
    theme,
  } = useAppSettings();

  const TEXT_SCALES = [
    { label: "Default", value: 1.0 },
    { label: "Large", value: 1.15 },
    { label: "Extra Large", value: 1.3 },
  ] as const;

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <OfflineBanner isOffline={isOffline} />

      <View style={styles.safeHeader}>
        <Pressable
          onPress={() => navigation.navigate("Tabs", { screen: "ScheduleTab" })}
          style={[
            styles.closeButton,
            { backgroundColor: theme.colors.primary },
          ]}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Close settings"
        >
          <Text style={[styles.closeText, { color: theme.colors.primaryText }]}>×</Text>
        </Pressable>

        <Text style={[styles.headerTitle, { color: theme.colors.text, fontSize: theme.typography.h1 }]}>
          Settings
        </Text>
      </View>

      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        {/* Appearance */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text, fontSize: theme.typography.h3 }]}>
          Appearance
        </Text>
        <Text style={[styles.sectionSub, { color: theme.colors.textMuted }]}>
          Choose light/dark or follow your system.
        </Text>

        <View style={styles.rowWrap}>
          {(["system", "light", "dark"] as const).map((mode) => {
            const selected = mode === colorMode;
            return (
              <Pressable
                key={mode}
                onPress={() => setColorMode(mode)}
                style={[
                  styles.choiceChip,
                  {
                    borderColor: selected ? themeColorHex : theme.colors.border,
                    backgroundColor: selected ? theme.colors.surface2 : theme.colors.surface,
                  },
                ]}
              >
                <Text style={[styles.chipText, { color: theme.colors.text }]}>
                  {mode.toUpperCase()}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ height: 18 }} />

        {/* Contrast */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text, fontSize: theme.typography.h3 }]}>
          Contrast
        </Text>
        

        <View style={styles.rowWrap}>
          {(["normal", "high"] as const).map((m) => {
            const selected = m === contrastMode;
            return (
              <Pressable
                key={m}
                onPress={() => setContrastMode(m)}
                style={[
                  styles.choiceChip,
                  {
                    borderColor: selected ? themeColorHex : theme.colors.border,
                    backgroundColor: selected ? theme.colors.surface2 : theme.colors.surface,
                  },
                ]}
              >
                <Text style={[styles.chipText, { color: theme.colors.text }]}>
                  {m === "high" ? "HIGH" : "NORMAL"}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ height: 18 }} />

        {/* Global text size */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text, fontSize: theme.typography.h3 }]}>
          Text size
        </Text>
        

        <View style={styles.rowWrap}>
          {TEXT_SCALES.map((t) => {
            const selected = Math.abs(textScale - t.value) < 0.01;
            return (
              <Pressable
                key={t.label}
                onPress={() => setTextScale(t.value)}
                style={[
                  styles.choiceChip,
                  {
                    borderColor: selected ? themeColorHex : theme.colors.border,
                    backgroundColor: selected ? theme.colors.surface2 : theme.colors.surface,
                  },
                ]}
              >
                <Text style={[styles.chipText, { color: theme.colors.text }]}>
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ height: 18 }} />

        {/* Accent color */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text, fontSize: theme.typography.h3 }]}>
          Accent color
        </Text>
        

        <View style={styles.rowWrap}>
          {(Object.keys(ThemePalette) as ThemeColor[]).map((key) => {
            const selected = key === themeColorKey;
            return (
              <Pressable
                key={key}
                onPress={() => setThemeColorKey(key)}
                style={[
                  styles.colorChip,
                  {
                    borderColor: selected ? themeColorHex : theme.colors.border,
                    backgroundColor: theme.colors.surface,
                  },
                ]}
              >
                <View style={[styles.colorDot, { backgroundColor: ThemePalette[key] }]} />
                <Text style={[styles.chipText, { color: theme.colors.text }]}>{key}</Text>
              </Pressable>
            );
          })}
        </View>

        
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeHeader: {
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    fontSize: 22,
    fontWeight: "700",
  },
  headerTitle: {
    fontWeight: "800",
    marginTop: 18,
  },
  sectionTitle: {
    fontWeight: "800",
    marginBottom: 4,
  },
  sectionSub: {
    marginBottom: 12,
  },
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  choiceChip: {
    borderWidth: 2,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
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
    fontWeight: "700",
    textTransform: "capitalize",
  },
});