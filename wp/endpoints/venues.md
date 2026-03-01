# Endpoint: GET /venues

## Overview

Returns all active festival venues and points of interest. This data drives the map screen — pins, labels, POI icons, and accessibility info all come from this endpoint.

Venue data is mostly static. The app should refresh it **once daily or on app open**, not on the 30-minute schedule cadence. This reduces API cost and server load during festival days.

---

## Request

```
GET /wp-json/bumbershoot/v1/venues
```

### Query Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `type` | string | ❌ | Filter by venue type. e.g., `main-stage`, `restrooms`, `first-aid` |
| `accessible_only` | boolean | ❌ | If `true`, return only venues where `is_accessible` is true |

**Example requests:**

```
GET /wp-json/bumbershoot/v1/venues
GET /wp-json/bumbershoot/v1/venues?type=main-stage
GET /wp-json/bumbershoot/v1/venues?accessible_only=true
```

---

## Response

### Status Codes

| Code | Meaning |
|---|---|
| `200 OK` | Success. Returns array of venue objects. |
| `200 OK` with `[]` | No active venues. Should not occur in production. |
| `500` | Server error. |

### Headers (Required)

```
Cache-Control: public, max-age=86400, stale-while-revalidate=3600
Last-Modified: <timestamp of most recently modified venue>
ETag: "<hash>"
Content-Type: application/json; charset=UTF-8
```

> `max-age=86400` = 24 hours. Venue data warrants a longer cache than schedule data.

### Response Body

```json
{
  "generated_at": "2025-08-30T08:00:00-07:00",
  "venue_count": 3,
  "venues": [
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
    },
    {
      "id": 7,
      "title": "First Aid Station — North",
      "slug": "first-aid-north",
      "short_name": "First Aid N",
      "type": "first-aid",
      "lat": 47.6228,
      "lng": -122.3495,
      "map_zoom": 17,
      "area_note": "Near the north entry gate, beside the info booth",
      "capacity": null,
      "is_accessible": true,
      "accessibility_notes": null,
      "amenities": [],
      "is_active": true
    },
    {
      "id": 9,
      "title": "Main Entry Gate",
      "slug": "main-entry-gate",
      "short_name": "Main Entry",
      "type": "entry-point",
      "lat": 47.6231,
      "lng": -122.3538,
      "map_zoom": 17,
      "area_note": "On 1st Ave N at Harrison St. ADA entry on south side of gate.",
      "capacity": null,
      "is_accessible": true,
      "accessibility_notes": "ADA entry lane on south side. Mobility equipment available at gate.",
      "amenities": [],
      "is_active": true
    }
  ]
}
```

---

## Field Reference

| Field | Type | Notes |
|---|---|---|
| `id` | integer | WordPress post ID |
| `title` | string | Full venue name |
| `slug` | string | URL-safe identifier |
| `short_name` | string | Used on map pin labels — max 20 chars |
| `type` | string | Controls pin icon — see vocabulary in `post-types/venues.md` |
| `lat` | float | Decimal degrees latitude |
| `lng` | float | Decimal degrees longitude |
| `map_zoom` | integer \| null | Suggested zoom level when this venue is focused |
| `area_note` | string \| null | Human-readable location hint |
| `capacity` | integer \| null | Estimated capacity; null for non-stage venues |
| `is_accessible` | boolean | ADA/wheelchair accessible |
| `accessibility_notes` | string \| null | Specific accessibility detail |
| `amenities` | string[] | Nearby amenities — see vocabulary in `post-types/venues.md` |
| `is_active` | boolean | Only `true` venues are returned by this endpoint |

---

## Map Integration Notes

The app uses this response to:

1. **Render pins** at `lat`/`lng` using the `type` to select an icon.
2. **Display `short_name`** as the pin label.
3. **Show a detail popup** on pin tap with `title`, `area_note`, `amenities`, and `accessibility_notes`.
4. **Link "Find on Map"** from the event detail screen using `venue_id` to locate the correct pin.

### Bounding Box Reference

All Bumbershoot venues should fall within this approximate bounding box for Seattle Center:

```
North: 47.6235
South: 47.6185
East:  -122.3475
West:  -122.3560
```

Any venue coordinates outside this box should be reviewed — likely a data entry error.

---

## Pre-packaged Map Overlay (Recommended)

Rather than relying entirely on live tile requests, the app should include a festival-specific **GeoJSON overlay** that marks stage zones, pathways, and key areas. This overlay can be bundled with the app or served as a static file from the backend.

If the backend provides a GeoJSON overlay, serve it at:

```
GET /wp-json/bumbershoot/v1/map-overlay
```

or as a static file at:

```
https://cms.bumbershoot.com/festival-map/bumbershoot-2025-overlay.geojson
```

This is a stretch goal — document the intent here and implement if time allows.

---

## Implementation Notes

- Only return venues where `venue_is_active` is `true`. Filter this in the WP_Query.
- Confirm all coordinates against a real Seattle Center map before launch — coordinate errors will place pins in the wrong location.
- POI venues (restrooms, water stations, etc.) may have many entries. Ensure they all have accurate `lat`/`lng` values.
- Consider a separate endpoint `/wp-json/bumbershoot/v1/venues/{id}` if the app needs to deep-link to a venue — for MVP this is optional.
