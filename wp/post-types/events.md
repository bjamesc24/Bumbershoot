# Custom Post Type: Events

## Overview

The `event` post type represents a single scheduled performance, set, panel, or activity at Bumbershoot. It is the most critical content type in the system — every feature in the app traces back to event data.

---

## CPT Registration

**Post Type Slug:** `bumbershoot_event`  
**REST API Base:** `wp-json/wp/v2/bumbershoot_event` (native WP REST, not used directly by app)  
**Custom Endpoint:** `wp-json/bumbershoot/v1/schedule` and `wp-json/bumbershoot/v1/events/{id}`

### CPT UI Settings (if using CPT UI plugin)

| Setting | Value |
|---|---|
| Post Type Slug | `bumbershoot_event` |
| Plural Label | Events |
| Singular Label | Event |
| Public | Yes |
| Has Archive | No |
| Show in REST | Yes |
| Menu Icon | `dashicons-calendar-alt` |
| Supports | Title, Editor (description), Thumbnail |

---

## Fields

All fields below should be registered as an ACF Field Group named **"Event Details"** attached to the `bumbershoot_event` post type. If not using ACF, register equivalent meta fields via `register_post_meta()`.

### Core Scheduling Fields

| Field Label | Field Name | Field Type | Required | Notes |
|---|---|---|---|---|
| Start Time | `event_start_time` | Date Time Picker | ✅ | ISO 8601 format; include timezone (America/Los_Angeles) |
| End Time | `event_end_time` | Date Time Picker | ✅ | Must be after start time |
| Festival Day | `event_day` | Select | ✅ | Options: `day-1`, `day-2`, `day-3` |
| Venue | `event_venue` | Post Object | ✅ | Relates to `bumbershoot_venue` CPT |

### Content Fields

| Field Label | Field Name | Field Type | Required | Notes |
|---|---|---|---|---|
| Short Description | `event_description_short` | Textarea | ✅ | Max 200 characters; used in schedule list view |
| Full Description | `event_description_full` | WYSIWYG / Textarea | ❌ | Used in event detail screen |
| Category | `event_category` | Select | ✅ | See category options below |
| Tags | `event_tags` | Taxonomy / Checkbox | ❌ | e.g., `family-friendly`, `18+`, `free-with-entry` |
| Featured Image | (WP native) | Image | ❌ | Used as artist/event hero image |

### Relationship Fields

| Field Label | Field Name | Field Type | Required | Notes |
|---|---|---|---|---|
| Artists | `event_artists` | Relationship | ❌ | Links to `bumbershoot_artist` posts; multi-select |
| Vendors at Event | `event_vendors` | Relationship | ❌ | Links to `bumbershoot_vendor` posts; optional |

### Status & Change Tracking Fields

| Field Label | Field Name | Field Type | Required | Notes |
|---|---|---|---|---|
| Event Status | `event_status` | Select | ✅ | Options: `scheduled`, `cancelled`, `moved`, `time-changed` |
| Status Note | `event_status_note` | Text | ❌ | e.g., "Stage moved to Fisher Green due to weather" |
| Last Data Change | `event_last_changed` | Date Time Picker | ✅ | **Critical.** Updated every time any field changes. Drives `/changes` endpoint. |
| Is Highlighted | `event_is_highlighted` | True/False | ❌ | Marks headliners or featured events |

---

## Category Options

These are the supported values for `event_category`. Extend only with client approval.

| Value | Label |
|---|---|
| `music` | Music |
| `comedy` | Comedy |
| `visual-art` | Visual Art |
| `performance-art` | Performance Art |
| `panel` | Panel / Talk |
| `workshop` | Workshop |
| `family` | Family Activity |
| `other` | Other |

---

## Tag Options (Taxonomy or ACF Checkbox)

| Value | Label |
|---|---|
| `family-friendly` | Family Friendly |
| `18-plus` | 18+ |
| `all-ages` | All Ages |
| `accessible` | Accessibility Accommodations Available |
| `free-with-entry` | Free with Festival Entry |
| `limited-capacity` | Limited Capacity |
| `headliner` | Headliner |

---

## Status Lifecycle

```
scheduled ──── normal state ──── no action needed
    │
    ├──→ time-changed  ── update event_start_time + event_end_time
    │                   ── set event_status_note
    │                   ── update event_last_changed
    │
    ├──→ moved         ── update event_venue relationship
    │                   ── set event_status_note
    │                   ── update event_last_changed
    │
    └──→ cancelled     ── set event_status_note
                        ── update event_last_changed
```

> ⚠️ **Important:** `event_last_changed` must be updated manually by the editorial team every time any field is modified. This is what the `/changes` endpoint uses to detect modifications. Consider adding an ACF validation hook or `save_post` action to auto-update this field.

---

## Sample JSON Output (minimal, for schedule list)

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
  "venue_id": 3,
  "venue_name": "Fisher Green Stage",
  "status": "scheduled",
  "status_note": null,
  "is_highlighted": true,
  "last_changed": "2025-07-15T10:22:00-07:00"
}
```

See `wp/sample-data/events.sample.json` for a full multi-event dataset.

---

## Editorial Notes

- **One post = one set/performance.** If an artist plays twice, create two posts.
- **Titles** should be the artist or event name only, not "Mt. Joy at Fisher Green." The venue relationship handles location.
- **Festival Day** should always be set even though it's derivable from the date — it makes filtering faster on the client.
- **`event_last_changed`** is the only field the backend needs to "own" carefully. If it falls out of sync, the change-detection system breaks.
