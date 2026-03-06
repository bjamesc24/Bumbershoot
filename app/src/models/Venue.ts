export type VenueCategory =
  | "stage"
  | "food"
  | "restroom"
  | "entertainment";

export type Venue = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: VenueCategory;
};