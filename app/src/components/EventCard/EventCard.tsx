import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ScheduleEvent } from "../../types/schedule/scheduleTypes";

export function EventCard({ event }: { event: ScheduleEvent }) {
  const start = new Date(event.startTime).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const end = new Date(event.endTime).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

  return (
    <View style={s.row}>
      <Text style={s.title}>{event.title}</Text>
      <Text style={s.meta}>{start} – {end} • {event.stage}</Text>
      <Text style={s.meta}>{event.category}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  row: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1 },
  title: { fontSize: 16, fontWeight: "700", marginBottom: 2 },
  meta: { fontSize: 12 },
});