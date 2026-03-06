import React, { useCallback, useState, useMemo } from "react";
import {
  FlatList,
  View,
  Pressable,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import {
  FavoriteRecord,
  getFavorites,
  removeFavorite,
} from "../storage/favoritesStore";

import LoadingState from "../components/LoadingState";
import OfflineBanner from "../components/OfflineBanner";
import { useOfflineStatus } from "../hooks/useOfflineStatus";
import { useAppSettings } from "../context/AppSettingsContext";

import Screen from "../components/Screen";
import ThemedText from "../components/ThemedText";

type SortMode = "az" | "za" | "recent" | "oldest";

const SORT_OPTIONS: { key: SortMode; label: string }[] = [
  { key: "recent", label: "Recent" },
  { key: "oldest", label: "Oldest" },
  { key: "az", label: "A–Z" },
  { key: "za", label: "Z–A" },
];

export default function FavoritesScreen() {
  const navigation = useNavigation<any>();
  const isOffline = useOfflineStatus();
  const { theme, themeColorHex } = useAppSettings();

  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<FavoriteRecord[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>("recent");

  const loadFavorites = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getFavorites();
      setFavorites(data);
    } catch {
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadFavorites();
    }, [loadFavorites])
  );

  const handleRemove = async (id: string) => {
    await removeFavorite(id);
    await loadFavorites();
  };

  const sorted = useMemo(() => {
    const copy = [...favorites];
    switch (sortMode) {
      case "az":
        return copy.sort((a, b) => (a.title ?? "").localeCompare(b.title ?? ""));
      case "za":
        return copy.sort((a, b) => (b.title ?? "").localeCompare(a.title ?? ""));
      case "oldest":
        return copy.reverse();
      case "recent":
      default:
        return copy; // getFavorites returns newest first
    }
  }, [favorites, sortMode]);

  if (loading) {
    return (
      <Screen>
        <OfflineBanner isOffline={isOffline} />
        <LoadingState visible />
      </Screen>
    );
  }

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
          Favorites
        </ThemedText>
      </View>

      {/* Sort controls */}
      <View style={styles.sortRow}>
        {SORT_OPTIONS.map((opt) => {
          const selected = opt.key === sortMode;
          return (
            <Pressable
              key={opt.key}
              onPress={() => setSortMode(opt.key)}
              style={[
                styles.sortChip,
                {
                  borderColor: selected ? themeColorHex : theme.colors.border,
                  backgroundColor: selected ? `${themeColorHex}22` : theme.colors.surface,
                },
              ]}
            >
              <ThemedText
                variant="caption"
                weight="700"
                style={{ color: selected ? theme.colors.text : theme.colors.textMuted }}
              >
                {opt.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {sorted.length === 0 ? (
        <ThemedText muted style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          No favorites yet. Tap Save on any event, artist, or venue to add it here.
        </ThemedText>
      ) : (
        <FlatList
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 }}
          data={sorted}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={[
                styles.row,
                { borderBottomColor: theme.colors.border, backgroundColor: theme.colors.surface2 },
              ]}
            >
              <View style={styles.rowText}>
                <ThemedText variant="body" weight="700">
                  {item.title ?? item.id}
                </ThemedText>
                {item.start ? (
                  <ThemedText variant="caption" muted style={{ marginTop: 4 }}>
                    {new Date(item.start).toLocaleString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </ThemedText>
                ) : null}
              </View>

              <TouchableOpacity
                onPress={() => handleRemove(item.id)}
                style={styles.deleteButton}
                hitSlop={8}
              >
                <ThemedText style={{ fontSize: 18, color: theme.colors.textMuted }}>
                  🗑
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  safeHeader: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
  sortRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexWrap: "wrap",
  },
  sortChip: {
    borderWidth: 2,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 8,
  },
  rowText: {
    flex: 1,
  },
  deleteButton: {
    paddingLeft: 12,
  },
});