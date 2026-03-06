import React from "react";
import { View, TextInput, Pressable, StyleSheet } from "react-native";
import { ScheduleViewMode } from "../models/schedule/scheduleTypes";

import { useAppSettings } from "../context/AppSettingsContext";
import ThemedText from "./ThemedText";

type Props = {
  mode: ScheduleViewMode;
  onModeChange: (m: ScheduleViewMode) => void;
  searchText: string;
  onSearchTextChange: (t: string) => void;
};

export default function ScheduleHeader({
  mode,
  onModeChange,
  searchText,
  onSearchTextChange,
}: Props) {
  const { theme, themeColorHex } = useAppSettings();

  return (
    <View
      style={[
        s.wrap,
        {
          borderBottomColor: theme.colors.border,
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      {/* View mode toggle buttons */}
      <View style={s.row}>
        <ModeBtn
          label="Time"
          active={mode === "time"}
          onPress={() => onModeChange("time")}
        />
        <ModeBtn
          label="Stage"
          active={mode === "stage"}
          onPress={() => onModeChange("stage")}
        />
        <ModeBtn
          label="Category"
          active={mode === "category"}
          onPress={() => onModeChange("category")}
        />
      </View>

      {/* Keyword search input */}
      <TextInput
        value={searchText}
        onChangeText={onSearchTextChange}
        placeholder="Search events…"
        placeholderTextColor={theme.colors.textMuted}
        autoCorrect={false}
        style={[
          s.search,
          {
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
            color: theme.colors.text,
            fontSize: theme.typography.body,
          },
        ]}
      />
    </View>
  );
}

function ModeBtn({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { theme, themeColorHex, textScale } = useAppSettings();

  const px = Math.round(12 * textScale);
  const py = Math.round(8 * textScale);

  return (
    <Pressable
      onPress={onPress}
      style={[
        s.btn,
        {
          paddingHorizontal: px,
          paddingVertical: py,
          borderColor: active ? themeColorHex : theme.colors.border,
          backgroundColor: active ? `${themeColorHex}22` : theme.colors.surface2,
        },
      ]}
    >
      <ThemedText
        variant="caption"
        weight="800"
        style={{ color: active ? theme.colors.text : theme.colors.textMuted }}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 12, borderBottomWidth: 1 },
  row: { flexDirection: "row", gap: 8, marginBottom: 10 },
  btn: {
    borderWidth: 2,
    borderRadius: 999, 
    alignItems: "center",
    justifyContent: "center",
  },
  search: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});