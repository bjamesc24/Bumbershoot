# Custom Post Type: Venues

## Overview

The `venue` post type represents a physical stage, area, or point of interest within the Bumbershoot festival grounds at Seattle Center. Venue data is used by both the schedule (to associate events with locations) and the map (to render pins and labels).

Venue data is **mostly static** — it changes rarely, if ever, during the festival. The app should refresh venue data daily or on app open, not on the 30-minute schedule cadence.

---

## CPT Registration

**Post Type Slug:** `bumbershoot_venue`  
**Custom Endpoint:** `wp-json/bumbershoot/v1/venues`

### CPT UI Settings

| Setting | Value |
|---|---|
| Post Type Slug | `bumbershoot_venue` |
| Plural Label | Venues |
| Singular Label | Venue |
| Public | Yes |
| Has Archive | No |
| Show in REST | Yes |
| Menu Icon | `dashicons-location-alt` |
| Supports | Title, Editor (notes), Thumbnail |

---

## Fields

### Location & Identity Fields

| Field Label | Field Name | Field Type | Required | Notes |
|---|---|---|---|---|
| Venue Type | `venue_type` | Select | ✅ | See type options below |
| Short Name | `venue_short_name` | Text | ✅ | Used on map pin labels; max 20 chars |
| Latitude | `venue_lat` | Number | ✅ | Decimal degrees; e.g., `47.6213` |
| Longitude | `venue_lng` | Number | ✅ | Decimal degrees; e.g., `-122.3509` |
| Map Zoom Level | `venue_map_zoom` | Number | ❌ | Suggested zoom when this venue is focused; default 16 |
| Address / Area Note | `venue_area_note` | Text | ❌ | Human-readable location hint; e.g., "Near the International Fountain" |

### Capacity & Accessibility

| Field Label | Field Name | Field Type | Required | Notes |
|---|---|---|---|---|
| Estimated Capacity | `venue_capacity` | Number | ❌ | Rough capacity; used for "limited capacity" badge logic |
| Is Accessible | `venue_is_accessible` | True/False | ✅ | ADA/wheelchair accessible |
| Accessibility Notes | `venue_accessibility_notes` | Textarea | ❌ | e.g., "Viewing platform available on north side" |

### Operational Info

| Field Label | Field Name | Field Type | Required | Notes |
|---|---|---|---|---|
| Amenities | `venue_amenities` | Checkbox | ❌ | Options: `restrooms`, `water-station`, `first-aid`, `food-nearby`, `merch` |
| Is Active | `venue_is_active` | True/False | ✅ | Set to false to hide from app without deleting |

---

## Venue Type Options

| Value | Label | Map Icon |
|---|---|---|
| `main-stage` | Main Stage | 🎤 Star pin |
| `secondary-stage` | Secondary Stage | 🎤 Regular pin |
| `gallery` | Gallery / Exhibition | 🖼 |
| `food-area` | Food & Drink Area | 🍔 |
| `info-booth` | Info Booth | ℹ️ |
| `first-aid` | First Aid Station | ➕ |
| `restrooms` | Restrooms | 🚻 |
| `entry-point` | Entry / Gate | 🚪 |
| `water-station` | Water Station | 💧 |
| `merch` | Merchandise | 🛍 |
| `parking` | Parking / Transit | 🅿️ |
| `other` | Other POI | 📍 |

---

## Seattle Center Context

Bumbershoot takes place at Seattle Center. The following are approximate reference coordinates for key areas:

| Location | Lat | Lng |
|---|---|---|
| Seattle Center campus center | 47.6213 | -122.3509 |
| KeyArena / Climate Pledge Arena area | 47.6221 | -122.3541 |
| International Fountain | 47.6214 | -122.3494 |
| Fisher Green | 47.6203 | -122.3500 |
| Exhibition Hall | 47.6196 | -122.3514 |

> **Note:** Confirm all coordinates with an actual site map before publishing. These are approximate references only.

---

## Sample JSON Output

```json
{
  "id": 3,
  "title": "Fisher Green Stage",
  "slug": "fisher-green-stage",
  "short_name": "Fisher Green",
  "type": "main-stage",
  "lat": 47.6203,
  "lng": -122.3500,
  "map_zoom": 16,
  "area_note": "Near the International Fountain, south lawn",
  "capacity": 8000,
  "is_accessible": true,
  "accessibility_notes": "Dedicated ADA viewing area on the east side",
  "amenities": ["restrooms", "water-station", "food-nearby"],
  "is_active": true
}
```

See `wp/sample-data/venues.sample.json` for the full dataset.

---

## Map Integration Notes

- The app will use venue `lat`/`lng` to render pins on the map (OpenStreetMap-based tiles).
- The `type` field drives pin icon selection — keep the type vocabulary stable; do not rename values after the app ships.
- POI venues (restrooms, first-aid, entry points) should all be entered as separate posts, even if they don't host events.
- Stage venues should have a featured image set — this appears on the event detail screen when an event references the venue.

---

## Editorial Notes

- Create one post per distinct location, including POIs.
- Do not delete inactive venues — use `venue_is_active: false` to hide them.
- Coordinate accuracy matters. Test pins on a map before publishing.
- The `short_name` field is what appears on map pins — keep it brief and unambiguous.
