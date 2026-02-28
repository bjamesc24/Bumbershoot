import React from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { ScheduleViewMode } from "../../types/schedule/scheduleTypes";

export function ScheduleHeader({
  mode,
  onModeChange,
  searchText,
  onSearchTextChange,
}: {
  mode: ScheduleViewMode;
  onModeChange: (m: ScheduleViewMode) => void;
  searchText: string;
  onSearchTextChange: (t: string) => void;
}) {
  return (
    <View style={s.wrap}>
      <View style={s.row}>
        <Btn label="Time" active={mode === "time"} onPress={() => onModeChange("time")} />
        <Btn label="Stage" active={mode === "stage"} onPress={() => onModeChange("stage")} />
        <Btn label="Category" active={mode === "category"} onPress={() => onModeChange("category")} />
      </View>

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

function Btn({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
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
  btnActive: { },
  btnText: { fontWeight: "700" },
  btnTextActive: { },
  search: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
});