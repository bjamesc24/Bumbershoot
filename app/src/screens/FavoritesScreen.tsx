import React, { useCallback, useState } from "react";
import {
  FlatList,
  Text,
  View,
  Button,
  Pressable,
  StyleSheet,
} from "react-native";
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
import ScreenTitle from "../components/ScreenTitle";

export default function FavoritesScreen() {
  const navigation = useNavigation<any>();
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
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <OfflineBanner isOffline={isOffline} />
        <LoadingState visible />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <OfflineBanner isOffline={isOffline} />

<View style={styles.safeHeader}>
  
  <Pressable
    onPress={() =>
      navigation.navigate("Tabs", { screen: "ScheduleTab" })
    }
    style={styles.closeButton}
  >
    <Text style={styles.closeText}>×</Text>
  </Pressable>


  <Text style={styles.headerTitle}>Favorites</Text>
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
          <Text style={{ opacity: 0.7, marginTop: 16 }}>
            No favorites yet. Tap the favorite button on an event to save it.
          </Text>
        ) : (
          <FlatList
            contentContainerStyle={{ paddingBottom: 16, paddingTop: 12 }}
            data={favorites}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.itemRow}>
                <Text style={styles.itemTitle}>
                  {item.title ?? item.id}
                </Text>
                {item.start ? (
                  <Text style={styles.itemSubtitle}>{item.start}</Text>
                ) : null}
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    position: "relative",
  },

 

  itemRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },

  itemTitle: {
    fontSize: 16,
    fontWeight: "500",
  },

  itemSubtitle: {
    opacity: 0.7,
    marginTop: 4,
  },
  

safeHeader: {
  paddingTop: 50,        
  paddingHorizontal: 16,
},

closeButton: {
  width: 42,
  height: 42,
  borderRadius: 21,
  backgroundColor: "#111",
  justifyContent: "center",
  alignItems: "center",
},

closeText: {
  color: "#fff",
  fontSize: 22,
  fontWeight: "600",
},

headerTitle: {
  fontSize: 28,
  fontWeight: "800",
  marginTop: 18,        
},
});