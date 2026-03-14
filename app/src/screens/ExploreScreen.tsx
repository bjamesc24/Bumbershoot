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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getItemId(item: any): string {
  const rawType = item?.type ?? "";
  if (rawType === "artist") return `music-${item.id}`;
  if (rawType === "art") return `art-${item.id}`;
  return String(item?.id ?? "");
}

// ---------------------------------------------------------------------------
// Section header
// ---------------------------------------------------------------------------

function SectionHeader({ title }: { title: string }) {
  const { theme } = useAppSettings();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
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
}: {
  title: string;
  subtitle?: string | null;
  meta?: string | null;
  onPress?: () => void;
  showAttend?: boolean;
  item?: any;
  disabled?: boolean;
}) {
  const { theme, themeColorHex } = useAppSettings();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const id = item ? getItemId(item) : "";
  const { favorited, attending, handleFavorite, handleAttending } =
    useItemActions(id, item);

  return (
    <TouchableOpacity
      style={[styles.card, disabled && styles.cardDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={disabled ? 1 : 0.85}
    >
      <View style={styles.imagePlaceholder} />

      <Text style={styles.cardTitle} numberOfLines={2}>
        {title}
      </Text>

      {subtitle ? <Text style={styles.cardMeta}>{subtitle}</Text> : null}
      {meta ? <Text style={styles.cardMeta}>{meta}</Text> : null}

      {showAttend && item ? (
        <View style={styles.cardActions}>
          <TouchableOpacity
            onPress={() => handleFavorite(title)}
            style={[
              styles.actionButton,
              {
                borderColor: favorited ? themeColorHex : theme.colors.border,
                backgroundColor: favorited ? themeColorHex : theme.colors.surface2,
              },
            ]}
          >
            <Text
              style={[
                styles.actionText,
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
              styles.actionButton,
              {
                borderColor: attending ? themeColorHex : theme.colors.border,
                backgroundColor: attending ? themeColorHex : theme.colors.surface2,
              },
            ]}
          >
            <Text
              style={[
                styles.actionText,
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
      ) : null}
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
  const { theme } = useAppSettings();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <FlatList
      data={data}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => String(item.id ?? item.name)}
      renderItem={({ item }): React.ReactElement => renderItem(item)}
      contentContainerStyle={styles.horizontalList}
    />
  );
}

// ---------------------------------------------------------------------------
// Main Explore screen
// ---------------------------------------------------------------------------

export default function ExploreScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useAppSettings();
  const styles = useMemo(() => createStyles(theme), [theme]);

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

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Musicians */}
        <View style={styles.divider} />
        <SectionHeader title="Musicians" />
        <HorizontalSection
          data={musicData as any[]}
          renderItem={(item) => (
            <ExploreCard
              title={stripHtml(item.title?.rendered ?? "")}
              subtitle={item.meta?.genre ?? item.meta?.event_category ?? "Musician"}
              meta={item.meta?.hometown ?? stripHtml(item.excerpt?.rendered ?? "")}
              onPress={() => goToDetail(item, "musician")}
              item={item}
            />
          )}
        />

        {/* Music Line-Up */}
        <View style={styles.divider} />
        <SectionHeader title="Music Line-Up" />
        <HorizontalSection
          data={musicData as any[]}
          renderItem={(item) => {
            const start = item.meta?.event_start_time
              ? new Date(item.meta.event_start_time).toLocaleTimeString(undefined, {
                  hour: "numeric",
                  minute: "2-digit",
                })
              : null;
            return (
              <ExploreCard
                title={stripHtml(item.title?.rendered ?? "")}
                subtitle={start ? `${start} · ${item.meta?.stage}` : item.meta?.stage}
                meta={item.meta?.event_category ?? item.meta?.genre}
                onPress={() => goToDetail(item, "music-event")}
                showAttend
                item={item}
              />
            );
          }}
        />

        {/* Artists */}
        <View style={styles.divider} />
        <SectionHeader title="Artists" />
        <HorizontalSection
          data={artData as any[]}
          renderItem={(item) => (
            <ExploreCard
              title={stripHtml(item.title?.rendered ?? "")}
              subtitle={
                item.meta?.type ?? item.meta?.event_category ?? item.meta?.genre ?? "Artist"
              }
              meta={stripHtml(item.excerpt?.rendered ?? "")}
              onPress={() => goToDetail(item, "artist")}
              item={item}
            />
          )}
        />

        {/* Art */}
        <View style={styles.divider} />
        <SectionHeader title="Art" />
        <HorizontalSection
          data={artData as any[]}
          renderItem={(item) => {
            const start = item.meta?.event_start_time
              ? new Date(item.meta.event_start_time).toLocaleTimeString(undefined, {
                  hour: "numeric",
                  minute: "2-digit",
                })
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
              />
            );
          }}
        />

        {/* Vendors */}
        <View style={styles.divider} />
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
            />
          )}
        />

        {/* Stages */}
        <View style={styles.divider} />
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

        {/* Districts */}
        <View style={styles.divider} />
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
// Styles — Sasha's token-aware approach
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
    scroll: {
      paddingBottom: 32,
      backgroundColor: theme.colors.background,
    },
    sectionHeader: {
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 8,
    },
    sectionTitle: {
      fontSize: getFontSize(theme?.typography?.h2, 22),
      lineHeight: getLineHeight(theme?.typography?.h2, 28),
      fontWeight: getFontWeight(theme?.typography?.h2, "700"),
      color: theme.colors.text,
    },
    divider: {
      height: 1,
      marginHorizontal: 16,
      marginTop: 16,
      backgroundColor: theme.colors.border,
    },
    horizontalList: {
      paddingHorizontal: 16,
      gap: 12,
    },
    card: {
      width: CARD_WIDTH,
      minHeight: 250,
      borderRadius: 12,
      borderWidth: 1,
      padding: 12,
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
    },
    cardDisabled: {
      opacity: 0.6,
    },
    imagePlaceholder: {
      width: "100%",
      height: IMAGE_HEIGHT,
      borderRadius: 8,
      marginBottom: 10,
      backgroundColor: theme.colors.surface2,
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
      color: theme.colors.text,
      fontSize: getFontSize(theme?.typography?.caption, 13),
      lineHeight: getLineHeight(theme?.typography?.caption, 18),
      fontWeight: "500",
    },
  });
}