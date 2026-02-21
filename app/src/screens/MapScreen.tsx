/**
 * MapScreen.tsx
 * -------------
 * Responsibility:
 *   Display a navigable view of the festival grounds and visualize physical locations.
 * 
 * Notes:
 *   Marker data is currently static but will later originate from the venue dataset.
 *   The map region is intentionally constrained because the application represents
 *   a single bounded location rather than general navigation.
 */

import React from "react";
import { View } from "react-native";
import MapView, { Marker, Region } from "react-native-maps";

import OfflineBanner from "../components/OfflineBanner";
import { useOfflineStatus } from "../hooks/useOfflineStatus";

// Geographic bounds centered on Seattle Center
const SEATTLE_CENTER_REGION: Region = {
  latitude: 47.6205,
  longitude: -122.3493,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

export default function MapScreen() {
  const isOffline = useOfflineStatus();

  return (
    <View style={{ flex: 1 }}>
      {/* Informational connectivity indicator */}
      <OfflineBanner isOffline={isOffline} />

      <MapView style={{ flex: 1 }} initialRegion={SEATTLE_CENTER_REGION}>
        {/* Example location marker */}
        <Marker
          coordinate={{ latitude: 47.6205, longitude: -122.3493 }}
          title="Seattle Center"
          description="Sample marker"
        />
      </MapView>
    </View>
  );
}