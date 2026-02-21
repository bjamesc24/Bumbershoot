/**
 * Venue.ts
 * --------
 * Domain model representing a physical location within the festival grounds.
 *
 * Role in the application:
 *   Venues define fixed positions on the map (stages, areas, or points of interest).
 *   Other data — such as events or vendors — reference a venue to determine where they appear geographically.
 *
 * Coordinate system:
 *   Latitude and longitude correspond to real-world positions inside the Seattle Center area so map markers can be placed accurately.
 */
export type Venue = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};