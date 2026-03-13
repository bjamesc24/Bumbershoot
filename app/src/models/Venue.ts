export type VenueCategory =
  | "stage"
  | "district"
  | "vendor"
  | "restroom"
  | "info";

export type VenueSubcategory =
  | "food"
  | "merch"
  | "arts_crafts"
  | null;

export type Venue = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: VenueCategory;
  subcategory?: VenueSubcategory;
  description?: string;
  rawItem?: any;
};