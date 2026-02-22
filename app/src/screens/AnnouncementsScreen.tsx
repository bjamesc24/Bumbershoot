/**
 * AnnouncementsScreen.tsx
 * -----------------------
 * Responsibility:
 *   Display festival announcements sorted by priority so the most important
 *   information is always at the top of the list.
 *
 * Design considerations:
 *   - Announcements arrive pre-sorted from announcementsService (urgent → personal → general).
 *     This screen does not need to handle sorting logic.
 *   - Each priority level receives distinct visual treatment so users can
 *     quickly identify the importance of each announcement.
 *   - Errors during loading are caught silently; an empty list is shown as a fallback.
 */

import React, { useCallback, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { getAnnouncements } from "../services/announcementsService";
import type { Announcement, AnnouncementPriority } from "../models/Announcement";
import LoadingState from "../components/LoadingState";
import OfflineBanner from "../components/OfflineBanner";
import { useOfflineStatus } from "../hooks/useOfflineStatus";

// ---------------------------------------------------------------------------
// Priority badge styling
// ---------------------------------------------------------------------------

/** Background color for each priority level badge. */
const PRIORITY_COLORS: Record<AnnouncementPriority, string> = {
  urgent: "#c0392b",
  personal: "#2471a3",
  general: "#717d7e",
};

/** Human-readable label shown on each priority badge. */
const PRIORITY_LABELS: Record<AnnouncementPriority, string> = {
  urgent: "URGENT",
  personal: "FOR YOU",
  general: "INFO",
};

// ---------------------------------------------------------------------------
// Announcement card component
// ---------------------------------------------------------------------------

/**
 * Renders a single announcement as a card with a priority badge,
 * title, message body, and published timestamp.
 */
function AnnouncementCard({ item }: { item: Announcement }) {
  const badgeColor = PRIORITY_COLORS[item.priority];
  const badgeLabel = PRIORITY_LABELS[item.priority];

  // Format the timestamp into a readable local date and time
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
      {/* Priority badge */}
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

      {/* Announcement title */}
      <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 6 }}>
        {item.title}
      </Text>

      {/* Announcement body */}
      <Text style={{ fontSize: 14, opacity: 0.8, lineHeight: 20, marginBottom: 8 }}>
        {item.message}
      </Text>

      {/* Published timestamp */}
      <Text style={{ fontSize: 12, opacity: 0.5 }}>{formattedDate}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Screen component
// ---------------------------------------------------------------------------

export default function AnnouncementsScreen() {
  const isOffline = useOfflineStatus();

  // Tracks storage read state
  const [loading, setLoading] = useState(true);

  // Current list of announcements, pre-sorted by announcementsService
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  /**
   * Reads announcements and updates screen state.
   * Errors are swallowed intentionally to prevent UI failure if the data cannot be loaded.
   */
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

  /**
   * Reload announcements whenever the screen becomes active.
   * Ensures the list reflects any new announcements posted since last visit.
   */
  useFocusEffect(
    useCallback(() => {
      void loadAnnouncements();
    }, [loadAnnouncements])
  );

  // Loading UI while announcement data is being read
  if (loading) {
    return (
      <View style={{ flex: 1 }}>
        <OfflineBanner isOffline={isOffline} />
        <LoadingState visible={true} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "#f4f4f4" }}>
      <OfflineBanner isOffline={isOffline} />

      <Text style={{ fontSize: 24, fontWeight: "600", marginBottom: 16 }}>
        Announcements
      </Text>

      {announcements.length === 0 ? (
        <Text style={{ opacity: 0.7 }}>No announcements at this time.</Text>
      ) : (
        <FlatList
          data={announcements}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <AnnouncementCard item={item} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}