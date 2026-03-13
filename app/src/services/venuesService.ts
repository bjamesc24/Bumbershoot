/**
 * venuesService.ts
 * ----------------
 * Responsibility:
 *   Provide location data for all map markers within the festival grounds.
 *
 * Data sources:
 *   - music.sample.json     -> stage markers (one per unique stage)
 *   - art.sample.json       -> district markers (one per unique district)
 *   - vendors.sample.json   -> vendor markers
 *   - locations.sample.json -> restrooms, info desks
 *
 * Design:
 *   - Loads from local bundled files so map works offline
 *   - When API is ready, swap loadSampleVenues() for getVenuesFromApi()
 */

import { apiClient } from "./apiClient";
import type { Venue } from "../models/Venue";

function loadStaticLocations(): Venue[] {
  const data = require("../sample-data/locations.sample.json");
  return Array.isArray(data) ? data : [];
}

function loadMusicVenues(): Venue[] {
  const data = require("../sample-data/music.sample.json");
  const items = Array.isArray(data) ? data : [];

  const seen = new Set<string>();
  const venues: Venue[] = [];

  for (const item of items) {
    const stage = item?.meta?.stage;
    const lat = item?.meta?.coordinates?.lat;
    const lng = item?.meta?.coordinates?.lng;

    if (!stage || lat == null || lng == null || seen.has(stage)) continue;
    seen.add(stage);

    venues.push({
      id: `stage-${stage.toLowerCase().replace(/\s+/g, "-")}`,
      name: `${stage} Stage`,
      lat,
      lng,
      category: "stage",
      description: `Music stage — ${stage}`,
    });
  }

  return venues;
}

function loadArtVenues(): Venue[] {
  const data = require("../sample-data/art.sample.json");
  const items = Array.isArray(data) ? data : [];

  const seen = new Set<string>();
  const venues: Venue[] = [];

  for (const item of items) {
    const district = item?.meta?.district;
    const lat = item?.meta?.coordinates?.lat;
    const lng = item?.meta?.coordinates?.lng;

    if (!district || lat == null || lng == null || seen.has(district)) continue;
    seen.add(district);

    venues.push({
      id: `district-${district.toLowerCase().replace(/\s+/g, "-")}`,
      name: district,
      lat,
      lng,
      category: "district",
      description: `Art district — ${district}`,
    });
  }

  return venues;
}

function loadVendorVenues(): Venue[] {
  const data = require("../sample-data/vendors.sample.json");
  const items = Array.isArray(data) ? data : [];

  return items
    .filter((v: any) => v?.meta?.coordinates?.lat != null)
    .map((v: any) => ({
      id: `vendor-${v.id}`,
      name: v?.title?.rendered ?? v?.name ?? "Vendor",
      lat: v.meta.coordinates.lat,
      lng: v.meta.coordinates.lng,
      category: "vendor" as const,
      subcategory: v?.meta?.vendor_type ?? null,
      description: v?.excerpt?.rendered
        ? v.excerpt.rendered.replace(/<[^>]+>/g, "")
        : undefined,
      rawItem: v,
    }));
}

async function getVenuesFromApi(): Promise<Venue[]> {
  return apiClient.get<Venue[]>("/bumbershoot/v1/venues");
}

export async function getVenues(): Promise<Venue[]> {
  return [
    ...loadMusicVenues(),
    ...loadArtVenues(),
    ...loadVendorVenues(),
    ...loadStaticLocations(),
  ];
  // TODO: switch to live API once endpoint is ready:
  // return getVenuesFromApi();
}