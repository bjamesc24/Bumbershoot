/**
 * DetailScreen.tsx
 * ----------------
 * Unified detail screen for Events, Artists, Workshops, Vendors, and Venues.
 */

import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Share,
  Linking,
} from "react-native";
import { isFavorited, toggleFavorite } from "../storage/favoritesStore";
import { isAttending, toggleAttending } from "../storage/attendingStore";
import { useAppSettings } from "../context/AppSettingsContext";
import { createCommonStyles } from "../theme/commonStyles";

type DetailScreenParams = {
  item: any;
  type: "event" | "artist" | "workshop" | "vendor" | "venue";
};

function scaleValue(base: number, textScale: number) {
  return Math.round(base * textScale);
}

export default function DetailScreen({ route }: any) {
  const { item, type } = route.params as DetailScreenParams;
  const { theme, themeColorHex, textScale } = useAppSettings();

  const common = useMemo(() => createCommonStyles(theme), [theme]);
  const styles = useMemo(
    () => createStyles(theme, themeColorHex, textScale),
    [theme, themeColorHex, textScale]
  );

  const id = String(item?.id ?? "");
  const [favorited, setFavorited] = useState(false);
  const [attending, setAttending] = useState(false);

  useEffect(() => {
    isFavorited(id).then(setFavorited);
    isAttending(id).then(setAttending);
  }, [id]);

  const title =
    item?.title?.rendered ??
    (typeof item?.title === "string" ? item.title : null) ??
    item?.name ??
    "Untitled";

  const description =
    item?.content?.rendered
      ? item.content.rendered.replace(/<[^>]+>/g, "")
      : item?.description ?? null;

  const excerpt =
    item?.excerpt?.rendered
      ? item.excerpt.rendered.replace(/<[^>]+>/g, "")
      : null;

  const startTime = item?.meta?.event_start_time ?? item?.startTime ?? item?.start ?? null;
  const endTime = item?.meta?.event_end_time ?? item?.endTime ?? item?.end ?? null;
  const stage = item?.meta?.stage ?? item?.stage ?? item?.location ?? null;
  const category =
    item?.meta?.event_category ?? item?.category ?? item?.genre ?? item?.type ?? null;

  const address = item?.meta?.address ?? null;
  const capacity = item?.meta?.capacity ?? null;
  const stageType = item?.meta?.stage_type ?? null;
  const amenities: string[] = item?.meta?.amenities ?? [];

  const spotifyUrl: string | null = item?.meta?.spotify_url ?? item?.spotify_url ?? null;
  const appleMusicUrl: string | null =
    item?.meta?.apple_music_url ?? item?.apple_music_url ?? null;
  const websiteUrl: string | null = item?.link ?? item?.meta?.website ?? null;

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
        message: websiteUrl ? `${title} — ${websiteUrl}` : title,
        title,
      });
    } catch {
      // dismissed
    }
  };

  const handleExternalLink = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={common.screenContent}
    >
      <View style={styles.imagePlaceholder} />

      <View style={common.pageBody}>
        <Text style={styles.title}>{title}</Text>

        <Text style={styles.badge}>{type.toUpperCase()}</Text>

        {formattedStart && (
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>When</Text>
            <Text style={styles.metaValue}>
              {formattedStart}
              {formattedEnd ? ` – ${formattedEnd}` : ""}
            </Text>
          </View>
        )}

        {stage && (
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Stage</Text>
            <Text style={styles.metaValue}>{stage}</Text>
          </View>
        )}

        {category && (
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Category</Text>
            <Text style={styles.metaValue}>{category}</Text>
          </View>
        )}

        {address && (
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Address</Text>
            <Text style={styles.metaValue}>{address}</Text>
          </View>
        )}

        {capacity && (
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Capacity</Text>
            <Text style={styles.metaValue}>{capacity.toLocaleString()}</Text>
          </View>
        )}

        {stageType && (
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Stage Type</Text>
            <Text style={styles.metaValue}>{stageType}</Text>
          </View>
        )}

        {amenities.length > 0 && (
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Amenities</Text>
            <Text style={styles.metaValue}>{amenities.join(", ")}</Text>
          </View>
        )}

        {(excerpt || description) && (
          <View style={styles.descBlock}>
            <Text style={styles.sectionLabel}>About</Text>
            <Text style={styles.desc}>{excerpt ?? description}</Text>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              favorited && styles.actionBtnActive,
            ]}
            onPress={handleFavorite}
          >
            <Text
              style={[
                styles.actionBtnText,
                favorited && styles.actionBtnTextActive,
              ]}
            >
              {favorited ? "Saved" : "Save"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionBtn,
              attending && styles.actionBtnActive,
            ]}
            onPress={handleAttending}
          >
            <Text
              style={[
                styles.actionBtnText,
                attending && styles.actionBtnTextActive,
              ]}
            >
              {attending ? "Attending" : "Attend"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
            <Text style={styles.actionBtnText}>Share</Text>
          </TouchableOpacity>
        </View>

        {(spotifyUrl || appleMusicUrl || websiteUrl) && (
          <View style={styles.linksBlock}>
            <Text style={styles.sectionLabel}>Links</Text>

            {spotifyUrl && (
              <TouchableOpacity
                style={styles.linkBtn}
                onPress={() => handleExternalLink(spotifyUrl)}
              >
                <Text style={styles.linkBtnText}>Spotify</Text>
              </TouchableOpacity>
            )}

            {appleMusicUrl && (
              <TouchableOpacity
                style={styles.linkBtn}
                onPress={() => handleExternalLink(appleMusicUrl)}
              >
                <Text style={styles.linkBtnText}>Apple Music</Text>
              </TouchableOpacity>
            )}

            {websiteUrl && (
              <TouchableOpacity
                style={styles.linkBtn}
                onPress={() => handleExternalLink(websiteUrl)}
              >
                <Text style={styles.linkBtnText}>Website</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function createStyles(theme: any, themeColorHex: string, textScale: number) {
  const titleSize = scaleValue(24, textScale);
  const badgeSize = scaleValue(11, textScale);
  const metaLabelSize = scaleValue(11, textScale);
  const metaValueSize = scaleValue(15, textScale);
  const descSize = scaleValue(15, textScale);
  const buttonTextSize = scaleValue(14, textScale);

  return StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },

    imagePlaceholder: {
  width: "100%",
  height: 220,
  backgroundColor: "#D9D9D9",
},

    title: {
      fontSize: titleSize,
      fontWeight: "800",
      lineHeight: Math.round(titleSize * 1.2),
      color: theme.colors.text,
      marginBottom: 4,
    },

    badge: {
      fontSize: badgeSize,
      fontWeight: "600",
      lineHeight: Math.round(badgeSize * 1.2),
      color: themeColorHex,
      letterSpacing: 1,
      marginBottom: 16,
    },

    metaBlock: {
      marginBottom: 10,
    },

    metaLabel: {
      fontSize: metaLabelSize,
      fontWeight: "700",
      lineHeight: Math.round(metaLabelSize * 1.2),
      color: theme.colors.textMuted,
      letterSpacing: 0.5,
      textTransform: "uppercase",
      marginBottom: 2,
    },

    metaValue: {
      fontSize: metaValueSize,
      fontWeight: "400",
      lineHeight: Math.round(metaValueSize * 1.35),
      color: theme.colors.text,
    },

    descBlock: {
      marginTop: 16,
      marginBottom: 8,
    },

    sectionLabel: {
      fontSize: metaLabelSize,
      fontWeight: "700",
      lineHeight: Math.round(metaLabelSize * 1.2),
      color: theme.colors.textMuted,
      letterSpacing: 0.5,
      textTransform: "uppercase",
      marginBottom: 6,
    },

    desc: {
      fontSize: descSize,
      fontWeight: "400",
      lineHeight: Math.round(descSize * 1.45),
      color: theme.colors.text,
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
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },

    actionBtnActive: {
      backgroundColor: themeColorHex,
      borderColor: themeColorHex,
    },

    actionBtnText: {
      fontSize: buttonTextSize,
      fontWeight: "600",
      lineHeight: Math.round(buttonTextSize * 1.2),
      color: theme.colors.text,
    },

    actionBtnTextActive: {
      color: "#FFFFFF",
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
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },

    linkBtnText: {
      fontSize: buttonTextSize,
      fontWeight: "600",
      lineHeight: Math.round(buttonTextSize * 1.2),
      color: theme.colors.text,
    },
  });
}