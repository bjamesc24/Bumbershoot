import * as React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

export default function EmptyState({ message, onClear }: { message: string; onClear?: () => void }) {
  return (
    <View style={s.wrap}>
      <Text style={s.title}>No results</Text>
      <Text style={s.msg}>{message}</Text>
      {onClear && (
        <Pressable style={s.btn} onPress={onClear}>
          <Text style={s.btnText}>Clear search</Text>
        </Pressable>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 6 },
  msg: { fontSize: 14, textAlign: "center", marginBottom: 12 },
  btn: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  btnText: { fontWeight: "700" },
});