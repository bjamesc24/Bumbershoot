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

/** Geographic bounds centered on Seattle Center. */
const SEATTLE_CENTER_REGION: Region = {
  latitude: 47.6205,
  longitude: -122.3493,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

export default function MapScreen() {
  const isOffline = useOfflineStatus();

  // Tracks whether venue data is still being loaded
  const [loading, setLoading] = useState(true);

  // Venue locations to render as map markers
  const [venues, setVenues] = useState<Venue[]>([]);

  /**
   * Load venue data when the screen mounts.
   * Errors are caught to prevent a crash — the map renders without markers as a fallback.
   */
  useEffect(() => {
    async function loadVenues() {
      try {
        const data = await getVenues();
        setVenues(data);
      } catch {
        // Map still renders without markers if data fails to load
        setVenues([]);
      } finally {
        setLoading(false);
      }
    }

    void loadVenues();
  }, []);

  // Loading UI while venue data is being read
  if (loading) {
    return (
      <View style={{ flex: 1 }}>
        <OfflineBanner isOffline={isOffline} />
        <LoadingState visible={true} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Informational connectivity indicator */}
      <OfflineBanner isOffline={isOffline} />

      <MapView style={{ flex: 1 }} initialRegion={SEATTLE_CENTER_REGION}>
        {/* Render a marker for each venue loaded from venuesService */}
        {venues.map((venue) => (
          <Marker
            key={venue.id}
            coordinate={{ latitude: venue.lat, longitude: venue.lng }}
            title={venue.name}
          />
        ))}
      </MapView>
    </View>
  );
}