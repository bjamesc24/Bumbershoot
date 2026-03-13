/**
 * AnnouncementsScreen.tsx
 * -----------------------
 * Displays festival announcements sorted by priority.
 * "FOR YOU" announcements are any whose related_event matches
 * something the user has marked as attending.
 * Re-fetches on every focus so attend changes are reflected immediately.
 */

import React, { useCallback, useState } from "react";
import { FlatList, View, Pressable, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import { getAnnouncements } from "../services/announcementsService";
import type { Announcement, AnnouncementPriority } from "../models/Announcement";
import LoadingState from "../components/LoadingState";
import OfflineBanner from "../components/OfflineBanner";
import { useOfflineStatus } from "../hooks/useOfflineStatus";
import { useAppSettings } from "../context/AppSettingsContext";

import Screen from "../components/Screen";
import ThemedText from "../components/ThemedText";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PRIORITY_LABELS: Record<AnnouncementPriority, string> = {
  urgent: "URGENT",
  important: "FOR YOU",
  normal: "INFO",
};

const PRIORITY_COLORS: Record<AnnouncementPriority, string> = {
  urgent: "#c0392b",
  important: "#2471a3",
  normal: "#717d7e",
};

const TYPE_LABELS: Record<string, string> = {
  "schedule-change": "Schedule Change",
  weather: "Weather",
  service: "Service",
  general: "General",
};

// ---------------------------------------------------------------------------
// AnnouncementCard
// ---------------------------------------------------------------------------

function AnnouncementCard({ item }: { item: Announcement }) {
  const { theme } = useAppSettings();

  const badgeColor = PRIORITY_COLORS[item.priority];
  const badgeLabel = PRIORITY_LABELS[item.priority];
  const typeLabel = TYPE_LABELS[item.type] ?? item.type;

  const formattedDate = new Date(item.published_at).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const handleExternalLink = () => {
    if (item.external_url) {
      Linking.openURL(item.external_url).catch(() => {});
    }
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface2,
          borderColor: item.is_pinned ? badgeColor : theme.colors.border,
          borderWidth: item.is_pinned ? 1.5 : 1,
          shadowColor: "#000",
        },
      ]}
    >
      {/* Priority badge + type label row */}
      <View style={styles.cardTopRow}>
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <ThemedText variant="caption" weight="800" style={{ color: "#fff" }}>
            {badgeLabel}
          </ThemedText>
        </View>

        <ThemedText variant="caption" muted style={{ marginLeft: 8 }}>
          {typeLabel}
          {item.is_pinned ? " · 📌" : ""}
        </ThemedText>
      </View>

      {/* Title */}
      <ThemedText variant="h3" weight="800" style={{ marginBottom: 6 }}>
        {item.title}
      </ThemedText>

      {/* Body */}
      <ThemedText
        muted
        style={{
          lineHeight: Math.round(theme.typography.body * 1.35),
          marginBottom: 8,
        }}
      >
        {item.body}
      </ThemedText>

      {/* Related event or venue */}
      {(item.related_event || item.related_venue) && (
        <ThemedText variant="caption" muted style={{ marginBottom: 6 }}>
          {[
            item.related_event?.title,
            item.related_venue?.short_name,
          ]
            .filter(Boolean)
            .join(" · ")}
        </ThemedText>
      )}

      {/* External link */}
      {item.external_url && (
        <TouchableOpacity onPress={handleExternalLink} style={styles.externalLink}>
          <ThemedText
            variant="caption"
            weight="700"
            style={{ color: badgeColor }}
          >
            {item.external_url_label ?? "Learn More →"}
          </ThemedText>
        </TouchableOpacity>
      )}

      {/* Timestamp */}
      <ThemedText variant="caption" muted>
        {formattedDate}
      </ThemedText>
    </View>
  );
}

// ---------------------------------------------------------------------------
// AnnouncementsScreen
// ---------------------------------------------------------------------------

export default function AnnouncementsScreen() {
  const navigation = useNavigation<any>();
  const isOffline = useOfflineStatus();
  const { theme } = useAppSettings();

  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function load() {
        setLoading(true);
        try {
          const data = await getAnnouncements();
          if (active) setAnnouncements(data);
        } catch {
          if (active) setAnnouncements([]);
        } finally {
          if (active) setLoading(false);
        }
      }

      void load();

      return () => { active = false; };
    }, [])
  );

  if (loading) {
    return (
      <Screen>
        <OfflineBanner isOffline={isOffline} />
        <LoadingState visible />
      </Screen>
    );
  }

  const urgentCount = announcements.filter((a) => a.priority === "urgent").length;
  const forYouCount = announcements.filter((a) => a.priority === "important").length;

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

        {/* Summary line */}
        {announcements.length > 0 && (
          <ThemedText variant="caption" muted style={{ marginTop: 4, marginBottom: 4 }}>
            {[
              urgentCount > 0 && `${urgentCount} urgent`,
              forYouCount > 0 && `${forYouCount} for you`,
            ]
              .filter(Boolean)
              .join(" · ") || `${announcements.length} announcements`}
          </ThemedText>
        )}
      </View>

      {announcements.length === 0 ? (
        <View style={styles.emptyState}>
          <ThemedText muted>No announcements at this time.</ThemedText>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={announcements}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <AnnouncementCard item={item} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  safeHeader: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
  },
  emptyState: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  card: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  externalLink: {
    marginBottom: 8,
  },
});