/**
 * ExploreScreen.tsx
 * -----------------
 * Discovery feed: Artists, Events, Workshops, Vendors, Venues.
 * Events and Venues pull from Spencer's sample data.
 * Artists, Workshops, Vendors are stubbed.
 * All cards navigate to DetailScreen with full item data.
 */

import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import Screen from "../components/Screen";
import ScreenTitle from "../components/ScreenTitle";
import { isFavorited, toggleFavorite } from "../storage/favoritesStore";
import { isAttending, toggleAttending } from "../storage/attendingStore";

import eventsData from "../sample-data/events.sample.json";
import venuesData from "../sample-data/venues.sample.json";

import { createCommonStyles } from "../theme/commonStyles";
import { useAppSettings } from "../context/AppSettingsContext";
// ---------------------------------------------------------------------------
// Placeholder data
// ---------------------------------------------------------------------------

const PLACEHOLDER_ARTISTS = [
  {
    id: "artist-1",
    name: "TBA Artist 1",
    genre: "Music",
    description: "Artist lineup coming soon.",
  },
  {
    id: "artist-2",
    name: "TBA Artist 2",
    genre: "Music",
    description: "Artist lineup coming soon.",
  },
  {
    id: "artist-3",
    name: "TBA Artist 3",
    genre: "Music",
    description: "Artist lineup coming soon.",
  },
];

const PLACEHOLDER_WORKSHOPS = [
  {
    id: "workshop-1",
    name: "TBA Workshop 1",
    description: "Workshop details coming soon.",
    start: "2026-06-07T20:40:00",
    end: "2026-06-07T21:40:00",
    lat: 47.6205,
    lng: -122.3493,
    location: "TBA Location",
  },
  {
    id: "workshop-2",
    name: "TBA Workshop 2",
    description: "Workshop details coming soon.",
    start: "2026-06-15T13:00:00",
    end: "2026-06-15T14:00:00",
    lat: 47.6205,
    lng: -122.3493,
    location: "TBA Location",
  },
];

const PLACEHOLDER_VENDORS = [
  { id: "vendor-1", name: "TBA Vendor 1", type: "Food & Drink" },
  { id: "vendor-2", name: "TBA Vendor 2", type: "Merchandise" },
  { id: "vendor-3", name: "TBA Vendor 3", type: "Arts & Crafts" },
];

// ---------------------------------------------------------------------------
// Section header
// ---------------------------------------------------------------------------

