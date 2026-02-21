/**
 * FavoritesScreen.tsx
 * -------------------
 * Responsibility:
 *   Display the user's saved items and keep the list synchronized with local storage.
 * 
 * Development utilities:
 *   Temporary buttons exist to simulate user actions until event-level favorite interactions are implemented elsewhere in the app.
 */

import React, { useCallback, useState } from "react";
import { FlatList, Text, View, Button } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { FavoriteRecord, getFavorites, addFavorite, clearFavorites } from "../storage/favoritesStore";
import LoadingState from "../components/LoadingState";
import OfflineBanner from "../components/OfflineBanner";
import { useOfflineStatus } from "../hooks/useOfflineStatus";

export default function FavoritesScreen() {
  const isOffline = useOfflineStatus();

  // Tracks storage read state
  const [loading, setLoading] = useState(true);

  // Current list of saved favorites
  const [favorites, setFavorites] = useState<FavoriteRecord[]>([]);

  /**
   * Reads favorites from local storage and updates screen state.
   * Errors are swallowed intentionally to prevent UI failure due to storage issues.
   */
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

  /**
   * Reload favorites whenever the screen becomes active.
   * Ensures the list reflects changes made elsewhere in the app.
   */
  useFocusEffect(
    useCallback(() => {
      void loadFavorites();
    }, [loadFavorites])
  );

  // Loading UI while reading storage
  if (loading) {
    return (
      <View style={{ flex: 1 }}>
        <OfflineBanner isOffline={isOffline} />
        <LoadingState visible={true} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <OfflineBanner isOffline={isOffline} />

      <Text style={{ fontSize: 24, fontWeight: "600", marginBottom: 12 }}>
        Favorites
      </Text>

      {/* Development utilities: simulate favoriting before event UI exists */}
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

      <Button
        title="Clear Favorites"
        onPress={async () => {
          await clearFavorites();
          await loadFavorites();
        }}
      />

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