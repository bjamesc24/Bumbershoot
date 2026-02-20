/**
 * FavoritesScreen.tsx
 * -------------------
 * Displays the list of items the user has favorited.
 * Favorites are stored locally on the device so they work offline.
 */

import React, { useCallback, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { FavoriteRecord, getFavorites } from "../storage/favoritesStore";
import LoadingState from "../components/LoadingState";
import OfflineBanner from "../components/OfflineBanner";
import { useOfflineStatus } from "../hooks/useOfflineStatus";

export default function FavoritesScreen() {
  const isOffline = useOfflineStatus();

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
      <View style={{ flex: 1 }}>
        <OfflineBanner visible={isOffline} />
        <LoadingState />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <OfflineBanner visible={isOffline} />

      <Text style={{ fontSize: 24, fontWeight: "600", marginBottom: 12 }}>
        Favorites
      </Text>

      {favorites.length === 0 ? (
        <Text style={{ opacity: 0.7 }}>
          No favorites yet. Tap the favorite button on an event to save it.
        </Text>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={{
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: "#ddd",
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "500" }}>
                {item.title ?? item.id}
              </Text>

              {item.start ? (
                <Text style={{ opacity: 0.7, marginTop: 4 }}>{item.start}</Text>
              ) : null}
            </View>
          )}
        />
      )}
    </View>
  );
}