/**
 * MapScreen.tsx
 * -------------
 * Responsibility:
 *   Display a navigable view of the festival grounds and visualize physical locations.
 *
 * Design considerations:
 *   - Marker data is loaded from venuesService, which currently reads from local sample data.
 *     When the API is ready, venuesService will switch to live data without changes here.
 *   - The map region is intentionally constrained because the application represents
 *     a single bounded location rather than general navigation.
 *   - Errors during venue loading are caught silently to prevent a blank screen;
 *     the map still renders without markers if data cannot be loaded.
 */

import React, { useEffect, useState } from "react";
import { View } from "react-native";
import MapView, { Marker, Region } from "react-native-maps";

import OfflineBanner from "../components/OfflineBanner";
import LoadingState from "../components/LoadingState";
import { useOfflineStatus } from "../hooks/useOfflineStatus";
import { getVenues } from "../services/venuesService";
import type { Venue } from "../models/Venue";
import ScreenTitle from "../components/ScreenTitle";

/** Geographic bounds centered on Seattle Center. */
const SEATTLE_CENTER_REGION: Region = {
  latitude: 47.6205,
  longitude: -122.3493,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

export default function MapScreen() {
  const isOffline = useOfflineStatus();

  const [loading, setLoading] = useState(true);
  const [venues, setVenues] = useState<Venue[]>([]);

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

  if (loading) {
    return (
      <View style={{ flex: 1 }}>
        <OfflineBanner isOffline={isOffline} />
        <LoadingState visible={true} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <OfflineBanner isOffline={isOffline} />
      <ScreenTitle title="Map" />

      <View style={{ height: 44 }} />

      <View
        style={{
          marginHorizontal: 16,
          borderRadius: 22,
          overflow: "hidden", 
          backgroundColor: "#fff",
          shadowColor: "#000",
          shadowOpacity: 0.12,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
          elevation: 6,
          height: 520, 
        }}
      >
        <MapView style={{ flex: 1 }} initialRegion={SEATTLE_CENTER_REGION}>
          {venues.map((venue) => (
            <Marker
              key={venue.id}
              coordinate={{ latitude: venue.lat, longitude: venue.lng }}
              title={venue.name}
            />
          ))}
        </MapView>
      </View>

      <View style={{ flex: 1 }} />
    </View>
  );
}