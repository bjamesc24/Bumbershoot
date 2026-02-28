/**
 * ScheduleScreen.tsx
 * ------------------
 * Responsibility:
 *   Display the full festival schedule with filtering by time, stage, or category,
 *   and keyword search. Handles loading, empty, and error states.
 *
 * Design considerations:
 *   - Schedule data is managed by useScheduleData which handles caching,
 *     staleness detection, and refresh logic.
 *   - Sections are built in-memory from the event list via buildScheduleSections.
 *   - This screen does not manage connectivity directly — it receives isOnline
 *     from useConnectivity and passes it down.
 */

import React, { useMemo, useState } from "react";
import { View } from "react-native";

import { useConnectivity } from "../hooks/useConnectivity";
import useScheduleData from "../hooks/useScheduleData";
import { buildScheduleSections } from "../utils/schedulePresentation";
import { ScheduleViewMode } from "../models/schedule/scheduleTypes";

import ScheduleHeader from "../components/ScheduleHeader";
import ScheduleStatusBanner from "../components/ScheduleStatusBanner";
import ScheduleList from "../components/ScheduleList";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";

export default function ScheduleScreen() {
  const { isOnline } = useConnectivity();
  const schedule = useScheduleData(isOnline);

  // Controls how events are grouped — by time, stage, or category
  const [mode, setMode] = useState<ScheduleViewMode>("time");

  // Keyword filter applied across title, stage, category, tags, and description
  const [searchText, setSearchText] = useState("");

  // Build grouped sections from the event list based on current mode and search
  const sections = useMemo(() => {
    return buildScheduleSections(schedule.events, mode, searchText);
  }, [schedule.events, mode, searchText]);

  // Show full-screen loader only on first load when there is no cached data
  if (schedule.isInitialLoading && !schedule.hasCache) {
    return <LoadingState visible={true} message="Loading schedule..." />;
  }

  const isEmpty = sections.length === 0 || sections.every((s) => s.data.length === 0);

  return (
    <View style={{ flex: 1 }}>
      <ScheduleHeader
        mode={mode}
        onModeChange={setMode}
        searchText={searchText}
        onSearchTextChange={setSearchText}
      />

      <ScheduleStatusBanner
        isOnline={isOnline}
        isStale={schedule.isStale}
        lastUpdatedText={schedule.lastUpdatedText}
        refreshError={schedule.refreshError}
        onRefresh={schedule.refresh}
      />

      {isEmpty ? (
        <EmptyState
          message={searchText.trim() ? "No events match your search." : "No schedule available yet."}
          onClear={searchText.trim() ? () => setSearchText("") : undefined}
        />
      ) : (
        <ScheduleList
          sections={sections}
          refreshing={schedule.isRefreshing}
          onRefresh={schedule.refresh}
        />
      )}
    </View>
  );
}