import React, { useCallback, useState } from "react";
import { FlatList, View, Pressable, StyleSheet } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import { getAnnouncements } from "../services/announcementsService";
import type { Announcement, AnnouncementPriority } from "../models/Announcement";
import LoadingState from "../components/LoadingState";
import OfflineBanner from "../components/OfflineBanner";
import { useOfflineStatus } from "../hooks/useOfflineStatus";
import { useAppSettings } from "../context/AppSettingsContext";

import Screen from "../components/Screen";
import ThemedText from "../components/ThemedText";

const PRIORITY_LABELS: Record<AnnouncementPriority, string> = {
  urgent: "URGENT",
  personal: "FOR YOU",
  general: "INFO",
};

const PRIORITY_COLORS: Record<AnnouncementPriority, string> = {
  urgent: "#c0392b",
  personal: "#2471a3",
  general: "#717d7e",
};

function AnnouncementCard({ item }: { item: Announcement }) {
  const { theme } = useAppSettings();

  const badgeColor = PRIORITY_COLORS[item.priority];
  const badgeLabel = PRIORITY_LABELS[item.priority];

  const formattedDate = new Date(item.publishedAt).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface2,
          borderColor: theme.colors.border,
          shadowColor: "#000",
        },
      ]}
    >
      <View style={[styles.badge, { backgroundColor: badgeColor }]}>
        <ThemedText variant="caption" weight="800" style={{ color: "#fff" }}>
          {badgeLabel}
        </ThemedText>
      </View>

      <ThemedText variant="h3" weight="800" style={{ marginBottom: 6 }}>
        {item.title}
      </ThemedText>

      <ThemedText muted style={{ lineHeight: Math.round(theme.typography.body * 1.35), marginBottom: 8 }}>
        {item.message}
      </ThemedText>

      <ThemedText variant="caption" muted>
        {formattedDate}
      </ThemedText>
    </View>
  );
}

export default function AnnouncementsScreen() {
  const navigation = useNavigation<any>();
  const isOffline = useOfflineStatus();
  const { theme } = useAppSettings();

  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const loadAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAnnouncements();
      setAnnouncements(data);
    } catch {
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadAnnouncements();
    }, [loadAnnouncements])
  );

  if (loading) {
    return (
      <Screen>
        <OfflineBanner isOffline={isOffline} />
        <LoadingState visible />
      </Screen>
    );
  }

  return (
    <Screen>
      <OfflineBanner isOffline={isOffline} />

      <View style={styles.safeHeader}>
        <Pressable
          onPress={() => navigation.navigate("Tabs", { screen: "Explore" })}
          style={[styles.closeButton, { backgroundColor: theme.colors.primary }]}
        >
          <ThemedText weight="800" style={{ color: theme.colors.primaryText, fontSize: 22 }}>
            ×
          </ThemedText>
        </Pressable>

        <ThemedText variant="h1" weight="800" style={{ marginTop: 18 }}>
          Announcements
        </ThemedText>
      </View>

      {announcements.length === 0 ? (
        <ThemedText muted style={{ paddingHorizontal: 16 }}>
          No announcements at this time.
        </ThemedText>
      ) : (
        <FlatList
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 }}
          data={announcements}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <AnnouncementCard item={item} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  safeHeader: {
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
  },
});