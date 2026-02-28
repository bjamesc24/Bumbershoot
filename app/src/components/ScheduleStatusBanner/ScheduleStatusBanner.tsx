import * as React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

type Props = {
  isOnline: boolean;
  isStale: boolean;
  lastUpdatedText: string;
  refreshError: string | null;
  onRefresh: () => void;
};

export default function ScheduleStatusBanner({ isOnline, isStale, lastUpdatedText, refreshError, onRefresh }: Props) {
  const show = !isOnline || isStale || !!refreshError;
  if (!show) return null;

  return (
    <View style={s.wrap}>
      {!isOnline && <Text style={s.line}>Offline — showing saved schedule.</Text>}
      {isStale && <Text style={s.line}>Schedule may be out of date. Last updated: {lastUpdatedText}</Text>}
      {!!refreshError && <Text style={s.err}>{refreshError}</Text>}

      <Pressable onPress={onRefresh} disabled={!isOnline} style={s.btn}>
        <Text style={s.btnText}>{isOnline ? "Refresh" : "Refresh (offline)"}</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 12, borderBottomWidth: 1 },
  line: { fontSize: 13, marginBottom: 4 },
  err: { fontSize: 13, marginBottom: 8 },
  btn: { alignSelf: "flex-start", borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  btnText: { fontWeight: "700" },
});