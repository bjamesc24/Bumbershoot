import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  TouchableOpacity,
  SectionList,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import Screen from "../components/Screen";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import { useOfflineStatus } from "../hooks/useOfflineStatus";
import useScheduleData from "../hooks/useScheduleData";
import { useAppSettings } from "../context/AppSettingsContext";
import { ScheduleItem } from "../models/schedule/scheduleTypes";

function decodeHtml(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ScheduleSearchScreen() {
  const navigation = useNavigation<any>();
  const isOffline = useOfflineStatus();
  const { theme, themeColorHex } = useAppSettings();
  const schedule = useScheduleData(!isOffline);

  const [searchText, setSearchText] = useState("");

  const filteredItems = useMemo(() => {
  const query = searchText.trim().toLowerCase();

  if (!query) return schedule.events;

  return schedule.events.filter((item: ScheduleItem) => {
    const title = decodeHtml(item.title || "").toLowerCase();
    const stage = (item.stage || "").toLowerCase();
    const category = (item.category || "").toLowerCase();
    const type = (item.itemType || "").toLowerCase();

    return (
      title.includes(query) ||
      stage.includes(query) ||
      category.includes(query) ||
      type.includes(query)
    );
  });
}, [schedule.events, searchText]);

  const sections = useMemo(() => {
    const sorted = [...filteredItems].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    const map = new Map<string, ScheduleItem[]>();

    sorted.forEach((item) => {
      const label = new Date(item.startTime).toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      });

      const arr = map.get(label) ?? [];
      arr.push(item);
      map.set(label, arr);
    });

    return Array.from(map.entries()).map(([title, data]) => ({
      title,
      data,
    }));
  }, [filteredItems]);

 const handleItemPress = (item: ScheduleItem) => {
  navigation.push("Detail", { item: item.rawItem, type: item.itemType });
};

  if (schedule.isInitialLoading && !schedule.hasCache) {
    return (
      <Screen>
        <LoadingState visible message="Loading schedule..." />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={[
            styles.backButton,
            {
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
            },
          ]}
        >
          <Text style={[styles.backButtonText, { color: theme.colors.text }]}>
            Back
          </Text>
        </Pressable>

        <Text
          style={[
            styles.screenTitle,
            { color: theme.colors.text, fontSize: theme.typography.h1 },
          ]}
        >
          Search
        </Text>

        <View style={{ width: 60 }} />
      </View>

      <View style={styles.searchBoxWrap}>
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search events..."
          placeholderTextColor={theme.colors.textMuted}
          style={[
            styles.searchInput,
            {
              color: theme.colors.text,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
            },
          ]}
        />
      </View>

      {filteredItems.length === 0 ? (
  <EmptyState message="No events found." />
) : (
  <SectionList
    sections={sections}
    keyExtractor={(item) => item.id}
    renderSectionHeader={({ section }) => (
      <View
        style={[
          styles.sectionHeader,
          {
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {section.title}
        </Text>
      </View>
    )}
    renderItem={({ item }) => (
      <TouchableOpacity
        onPress={() => handleItemPress(item)}
        activeOpacity={0.7}
        style={[
          styles.listRow,
          {
            borderBottomColor: theme.colors.border,
            backgroundColor: theme.colors.surface2,
          },
        ]}
      >
        <View
          style={[styles.listAccent, { backgroundColor: themeColorHex }]}
        />
        <View style={styles.listRowContent}>
          <Text
            style={[styles.listRowTitle, { color: theme.colors.text }]}
            numberOfLines={1}
          >
            {decodeHtml(item.title)}
          </Text>

          <Text
            style={[styles.listRowMeta, { color: theme.colors.textMuted }]}
          >
            {formatTime(item.startTime)} – {formatTime(item.endTime)}
            {item.stage ? ` · ${item.stage}` : ""}
            {item.category ? ` · ${item.category}` : ""}
          </Text>
        </View>
      </TouchableOpacity>
    )}
    ListFooterComponent={<View style={{ height: 32 }} />}
  />
)}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 70,
    paddingBottom: 8,
  },
  screenTitle: {
    fontWeight: "800",
  },
  backButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minWidth: 60,
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: "700",
  },
  searchBoxWrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  searchInput: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "stretch",
    borderBottomWidth: 1,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 10,
    overflow: "hidden",
  },
  listAccent: {
    width: 4,
  },
  listRowContent: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  listRowTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 3,
  },
  listRowMeta: {
    fontSize: 12,
    marginBottom: 2,
  },
});