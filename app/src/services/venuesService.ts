/**
 * venuesService.ts
 * ----------------
 * Responsibility:
 *   Provide location data representing physical areas within the festival grounds.
 *
 * Design considerations:
 *   - Data currently loads from a local bundled file so the map works without a network connection.
 *   - When the backend API is ready, swap getVenues() to call getVenuesFromApi() instead
 *     of loadSampleVenues() — no screen components need to change.
 */

import { apiClient } from "./apiClient";
import type { Venue } from "../models/Venue";

/**
 * Reads venue data from the local bundled dataset.
 * The require call allows the data to be packaged with the mobile app build.
 * Handles both a bare array and an object with a venues property.
 */
function loadSampleVenues(): Venue[] {
  const data = require("../sample-data/venues.sample.json");
  return Array.isArray(data) ? data : data.venues ?? [];
}

/**
 * Fetches venue data from the WordPress REST API.
 * Expected endpoint: GET /bumbershoot/v1/venues
 *
 * Not yet active — call this from getVenues() once endpoint is working.
 */
async function getVenuesFromApi(): Promise<Venue[]> {
  return apiClient.get<Venue[]>("/bumbershoot/v1/venues");
}

/**
 * Returns all known venue locations.
 * Currently resolves immediately from local sample data.
 *
 * To switch to live data, replace loadSampleVenues() with getVenuesFromApi() below.
 */
export async function getVenues(): Promise<Venue[]> {
  return loadSampleVenues();
  // TODO: switch to live API once endpoint is ready:
  // return getVenuesFromApi();
}