import { apiClient } from "./apiClient";
import type { Venue } from "../models/Venue";

function loadStaticLocations(): Venue[] {
  const data = require("../sample-data/locations.sample.json");
  return Array.isArray(data) ? data : [];
}

function loadStageVenues(): Venue[] {
  const data = require("../sample-data/venues.sample.json");
  return Array.isArray(data) ? data : [];
}

function loadDistrictVenues(): Venue[] {
  const data = require("../sample-data/districts.sample.json");
  return Array.isArray(data)
    ? data.map((d: any) => ({
        id: d.id,
        name: d.name,
        lat: d.lat,
        lng: d.lng,
        category: "district" as const,
        description: `Art district — ${d.name}`,
      }))
    : [];
}

function loadVendorVenues(): Venue[] {
  const data = require("../sample-data/vendors.sample.json");
  const items = Array.isArray(data) ? data : [];

  return items
    .filter((v: any) => v?.meta?.coordinates?.lat != null)
    .map((v: any) => ({
      id: `vendor-${v.id}`,
      name: v?.title?.rendered ?? "Vendor",
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
  if (apiClient.useSampleData) {
    return [
      ...loadStageVenues(),
      ...loadDistrictVenues(),
      ...loadVendorVenues(),
      ...loadStaticLocations(),
    ];
  }

  return getVenuesFromApi();
}