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
import ScreenTitle from "../components/ScreenTitle";
export default function ScheduleScreen() {
  const { isOnline } = useConnectivity();
  const schedule = useScheduleData(isOnline);

  const [mode, setMode] = useState<ScheduleViewMode>("time");

  const [searchText, setSearchText] = useState("");

  const sections = useMemo(() => {
    return buildScheduleSections(schedule.events, mode, searchText);
  }, [schedule.events, mode, searchText]);

  if (schedule.isInitialLoading && !schedule.hasCache) {
    return <LoadingState visible={true} message="Loading schedule..." />;
  }

  const isEmpty = sections.length === 0 || sections.every((s) => s.data.length === 0);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
    
      <ScreenTitle title="Explore" />

      {/* Filters + search UI */}
      <ScheduleHeader
        mode={mode}
        onModeChange={setMode}
        searchText={searchText}
        onSearchTextChange={setSearchText}
      />

      {/* Online/offline + refresh status */}
      <ScheduleStatusBanner
        isOnline={isOnline}
        isStale={schedule.isStale}
        lastUpdatedText={schedule.lastUpdatedText}
        refreshError={schedule.refreshError}
        onRefresh={schedule.refresh}
      />

      {/* Main list / empty state */}
      {isEmpty ? (
        <EmptyState
          message={
            searchText.trim()
              ? "No events match your search."
              : "No schedule available yet."
          }
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