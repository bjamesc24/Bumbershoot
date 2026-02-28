import React, { useMemo, useState } from "react";
import { View } from "react-native";

import {useConnectivity }from "../hooks/useConnectivity";         
import useScheduleData from "../hooks/useScheduleData";

import { buildScheduleSections } from "../utils/SchedulePresentation"; 
import { ScheduleViewMode } from "../storage/scheduleTypes";      

import {ScheduleHeader} from "../components/ScheduleHeader";
import ScheduleStatusBanner from "../components/ScheduleStatusBanner";
import {ScheduleList} from "../components/ScheduleList";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
export default function ScheduleScreen() {
  const { isOnline } = useConnectivity();
  const schedule = useScheduleData(isOnline);

  
  const [mode, setMode] = useState<ScheduleViewMode>("time");

  
  const [searchText, setSearchText] = useState("");

 
  const sections = useMemo(() => {
    return buildScheduleSections(schedule.events, mode, searchText);
  }, [schedule.events, mode, searchText]);

 
  if (schedule.isInitialLoading && !schedule.hasCache) {
    return <LoadingState />;
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