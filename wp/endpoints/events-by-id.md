# Endpoint: GET /events/{id}

## Overview

Returns the full detail record for a single event. The app calls this endpoint when a user taps on an event in the schedule — it is an **on-demand, user-triggered** request, not part of the background refresh cycle.

Because it is on-demand, it should be fast and richly detailed. This is where full descriptions, embedded artist objects, and venue info are returned.

---

## Request

```
GET /wp-json/bumbershoot/v1/events/{id}
```

### Path Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `id` | integer | ✅ | WordPress post ID of the event |

**Example:**

```
GET /wp-json/bumbershoot/v1/events/101
```

> **Note:** IDs come from the `id` field in the `/schedule` response. The app should never construct IDs — only use IDs it already retrieved from the schedule.

---

## Response

### Status Codes

| Code | Meaning |
|---|---|
| `200 OK` | Success. Returns single event object. |
| `404 Not Found` | No published event exists with that ID. App should handle gracefully. |
| `500` | Server error. |

### Headers (Required)

```
Cache-Control: public, max-age=3600, stale-while-revalidate=60
Last-Modified: <event_last_changed value>
ETag: "<hash>"
Content-Type: application/json; charset=UTF-8
```

> Event detail pages can be cached longer than the schedule list (1 hour vs 30 min) because users typically view a detail, then go back — not poll it repeatedly.

### Response Body

```json
{
  "id": 101,
  "title": "Mt. Joy",
  "slug": "mt-joy",
  "category": "music",
  "tags": ["all-ages", "headliner"],
  "start_time": "2025-08-30T19:00:00-07:00",
  "end_time": "2025-08-30T20:30:00-07:00",
  "day": "day-1",
  "status": "scheduled",
  "status_note": null,
  "is_highlighted": true,
  "last_changed": "2025-07-15T10:22:00-07:00",

  "description_short": "Philadelphia indie folk band known for lush harmonies and heartfelt lyrics.",
  "description_full": "<p>Mt. Joy formed in Los Angeles in 2016 and has since toured extensively across North America and Europe. Their sound blends folk, soul, and indie rock into something warm and immediate.</p><p>This Bumbershoot set will feature tracks from their latest album alongside fan favorites.</p>",

  "venue": {
    "id": 3,
    "title": "Fisher Green Stage",
    "short_name": "Fisher Green",
    "slug": "fisher-green-stage",
    "type": "main-stage",
    "lat": 47.6203,
    "lng": -122.3500,
    "area_note": "Near the International Fountain, south lawn",
    "is_accessible": true,
    "accessibility_notes": "Dedicated ADA viewing area on the east side",
    "amenities": ["restrooms", "water-station", "food-nearby"]
  },

  "artists": [
    {
      "id": 201,
      "title": "Mt. Joy",
      "slug": "mt-joy",
      "type": "musician",
      "genre": "indie-rock",
      "origin": "Philadelphia, PA",
      "bio_short": "Philadelphia indie folk band known for lush harmonies and heartfelt lyrics. Touring in support of their 2024 album.",
      "is_headliner": true,
      "is_local": false,
      "photo_url": "https://cms.bumbershoot.com/wp-content/uploads/mt-joy.jpg",
      "links": {
        "spotify": "https://open.spotify.com/artist/69tiO1fG8VWduIa1k8Z2eO",
        "apple_music": "https://music.apple.com/us/artist/mt-joy/1156713197",
        "youtube": "https://www.youtube.com/@mtjoyband",
        "website": "https://www.mtjoyband.com",
        "instagram": "https://www.instagram.com/mtjoy"
      }
    }
  ],

  "featured_image_url": "https://cms.bumbershoot.com/wp-content/uploads/mt-joy-hero.jpg",
  "thumbnail_url": "https://cms.bumbershoot.com/wp-content/uploads/mt-joy-thumb.jpg"
}
```

---

## Field Reference

All fields from `/schedule` are repeated here, plus:

| Field | Type | Notes |
|---|---|---|
| `description_short` | string | Short bio/description (max 300 chars) |
| `description_full` | string (HTML) | Full description. May contain HTML from WP editor. App should render appropriately. |
| `venue` | object | Full embedded venue object — not just ID |
| `artists` | object[] | Full embedded artist objects — not just IDs |
| `featured_image_url` | string \| null | Full-size hero image URL |
| `thumbnail_url` | string \| null | Square thumbnail URL |

---

## Image URL Notes

WordPress generates multiple image sizes. The backend should expose specific named sizes to the app:

| Field | WP Image Size | Dimensions |
|---|---|---|
| `featured_image_url` | `large` or `full` | 1200px wide |
| `thumbnail_url` | `medium` | 400×400px |

Return absolute URLs. Do not return relative paths.

---

## Graceful Degradation

If an event has no artists linked: return `"artists": []`, not null or omit the field.  
If an event has no featured image: return `"featured_image_url": null`.  
If `description_full` is empty: return the value of `description_short` as a fallback.

The app should never crash because a field is missing or null — but the backend should still consistently include all fields.

---

## Caching Note for Event Changes

If an event's status changes mid-festival (e.g., `moved` or `time-changed`), any cached version of `/events/{id}` in a CDN or reverse proxy should be **purged or have a short TTL**. 

Recommended approach: set a shorter `max-age` on events with non-`scheduled` status:

```php
if ($status !== 'scheduled') {
    header('Cache-Control: public, max-age=300'); // 5 min for changed events
} else {
    header('Cache-Control: public, max-age=3600'); // 1 hour for stable events
}
```
