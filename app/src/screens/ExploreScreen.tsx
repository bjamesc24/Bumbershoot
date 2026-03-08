/**
 * ExploreScreen.tsx
 * -----------------
 * Discovery feed: Artists, Events, Workshops, Vendors, Venues.
 * Events and Venues pull from Spencer's sample data.
 * Artists, Workshops, Vendors are stubbed.
 * All cards navigate to DetailScreen with full item data.
 */

import React, { useEffect, useState } from "react";
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

// ---------------------------------------------------------------------------
// Placeholder data
// ---------------------------------------------------------------------------

const PLACEHOLDER_ARTISTS = [
  { id: "artist-1", name: "TBA Artist 1", genre: "Music", description: "Artist lineup coming soon." },
  { id: "artist-2", name: "TBA Artist 2", genre: "Music", description: "Artist lineup coming soon." },
  { id: "artist-3", name: "TBA Artist 3", genre: "Music", description: "Artist lineup coming soon." },
];

const PLACEHOLDER_WORKSHOPS = [
  { id: "workshop-1", name: "TBA Workshop 1", description: "Workshop details coming soon.", start: "2026-06-07T20:40:00", end: "2026-06-07T21:40:00", lat: 47.6205, lng: -122.3493, location: "TBA Location" },
  { id: "workshop-2", name: "TBA Workshop 2", description: "Workshop details coming soon.", start: "2026-06-15T13:00:00", end: "2026-06-15T14:00:00", lat: 47.6205, lng: -122.3493, location: "TBA Location" },
];

const PLACEHOLDER_VENDORS = [
  { id: "vendor-1", name: "TBA Vendor 1", type: "Food & Drink" },
  { id: "vendor-2", name: "TBA Vendor 2", type: "Merchandise" },
  { id: "vendor-3", name: "TBA Vendor 3", type: "Arts & Crafts" },
];

// ---------------------------------------------------------------------------
// Section header
// ---------------------------------------------------------------------------

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionTitle}>{title}</Text>
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
  const id = String(item?.id ?? "");
  const [favorited, setFavorited] = useState(false);
  const [attending, setAttending] = useState(false);

  useEffect(() => {
    if (!item) return;
    isFavorited(id).then(setFavorited);
    isAttending(id).then(setAttending);
  }, [id]);

  const handleFavorite = async () => {
    const { isNowFavorited } = await toggleFavorite({
      id,
      title,
      start: item?.meta?.event_start_time,
    });
    setFavorited(isNowFavorited);
  };

  const handleAttending = async () => {
    const { isNowAttending } = await toggleAttending({
      id,
      title,
      start: item?.meta?.event_start_time,
      end: item?.meta?.event_end_time,
      stage: item?.meta?.stage,
    });
    setAttending(isNowAttending);
  };

  return (
    <TouchableOpacity style={s.card} onPress={onPress}>
      <View style={s.imagePlaceholder} />
      <Text style={s.cardTitle} numberOfLines={2}>{title}</Text>
      {subtitle ? <Text style={s.cardMeta}>{subtitle}</Text> : null}
      {meta ? <Text style={s.cardMeta}>{meta}</Text> : null}
      {showAttend && item && (
        <View style={s.cardActions}>
          <TouchableOpacity onPress={handleFavorite} style={s.actionButton}>
            <Text style={s.actionText}>{favorited ? "Saved" : "Save"}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleAttending} style={s.actionButton}>
            <Text style={s.actionText}>{attending ? "Attending" : "Attend"}</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// Horizontal scroll row
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
      renderItem={({ item }): React.ReactElement => renderItem(item)}
      contentContainerStyle={s.horizontalList}
    />
  );
}

// ---------------------------------------------------------------------------
// ExploreScreen
// ---------------------------------------------------------------------------

export default function ExploreScreen() {
  const navigation = useNavigation<any>();

  const goToDetail = (item: any, type: string) => {
    navigation.navigate("Detail", { item, type });
  };

  return (
    <Screen>
      <ScreenTitle title="Explore" />
      <ScrollView contentContainerStyle={s.scroll}>

        <SectionHeader title="Artists" />
        <HorizontalSection
          data={PLACEHOLDER_ARTISTS}
          renderItem={(item) => (
            <ExploreCard
              title={item.name}
              subtitle={item.genre}
              onPress={() => goToDetail(item, "artist")}
            />
          )}
        />

        <View style={s.divider} />

        <SectionHeader title="Events" />
        <HorizontalSection
          data={eventsData as any[]}
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

        <View style={s.divider} />
        
        <SectionHeader title="Workshops" />
        <HorizontalSection
          data={PLACEHOLDER_WORKSHOPS}
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

        <View style={s.divider} />

        <SectionHeader title="Vendors" />
        <HorizontalSection
          data={PLACEHOLDER_VENDORS}
          renderItem={(item) => (
            <ExploreCard
              title={item.name}
              subtitle={item.type}
              onPress={() => goToDetail(item, "vendor")}
            />
          )}
        />

        <View style={s.divider} />

        <SectionHeader title="Venues" />
        <HorizontalSection
          data={venuesData as any[]}
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
    fontSize: 20,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E5E5",
    marginHorizontal: 16,
    marginTop: 16,
  },
  horizontalList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 12,
  },
  imagePlaceholder: {
    width: "100%",
    height: IMAGE_HEIGHT,
    backgroundColor: "#D9D9D9",
    borderRadius: 8,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  cardMeta: {
    fontSize: 12,
    color: "#777",
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
    borderColor: "#CCC",
    backgroundColor: "#FFF",
  },
  actionText: {
    fontSize: 12,
  },
});