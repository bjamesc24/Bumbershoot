import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Pressable, StyleSheet, Alert } from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import * as Location from "expo-location";

import OfflineBanner from "../components/OfflineBanner";
import LoadingState from "../components/LoadingState";
import { useOfflineStatus } from "../hooks/useOfflineStatus";
import { getVenues } from "../services/venuesService";
import type { Venue } from "../models/Venue";
import ScreenTitle from "../components/ScreenTitle";
import Screen from "../components/Screen";
import ThemedText from "../components/ThemedText";
import { useAppSettings } from "../context/AppSettingsContext";

type FilterKey = "all" | "stage" | "food" | "restroom" | "entertainment";

const SEATTLE_CENTER_REGION: Region = {
  latitude: 47.6205,
  longitude: -122.3493,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "stage", label: "Stages" },
  { key: "food", label: "Food" },
  { key: "restroom", label: "Restrooms" },
  { key: "entertainment", label: "Entertainment" },
];

export default function MapScreen() {
  const isOffline = useOfflineStatus();
  const { theme, themeColorHex } = useAppSettings();

  const mapRef = useRef<MapView | null>(null);

  const [loading, setLoading] = useState(true);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [filter, setFilter] = useState<FilterKey>("all");

  useEffect(() => {
    async function loadVenues() {
      try {
        const data = await getVenues();
        setVenues(data);
      } catch {
        setVenues([]);
      } finally {
        setLoading(false);
      }
    }
    void loadVenues();
  }, []);

  const filteredVenues = useMemo(() => {
    if (filter === "all") return venues;
    return venues.filter((v) => v.category === filter);
  }, [venues, filter]);

  const locateMe = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Location permission needed", "Please allow location access to use Locate Me.");
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const userRegion: Region = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };

      mapRef.current?.animateToRegion(userRegion, 800);
    } catch {
      Alert.alert("Location unavailable", "We couldn't get your current location.");
    }
  };

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
      <ScreenTitle title="Map" />

      <View
        style={[
          styles.chipsRow,
          {
            backgroundColor: theme.colors.surface2,
            borderColor: theme.colors.border,
          },
        ]}
      >
        {FILTERS.map((f) => {
          const selected = f.key === filter;

          return (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[
                styles.chip,
                {
                  borderColor: selected ? themeColorHex : theme.colors.border,
                  backgroundColor: selected ? `${themeColorHex}22` : theme.colors.surface,
                },
              ]}
            >
              <ThemedText
                variant="caption"
                weight="800"
                style={{
                  color: selected ? theme.colors.text : theme.colors.textMuted,
                }}
              >
                {f.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      <View
        style={[
          styles.mapCard,
          {
            backgroundColor: theme.colors.surface2,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          initialRegion={SEATTLE_CENTER_REGION}
          showsUserLocation
          showsMyLocationButton={false}
        >
          {filteredVenues.map((venue) => (
            <Marker
              key={venue.id}
              coordinate={{ latitude: venue.lat, longitude: venue.lng }}
              title={venue.name}
            />
          ))}
        </MapView>

        <View style={styles.mapButtons}>
          <Pressable
            onPress={() => mapRef.current?.animateToRegion(SEATTLE_CENTER_REGION, 400)}
            style={[
              styles.mapButton,
              {
                backgroundColor: theme.colors.surface2,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <ThemedText variant="caption" weight="800">
              Reset
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={locateMe}
            style={[
              styles.mapButton,
              {
                backgroundColor: theme.colors.primary,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <ThemedText
              variant="caption"
              weight="800"
              style={{ color: theme.colors.primaryText }}
            >
              Locate Me
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },

  chip: {
    borderWidth: 2,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  mapCard: {
  flex: 1,
  marginHorizontal: 16,
  marginTop: 12,
  marginBottom: 12,
  borderRadius: 22,
  overflow: "hidden",
  borderWidth: 1,
},

  mapButtons: {
    position: "absolute",
    right: 16,
    bottom: 16,
    gap: 8,
  },

  mapButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
});