function SectionHeader({
  title,
  sectionHeaderStyle,
  sectionTitleStyle,
}: {
  title: string;
  sectionHeaderStyle: any;
  sectionTitleStyle: any;
}) {
  return (
    <View style={sectionHeaderStyle}>
      <Text style={sectionTitleStyle}>{title}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Generic card
// ---------------------------------------------------------------------------

function ExploreCard({
  title,
  subtitle,
  meta,
  onPress,
  showAttend,
  item,
}: {
  title: string;
  subtitle?: string | null;
  meta?: string | null;
  onPress: () => void;
  showAttend?: boolean;
  item?: any;
}) {
  const navigation = useNavigation<any>();
  const { theme } = useAppSettings();
  const common = useMemo(() => createCommonStyles(theme), [theme]);
  const styles = useMemo(() => createStyles(theme), [theme]);

  const id = String(item?.id ?? "");
  const [favorited, setFavorited] = useState(false);
  const [attending, setAttending] = useState(false);

  useEffect(() => {
    if (!item) return;
    isFavorited(id).then(setFavorited);
    isAttending(id).then(setAttending);
  }, [id, item]);

  const handleFavorite = async () => {
    const { isNowFavorited } = await toggleFavorite({
      id,
      title,
      start: item?.meta?.event_start_time ?? item?.start,
    });
    setFavorited(isNowFavorited);
  };

  const handleAttending = async () => {
    const { isNowAttending } = await toggleAttending({
      id,
      title,
      start: item?.meta?.event_start_time ?? item?.start,
      end: item?.meta?.event_end_time ?? item?.end,
      stage: item?.meta?.stage ?? item?.location,
    });
    setAttending(isNowAttending);
  };

  return (
    <TouchableOpacity
      style={[common.card, styles.card]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[common.imagePlaceholder, styles.imagePlaceholder]} />

      <Text style={styles.cardTitle} numberOfLines={2}>
        {title}
      </Text>

      {subtitle ? <Text style={styles.cardMeta}>{subtitle}</Text> : null}
      {meta ? <Text style={styles.cardMeta}>{meta}</Text> : null}

      {showAttend && item ? (
        <View style={common.actionRow}>
          <TouchableOpacity onPress={handleFavorite} style={common.smallButton}>
            <Text style={styles.actionText}>{favorited ? "Saved" : "Save"}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleAttending} style={common.smallButton}>
            <Text style={styles.actionText}>
              {attending ? "Attending" : "Attend"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// Horizontal scroll row
// ---------------------------------------------------------------------------

function HorizontalSection({
  data,
  renderItem,
  horizontalListStyle,
}: {
  data: any[];
  renderItem: (item: any) => React.ReactElement;
  horizontalListStyle: any;
}) {
  return (
    <FlatList
      data={data}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => String(item.id ?? item.name)}
      renderItem={({ item }): React.ReactElement => renderItem(item)}
      contentContainerStyle={horizontalListStyle}
    />
  );
}

// ---------------------------------------------------------------------------
// ExploreScreen
// ---------------------------------------------------------------------------

export default function ExploreScreen() {
  const navigation = useNavigation<any>();
const { theme } = useAppSettings();

  const common = useMemo(() => createCommonStyles(theme), [theme]);
  const styles = useMemo(() => createStyles(theme), [theme]);

  const goToDetail = (item: any, type: string) => {
    navigation.navigate("Detail", { item, type });
  };

  return (
    <Screen>
      <ScreenTitle title="Explore" />

      <ScrollView contentContainerStyle={common.screenContent}>
        <SectionHeader
          title="Artists"
          sectionHeaderStyle={common.sectionHeader}
          sectionTitleStyle={styles.sectionTitle}
        />
        <HorizontalSection
          data={PLACEHOLDER_ARTISTS}
          horizontalListStyle={common.horizontalList}
          renderItem={(item) => (
            <ExploreCard
              title={item.name}
              subtitle={item.genre}
              onPress={() => goToDetail(item, "artist")}
            />
          )}
        />

        <View style={common.divider} />

        <SectionHeader
          title="Events"
          sectionHeaderStyle={common.sectionHeader}
          sectionTitleStyle={styles.sectionTitle}
        />
        <HorizontalSection
          data={eventsData as any[]}
          horizontalListStyle={common.horizontalList}
          renderItem={(item) => {
            const start = item.meta?.event_start_time
              ? new Date(item.meta.event_start_time).toLocaleTimeString(undefined, {
                  hour: "numeric",
                  minute: "2-digit",
                })
              : null;

            return (
              <ExploreCard
                title={item.title?.rendered}
                subtitle={start ? `${start} · ${item.meta?.stage}` : item.meta?.stage}
                meta={item.meta?.event_category}
                onPress={() => goToDetail(item, "event")}
                showAttend
                item={item}
              />
            );
          }}
        />

        <View style={common.divider} />

        <SectionHeader
          title="Workshops"
          sectionHeaderStyle={common.sectionHeader}
          sectionTitleStyle={styles.sectionTitle}
        />
        <HorizontalSection
          data={PLACEHOLDER_WORKSHOPS}
          horizontalListStyle={common.horizontalList}
          renderItem={(item) => {
            const start = item.start
              ? new Date(item.start).toLocaleTimeString(undefined, {
                  hour: "numeric",
                  minute: "2-digit",
                })
              : null;

            return (
              <ExploreCard
                title={item.name}
                subtitle={start ? `${start} · ${item.location}` : item.location}
                meta={item.description}
                onPress={() => goToDetail(item, "workshop")}
                showAttend
                item={item}
              />
            );
          }}
        />

        <View style={common.divider} />

        <SectionHeader
          title="Vendors"
          sectionHeaderStyle={common.sectionHeader}
          sectionTitleStyle={styles.sectionTitle}
        />
        <HorizontalSection
          data={PLACEHOLDER_VENDORS}
          horizontalListStyle={common.horizontalList}
          renderItem={(item) => (
            <ExploreCard
              title={item.name}
              subtitle={item.type}
              onPress={() => goToDetail(item, "vendor")}
            />
          )}
        />

        <View style={common.divider} />

        <SectionHeader
          title="Venues"
          sectionHeaderStyle={common.sectionHeader}
          sectionTitleStyle={styles.sectionTitle}
        />
        <HorizontalSection
          data={venuesData as any[]}
          horizontalListStyle={common.horizontalList}
          renderItem={(item) => (
            <ExploreCard
              title={item.name}
              subtitle={item.category}
              onPress={() => goToDetail(item, "venue")}
            />
          )}
        />
      </ScrollView>
    </Screen>
  );
}

// ---------------------------------------------------------------------------
// Local themed styles
// ---------------------------------------------------------------------------

const CARD_WIDTH = 220;
const IMAGE_HEIGHT = 140;

function getFontSize(token: any, fallback: number) {
  if (typeof token === "number") return token;
  if (token && typeof token.fontSize === "number") return token.fontSize;
  return fallback;
}

function getLineHeight(token: any, fallback: number) {
  if (token && typeof token.lineHeight === "number") return token.lineHeight;
  return fallback;
}

function getFontWeight(token: any, fallback: any) {
  if (token && token.fontWeight) return token.fontWeight;
  return fallback;
}

function createStyles(theme: any) {
  return StyleSheet.create({
    sectionTitle: {
      fontSize: getFontSize(theme?.typography?.h2, 22),
      lineHeight: getLineHeight(theme?.typography?.h2, 28),
      fontWeight: getFontWeight(theme?.typography?.h2, "700"),
      color: theme.colors.text,
    },

    card: {
      width: CARD_WIDTH,
      minHeight: 250,
    },

    imagePlaceholder: {
      height: IMAGE_HEIGHT,
    },

    cardTitle: {
      color: theme.colors.text,
      marginBottom: 6,
      fontSize: getFontSize(theme?.typography?.bodyStrong, 16),
      lineHeight: getLineHeight(theme?.typography?.bodyStrong, 22),
      fontWeight: getFontWeight(theme?.typography?.bodyStrong, "600"),
      minHeight: 44,
    },

    cardMeta: {
      color: theme.colors.textMuted,
      marginBottom: 4,
      fontSize: getFontSize(theme?.typography?.caption, 13),
      lineHeight: getLineHeight(theme?.typography?.caption, 18),
      fontWeight: getFontWeight(theme?.typography?.caption, "400"),
    },

    actionText: {
      color: theme.colors.text,
      fontSize: getFontSize(theme?.typography?.caption, 13),
      lineHeight: getLineHeight(theme?.typography?.caption, 18),
      fontWeight: "500",
    },
  });
}