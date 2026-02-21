/**
 * venuesService.ts
 * ----------------
 * Responsibility:
 *   Provide location data representing physical areas within the festival grounds.
 *
 * Future behavior:
 *   The data source can be replaced with an API request without changing
 *   any screen components that consume this service.
 */

import type { Venue } from "../models/Venue";

/**
 * Reads venue data from the local bundled dataset.
 * The require call allows the data to be packaged with the mobile app build.
 */
function loadSampleVenues(): Venue[] {
  const data = require("../sample-data/venues.sample.json");
  return Array.isArray(data) ? data : data.venues ?? [];
}

/**
 * Returns all known venue locations.
 * Currently resolves immediately from local data.
 */
export async function getVenues(): Promise<Venue[]> {
  return loadSampleVenues();
}