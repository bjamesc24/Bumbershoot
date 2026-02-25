# Custom Post Type: Announcements

## Overview

The `announcement` post type carries official festival operations communications to app users. This includes schedule changes, weather alerts, entry gate updates, service notices, and general festival information.

Announcements are the **only content type that may need to update faster than 30 minutes** during a live festival day. The app should still respect the 30-minute refresh cadence for the polling interval, but the backend should be able to publish new announcements at any time.

---

## CPT Registration

**Post Type Slug:** `bumbershoot_announcement`  
**Custom Endpoint:** `wp-json/bumbershoot/v1/announcements`

### CPT UI Settings

| Setting | Value |
|---|---|
| Post Type Slug | `bumbershoot_announcement` |
| Plural Label | Announcements |
| Singular Label | Announcement |
| Public | Yes |
| Has Archive | No |
| Show in REST | Yes |
| Menu Icon | `dashicons-megaphone` |
| Supports | Title, Editor (body), Thumbnail |

---

## Fields

### Classification Fields

| Field Label | Field Name | Field Type | Required | Notes |
|---|---|---|---|---|
| Announcement Type | `announcement_type` | Select | ✅ | See type options below |
| Priority Level | `announcement_priority` | Select | ✅ | `normal`, `important`, `urgent` |
| Is Pinned | `announcement_is_pinned` | True/False | ❌ | Pinned announcements always appear at top of feed |

### Timing & Lifecycle Fields

| Field Label | Field Name | Field Type | Required | Notes |
|---|---|---|---|---|
| Published At | (WP native `post_date`) | — | ✅ | Use WordPress publish date natively |
| Expires At | `announcement_expires_at` | Date Time Picker | ❌ | App hides announcement after this time; useful for time-limited notices |
| Festival Day | `announcement_day` | Select | ❌ | `day-1`, `day-2`, `day-3`, `all-days`, `pre-festival` |

### Linked Content Fields

| Field Label | Field Name | Field Type | Required | Notes |
|---|---|---|---|---|
| Related Event | `announcement_related_event` | Post Object | ❌ | Links to a `bumbershoot_event` post; used when announcement is about a specific event change |
| Related Venue | `announcement_related_venue` | Post Object | ❌ | Links to a `bumbershoot_venue` post; used for location-specific notices |
| External Link | `announcement_external_url` | URL | ❌ | Optional link to more information |
| External Link Label | `announcement_external_url_label` | Text | ❌ | Button label text; e.g., "View Updated Schedule" |

---

## Announcement Type Options

| Value | Label | Use Case |
|---|---|---|
| `schedule-change` | Schedule Change | Event time/stage changes |
| `cancellation` | Cancellation | Event cancelled |
| `weather` | Weather Alert | Weather-related updates |
| `entry` | Entry & Gates | Gate hours, line updates |
| `transport` | Transport & Parking | Shuttle, transit, parking |
| `service` | Services & Amenities | First aid, lost & found, water |
| `general` | General Info | Non-urgent festival-wide info |
| `emergency` | Emergency Notice | Safety and emergency info |

---

## Priority Behavior

| Priority | App Behavior |
|---|---|
| `normal` | Displayed in chronological feed, no special treatment |
| `important` | Displayed with highlight styling (e.g., yellow border) |
| `urgent` | Displayed with alert styling (e.g., red); consider triggering a local notification on client |

---

## Sample JSON Output

```json
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
  "related_event_id": 101,
  "related_venue_id": 3,
  "external_url": null,
  "external_url_label": null
}
```

See `wp/sample-data/announcements.sample.json` for a full feed dataset.

---

## Editorial Workflow

1. Ops team identifies a change (e.g., a stage shift confirmed).
2. Editorial staff logs into WordPress admin.
3. Creates a new `Announcement` post, sets type to `schedule-change`, links to the affected event.
4. Simultaneously updates the `bumbershoot_event` post — changes `event_status`, `event_status_note`, and critically `event_last_changed`.
5. Publishes both. The next 30-minute poll from the app will surface both the announcement and the changed event.

> **Important:** Announcements and Event updates should always be published together when a schedule change occurs. The announcement explains the change in human language; the event record reflects the machine-readable truth.

---

## Content Guidelines

- **Titles** should be specific and scannable: "Stage Time Change: Mt. Joy", not "Important Update".
- **Body** should be 1–3 sentences maximum. App users are on their feet at a festival.
- **Avoid jargon.** Write for a general audience who may not know stage names yet.
- **Emergency announcements** should never use vague language. Be direct about what to do and where to go.
- **Use `expires_at`** for time-sensitive notices so stale warnings don't confuse users.
