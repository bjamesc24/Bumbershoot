import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Pressable,
  StyleSheet,
  Alert,
  Text,
  Linking,
} from "react-native";
import MapView, { Marker, Callout, Region } from "react-native-maps";
import * as Location from "expo-location";

import OfflineBanner from "../components/OfflineBanner";
import LoadingState from "../components/LoadingState";
import { useOfflineStatus } from "../hooks/useOfflineStatus";
import { getVenues } from "../services/venuesService";
import type { Venue, VenueCategory } from "../models/Venue";
import ScreenTitle from "../components/ScreenTitle";
import Screen from "../components/Screen";
import ThemedText from "../components/ThemedText";
import { useAppSettings } from "../context/AppSettingsContext";
import { useNavigation } from "@react-navigation/native";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FilterKey = "all" | VenueCategory;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SEATTLE_CENTER_REGION: Region = {
  latitude: 47.6205,
  longitude: -122.3493,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "stage", label: "Stages" },
  { key: "district", label: "Districts" },
  { key: "vendor", label: "Vendors" },
  { key: "info", label: "Info" },
  { key: "restroom", label: "Restrooms" },
];

// Pin color per category — makes markers visually distinct at a glance
const CATEGORY_COLORS: Record<VenueCategory, string> = {
  stage: "#E63946",
  district: "#9B5DE5",
  vendor: "#F4A261",
  restroom: "#457B9D",
  info: "#2A9D8F",
};

// ---------------------------------------------------------------------------
// Helper: open Apple Maps on iOS, Google Maps as fallback
// ---------------------------------------------------------------------------

function openDirections(lat: number, lng: number, name: string) {
  const encoded = encodeURIComponent(name);
  const url = `maps://?q=${encoded}&ll=${lat},${lng}`;
  const fallback = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  Linking.canOpenURL(url)
    .then((supported) => {
      Linking.openURL(supported ? url : fallback);
    })
    .catch(() => Linking.openURL(fallback));
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function MapScreen() {
  const isOffline = useOfflineStatus();
  const { theme, themeColorHex } = useAppSettings();
  const navigation = useNavigation<any>();

  const mapRef = useRef<MapView | null>(null);

  const [loading, setLoading] = useState(true);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [filter, setFilter] = useState<FilterKey>("all");

  // Load all venue/location markers from service on mount
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

  // Filter markers by selected category chip
  const filteredVenues = useMemo(() => {
    if (filter === "all") return venues;
    return venues.filter((v) => v.category === filter);
  }, [venues, filter]);

  // Request location permission and animate map to user's position
  const locateMe = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Location permission needed",
          "Please allow location access to use Locate Me."
        );
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

      {/* ----------------------------------------------------------------- */}
      {/* Category filter chips */}
      {/* ----------------------------------------------------------------- */}
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
                  backgroundColor: selected
                    ? `${themeColorHex}22`
                    : theme.colors.surface,
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

      {/* ----------------------------------------------------------------- */}
      {/* Map */}
      {/* ----------------------------------------------------------------- */}
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
              pinColor={CATEGORY_COLORS[venue.category]}
              // Tapping the callout opens directions in Maps
              onCalloutPress={() => openDirections(venue.lat, venue.lng, venue.name)}
            >
              {/* Callout bubble — shows name, category, and directions link
                  The white bubble shape is native and cannot be restyled.
                  To fully customize the bubble, switch to tooltip={true}
                  and render a custom View instead. */}
              <Callout tooltip={false}>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>{venue.name}</Text>
                  <Text style={styles.calloutCategory}>{venue.category}</Text>
                  <Text style={styles.calloutLink}>Get Directions →</Text>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>

        {/* ----------------------------------------------------------------- */}
        {/* Map control buttons — Reset and Locate Me */}
        {/* ----------------------------------------------------------------- */}
        <View style={styles.mapButtons}>
          <Pressable
            onPress={() =>
              mapRef.current?.animateToRegion(SEATTLE_CENTER_REGION, 400)
            }
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

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  // Filter chip row at the top
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

  // Map container card
  mapCard: {
    flex: 1,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
  },

  // Floating Reset / Locate Me buttons
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

  // Callout bubble content
  // Note: width, padding, and font sizes are the main things you can change here.
  // The bubble shape itself is rendered natively and cannot be styled.
  callout: {
    width: 180,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 3,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
    marginBottom: 1,
  },
  calloutCategory: {
    fontSize: 11,
    color: "#888",
    textTransform: "capitalize",
    marginBottom: 6,
  },
  calloutLink: {
    fontSize: 12,
    fontWeight: "700",
    color: "#007AFF",
  },
});