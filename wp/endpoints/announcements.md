# Endpoint: GET /announcements

## Overview

Returns the list of active festival announcements from operations staff. This is the real-time communications channel between the festival team and app users — schedule changes, weather alerts, service notices, and emergency information all flow through here.

Announcements share the same 30-minute refresh cadence as the schedule, since they may contain time-sensitive information.

---

## Request

```
GET /wp-json/bumbershoot/v1/announcements
```

### Query Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `day` | string | ❌ | Filter by festival day. Values: `day-1`, `day-2`, `day-3`, `all-days` |
| `type` | string | ❌ | Filter by announcement type. e.g., `schedule-change`, `weather` |
| `priority` | string | ❌ | Filter by priority. Values: `normal`, `important`, `urgent` |
| `since` | ISO 8601 string | ❌ | Return only announcements published after this timestamp |
| `limit` | integer | ❌ | Max number of announcements to return. Default: 50. Max: 100. |

**Example requests:**

```
GET /wp-json/bumbershoot/v1/announcements
GET /wp-json/bumbershoot/v1/announcements?day=day-1
GET /wp-json/bumbershoot/v1/announcements?type=schedule-change
GET /wp-json/bumbershoot/v1/announcements?priority=urgent
GET /wp-json/bumbershoot/v1/announcements?since=2025-08-30T12:00:00-07:00
```

---

## Response

### Status Codes

| Code | Meaning |
|---|---|
| `200 OK` | Success. Returns array of announcements. |
| `200 OK` with `[]` | No active announcements. Valid state — app should show empty state gracefully. |
| `500` | Server error. App falls back to cached announcements. |

### Headers (Required)

```
Cache-Control: public, max-age=1800, stale-while-revalidate=60
Last-Modified: <timestamp of most recently published announcement>
ETag: "<hash>"
Content-Type: application/json; charset=UTF-8
```

### Response Body

```json
{
  "generated_at": "2025-08-30T17:50:00-07:00",
  "announcement_count": 2,
  "announcements": [
    {
      "id": 501,
      "title": "Stage Time Change: Mt. Joy",
      "body": "Mt. Joy's Fisher Green set has been moved from 7:00 PM to 8:00 PM due to a stage setup delay. All other programming is on schedule.",
      "type": "schedule-change",
      "priority": "important",
      "is_pinned": true,
      "published_at": "2025-08-30T17:45:00-07:00",
      "expires_at": "2025-08-30T21:00:00-07:00",
      "day": "day-1",
      "related_event": {
        "id": 101,
        "title": "Mt. Joy",
        "slug": "mt-joy"
      },
      "related_venue": {
        "id": 3,
        "title": "Fisher Green Stage",
        "short_name": "Fisher Green"
      },
      "external_url": null,
      "external_url_label": null
    },
    {
      "id": 499,
      "title": "Water Stations Now Open at All Stages",
      "body": "Free water refill stations are now operational at Fisher Green, Starbucks Stage, and the Exhibition Hall. Bring a reusable bottle or pick one up at the merch booth.",
      "type": "service",
      "priority": "normal",
      "is_pinned": false,
      "published_at": "2025-08-30T10:00:00-07:00",
      "expires_at": null,
      "day": "all-days",
      "related_event": null,
      "related_venue": null,
      "external_url": null,
      "external_url_label": null
    }
  ]
}
```

---

## Field Reference

| Field | Type | Notes |
|---|---|---|
| `id` | integer | WordPress post ID |
| `title` | string | Short, scannable headline |
| `body` | string (plain text) | 1–3 sentence message body. No HTML. |
| `type` | string | See vocabulary in `post-types/announcements.md` |
| `priority` | string | `normal`, `important`, or `urgent` |
| `is_pinned` | boolean | Pinned announcements should be sorted to the top regardless of publish time |
| `published_at` | ISO 8601 string | When this announcement was published |
| `expires_at` | ISO 8601 string \| null | After this time, omit from results. If null, never expires. |
| `day` | string \| null | Festival day or `all-days` |
| `related_event` | object \| null | Minimal event reference. Null if not event-specific. |
| `related_venue` | object \| null | Minimal venue reference. Null if not venue-specific. |
| `external_url` | string \| null | Link to more info. |
| `external_url_label` | string \| null | Button label text for the external link. |

---

## Sort Order

Default sort:

1. **Pinned announcements first** (`is_pinned: true`)
2. Then by **`published_at` descending** (newest first)

---

## Expiry Filtering

The backend should filter out expired announcements server-side. Do not rely on the app to hide expired content.

Implementation hint (PHP/WordPress):

```php
$now = current_time('mysql');

// Exclude posts where announcement_expires_at is set AND in the past
$meta_query = [
  'relation' => 'OR',
  [
    'key'     => 'announcement_expires_at',
    'compare' => 'NOT EXISTS',
  ],
  [
    'key'     => 'announcement_expires_at',
    'value'   => '',
    'compare' => '=',
  ],
  [
    'key'     => 'announcement_expires_at',
    'value'   => $now,
    'compare' => '>',
    'type'    => 'DATETIME',
  ],
];
```

---

## Caching Consideration for Urgent Announcements

The 30-minute `max-age` cache is appropriate for most announcements. However, for **emergency or urgent announcements**, consider implementing a cache purge mechanism (e.g., a WP hook that clears the CDN cache on publish) so that emergency notices reach users within minutes rather than waiting for cache expiry.

This is a should-have, not MVP. Document the intent and implement if time allows.

---

## App Behavior on New Announcements

When the app fetches a new announcement it has not seen before (based on `id`), it may:

- Display a notification badge on the Announcements tab
- Trigger a local notification if `priority` is `urgent` (client-side decision, not backend)
- Highlight the announcement in the feed with visual treatment matching its priority

These are frontend decisions — the backend only needs to deliver the data accurately and promptly.
