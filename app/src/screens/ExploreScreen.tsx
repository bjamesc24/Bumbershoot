import React from "react";
import { View, StyleSheet } from "react-native";

import Screen from "../components/Screen";
import ScreenTitle from "../components/ScreenTitle";
import ThemedText from "../components/ThemedText";
import { useAppSettings } from "../context/AppSettingsContext";

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
  { id: "workshop-1", name: "TBA Workshop 1", description: "Workshop details coming soon." },
  { id: "workshop-2", name: "TBA Workshop 2", description: "Workshop details coming soon." },
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
// Generic card — used for all types
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

  const handleFavorite = async (e: any) => {
    e.stopPropagation?.();
    const { isNowFavorited } = await toggleFavorite({
      id,
      title,
      start: item?.meta?.event_start_time,
    });
    setFavorited(isNowFavorited);
  };

  const handleAttending = async (e: any) => {
    e.stopPropagation?.();
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
  const { theme } = useAppSettings();

  return (
    <Screen>
      <ScreenTitle title="Explore" />

      <View style={styles.body}>
        <ThemedText variant="h3" weight="800" style={{ marginBottom: 8 }}>
          Coming Soon
        </ThemedText>

        <ThemedText
          muted
          style={{
            textAlign: "center",
            lineHeight: Math.round(theme.typography.body * 1.4),
          }}
        >
          Artists, vendors, and festival highlights will appear here.
        </ThemedText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
});