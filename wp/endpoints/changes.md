# Endpoint: GET /changes

## Overview

Returns a lightweight feed of content that has changed since a given timestamp. This is the **change-detection mechanism** that allows the app to know whether a full data refresh is needed without downloading the entire schedule payload.

This endpoint is a **should-have** (not MVP-blocking), but it significantly reduces server load during festival day and makes the update system more efficient and elegant. If not implemented, the app can fall back to pulling the full `/schedule` every 30 minutes — but `/changes` is worth building.

---

## Request

```
GET /wp-json/bumbershoot/v1/changes?since=<ISO 8601 timestamp>
```

### Query Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `since` | ISO 8601 string | ✅ | Return items changed after this timestamp |
| `types` | comma-separated string | ❌ | Limit to content types. e.g., `events,announcements`. Default: all types. |

**Example requests:**

```
GET /wp-json/bumbershoot/v1/changes?since=2025-08-30T14:00:00-07:00
GET /wp-json/bumbershoot/v1/changes?since=2025-08-30T14:00:00-07:00&types=events
GET /wp-json/bumbershoot/v1/changes?since=2025-08-30T14:00:00-07:00&types=events,announcements
```

---

## Response

### Status Codes

| Code | Meaning |
|---|---|
| `200 OK` | Success. Returns change summary — may be empty if nothing changed. |
| `400 Bad Request` | Missing or unparseable `since` parameter. |
| `500` | Server error. App treats as "changes unknown" and re-fetches full schedule. |

### Headers (Required)

```
Cache-Control: public, max-age=60
Content-Type: application/json; charset=UTF-8
```

> Short cache (`max-age=60`) — this endpoint is meant to be polled frequently and tell the app whether fresh data is available. Long caching would defeat the purpose.

### Response Body — Changes Found

```json
{
  "checked_at": "2025-08-30T17:50:00-07:00",
  "since": "2025-08-30T14:00:00-07:00",
  "has_changes": true,
  "datasets": {
    "events": {
      "changed": true,
      "updated": [101, 109],
      "cancelled": [115]
    },
    "announcements": {
      "changed": true
    },
    "venues": {
      "changed": false
    },
    "artists": {
      "changed": false
    },
    "vendors": {
      "changed": false
    }
  }
}
```

### Response Body — No Changes

```json
{
  "checked_at": "2025-08-30T17:50:00-07:00",
  "since": "2025-08-30T14:00:00-07:00",
  "has_changes": false,
  "datasets": {
    "events":        { "changed": false },
    "announcements": { "changed": false },
    "venues":        { "changed": false },
    "artists":       { "changed": false },
    "vendors":       { "changed": false }
  }
}
```

---

## Field Reference

| Field | Type | Notes |
|---|---|---|
| `checked_at` | ISO 8601 string | When this response was generated |
| `since` | ISO 8601 string | The timestamp the query was made from — echoed back for confirmation |
| `has_changes` | boolean | Top-level flag — app reads this first to decide whether to re-fetch |
| `datasets.events.changed` | boolean | True if any event changed since `since` |
| `datasets.events.updated` | integer[] | IDs of events that changed (time, venue, status, etc.) |
| `datasets.events.cancelled` | integer[] | IDs of events whose status changed to `cancelled` |
| `datasets.announcements.changed` | boolean | True if any announcement was published since `since` |
| `datasets.venues.changed` | boolean | True if any venue record changed since `since` |
| `datasets.artists.changed` | boolean | True if any artist record changed since `since` |
| `datasets.vendors.changed` | boolean | True if any vendor record changed since `since` |

---

## App Polling Workflow Using /changes

```
Every 30 minutes:
│
├─ 1. GET /changes?since=<last_successful_poll_timestamp>
│
├─ if has_changes == false:
│   └─ Do nothing. Show "Schedule up to date."
│
└─ if has_changes == true:
    ├─ if datasets.events.changed == true:
    │   └─ GET /schedule (full refresh of event data)
    │       └─ Update local cache
    │       └─ Diff against favorited events → surface change notifications
    │
    ├─ if datasets.announcements.changed == true:
    │   └─ GET /announcements (full refresh)
    │       └─ Update local cache
    │       └─ Badge the announcements tab
    │
    └─ Update last_poll_timestamp = checked_at
```

This approach means the app **only downloads the full schedule when something actually changed**, which reduces data usage and server load during the festival.

---

## Backend Implementation Notes

The `/changes` endpoint is backed by a custom WP REST route that runs meta queries against `event_last_changed`, `post_modified` (for announcements/artists/vendors), and post status.

### Simplified PHP logic sketch

```php
register_rest_route('bumbershoot/v1', '/changes', [
  'methods'  => 'GET',
  'callback' => function(WP_REST_Request $request) {
    $since = sanitize_text_field($request->get_param('since'));
    if (!$since) {
      return new WP_Error('missing_since', 'The since parameter is required.', ['status' => 400]);
    }

    // Query events changed since $since using event_last_changed ACF field
    $changed_events = new WP_Query([
      'post_type'  => 'bumbershoot_event',
      'post_status' => 'publish',
      'fields'     => 'ids',
      'meta_query' => [[
        'key'     => 'event_last_changed',
        'value'   => $since,
        'compare' => '>',
        'type'    => 'DATETIME',
      ]],
    ]);

    // Query announcements by post_modified
    $new_announcements = new WP_Query([
      'post_type'    => 'bumbershoot_announcement',
      'post_status'  => 'publish',
      'fields'       => 'ids',
      'date_query'   => [['after' => $since, 'column' => 'post_modified']],
    ]);

    // ... similar for venues, artists, vendors

    $has_changes = ($changed_events->found_posts + $new_announcements->found_posts) > 0;

    return [
      'checked_at'  => current_time('c'),
      'since'       => $since,
      'has_changes' => $has_changes,
      'changes'     => [
        'events'        => ['updated' => $changed_events->posts, 'count' => $changed_events->found_posts],
        'announcements' => ['new' => $new_announcements->posts, 'count' => $new_announcements->found_posts],
        // ...
      ],
    ];
  },
  'permission_callback' => '__return_true', // public endpoint
]);
```

> This is a sketch for reference. Implement and test thoroughly before festival day.

---

## Fallback If /changes Is Not Implemented

If `/changes` is not ready in time, the app falls back to:

```
Every 30 minutes:
└─ GET /schedule (always full refresh)
   └─ Compare event_count and last_changed values against cached data
   └─ Update cache if different
```

This is less efficient but equally correct from a data perspective. Document which approach the app is using in `docs/10-offline-caching-spec.md`.
