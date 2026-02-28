/**
 * ScheduleList.tsx
 * ----------------
 * Responsibility:
 *   Render the grouped schedule as a scrollable section list.
 *   Each event row is tappable and navigates to EventDetailsScreen.
 *
 * Design considerations:
 *   - Sections are pre-built by buildScheduleSections — this component only renders them.
 *   - Pull-to-refresh is wired to the schedule refresh function from useScheduleData.
 *   - Navigation uses "EventDetails" to match the name defined in RootNavigator.
 */

import React from "react";
import { SectionList, View, Text, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ScheduleSection } from "../models/schedule/scheduleTypes";
import { ScheduleStackParamList } from "../navigation/RootNavigator";
import { EventCard } from "./EventCard";

type ScheduleNav = NativeStackNavigationProp<ScheduleStackParamList, "Schedule">;

type Props = {
  sections: ScheduleSection[];
  refreshing: boolean;
  onRefresh: () => void;
};

export default function ScheduleList({ sections, refreshing, onRefresh }: Props) {
  const navigation = useNavigation<ScheduleNav>();

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      refreshing={refreshing}
      onRefresh={onRefresh}
      renderSectionHeader={({ section }) => (
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>{section.title}</Text>
        </View>
      )}
      renderItem={({ item }) => (
        // Navigate to EventDetailsScreen passing the event id as a param
        <Pressable
          onPress={() => navigation.navigate("EventDetails", { eventId: item.id })}
        >
          <EventCard event={item} />
        </Pressable>
      )}
      ListFooterComponent={<View style={{ height: 24 }} />}
    />
  );
}

const s = StyleSheet.create({
  sectionHeader: { paddingVertical: 8, paddingHorizontal: 12, borderBottomWidth: 1 },
  sectionTitle: { fontWeight: "800" },
});