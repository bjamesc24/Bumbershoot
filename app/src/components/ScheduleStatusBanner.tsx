/**
 * ScheduleStatusBanner.tsx
 * ------------------------
 * Responsibility:
 *   Display a non-blocking status bar when the schedule data is offline,
 *   stale, or failed to refresh. Provides a manual refresh button.
 *
 * Design considerations:
 *   - Only renders when there is something worth showing — hidden when data is fresh and online.
 *   - Refresh button is disabled when offline to prevent unnecessary attempts.
 */

import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

type Props = {
  isOnline: boolean;
  isStale: boolean;
  lastUpdatedText: string;
  refreshError: string | null;
  onRefresh: () => void;
};

export default function ScheduleStatusBanner({ isOnline, isStale, lastUpdatedText, refreshError, onRefresh }: Props) {
  // Only show the banner when there is something to communicate
  const show = !isOnline || isStale || !!refreshError;
  if (!show) return null;

  return (
    <View style={s.wrap}>
      {/* Offline indicator */}
      {!isOnline && <Text style={s.line}>Offline — showing saved schedule.</Text>}

      {/* Stale data warning with last updated timestamp */}
      {isStale && <Text style={s.line}>Schedule may be out of date. Last updated: {lastUpdatedText}</Text>}

      {/* Refresh error message */}
      {!!refreshError && <Text style={s.err}>{refreshError}</Text>}

      {/* Manual refresh button — disabled when offline */}
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