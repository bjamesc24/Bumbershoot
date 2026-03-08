/**
 * DetailScreen.tsx
 * ----------------
 * Responsibility:
 *   Unified detail screen for Events, Artists, Workshops, Vendors, and Venues.
 *   Accepts an item passed via navigation params and renders whatever fields exist.
 *
 *   Actions: Favorite, Attend, Share, External links (Spotify, Apple Music, website).
 *
 * Navigation params:
 *   item  — the full data object (WP event, stub artist, stub vendor, etc.)
 *   type  — "event" | "artist" | "workshop" | "vendor" | "venue"
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Share,
  Linking,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { isFavorited, toggleFavorite } from "../storage/favoritesStore";
import { isAttending, toggleAttending } from "../storage/attendingStore";

type DetailScreenParams = {
  item: any;
  type: "event" | "artist" | "workshop" | "vendor" | "venue";
};

export default function DetailScreen({ route }: any) {
  const navigation = useNavigation();
  const { item, type } = route.params as DetailScreenParams;

  const id = String(item?.id ?? "");
  const [favorited, setFavorited] = useState(false);
  const [attending, setAttending] = useState(false);

  useEffect(() => {
    isFavorited(id).then(setFavorited);
    isAttending(id).then(setAttending);
  }, [id]);

  // Normalize title — WP shape uses title.rendered, ScheduleEvent uses title directly
  const title =
    item?.title?.rendered ?? (typeof item?.title === "string" ? item.title : null) ?? item?.name ?? "Untitled";

  // Normalize description — WP shape uses content.rendered, ScheduleEvent uses description
  const description =
    item?.content?.rendered
      ? item.content.rendered.replace(/<[^>]+>/g, "")
      : item?.description ?? null;

  const excerpt =
    item?.excerpt?.rendered
      ? item.excerpt.rendered.replace(/<[^>]+>/g, "")
      : null;

  // Event fields — handle both WP meta shape and ScheduleEvent shape
  const startTime = item?.meta?.event_start_time ?? item?.startTime ?? item?.start ?? null;
  const endTime = item?.meta?.event_end_time ?? item?.endTime ?? item?.end ?? null;
  const stage = item?.meta?.stage ?? item?.stage ?? item?.location ?? null;
  const category = item?.meta?.event_category ?? item?.category ?? item?.genre ?? item?.type ?? null;

  // Venue-specific fields
  const address = item?.meta?.address ?? null;
  const capacity = item?.meta?.capacity ?? null;
  const stageType = item?.meta?.stage_type ?? null;
  const amenities: string[] = item?.meta?.amenities ?? [];

  // External links — only show if present
  const spotifyUrl: string | null = item?.meta?.spotify_url ?? item?.spotify_url ?? null;
  const appleMusicUrl: string | null = item?.meta?.apple_music_url ?? item?.apple_music_url ?? null;
  const websiteUrl: string | null = item?.link ?? item?.meta?.website ?? null;

  // Format times
  const formattedStart = startTime
    ? new Date(startTime).toLocaleString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  const formattedEnd = endTime
    ? new Date(endTime).toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  const handleFavorite = async () => {
    const { isNowFavorited } = await toggleFavorite({
      id,
      title,
      start: startTime ?? undefined,
    });
    setFavorited(isNowFavorited);
  };

  const handleAttending = async () => {
    const { isNowAttending } = await toggleAttending({
      id,
      title,
      start: startTime ?? undefined,
      end: endTime ?? undefined,
      stage: stage ?? undefined,
    });
    setAttending(isNowAttending);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: websiteUrl
          ? `${title} — ${websiteUrl}`
          : title,
        title,
      });
    } catch {
      // Share dismissed
    }
  };

  const handleExternalLink = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <ScrollView contentContainerStyle={s.scroll}>

      {/* Image placeholder */}
      <View style={s.imagePlaceholder} />

      <View style={s.body}>

        {/* Title */}
        <Text style={s.title}>{title}</Text>

        {/* Type badge */}
        <Text style={s.badge}>{type.toUpperCase()}</Text>

        {/* Time and location — events */}
        {formattedStart && (
          <View style={s.metaBlock}>
            <Text style={s.metaLabel}>When</Text>
            <Text style={s.metaValue}>
              {formattedStart}{formattedEnd ? ` – ${formattedEnd}` : ""}
            </Text>
          </View>
        )}

        {stage && (
          <View style={s.metaBlock}>
            <Text style={s.metaLabel}>Stage</Text>
            <Text style={s.metaValue}>{stage}</Text>
          </View>
        )}

        {category && (
          <View style={s.metaBlock}>
            <Text style={s.metaLabel}>Category</Text>
            <Text style={s.metaValue}>{category}</Text>
          </View>
        )}

        {/* Venue-specific fields */}
        {address && (
          <View style={s.metaBlock}>
            <Text style={s.metaLabel}>Address</Text>
            <Text style={s.metaValue}>{address}</Text>
          </View>
        )}

        {capacity && (
          <View style={s.metaBlock}>
            <Text style={s.metaLabel}>Capacity</Text>
            <Text style={s.metaValue}>{capacity.toLocaleString()}</Text>
          </View>
        )}

        {stageType && (
          <View style={s.metaBlock}>
            <Text style={s.metaLabel}>Stage Type</Text>
            <Text style={s.metaValue}>{stageType}</Text>
          </View>
        )}

        {amenities.length > 0 && (
          <View style={s.metaBlock}>
            <Text style={s.metaLabel}>Amenities</Text>
            <Text style={s.metaValue}>{amenities.join(", ")}</Text>
          </View>
        )}

        {/* Description */}
        {(excerpt || description) && (
          <View style={s.descBlock}>
            <Text style={s.sectionLabel}>About</Text>
            <Text style={s.desc}>{excerpt ?? description}</Text>
          </View>
        )}

        {/* Action buttons */}
        <View style={s.actions}>
          <TouchableOpacity
            style={[s.actionBtn, favorited && s.actionBtnActive]}
            onPress={handleFavorite}
          >
            <Text style={[s.actionBtnText, favorited && s.actionBtnTextActive]}>
              {favorited ? "Saved" : "Save"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.actionBtn, attending && s.actionBtnActive]}
            onPress={handleAttending}
          >
            <Text style={[s.actionBtnText, attending && s.actionBtnTextActive]}>
              {attending ? "Attending" : "Attend"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.actionBtn} onPress={handleShare}>
            <Text style={s.actionBtnText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* External links — only shown if available */}
        {(spotifyUrl || appleMusicUrl || websiteUrl) && (
          <View style={s.linksBlock}>
            <Text style={s.sectionLabel}>Links</Text>
            {spotifyUrl && (
              <TouchableOpacity
                style={s.linkBtn}
                onPress={() => handleExternalLink(spotifyUrl)}
              >
                <Text style={s.linkBtnText}>Spotify</Text>
              </TouchableOpacity>
            )}
            {appleMusicUrl && (
              <TouchableOpacity
                style={s.linkBtn}
                onPress={() => handleExternalLink(appleMusicUrl)}
              >
                <Text style={s.linkBtnText}>Apple Music</Text>
              </TouchableOpacity>
            )}
            {websiteUrl && (
              <TouchableOpacity
                style={s.linkBtn}
                onPress={() => handleExternalLink(websiteUrl)}
              >
                <Text style={s.linkBtnText}>Website</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

      </View>
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const s = StyleSheet.create({
  scroll: {
    paddingBottom: 48,
  },
  imagePlaceholder: {
    width: "100%",
    height: 220,
    backgroundColor: "#D9D9D9",
  },
  body: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4,
  },
  badge: {
    fontSize: 11,
    fontWeight: "600",
    color: "#888",
    letterSpacing: 1,
    marginBottom: 16,
  },
  metaBlock: {
    marginBottom: 10,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#888",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 15,
  },
  descBlock: {
    marginTop: 16,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#888",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  desc: {
    fontSize: 15,
    lineHeight: 22,
    color: "#333",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 24,
    marginBottom: 8,
    flexWrap: "wrap",
  },
  actionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CCC",
    backgroundColor: "#FFF",
  },
  actionBtnActive: {
    backgroundColor: "#1A1A1A",
    borderColor: "#1A1A1A",
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  actionBtnTextActive: {
    color: "#FFF",
  },
  linksBlock: {
    marginTop: 20,
    gap: 10,
  },
  linkBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CCC",
    backgroundColor: "#FFF",
  },
  linkBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
});