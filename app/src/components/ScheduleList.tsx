import React from "react";
import { SectionList, View, Text, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { ScheduleSection } from "../storage/scheduleTypes";
import EventCard from "./EventCard";

type Props = {
  sections: ScheduleSection[];
  refreshing: boolean;
  onRefresh: () => void;
};

export function ScheduleList({ sections, refreshing, onRefresh }: Props) {
  const navigation = useNavigation<any>(); // quick + flexible; you can type it later

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
        <Pressable
          onPress={() => navigation.navigate("EventDetail", { eventId: item.id })}
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