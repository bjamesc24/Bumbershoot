/**
 * ScheduleHeader.tsx
 * ------------------
 * Responsibility:
 *   Render the schedule view mode toggle (Time, Stage, Category)
 *   and the keyword search input.
 *
 * Design considerations:
 *   - Mode and search state are owned by ScheduleScreen and passed down as props.
 *     This component is purely presentational.
 */

import React from "react";
import { View, TextInput, Pressable, Text, StyleSheet } from "react-native";
import { ScheduleViewMode } from "../models/schedule/scheduleTypes";

type Props = {
  mode: ScheduleViewMode;
  onModeChange: (m: ScheduleViewMode) => void;
  searchText: string;
  onSearchTextChange: (t: string) => void;
};

export default function ScheduleHeader({ mode, onModeChange, searchText, onSearchTextChange }: Props) {
  return (
    <View style={s.wrap}>
      {/* View mode toggle buttons */}
      <View style={s.row}>
        <ModeBtn label="Time" active={mode === "time"} onPress={() => onModeChange("time")} />
        <ModeBtn label="Stage" active={mode === "stage"} onPress={() => onModeChange("stage")} />
        <ModeBtn label="Category" active={mode === "category"} onPress={() => onModeChange("category")} />
      </View>

      {/* Keyword search input */}
      <TextInput
        value={searchText}
        onChangeText={onSearchTextChange}
        placeholder="Search events…"
        autoCorrect={false}
        style={s.search}
      />
    </View>
  );
}

/**
 * Individual mode toggle button with active state styling.
 */
function ModeBtn({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[s.btn, active && s.btnActive]} onPress={onPress}>
      <Text style={[s.btnText, active && s.btnTextActive]}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 12, borderBottomWidth: 1 },
  row: { flexDirection: "row", gap: 8, marginBottom: 10 },
  btn: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  btnActive: { backgroundColor: "#2c3e50", borderColor: "#2c3e50" },
  btnText: { fontWeight: "700" },
  btnTextActive: { color: "#fff" },
  search: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
});