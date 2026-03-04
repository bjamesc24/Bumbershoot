import React, { useCallback, useState } from "react";
import { FlatList, Text, View, Pressable, StyleSheet } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import { getAnnouncements } from "../services/announcementsService";
import type { Announcement, AnnouncementPriority } from "../models/Announcement";
import LoadingState from "../components/LoadingState";
import OfflineBanner from "../components/OfflineBanner";
import { useOfflineStatus } from "../hooks/useOfflineStatus";

const PRIORITY_COLORS: Record<AnnouncementPriority, string> = {
  urgent: "#c0392b",
  personal: "#2471a3",
  general: "#717d7e",
};

const PRIORITY_LABELS: Record<AnnouncementPriority, string> = {
  urgent: "URGENT",
  personal: "FOR YOU",
  general: "INFO",
};

function AnnouncementCard({ item }: { item: Announcement }) {
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
      style={{
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 14,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}
    >
      <View
        style={{
          alignSelf: "flex-start",
          backgroundColor: badgeColor,
          borderRadius: 4,
          paddingHorizontal: 8,
          paddingVertical: 3,
          marginBottom: 8,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>
          {badgeLabel}
        </Text>
      </View>

      <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 6 }}>
        {item.title}
      </Text>

      <Text style={{ fontSize: 14, opacity: 0.8, lineHeight: 20, marginBottom: 8 }}>
        {item.message}
      </Text>

      <Text style={{ fontSize: 12, opacity: 0.5 }}>{formattedDate}</Text>
    </View>
  );
}

export default function AnnouncementsScreen() {
  const navigation = useNavigation<any>();
  const isOffline = useOfflineStatus();
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
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <OfflineBanner isOffline={isOffline} />
        <LoadingState visible />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f4f4f4" }}>
      <OfflineBanner isOffline={isOffline} />

      <View style={styles.safeHeader}>
        <Pressable
          onPress={() => navigation.navigate("Tabs", { screen: "Explore" })}
          style={styles.closeButton}
        >
          <Text style={styles.closeText}>×</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Announcements</Text>
      </View>

      {announcements.length === 0 ? (
        <Text style={{ opacity: 0.7, paddingHorizontal: 16 }}>
          No announcements at this time.
        </Text>
      ) : (
        <FlatList
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 }}
          data={announcements}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <AnnouncementCard item={item} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
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
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    marginTop: 18,
  },
});