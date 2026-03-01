# Endpoint: GET /schedule

## Overview

Returns the full list of festival events in a minimal, app-optimized shape. This is the most frequently polled endpoint — the mobile app calls it every 30 minutes and uses the response to update its local cache.

---

## Request

```
GET /wp-json/bumbershoot/v1/schedule
```

### Query Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `day` | string | ❌ | Filter by festival day. Values: `day-1`, `day-2`, `day-3` |
| `stage` | string | ❌ | Filter by venue slug. e.g., `fisher-green-stage` |
| `category` | string | ❌ | Filter by event category. e.g., `music`, `comedy` |
| `q` | string | ❌ | Keyword search across event title and short description |
| `since` | ISO 8601 string | ❌ | Return only events whose `last_changed` is after this timestamp. Enables lightweight change polling. |

**Example requests:**

```
GET /wp-json/bumbershoot/v1/schedule
GET /wp-json/bumbershoot/v1/schedule?day=day-1
GET /wp-json/bumbershoot/v1/schedule?stage=fisher-green-stage&day=day-1
GET /wp-json/bumbershoot/v1/schedule?category=music
GET /wp-json/bumbershoot/v1/schedule?q=mt+joy
GET /wp-json/bumbershoot/v1/schedule?since=2025-08-30T00:00:00-07:00
```

---

## Response

### Status Codes

| Code | Meaning |
|---|---|
| `200 OK` | Success. Returns array of events. |
| `200 OK` with `[]` | No events match the filters. Never return 404 for empty sets. |
| `500` | Server error. App falls back to cached data. |

### Headers (Required)

```
Cache-Control: public, max-age=1800, stale-while-revalidate=60
Last-Modified: <timestamp of most recently changed event>
ETag: "<hash-of-response-body>"
Content-Type: application/json; charset=UTF-8
```

### Response Body

```json
{
  "generated_at": "2025-08-30T14:00:00-07:00",
  "event_count": 2,
  "events": [
    {
      "id": 101,
      "title": "Mt. Joy",
      "slug": "mt-joy",
      "category": "music",
      "tags": ["all-ages", "headliner"],
      "start_time": "2025-08-30T19:00:00-07:00",
      "end_time": "2025-08-30T20:30:00-07:00",
      "day": "day-1",
      "venue_id": 3,
      "venue_name": "Fisher Green Stage",
      "venue_short_name": "Fisher Green",
      "status": "scheduled",
      "status_note": null,
      "is_highlighted": true,
      "artist_ids": [201],
      "last_changed": "2025-07-15T10:22:00-07:00"
    },
    {
      "id": 102,
      "title": "Caroline Rose",
      "slug": "caroline-rose",
      "category": "music",
      "tags": ["all-ages"],
      "start_time": "2025-08-30T16:00:00-07:00",
      "end_time": "2025-08-30T17:15:00-07:00",
      "day": "day-1",
      "venue_id": 4,
      "venue_name": "Starbucks Stage",
      "venue_short_name": "Starbucks",
      "status": "scheduled",
      "status_note": null,
      "is_highlighted": false,
      "artist_ids": [202],
      "last_changed": "2025-07-10T09:00:00-07:00"
    }
  ]
}
```

---

## Field Reference

| Field | Type | Notes |
|---|---|---|
| `generated_at` | ISO 8601 string | Timestamp when this response was generated. Helps app display "Last updated" |
| `event_count` | integer | Total events in this response |
| `id` | integer | WordPress post ID — stable, never changes |
| `title` | string | Event/artist name |
| `slug` | string | URL-safe identifier |
| `category` | string | See event category vocabulary in `post-types/events.md` |
| `tags` | string[] | See event tag vocabulary in `post-types/events.md` |
| `start_time` | ISO 8601 string | Always include timezone offset (`-07:00` for PDT) |
| `end_time` | ISO 8601 string | Always include timezone offset |
| `day` | string | `day-1`, `day-2`, or `day-3` — redundant with date but useful for filtering |
| `venue_id` | integer | WordPress post ID of the venue |
| `venue_name` | string | Full venue name |
| `venue_short_name` | string | Short name for tight spaces |
| `status` | string | `scheduled`, `cancelled`, `moved`, `time-changed` |
| `status_note` | string \| null | Human-readable explanation of non-scheduled status |
| `is_highlighted` | boolean | True for headliners/featured events |
| `artist_ids` | integer[] | IDs of linked artist posts |
| `last_changed` | ISO 8601 string | **Critical.** When any field on this event last changed. |

---

## Sorting

Default sort order: **`start_time` ascending** (earliest first). This is the primary sort for the schedule view.

If the backend needs to support multiple sort orders, implement `sort` as an optional parameter:

```
GET /schedule?sort=start_time      ← default
GET /schedule?sort=stage           ← group by venue alphabetically, then time
GET /schedule?sort=category        ← group by category, then time
```

For MVP, default sort only is acceptable. The app can sort client-side.

---

## Caching Strategy

This endpoint should be cached aggressively. Recommended strategy:

1. **WordPress side:** Set `Cache-Control: public, max-age=1800` in the REST response. This allows CDNs and proxies to cache it.
2. **CDN layer (if available):** Cache at edge, purge when a post is published or updated.
3. **App side:** Store full response body in local cache (AsyncStorage / SQLite). On next poll, use `If-None-Match` with the stored ETag. If server returns `304 Not Modified`, use cached data without parsing.

---

## Error & Fallback Behavior

If the endpoint returns a non-200 status or times out:

- The app **must not show an error screen.** It should use the most recent cached schedule.
- The app **should show a non-intrusive banner:** e.g., "Showing last known schedule. Updated 47 minutes ago."
- The app **should retry** on the next 30-minute cycle, not immediately.

---

## Implementation Notes

- This endpoint is backed by a WP_Query of all published `bumbershoot_event` posts.
- Apply filters before serializing to avoid pulling excess data into PHP memory.
- Do not include the full bio or WYSIWYG body here — that belongs in `/events/{id}`.
- If using a caching plugin (e.g., WP Super Cache, W3 Total Cache), ensure REST API responses are included in the cache scope.
- For the `?since=` parameter: compare `event_last_changed` ACF field value against the provided timestamp. This makes it usable as a lightweight change-detection poll.
