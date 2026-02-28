/**
 * EventInfo.tsx
 * -------------
 * Responsibility:
 *   Display full details for a single schedule event.
 *   Used by EventDetailsScreen.
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ScheduleEvent } from "../models/schedule/scheduleTypes";

export default function EventInfo({ event }: { event: ScheduleEvent }) {
  const start = new Date(event.startTime).toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" });
  const end = new Date(event.endTime).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

  return (
    <View style={s.wrap}>
      <Text style={s.title}>{event.title}</Text>
      <Text style={s.line}>{start} – {end}</Text>
      <Text style={s.line}>Stage: {event.stage}</Text>
      <Text style={s.line}>Category: {event.category}</Text>

      {/* Tags are optional — only render if present */}
      {!!event.tags?.length && (
        <Text style={s.line}>Tags: {event.tags.join(", ")}</Text>
      )}

      {/* Description is optional — only render if present */}
      {!!event.description && (
        <>
          <Text style={s.section}>About</Text>
          <Text style={s.desc}>{event.description}</Text>
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 16 },
  title: { fontSize: 22, fontWeight: "900", marginBottom: 8 },
  line: { fontSize: 14, marginBottom: 4 },
  section: { marginTop: 14, fontSize: 16, fontWeight: "800", marginBottom: 6 },
  desc: { fontSize: 14, lineHeight: 20 },
});