import React, { useCallback, useState } from "react";
import { FlatList, View, Button, Pressable, StyleSheet } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import {
  FavoriteRecord,
  getFavorites,
  addFavorite,
  clearFavorites,
} from "../storage/favoritesStore";

import LoadingState from "../components/LoadingState";
import OfflineBanner from "../components/OfflineBanner";
import { useOfflineStatus } from "../hooks/useOfflineStatus";
import { useAppSettings } from "../context/AppSettingsContext";

import Screen from "../components/Screen";
import ThemedText from "../components/ThemedText";

export default function FavoritesScreen() {
  const navigation = useNavigation<any>();
  const isOffline = useOfflineStatus();
  const { theme } = useAppSettings();

  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<FavoriteRecord[]>([]);

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
          onPress={() => navigation.navigate("Tabs", { screen: "Schedule" })}
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

      <View style={{ paddingHorizontal: 16 }}>
      
        <Button
          title="Add Sample Favorite"
          onPress={async () => {
            await addFavorite({
              id: "demo-event-1",
              title: "The Headliner Band",
              start: "2026-09-02T20:00:00Z",
            });
            await loadFavorites();
          }}
        />

        <View style={{ height: 8 }} />

        <Button
          title="Clear Favorites"
          onPress={async () => {
            await clearFavorites();
            await loadFavorites();
          }}
        />

        {favorites.length === 0 ? (
          <ThemedText muted style={{ marginTop: 16 }}>
            No favorites yet. Tap the favorite button on an event to save it.
          </ThemedText>
        ) : (
          <FlatList
            contentContainerStyle={{ paddingBottom: 16, paddingTop: 12 }}
            data={favorites}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.itemRow,
                  { borderBottomColor: theme.colors.border },
                ]}
              >
                <ThemedText variant="body" weight="700">
                  {item.title ?? item.id}
                </ThemedText>

                {item.start ? (
                  <ThemedText variant="caption" muted style={{ marginTop: 4 }}>
                    {item.start}
                  </ThemedText>
                ) : null}
              </View>
            )}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safeHeader: {
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
  itemRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
});