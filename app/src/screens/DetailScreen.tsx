/**
 * DetailScreen.tsx
 * ----------------
 * Unified detail screen for Events, Artists, Workshops, Vendors, and Venues.
 *
 * View types:
 * - "musician"    → Artist profile: bio, genre, hometown, like, share, scheduled appearances
 * - "artist"      → Art profile: bio, type, like, share, scheduled appearances
 * - "vendor"      → Vendor info: type, description, like, share
 * - "music-event" → Scheduled music event: time, stage, category, like, attend, share, link to artist
 * - "art-event"   → Scheduled art event: time, district, category, like, attend, share, link to artist
 * - "stage"       → All music events at this stage, tappable rows → music-event detail
 * - "district"    → All art events in this district, tappable rows → art-event detail
 */

import React, { useMemo } from "react";
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

import { useItemActions } from "../hooks/useItemActions";
import { useAttending } from "../context/AttendingContext";
import { useAppSettings } from "../context/AppSettingsContext";
import { stripHtml } from "../utils/displayUtils";
import type { DetailType } from "../navigation/RootNavigator";

import musicData from "../sample-data/music.sample.json";
import artData from "../sample-data/art.sample.json";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type DetailScreenParams = {
  item: any;
  type: DetailType;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function scaleValue(base: number, textScale: number) {
  return Math.round(base * textScale);
}

function getNormalizedTitle(item: any): string {
  const rawTitle =
    item?.title?.rendered ??
    (typeof item?.title === "string" ? item.title : null) ??
    item?.name ??
    "Untitled";
  return stripHtml(rawTitle);
}

function getNormalizedDescription(item: any): string | null {
  if (item?.content?.rendered) return stripHtml(item.content.rendered);
  if (item?.description) return item.description;
  return null;
}

function getNormalizedExcerpt(item: any): string | null {
  if (item?.excerpt?.rendered) return stripHtml(item.excerpt.rendered);
  return null;
}

function getCategoryValue(item: any, type: DetailType): string | null {
  if (type === "musician") return item?.meta?.genre ?? item?.meta?.event_category ?? null;
  if (type === "artist") return item?.meta?.type ?? item?.meta?.event_category ?? item?.meta?.genre ?? null;
  if (type === "vendor") return item?.meta?.vendor_type ?? item?.meta?.type ?? null;
  if (type === "music-event") return item?.meta?.event_category ?? item?.meta?.genre ?? null;
  if (type === "art-event") return item?.meta?.event_category ?? item?.meta?.genre ?? null;
  return null;
}

function getCategoryLabel(type: DetailType): string {
  if (type === "musician") return "Genre";
  if (type === "artist") return "Type";
  if (type === "vendor") return "Vendor Type";
  if (type === "music-event") return "Genre";
  if (type === "art-event") return "Category";
  return "Category";
}

function getBadgeLabel(type: DetailType): string {
  if (type === "musician") return "MUSICIAN";
  if (type === "artist") return "ARTIST";
  if (type === "vendor") return "VENDOR";
  if (type === "music-event") return "MUSIC";
  if (type === "art-event") return "ART";
  if (type === "stage") return "STAGE";
  if (type === "district") return "DISTRICT";
  return "";
}

function getScheduledItems(item: any, type: DetailType): any[] {
  if (type !== "musician" && type !== "artist") return [];
  const source = type === "musician" ? (musicData as any[]) : (artData as any[]);
  const currentSlug = item?.slug ?? null;
  const currentTitle = getNormalizedTitle(item);
  return source.filter((entry) => {
    const entrySlug = entry?.slug ?? null;
    const entryTitle = getNormalizedTitle(entry);
    if (currentSlug && entrySlug) return entrySlug === currentSlug;
    return entryTitle === currentTitle;
  });
}

function findArtistForEvent(item: any, type: DetailType): any | null {
  if (type !== "music-event" && type !== "art-event") return null;
  const source = type === "music-event" ? (musicData as any[]) : (artData as any[]);
  const eventSlug = item?.slug ?? null;
  const eventTitle = getNormalizedTitle(item);
  return (
    source.find((entry) => {
      if (eventSlug && entry?.slug) return entry.slug === eventSlug;
      return getNormalizedTitle(entry) === eventTitle;
    }) ?? null
  );
}

function getStageEvents(stageName: string): any[] {
  return (musicData as any[])
    .filter((e) => e?.meta?.stage === stageName && e?.meta?.event_start_time)
    .sort(
      (a, b) =>
        new Date(a.meta.event_start_time).getTime() -
        new Date(b.meta.event_start_time).getTime()
    );
}

function getDistrictEvents(districtName: string): any[] {
  return (artData as any[])
    .filter((e) => e?.meta?.district === districtName && e?.meta?.event_start_time)
    .sort(
      (a, b) =>
        new Date(a.meta.event_start_time).getTime() -
        new Date(b.meta.event_start_time).getTime()
    );
}

// ---------------------------------------------------------------------------
// ScheduleEntryRow
// ---------------------------------------------------------------------------

function ScheduleEntryRow({
  entryId,
  entry,
  formattedStart,
  formattedEnd,
  location,
  category,
}: {
  entryId: string;
  entry: any;
  formattedStart: string | null;
  formattedEnd: string | null;
  location: string | null;
  category: string | null;
}) {
  const { theme, themeColorHex, textScale } = useAppSettings();
  const styles = useMemo(
    () => createStyles(theme, themeColorHex, textScale),
    [theme, themeColorHex, textScale]
  );
  const { isAttending, toggle } = useAttending();
  const attending = isAttending(entryId);

  const handleAttend = async () => {
    await toggle({
      id: entryId,
      title: getNormalizedTitle(entry),
      start: entry?.meta?.event_start_time,
      end: entry?.meta?.event_end_time,
      stage: entry?.meta?.stage ?? entry?.meta?.district,
    });
  };

  return (
    <View style={[styles.scheduleItem, { borderBottomColor: theme.colors.border }]}>
      <View style={styles.scheduleItemHeader}>
        <Text style={styles.scheduleTitle} numberOfLines={2}>
          {getNormalizedTitle(entry)}
        </Text>
        <TouchableOpacity
          onPress={handleAttend}
          style={[
            styles.attendChip,
            {
              borderColor: attending ? themeColorHex : theme.colors.border,
              backgroundColor: attending ? themeColorHex : theme.colors.surface,
            },
          ]}
        >
          <Text
            style={[
              styles.attendChipText,
              { color: attending ? theme.colors.primaryText : theme.colors.textMuted },
            ]}
          >
            {attending ? "Attending" : "Attend"}
          </Text>
        </TouchableOpacity>
      </View>

      {formattedStart && (
        <Text style={styles.scheduleMeta}>
          {formattedStart}{formattedEnd ? ` – ${formattedEnd}` : ""}
        </Text>
      )}
      {location && <Text style={styles.scheduleMeta}>{location}</Text>}
      {category && <Text style={styles.scheduleMeta}>{category}</Text>}
    </View>
  );
}

// ---------------------------------------------------------------------------
// VenueEventRow
// ---------------------------------------------------------------------------

function VenueEventRow({
  entry,
  onPress,
}: {
  entry: any;
  onPress: () => void;
}) {
  const { theme, themeColorHex, textScale } = useAppSettings();
  const styles = useMemo(
    () => createStyles(theme, themeColorHex, textScale),
    [theme, themeColorHex, textScale]
  );
  const entryId = entry?.type === "art" ? `art-${entry.id}` : `music-${entry.id}`;
  const { isAttending, toggle } = useAttending();
  const attending = isAttending(entryId);

  const formattedStart = entry?.meta?.event_start_time
    ? new Date(entry.meta.event_start_time).toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  const formattedEnd = entry?.meta?.event_end_time
    ? new Date(entry.meta.event_end_time).toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  const category = entry?.meta?.event_category ?? entry?.meta?.genre ?? null;

  const handleAttend = async () => {
    await toggle({
      id: entryId,
      title: getNormalizedTitle(entry),
      start: entry?.meta?.event_start_time,
      end: entry?.meta?.event_end_time,
      stage: entry?.meta?.stage ?? entry?.meta?.district,
    });
  };

  return (
    <TouchableOpacity
      style={[
        styles.venueEventRow,
        {
          borderBottomColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.venueEventAccent, { backgroundColor: themeColorHex }]} />

      <View style={styles.venueEventContent}>
        <View style={styles.venueEventHeader}>
          <Text style={styles.venueEventTitle} numberOfLines={1}>
            {getNormalizedTitle(entry)}
          </Text>
          <TouchableOpacity
            onPress={handleAttend}
            style={[
              styles.attendChip,
              {
                borderColor: attending ? themeColorHex : theme.colors.border,
                backgroundColor: attending ? themeColorHex : theme.colors.surface2,
              },
            ]}
          >
            <Text
              style={[
                styles.attendChipText,
                { color: attending ? theme.colors.primaryText : theme.colors.textMuted },
              ]}
            >
              {attending ? "Attending" : "Attend"}
            </Text>
          </TouchableOpacity>
        </View>

        {formattedStart && (
          <Text style={styles.venueEventMeta}>
            {formattedStart}{formattedEnd ? ` – ${formattedEnd}` : ""}
          </Text>
        )}
        {category && <Text style={styles.venueEventMeta}>{category}</Text>}
      </View>

      <Text style={[styles.venueEventArrow, { color: theme.colors.textMuted }]}>›</Text>
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function DetailScreen({ route }: any) {
  const navigation = useNavigation<any>();
  const { theme, themeColorHex, textScale } = useAppSettings();

  const styles = useMemo(
    () => createStyles(theme, themeColorHex, textScale),
    [theme, themeColorHex, textScale]
  );

  const params = route?.params as DetailScreenParams | undefined;
  const item = params?.item;
  const type = params?.type;

  if (!item || !type) {
    return (
      <ScrollView
        style={{ backgroundColor: theme.colors.background }}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.body}>
          <Text style={styles.title}>Missing detail data</Text>
          <Text style={styles.desc}>
            This screen was opened without the required item information.
          </Text>
        </View>
      </ScrollView>
    );
  }

  const id =
    type === "musician" ? `music-${item?.id}` :
    type === "artist" ? `art-${item?.id}` :
    type === "music-event" ? `music-${item?.id}` :
    type === "art-event" ? `art-${item?.id}` :
    String(item?.id ?? "");

  const { favorited, handleFavorite } = useItemActions(id, item);
  const { isAttending, toggle } = useAttending();
  const attending = isAttending(id);

  const isEventView = type === "music-event" || type === "art-event";
  const isProfileView = type === "musician" || type === "artist";
  const isVenueView = type === "stage" || type === "district";

  const title = getNormalizedTitle(item);
  const description = getNormalizedDescription(item);
  const excerpt = getNormalizedExcerpt(item);
  const categoryValue = getCategoryValue(item, type);
  const categoryLabel = getCategoryLabel(type);
  const badgeLabel = getBadgeLabel(type);
  const hometown = item?.meta?.hometown ?? null;
  const websiteUrl: string | null = item?.link ?? item?.meta?.website ?? null;
  const spotifyUrl: string | null = item?.meta?.spotify_url ?? item?.spotify_url ?? null;
  const appleMusicUrl: string | null = item?.meta?.apple_music_url ?? item?.apple_music_url ?? null;
  const lat = item?.meta?.coordinates?.lat ?? item?.lat ?? null;
  const lng = item?.meta?.coordinates?.lng ?? item?.lng ?? null;

  const eventStart = item?.meta?.event_start_time ?? null;
  const eventEnd = item?.meta?.event_end_time ?? null;
  const stage = item?.meta?.stage ?? null;
  const district = item?.meta?.district ?? null;
  const location = stage ?? district ?? null;

  const formattedEventStart = eventStart
    ? new Date(eventStart).toLocaleString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  const formattedEventEnd = eventEnd
    ? new Date(eventEnd).toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  const scheduledItems = useMemo(() => getScheduledItems(item, type), [item, type]);
  const scheduleLabel =
    type === "musician" ? "Scheduled Music" :
    type === "artist" ? "Scheduled Art" : null;

  const linkedArtist = useMemo(() => findArtistForEvent(item, type), [item, type]);

  const venueName = item?.name ?? "";
  const venueEvents = useMemo(() => {
    if (type === "stage") return getStageEvents(venueName);
    if (type === "district") return getDistrictEvents(venueName);
    return [];
  }, [type, venueName]);

  const handleAttend = async () => {
    await toggle({ id, title, start: eventStart, end: eventEnd, stage: location });
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

  const handleGoToArtist = () => {
    if (!linkedArtist) return;
    navigation.push("Detail", {
      item: linkedArtist,
      type: type === "music-event" ? "musician" : "artist",
    });
  };

  const handleVenueEventPress = (entry: any) => {
    navigation.push("Detail", {
      item: entry,
      type: type === "stage" ? "music-event" : "art-event",
    });
  };

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.scroll}
    >
      <View style={styles.imagePlaceholder} />

      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.badge}>{badgeLabel}</Text>

        {/* Event view: time */}
        {isEventView && formattedEventStart && (
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Time</Text>
            <Text style={styles.metaValue}>
              {formattedEventStart}{formattedEventEnd ? ` – ${formattedEventEnd}` : ""}
            </Text>
          </View>
        )}

        {/* Event view: stage or district */}
        {isEventView && location && (
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>{stage ? "Stage" : "District"}</Text>
            <Text style={styles.metaValue}>{location}</Text>
          </View>
        )}

        {/* Category */}
        {categoryValue && (
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>{categoryLabel}</Text>
            <Text style={styles.metaValue}>{stripHtml(String(categoryValue))}</Text>
          </View>
        )}

        {/* Profile: hometown */}
        {isProfileView && hometown && (
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Hometown</Text>
            <Text style={styles.metaValue}>{hometown}</Text>
          </View>
        )}

        {/* Vendor: coordinates */}
        {type === "vendor" && lat != null && lng != null && (
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Coordinates</Text>
            <Text style={styles.metaValue}>{lat}, {lng}</Text>
          </View>
        )}

        {/* Venue view: event count */}
        {isVenueView && (
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>
              {type === "stage" ? "Stage" : "Art District"}
            </Text>
            <Text style={styles.metaValue}>
              {venueEvents.length} event{venueEvents.length !== 1 ? "s" : ""}
            </Text>
          </View>
        )}

        {/* About */}
        {!isEventView && !isVenueView && (excerpt || description) && (
          <View style={styles.descBlock}>
            <Text style={styles.sectionLabel}>About</Text>
            <Text style={styles.desc}>{excerpt ?? description}</Text>
          </View>
        )}

        {/* Actions */}
        {!isVenueView && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, favorited && styles.actionBtnActive]}
              onPress={() => handleFavorite(title)}
            >
              <Text style={[styles.actionBtnText, favorited && styles.actionBtnTextActive]}>
                {favorited ? "Liked" : "Like"}
              </Text>
            </TouchableOpacity>

            {isEventView && (
              <TouchableOpacity
                style={[styles.actionBtn, attending && styles.actionBtnActive]}
                onPress={handleAttend}
              >
                <Text style={[styles.actionBtnText, attending && styles.actionBtnTextActive]}>
                  {attending ? "Attending" : "Attend"}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
              <Text style={styles.actionBtnText}>Share</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Event view: link to artist profile */}
        {isEventView && linkedArtist && (
          <View style={styles.artistLinkBlock}>
            <Text style={styles.sectionLabel}>Artist</Text>
            <TouchableOpacity style={styles.artistLinkBtn} onPress={handleGoToArtist}>
              <Text style={styles.artistLinkTitle}>
                {getNormalizedTitle(linkedArtist)}
              </Text>
              <Text style={[styles.artistLinkArrow, { color: theme.colors.textMuted }]}>→</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Profile: external links */}
        {isProfileView && (spotifyUrl || appleMusicUrl || websiteUrl) && (
          <View style={styles.linksBlock}>
            <Text style={styles.sectionLabel}>Links</Text>
            {spotifyUrl && (
              <TouchableOpacity style={styles.linkBtn} onPress={() => handleExternalLink(spotifyUrl)}>
                <Text style={styles.linkBtnText}>Spotify</Text>
              </TouchableOpacity>
            )}
            {appleMusicUrl && (
              <TouchableOpacity style={styles.linkBtn} onPress={() => handleExternalLink(appleMusicUrl)}>
                <Text style={styles.linkBtnText}>Apple Music</Text>
              </TouchableOpacity>
            )}
            {websiteUrl && (
              <TouchableOpacity style={styles.linkBtn} onPress={() => handleExternalLink(websiteUrl)}>
                <Text style={styles.linkBtnText}>Website</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Vendor: website */}
        {type === "vendor" && websiteUrl && (
          <View style={styles.linksBlock}>
            <Text style={styles.sectionLabel}>Links</Text>
            <TouchableOpacity style={styles.linkBtn} onPress={() => handleExternalLink(websiteUrl)}>
              <Text style={styles.linkBtnText}>Website</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Profile: scheduled appearances */}
        {scheduleLabel && scheduledItems.length > 0 && (
          <View style={styles.scheduleBlock}>
            <Text style={styles.sectionLabel}>{scheduleLabel}</Text>
            {scheduledItems.map((entry) => {
              const entryId =
                type === "musician" ? `music-${entry.id}` : `art-${entry.id}`;
              const fStart = entry?.meta?.event_start_time
                ? new Date(entry.meta.event_start_time).toLocaleString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })
                : null;
              const fEnd = entry?.meta?.event_end_time
                ? new Date(entry.meta.event_end_time).toLocaleTimeString(undefined, {
                    hour: "numeric",
                    minute: "2-digit",
                  })
                : null;
              return (
                <ScheduleEntryRow
                  key={entryId}
                  entryId={entryId}
                  entry={entry}
                  formattedStart={fStart}
                  formattedEnd={fEnd}
                  location={entry?.meta?.stage ?? entry?.meta?.district ?? null}
                  category={entry?.meta?.event_category ?? entry?.meta?.genre ?? null}
                />
              );
            })}
          </View>
        )}

        {/* Venue view: events list */}
        {isVenueView && (
          <View style={styles.scheduleBlock}>
            <Text style={styles.sectionLabel}>
              {type === "stage" ? "Performances" : "Events"}
            </Text>
            {venueEvents.length === 0 ? (
              <Text style={styles.desc}>No events scheduled yet.</Text>
            ) : (
              venueEvents.map((entry) => (
                <VenueEventRow
                  key={entry.id}
                  entry={entry}
                  onPress={() => handleVenueEventPress(entry)}
                />
              ))
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Styles — Sasha's scaled approach
// ---------------------------------------------------------------------------

function createStyles(theme: any, themeColorHex: string, textScale: number) {
  const titleSize = scaleValue(24, textScale);
  const badgeSize = scaleValue(11, textScale);
  const metaLabelSize = scaleValue(11, textScale);
  const metaValueSize = scaleValue(15, textScale);
  const descSize = scaleValue(15, textScale);
  const buttonTextSize = scaleValue(14, textScale);
  const captionSize = scaleValue(13, textScale);

  return StyleSheet.create({
    scroll: {
      paddingBottom: 48,
    },
    imagePlaceholder: {
      width: "100%",
      height: 220,
      backgroundColor: theme.colors.surface2,
    },
    body: {
      padding: 16,
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
    artistLinkBlock: {
      marginTop: 20,
    },
    artistLinkBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    artistLinkTitle: {
      fontSize: metaValueSize,
      fontWeight: "700",
      lineHeight: Math.round(metaValueSize * 1.35),
      color: theme.colors.text,
    },
    artistLinkArrow: {
      fontSize: 16,
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
    scheduleBlock: {
      marginTop: 24,
    },
    scheduleItem: {
      paddingVertical: 12,
      borderBottomWidth: 1,
    },
    scheduleItemHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    scheduleTitle: {
      fontSize: metaValueSize,
      fontWeight: "700",
      lineHeight: Math.round(metaValueSize * 1.35),
      color: theme.colors.text,
      flex: 1,
      marginRight: 8,
    },
    scheduleMeta: {
      fontSize: captionSize,
      lineHeight: Math.round(captionSize * 1.35),
      color: theme.colors.textMuted,
      marginBottom: 2,
    },
    attendChip: {
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 6,
      borderWidth: 1,
    },
    attendChipText: {
      fontSize: scaleValue(12, textScale),
      fontWeight: "600",
    },
    venueEventRow: {
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: 1,
      borderRadius: 10,
      marginBottom: 8,
      overflow: "hidden",
    },
    venueEventAccent: {
      width: 4,
      alignSelf: "stretch",
    },
    venueEventContent: {
      flex: 1,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    venueEventHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 3,
    },
    venueEventTitle: {
      fontSize: metaValueSize,
      fontWeight: "700",
      lineHeight: Math.round(metaValueSize * 1.35),
      color: theme.colors.text,
      flex: 1,
      marginRight: 8,
    },
    venueEventMeta: {
      fontSize: captionSize,
      lineHeight: Math.round(captionSize * 1.35),
      color: theme.colors.textMuted,
      marginBottom: 2,
    },
    venueEventArrow: {
      fontSize: 20,
      paddingHorizontal: 12,
    },
  });
}