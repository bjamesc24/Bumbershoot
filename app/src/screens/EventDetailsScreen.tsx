import React, { useMemo } from "react";
import { View } from "react-native";

import { useConnectivity } from "../hooks/useConnectivity/useConnectivity";
import useScheduleData from "../hooks/useScheduleData/useScheduleData";

import ScheduleStatusBanner from "../components/ScheduleStatusBanner/ScheduleStatusBanner";
import EmptyState from "../components/EmptyState/EmptyState";
import EventInfo from "../components/EventInfo/EventInfo";

export default function EventDetailsScreen({ route }: any) {
  const { eventId } = route.params as { eventId: string };

  const { isOnline } = useConnectivity();
  const schedule = useScheduleData(isOnline);

  const event = useMemo(() => {
    return schedule.events.find((e) => e.id === eventId) ?? null;
  }, [schedule.events, eventId]);

  if (!event) {
    return <EmptyState message="Event not found (it may not be cached yet)." />;
  }

  return (
    <View style={{ flex: 1 }}>
      <ScheduleStatusBanner
        isOnline={isOnline}
        isStale={schedule.isStale}
        lastUpdatedText={schedule.lastUpdatedText}
        refreshError={schedule.refreshError}
        onRefresh={schedule.refresh}
      />

      <EventInfo event={event} />
    </View>
  );
}