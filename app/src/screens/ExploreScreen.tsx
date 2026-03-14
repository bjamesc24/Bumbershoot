/**
 * ExploreScreen.tsx
 *
 * Purpose:
 * Displays the main discovery feed for the festival app.
 *
 * Data sources:
 * - music.sample.json -> Musicians, Music Line-Up, Stages (derived)
 * - art.sample.json -> Artists, Art, Districts (derived)
 * - vendors.sample.json -> Vendors
 *
 * Navigation:
 * - Musicians, Artists, Vendors, Music Line-Up, Art -> DetailScreen
 * - Stages -> DetailScreen (stage view)
 * - Districts -> DetailScreen (district view)
 */

import React, { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import Screen from "../components/Screen";
import ScreenTitle from "../components/ScreenTitle";
import { useItemActions } from "../hooks/useItemActions";
import { useAppSettings } from "../context/AppSettingsContext";
import type { DetailType } from "../navigation/RootNavigator";

import musicData from "../sample-data/music.sample.json";
import artData from "../sample-data/art.sample.json";
import vendorsData from "../sample-data/vendors.sample.json";

import { stripHtml } from "../utils/displayUtils";
import {
  artImageRegistry,
  musicImageRegistry,
  vendorImageRegistry,
  defaultArtImage,
  defaultMusicImage,
  defaultVendorImage,
} from "../constants/imageRegistry";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getItemId(item: any): string {
  const rawType = item?.type ?? "";
  if (rawType === "artist") return `music-${item.id}`;
  if (rawType === "art") return `art-${item.id}`;
  return String(item?.id ?? "");
}

function getExploreImageSource(item: any): any | null {
  if (!item) return null;

  // Music items
  if (item?.type === "artist" && item?.meta?.image_url) {
    return musicImageRegistry[item.meta.image_url] ?? defaultMusicImage;
  }

  // Art items
  if (item?.type === "art" && item?.meta?.image_url) {
    return artImageRegistry[item.meta.image_url] ?? defaultArtImage;
  }

  // Vendor items
  if (item?.type === "vendor" && item?.image_url) {
    return vendorImageRegistry[item.image_url] ?? defaultVendorImage;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Section header
// ---------------------------------------------------------------------------

function SectionHeader({ title }: { title: string }) {
  const { theme } = useAppSettings();
  return (
    <View style={s.sectionHeader}>
      <Text
        style={[
          s.sectionTitle,
          { color: theme.colors.text, fontSize: theme.typography.h3 },
        ]}
      >
        {title}
      </Text>
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
  disabled,
  imageSource,
}: {
  title: string;
  subtitle?: string | null;
  meta?: string | null;
  onPress?: () => void;
  showAttend?: boolean;
  item?: any;
  disabled?: boolean;
  imageSource?: any | null;
}) {
  const { theme, themeColorHex } = useAppSettings();
  const id = item ? getItemId(item) : "";
  const { favorited, attending, handleFavorite, handleAttending } =
    useItemActions(id, item);

  return (
    <TouchableOpacity
      style={[
        s.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
        disabled && s.cardDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={disabled ? 1 : 0.8}
    >
      {imageSource ? (
        <Image source={imageSource} style={s.cardImage} resizeMode="cover" />
      ) : (
        <View style={[s.imagePlaceholder, { backgroundColor: theme.colors.surface2 }]} />
      )}

      <Text
        style={[
          s.cardTitle,
          { color: theme.colors.text, fontSize: theme.typography.body },
        ]}
        numberOfLines={2}
      >
        {title}
      </Text>

      {subtitle ? (
        <Text
          style={[
            s.cardMeta,
            { color: theme.colors.textMuted, fontSize: theme.typography.caption },
          ]}
        >
          {subtitle}
        </Text>
      ) : null}

      {meta ? (
        <Text
          style={[
            s.cardMeta,
            { color: theme.colors.textMuted, fontSize: theme.typography.caption },
          ]}
        >
          {meta}
        </Text>
      ) : null}

      {showAttend && item && (
        <View style={s.cardActions}>
          <TouchableOpacity
            onPress={() => handleFavorite(title)}
            style={[
              s.actionButton,
              {
                borderColor: favorited ? themeColorHex : theme.colors.border,
                backgroundColor: favorited ? themeColorHex : theme.colors.surface2,
              },
            ]}
          >
            <Text
              style={[
                s.actionText,
                {
                  color: favorited
                    ? theme.colors.primaryText
                    : theme.colors.textMuted,
                },
              ]}
            >
              {favorited ? "Liked" : "Like"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleAttending(title)}
            style={[
              s.actionButton,
              {
                borderColor: attending ? themeColorHex : theme.colors.border,
                backgroundColor: attending ? themeColorHex : theme.colors.surface2,
              },
            ]}
          >
            <Text
              style={[
                s.actionText,
                {
                  color: attending
                    ? theme.colors.primaryText
                    : theme.colors.textMuted,
                },
              ]}
            >
              {attending ? "Attending" : "Attend"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// Reusable horizontal list section
// ---------------------------------------------------------------------------

function HorizontalSection({
  data,
  renderItem,
}: {
  data: any[];
  renderItem: (item: any) => React.ReactElement;
}) {
  return (
    <FlatList
      data={data}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => String(item.id ?? item.name)}
      renderItem={({ item }) => renderItem(item)}
      contentContainerStyle={s.horizontalList}
    />
  );
}

// ---------------------------------------------------------------------------
// Main Explore screen
// ---------------------------------------------------------------------------

export default function ExploreScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useAppSettings();

  const goToDetail = (item: any, type: DetailType) => {
    navigation.navigate("Detail", { item, type });
  };

  // Derive stages from music data — stays in sync automatically
  const stages = useMemo(
    () =>
      Array.from(
        new Set(
          (musicData as any[]).map((e) => e?.meta?.stage).filter(Boolean)
        )
      )
        .sort()
        .map((name) => ({
          id: `stage-${(name as string).toLowerCase().replace(/\s+/g, "-")}`,
          name,
        })),
    []
  );

  // Derive districts from art data — stays in sync automatically
  const districts = useMemo(
    () =>
      Array.from(
        new Set(
          (artData as any[]).map((e) => e?.meta?.district).filter(Boolean)
        )
      )
        .sort()
        .map((name) => ({
          id: `district-${(name as string).toLowerCase().replace(/\s+/g, "-")}`,
          name,
        })),
    []
  );

  return (
    <Screen>
      <ScreenTitle title="Explore" />

      <ScrollView
        contentContainerStyle={[
          s.scroll,
          { backgroundColor: theme.colors.background },
        ]}
      >
        {/* ----------------------------------------------------------------- */}
        {/* Musicians */}
        {/* ----------------------------------------------------------------- */}
        <View style={[s.divider, { backgroundColor: theme.colors.border }]} />
        <SectionHeader title="Musicians" />

        <HorizontalSection
          data={musicData as any[]}
          renderItem={(item) => (
            <ExploreCard
              title={stripHtml(item.title?.rendered ?? "")}
              subtitle={
                item.meta?.genre ?? item.meta?.event_category ?? "Musician"
              }
              meta={
                item.meta?.hometown ??
                stripHtml(item.excerpt?.rendered ?? "")
              }
              onPress={() => goToDetail(item, "musician")}
              item={item}
              imageSource={getExploreImageSource(item)}
            />
          )}
        />

        {/* ----------------------------------------------------------------- */}
        {/* Music Line-Up */}
        {/* ----------------------------------------------------------------- */}
        <View style={[s.divider, { backgroundColor: theme.colors.border }]} />
        <SectionHeader title="Music Line-Up" />

        <HorizontalSection
          data={musicData as any[]}
          renderItem={(item) => {
            const start = item.meta?.event_start_time
              ? new Date(item.meta.event_start_time).toLocaleTimeString(
                  undefined,
                  { hour: "numeric", minute: "2-digit" }
                )
              : null;

            return (
              <ExploreCard
                title={stripHtml(item.title?.rendered ?? "")}
                subtitle={
                  start ? `${start} · ${item.meta?.stage}` : item.meta?.stage
                }
                meta={item.meta?.event_category ?? item.meta?.genre}
                onPress={() => goToDetail(item, "music-event")}
                showAttend
                item={item}
                imageSource={getExploreImageSource(item)}
              />
            );
          }}
        />

        {/* ----------------------------------------------------------------- */}
        {/* Artists */}
        {/* ----------------------------------------------------------------- */}
        <View style={[s.divider, { backgroundColor: theme.colors.border }]} />
        <SectionHeader title="Artists" />

        <HorizontalSection
          data={artData as any[]}
          renderItem={(item) => (
            <ExploreCard
              title={stripHtml(item.title?.rendered ?? "")}
              subtitle={
                item.meta?.type ??
                item.meta?.event_category ??
                item.meta?.genre ??
                "Artist"
              }
              meta={stripHtml(item.excerpt?.rendered ?? "")}
              onPress={() => goToDetail(item, "artist")}
              item={item}
              imageSource={getExploreImageSource(item)}
            />
          )}
        />

        {/* ----------------------------------------------------------------- */}
        {/* Scheduled Art */}
        {/* ----------------------------------------------------------------- */}
        <View style={[s.divider, { backgroundColor: theme.colors.border }]} />
        <SectionHeader title="Art" />

        <HorizontalSection
          data={artData as any[]}
          renderItem={(item) => {
            const start = item.meta?.event_start_time
              ? new Date(item.meta.event_start_time).toLocaleTimeString(
                  undefined,
                  { hour: "numeric", minute: "2-digit" }
                )
              : null;

            const district = item.meta?.district ?? "TBA";

            return (
              <ExploreCard
                title={stripHtml(item.title?.rendered ?? "")}
                subtitle={start ? `${start} · ${district}` : district}
                meta={item.meta?.event_category ?? item.meta?.genre}
                onPress={() => goToDetail(item, "art-event")}
                showAttend
                item={item}
                imageSource={getExploreImageSource(item)}
              />
            );
          }}
        />

        {/* ----------------------------------------------------------------- */}
        {/* Vendors */}
        {/* ----------------------------------------------------------------- */}
        <View style={[s.divider, { backgroundColor: theme.colors.border }]} />
        <SectionHeader title="Vendors" />

        <HorizontalSection
          data={vendorsData as any[]}
          renderItem={(item) => (
            <ExploreCard
              title={stripHtml(item.title?.rendered ?? "")}
              subtitle={stripHtml(item.meta?.vendor_type ?? "Vendor")}
              meta={stripHtml(item.excerpt?.rendered ?? "")}
              onPress={() => goToDetail(item, "vendor")}
              item={item}
              imageSource={getExploreImageSource(item)}
            />
          )}
        />

        {/* ----------------------------------------------------------------- */}
        {/* Stages — derived from music data */}
        {/* ----------------------------------------------------------------- */}
        <View style={[s.divider, { backgroundColor: theme.colors.border }]} />
        <SectionHeader title="Stages" />

        <HorizontalSection
          data={stages}
          renderItem={(item) => (
            <ExploreCard
              title={item.name}
              subtitle="Stage"
              onPress={() => goToDetail(item, "stage")}
            />
          )}
        />

        {/* ----------------------------------------------------------------- */}
        {/* Districts — derived from art data */}
        {/* ----------------------------------------------------------------- */}
        <View style={[s.divider, { backgroundColor: theme.colors.border }]} />
        <SectionHeader title="Districts" />

        <HorizontalSection
          data={districts}
          renderItem={(item) => (
            <ExploreCard
              title={item.name}
              subtitle="Art District"
              onPress={() => goToDetail(item, "district")}
            />
          )}
        />

        <View style={{ height: 32 }} />
      </ScrollView>
    </Screen>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const CARD_WIDTH = 220;
const IMAGE_HEIGHT = 140;

const s = StyleSheet.create({
  scroll: {
    paddingBottom: 32,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontWeight: "700",
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
    marginTop: 16,
  },
  horizontalList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  cardDisabled: {
    opacity: 0.6,
  },
  cardImage: {
    width: "100%",
    height: IMAGE_HEIGHT,
    borderRadius: 8,
    marginBottom: 10,
  },
  imagePlaceholder: {
    width: "100%",
    height: IMAGE_HEIGHT,
    borderRadius: 8,
    marginBottom: 10,
  },
  cardTitle: {
    fontWeight: "700",
    marginBottom: 4,
  },
  cardMeta: {
    marginBottom: 2,
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
  },
});