/**
 * DetailScreen.tsx
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
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import { useItemActions } from "../hooks/useItemActions";
import { useAttending } from "../context/AttendingContext";
import { useAppSettings } from "../context/AppSettingsContext";
import { stripHtml } from "../utils/displayUtils";
import type { DetailType } from "../navigation/RootNavigator";

import musicData from "../sample-data/music.sample.json";
import artData from "../sample-data/art.sample.json";

import {
  artImageRegistry,
  musicImageRegistry,
  vendorImageRegistry,
  defaultArtImage,
  defaultMusicImage,
  defaultVendorImage,
} from "../constants/imageRegistry";

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

// All events at a given stage, sorted by start time
function getStageEvents(stageName: string): any[] {
  return (musicData as any[])
    .filter((e) => e?.meta?.stage === stageName && e?.meta?.event_start_time)
    .sort(
      (a, b) =>
        new Date(a.meta.event_start_time).getTime() -
        new Date(b.meta.event_start_time).getTime()
    );
}

// All events in a given district, sorted by start time
function getDistrictEvents(districtName: string): any[] {
  return (artData as any[])
    .filter((e) => e?.meta?.district === districtName && e?.meta?.event_start_time)
    .sort(
      (a, b) =>
        new Date(a.meta.event_start_time).getTime() -
        new Date(b.meta.event_start_time).getTime()
    );
}

function getDetailImageSource(item: any, type: DetailType): any | null {
  if (!item) return null;

  if ((type === "musician" || type === "music-event") && item?.meta?.image_url) {
    return musicImageRegistry[item.meta.image_url] ?? defaultMusicImage;
  }

  if ((type === "artist" || type === "art-event") && item?.meta?.image_url) {
    return artImageRegistry[item.meta.image_url] ?? defaultArtImage;
  }

  if (type === "vendor" && item?.image_url) {
    return vendorImageRegistry[item.image_url] ?? defaultVendorImage;
  }

  return null;
}

// ---------------------------------------------------------------------------
// ScheduleEntryRow — profile view appearances with attend button
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
  const { theme, themeColorHex } = useAppSettings();
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
    <View style={[s.scheduleItem, { borderBottomColor: theme.colors.border }]}>
      <View style={s.scheduleItemHeader}>
        <Text
          style={[s.scheduleTitle, { color: theme.colors.text, fontSize: theme.typography.body }]}
          numberOfLines={2}
        >
          {getNormalizedTitle(entry)}
        </Text>
        <TouchableOpacity
          onPress={handleAttend}
          style={[
            s.attendChip,
            {
              borderColor: attending ? themeColorHex : theme.colors.border,
              backgroundColor: attending ? themeColorHex : theme.colors.surface,
            },
          ]}
        >
          <Text
            style={[
              s.attendChipText,
              { color: attending ? theme.colors.primaryText : theme.colors.textMuted },
            ]}
          >
            {attending ? "Attending" : "Attend"}
          </Text>
        </TouchableOpacity>
      </View>

      {formattedStart && (
        <Text style={[s.scheduleMeta, { color: theme.colors.textMuted, fontSize: theme.typography.caption }]}>
          {formattedStart}{formattedEnd ? ` – ${formattedEnd}` : ""}
        </Text>
      )}
      {location && (
        <Text style={[s.scheduleMeta, { color: theme.colors.textMuted, fontSize: theme.typography.caption }]}>
          {location}
        </Text>
      )}
      {category && (
        <Text style={[s.scheduleMeta, { color: theme.colors.textMuted, fontSize: theme.typography.caption }]}>
          {category}
        </Text>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// VenueEventRow — tappable event row used in stage/district views
// ---------------------------------------------------------------------------

function VenueEventRow({
  entry,
  onPress,
}: {
  entry: any;
  onPress: () => void;
}) {
  const { theme, themeColorHex } = useAppSettings();
  const entryId = entry?.type === "art"
    ? `art-${entry.id}`
    : `music-${entry.id}`;
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
      style={[s.venueEventRow, { borderBottomColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[s.venueEventAccent, { backgroundColor: themeColorHex }]} />

      <View style={s.venueEventContent}>
        <View style={s.venueEventHeader}>
          <Text
            style={[s.venueEventTitle, { color: theme.colors.text, fontSize: theme.typography.body }]}
            numberOfLines={1}
          >
            {getNormalizedTitle(entry)}
          </Text>
          <TouchableOpacity
            onPress={handleAttend}
            style={[
              s.attendChip,
              {
                borderColor: attending ? themeColorHex : theme.colors.border,
                backgroundColor: attending ? themeColorHex : theme.colors.surface2,
              },
            ]}
          >
            <Text
              style={[
                s.attendChipText,
                { color: attending ? theme.colors.primaryText : theme.colors.textMuted },
              ]}
            >
              {attending ? "Attending" : "Attend"}
            </Text>
          </TouchableOpacity>
        </View>

        {formattedStart && (
          <Text style={[s.venueEventMeta, { color: theme.colors.textMuted, fontSize: theme.typography.caption }]}>
            {formattedStart}{formattedEnd ? ` – ${formattedEnd}` : ""}
          </Text>
        )}
        {category && (
          <Text style={[s.venueEventMeta, { color: theme.colors.textMuted, fontSize: theme.typography.caption }]}>
            {category}
          </Text>
        )}
      </View>

      <Text style={[s.venueEventArrow, { color: theme.colors.textMuted }]}>›</Text>
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function DetailScreen({ route }: any) {
  const navigation = useNavigation<any>();
  const { theme, themeColorHex } = useAppSettings();

  const params = route?.params as DetailScreenParams | undefined;
  const item = params?.item;
  const type = params?.type;

  if (!item || !type) {
    return (
      <ScrollView contentContainerStyle={[s.scroll, { backgroundColor: theme.colors.background }]}>
        <View style={s.body}>
          <Text style={[s.title, { color: theme.colors.text }]}>Missing detail data</Text>
          <Text style={[s.desc, { color: theme.colors.textMuted }]}>
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

  const imageSource = getDetailImageSource(item, type);

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
    await toggle({
      id,
      title,
      start: eventStart,
      end: eventEnd,
      stage: location,
    });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: websiteUrl ? `${title} — ${websiteUrl}` : title,
        title,
      });
    } catch {}
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
    <ScrollView contentContainerStyle={[s.scroll, { backgroundColor: theme.colors.background }]}>
      {imageSource ? (
        <Image source={imageSource} style={s.heroImage} resizeMode="cover" />
      ) : (
        <View style={[s.imagePlaceholder, { backgroundColor: theme.colors.surface2 }]} />
      )}

      <View style={s.body}>
        <Text style={[s.title, { color: theme.colors.text, fontSize: theme.typography.h1 }]}>
          {title}
        </Text>
        <Text style={[s.badge, { color: theme.colors.textMuted }]}>{badgeLabel}</Text>

        {isEventView && formattedEventStart && (
          <View style={s.metaBlock}>
            <Text style={[s.metaLabel, { color: theme.colors.textMuted }]}>Time</Text>
            <Text style={[s.metaValue, { color: theme.colors.text, fontSize: theme.typography.body }]}>
              {formattedEventStart}{formattedEventEnd ? ` – ${formattedEventEnd}` : ""}
            </Text>
          </View>
        )}

        {isEventView && location && (
          <View style={s.metaBlock}>
            <Text style={[s.metaLabel, { color: theme.colors.textMuted }]}>
              {stage ? "Stage" : "District"}
            </Text>
            <Text style={[s.metaValue, { color: theme.colors.text, fontSize: theme.typography.body }]}>
              {location}
            </Text>
          </View>
        )}

        {categoryValue && (
          <View style={s.metaBlock}>
            <Text style={[s.metaLabel, { color: theme.colors.textMuted }]}>{categoryLabel}</Text>
            <Text style={[s.metaValue, { color: theme.colors.text, fontSize: theme.typography.body }]}>
              {stripHtml(String(categoryValue))}
            </Text>
          </View>
        )}

        {isProfileView && hometown && (
          <View style={s.metaBlock}>
            <Text style={[s.metaLabel, { color: theme.colors.textMuted }]}>Hometown</Text>
            <Text style={[s.metaValue, { color: theme.colors.text, fontSize: theme.typography.body }]}>
              {hometown}
            </Text>
          </View>
        )}

        {type === "vendor" && lat != null && lng != null && (
          <View style={s.metaBlock}>
            <Text style={[s.metaLabel, { color: theme.colors.textMuted }]}>Coordinates</Text>
            <Text style={[s.metaValue, { color: theme.colors.text, fontSize: theme.typography.body }]}>
              {lat}, {lng}
            </Text>
          </View>
        )}

        {isVenueView && (
          <View style={s.metaBlock}>
            <Text style={[s.metaLabel, { color: theme.colors.textMuted }]}>
              {type === "stage" ? "Stage" : "Art District"}
            </Text>
            <Text style={[s.metaValue, { color: theme.colors.text, fontSize: theme.typography.body }]}>
              {venueEvents.length} event{venueEvents.length !== 1 ? "s" : ""}
            </Text>
          </View>
        )}

        {!isEventView && !isVenueView && (excerpt || description) && (
          <View style={s.descBlock}>
            <Text style={[s.sectionLabel, { color: theme.colors.textMuted }]}>About</Text>
            <Text style={[s.desc, { color: theme.colors.text, fontSize: theme.typography.body }]}>
              {excerpt ?? description}
            </Text>
          </View>
        )}

        {!isVenueView && (
          <View style={s.actions}>
            <TouchableOpacity
              style={[
                s.actionBtn,
                {
                  borderColor: favorited ? themeColorHex : theme.colors.border,
                  backgroundColor: favorited ? themeColorHex : theme.colors.surface,
                },
              ]}
              onPress={() => handleFavorite(title)}
            >
              <Text
                style={[
                  s.actionBtnText,
                  {
                    color: favorited ? theme.colors.primaryText : theme.colors.text,
                    fontSize: theme.typography.body,
                  },
                ]}
              >
                {favorited ? "Liked" : "Like"}
              </Text>
            </TouchableOpacity>

            {isEventView && (
              <TouchableOpacity
                style={[
                  s.actionBtn,
                  {
                    borderColor: attending ? themeColorHex : theme.colors.border,
                    backgroundColor: attending ? themeColorHex : theme.colors.surface,
                  },
                ]}
                onPress={handleAttend}
              >
                <Text
                  style={[
                    s.actionBtnText,
                    {
                      color: attending ? theme.colors.primaryText : theme.colors.text,
                      fontSize: theme.typography.body,
                    },
                  ]}
                >
                  {attending ? "Attending" : "Attend"}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                s.actionBtn,
                { borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
              ]}
              onPress={handleShare}
            >
              <Text style={[s.actionBtnText, { color: theme.colors.text, fontSize: theme.typography.body }]}>
                Share
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {isEventView && linkedArtist && (
          <View style={s.artistLinkBlock}>
            <Text style={[s.sectionLabel, { color: theme.colors.textMuted }]}>Artist</Text>
            <TouchableOpacity
              style={[
                s.artistLinkBtn,
                { borderColor: theme.colors.border, backgroundColor: theme.colors.surface },
              ]}
              onPress={handleGoToArtist}
            >
              <Text style={[s.artistLinkTitle, { color: theme.colors.text, fontSize: theme.typography.body }]}>
                {getNormalizedTitle(linkedArtist)}
              </Text>
              <Text style={[s.artistLinkArrow, { color: theme.colors.textMuted }]}>→</Text>
            </TouchableOpacity>
          </View>
        )}

        {isProfileView && (spotifyUrl || appleMusicUrl || websiteUrl) && (
          <View style={s.linksBlock}>
            <Text style={[s.sectionLabel, { color: theme.colors.textMuted }]}>Links</Text>

            {spotifyUrl && (
              <TouchableOpacity
                style={[s.linkBtn, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
                onPress={() => handleExternalLink(spotifyUrl)}
              >
                <Text style={[s.linkBtnText, { color: theme.colors.text, fontSize: theme.typography.body }]}>
                  Spotify
                </Text>
              </TouchableOpacity>
            )}

            {appleMusicUrl && (
              <TouchableOpacity
                style={[s.linkBtn, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
                onPress={() => handleExternalLink(appleMusicUrl)}
              >
                <Text style={[s.linkBtnText, { color: theme.colors.text, fontSize: theme.typography.body }]}>
                  Apple Music
                </Text>
              </TouchableOpacity>
            )}

            {websiteUrl && (
              <TouchableOpacity
                style={[s.linkBtn, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
                onPress={() => handleExternalLink(websiteUrl)}
              >
                <Text style={[s.linkBtnText, { color: theme.colors.text, fontSize: theme.typography.body }]}>
                  Website
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {type === "vendor" && websiteUrl && (
          <View style={s.linksBlock}>
            <Text style={[s.sectionLabel, { color: theme.colors.textMuted }]}>Links</Text>
            <TouchableOpacity
              style={[s.linkBtn, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
              onPress={() => handleExternalLink(websiteUrl)}
            >
              <Text style={[s.linkBtnText, { color: theme.colors.text, fontSize: theme.typography.body }]}>
                Website
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {scheduleLabel && scheduledItems.length > 0 && (
          <View style={s.scheduleBlock}>
            <Text style={[s.sectionLabel, { color: theme.colors.textMuted }]}>{scheduleLabel}</Text>

            {scheduledItems.map((entry) => {
              const entryId =
                type === "musician" ? `music-${entry.id}` : `art-${entry.id}`;

              const formattedStart = entry?.meta?.event_start_time
                ? new Date(entry.meta.event_start_time).toLocaleString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
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

              const entryLocation = entry?.meta?.stage ?? entry?.meta?.district ?? null;
              const entryCategory = entry?.meta?.event_category ?? entry?.meta?.genre ?? null;

              return (
                <ScheduleEntryRow
                  key={entryId}
                  entryId={entryId}
                  entry={entry}
                  formattedStart={formattedStart}
                  formattedEnd={formattedEnd}
                  location={entryLocation}
                  category={entryCategory}
                />
              );
            })}
          </View>
        )}

        {isVenueView && (
          <View style={s.scheduleBlock}>
            <Text style={[s.sectionLabel, { color: theme.colors.textMuted }]}>
              {type === "stage" ? "Performances" : "Events"}
            </Text>

            {venueEvents.length === 0 ? (
              <Text style={[s.desc, { color: theme.colors.textMuted }]}>
                No events scheduled yet.
              </Text>
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
// Styles
// ---------------------------------------------------------------------------

const s = StyleSheet.create({
  scroll: {
    paddingBottom: 48,
  },
  heroImage: {
    width: "100%",
    height: 220,
  },
  imagePlaceholder: {
    width: "100%",
    height: 220,
  },
  body: {
    padding: 16,
  },
  title: {
    fontWeight: "800",
    marginBottom: 4,
  },
  badge: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: 16,
  },
  metaBlock: {
    marginBottom: 10,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  metaValue: {
    fontWeight: "400",
  },
  descBlock: {
    marginTop: 16,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  desc: {
    lineHeight: 22,
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
  },
  actionBtnText: {
    fontWeight: "600",
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
  },
  artistLinkTitle: {
    fontWeight: "700",
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
  },
  linkBtnText: {
    fontWeight: "600",
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
    fontWeight: "700",
    flex: 1,
    marginRight: 8,
  },
  scheduleMeta: {
    marginBottom: 2,
  },
  attendChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
  },
  attendChipText: {
    fontSize: 12,
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
    fontWeight: "700",
    flex: 1,
    marginRight: 8,
  },
  venueEventMeta: {
    marginBottom: 2,
  },
  venueEventArrow: {
    fontSize: 20,
    paddingHorizontal: 12,
  },
});