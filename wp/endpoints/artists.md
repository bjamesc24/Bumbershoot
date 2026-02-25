# Endpoint: GET /artists

## Overview

Returns the list of all artists appearing at Bumbershoot. Used to populate artist profile screens and support the "Favorites" flow for saving artists. Artist data is refreshed **daily or on app open** — not on the 30-minute cadence.

---

## Request

```
GET /wp-json/bumbershoot/v1/artists
```

### Query Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `type` | string | ❌ | Filter by artist type. e.g., `musician`, `comedian`, `dj` |
| `genre` | string | ❌ | Filter by genre. e.g., `indie-rock`, `hip-hop` |
| `headliners_only` | boolean | ❌ | If `true`, return only artists where `is_headliner` is true |
| `local_only` | boolean | ❌ | If `true`, return only artists where `is_local` is true |
| `q` | string | ❌ | Keyword search across artist title and short bio |

**Example requests:**

```
GET /wp-json/bumbershoot/v1/artists
GET /wp-json/bumbershoot/v1/artists?type=musician
GET /wp-json/bumbershoot/v1/artists?headliners_only=true
GET /wp-json/bumbershoot/v1/artists?local_only=true
GET /wp-json/bumbershoot/v1/artists?q=mt+joy
```

---

## Response

### Status Codes

| Code | Meaning |
|---|---|
| `200 OK` | Success. Returns array of artist objects. |
| `200 OK` with `[]` | No artists match filters. |
| `500` | Server error. App falls back to cached data. |

### Headers (Required)

```
Cache-Control: public, max-age=86400, stale-while-revalidate=3600
Last-Modified: <timestamp of most recently modified artist>
ETag: "<hash>"
Content-Type: application/json; charset=UTF-8
```

### Response Body

```json
{
  "generated_at": "2025-08-30T08:00:00-07:00",
  "artist_count": 2,
  "artists": [
    {
      "id": 201,
      "title": "Mt. Joy",
      "slug": "mt-joy",
      "type": "musician",
      "genre": "indie-rock",
      "origin": "Philadelphia, PA",
      "pronouns": null,
      "bio_short": "Philadelphia indie folk band known for lush harmonies and heartfelt lyrics. Touring in support of their 2024 album.",
      "bio_full": "<p>Mt. Joy formed in Los Angeles in 2016 and has since toured extensively...</p>",
      "is_headliner": true,
      "is_local": false,
      "content_advisory": null,
      "photo_url": "https://cms.bumbershoot.com/wp-content/uploads/mt-joy.jpg",
      "links": {
        "spotify": "https://open.spotify.com/artist/69tiO1fG8VWduIa1k8Z2eO",
        "apple_music": "https://music.apple.com/us/artist/mt-joy/1156713197",
        "bandcamp": null,
        "soundcloud": null,
        "youtube": "https://www.youtube.com/@mtjoyband",
        "website": "https://www.mtjoyband.com",
        "instagram": "https://www.instagram.com/mtjoy"
      },
      "event_ids": [101]
    },
    {
      "id": 202,
      "title": "Caroline Rose",
      "slug": "caroline-rose",
      "type": "musician",
      "genre": "indie-rock",
      "origin": "New York, NY",
      "pronouns": "she/her",
      "bio_short": "Brooklyn-based songwriter crafting irony-drenched pop with a theatrical edge.",
      "bio_full": "<p>Caroline Rose has been making music since 2014...</p>",
      "is_headliner": false,
      "is_local": false,
      "content_advisory": null,
      "photo_url": "https://cms.bumbershoot.com/wp-content/uploads/caroline-rose.jpg",
      "links": {
        "spotify": "https://open.spotify.com/artist/1l4fmDfPkjzF9GX4BIrCPJ",
        "apple_music": null,
        "bandcamp": null,
        "soundcloud": null,
        "youtube": null,
        "website": "https://www.carolinerosemusic.com",
        "instagram": "https://www.instagram.com/carolinerosemusic"
      },
      "event_ids": [102]
    }
  ]
}
```

---

## Field Reference

| Field | Type | Notes |
|---|---|---|
| `id` | integer | WordPress post ID |
| `title` | string | Artist or band name |
| `slug` | string | URL-safe identifier |
| `type` | string | See vocabulary in `post-types/artists.md` |
| `genre` | string \| null | See vocabulary in `post-types/artists.md` |
| `origin` | string \| null | Hometown or city |
| `pronouns` | string \| null | e.g., "she/her" |
| `bio_short` | string | Max 300 chars; used in list views |
| `bio_full` | string (HTML) \| null | Full biography with WP editor HTML |
| `is_headliner` | boolean | True for top-billed acts |
| `is_local` | boolean | True for WA State / Pacific NW artists |
| `content_advisory` | string \| null | e.g., "Explicit lyrics" |
| `photo_url` | string \| null | Artist photo URL |
| `links` | object | All platform links. Every key is always present; null if not set. |
| `event_ids` | integer[] | IDs of events this artist is linked to |

---

## Sort Order

Default: **alphabetical by title**, ascending. The app can re-sort client-side (e.g., by headliner status, by genre).
