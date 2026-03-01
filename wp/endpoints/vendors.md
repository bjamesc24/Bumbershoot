# Endpoint: GET /vendors

## Overview

Returns all active vendors and booths at Bumbershoot — food, beverages, merchandise, sponsor activations, and other presences. Used to populate the vendor listing and map pins for non-stage locations.

Like venues, vendor data is **mostly static** during the festival. Refresh daily or on app open.

---

## Request

```
GET /wp-json/bumbershoot/v1/vendors
```

### Query Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `type` | string | ❌ | Filter by vendor type. e.g., `food`, `merchandise`, `sponsor-activation` |
| `day` | string | ❌ | Filter by active festival day. e.g., `day-1` |
| `dietary` | string | ❌ | Filter food vendors by dietary option. e.g., `vegan`, `gluten-free` |
| `accessible_only` | boolean | ❌ | If `true`, return only accessible vendors |
| `q` | string | ❌ | Keyword search across vendor title and short description |

**Example requests:**

```
GET /wp-json/bumbershoot/v1/vendors
GET /wp-json/bumbershoot/v1/vendors?type=food
GET /wp-json/bumbershoot/v1/vendors?dietary=vegan
GET /wp-json/bumbershoot/v1/vendors?type=food&day=day-1
GET /wp-json/bumbershoot/v1/vendors?accessible_only=true
```

---

## Response

### Status Codes

| Code | Meaning |
|---|---|
| `200 OK` | Success. Returns array of vendor objects. |
| `200 OK` with `[]` | No vendors match filters. |
| `500` | Server error. App falls back to cached data. |

### Headers (Required)

```
Cache-Control: public, max-age=86400, stale-while-revalidate=3600
Last-Modified: <timestamp of most recently modified vendor>
ETag: "<hash>"
Content-Type: application/json; charset=UTF-8
```

### Response Body

```json
{
  "generated_at": "2025-08-30T08:00:00-07:00",
  "vendor_count": 2,
  "vendors": [
    {
      "id": 401,
      "title": "Marination",
      "slug": "marination",
      "type": "food",
      "booth_name": "Food Court Row A, Booth 3",
      "description_short": "Seattle-based Hawaiian-Korean fusion with kalua pork sliders, kimchi fried rice, and spam musubi.",
      "description_full": "<p>Marination has been a Seattle street food staple since 2009...</p>",
      "cuisine": "Hawaiian-Korean fusion",
      "dietary_options": ["gluten-free"],
      "price_range": "$$",
      "operating_hours": "Day 1–3: 11:00 AM – 9:00 PM",
      "payment_methods": ["cash", "card", "mobile-pay"],
      "is_accessible": true,
      "days_active": ["day-1", "day-2", "day-3"],
      "is_active": true,
      "is_sponsor": false,
      "sponsor_tier": null,
      "venue_id": 8,
      "lat": 47.6207,
      "lng": -122.3512,
      "thumbnail_url": "https://cms.bumbershoot.com/wp-content/uploads/marination.jpg",
      "website_url": "https://www.marinationmobile.com",
      "instagram_url": "https://www.instagram.com/marinationmobile"
    },
    {
      "id": 402,
      "title": "Bumbershoot Official Merch",
      "slug": "bumbershoot-official-merch",
      "type": "merchandise",
      "booth_name": "Merch Booth — Main Entry",
      "description_short": "Official Bumbershoot 2025 merchandise including tees, hoodies, hats, and posters.",
      "description_full": null,
      "cuisine": null,
      "dietary_options": [],
      "price_range": null,
      "operating_hours": "Festival hours daily",
      "payment_methods": ["card", "mobile-pay"],
      "is_accessible": true,
      "days_active": ["day-1", "day-2", "day-3"],
      "is_active": true,
      "is_sponsor": false,
      "sponsor_tier": null,
      "venue_id": 9,
      "lat": null,
      "lng": null,
      "thumbnail_url": null,
      "website_url": null,
      "instagram_url": null
    }
  ]
}
```

---

## Field Reference

| Field | Type | Notes |
|---|---|---|
| `id` | integer | WordPress post ID |
| `title` | string | Vendor name |
| `slug` | string | URL-safe identifier |
| `type` | string | See vocabulary in `post-types/vendors.md` |
| `booth_name` | string \| null | Specific booth location label |
| `description_short` | string | Max 200 chars |
| `description_full` | string (HTML) \| null | Full description |
| `cuisine` | string \| null | Food vendors only |
| `dietary_options` | string[] | Food vendors only. Empty array if none |
| `price_range` | string \| null | `$`, `$$`, or `$$$`. Food vendors only |
| `operating_hours` | string \| null | Plain text hours description |
| `payment_methods` | string[] | `cash`, `card`, `mobile-pay` |
| `is_accessible` | boolean | ADA accessible booth |
| `days_active` | string[] | e.g., `["day-1", "day-2", "day-3"]` |
| `is_active` | boolean | Only active vendors are returned |
| `is_sponsor` | boolean | Official festival sponsor |
| `sponsor_tier` | string \| null | Only set if `is_sponsor` is true |
| `venue_id` | integer \| null | ID of the venue zone this vendor is in |
| `lat` | float \| null | Exact coordinates if vendor needs its own pin |
| `lng` | float \| null | Exact coordinates if vendor needs its own pin |
| `thumbnail_url` | string \| null | Vendor logo or photo |
| `website_url` | string \| null | |
| `instagram_url` | string \| null | |

---

## Map Pin Logic

The app resolves a vendor's map position as follows:

1. If `lat` and `lng` are both set → use exact coordinates for a dedicated pin.
2. Else if `venue_id` is set → place the vendor within the zone of that venue (no dedicated pin, grouped with venue).
3. Else → vendor has no map location; omit from map view.

---

## Sort Order

Default: **by type** (food first, then merch, then other), then **alphabetical by title**. The app may re-sort client-side.
