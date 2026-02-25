# Custom Post Type: Artists

## Overview

The `artist` post type stores profile information for performers appearing at Bumbershoot. Artist records exist independently of events — one artist can be linked to multiple events (e.g., a musician who plays two sets, or appears on a panel).

Artist data is **reference data** that changes infrequently. The app should refresh it daily or on open, not on the 30-minute event cadence.

---

## CPT Registration

**Post Type Slug:** `bumbershoot_artist`  
**Custom Endpoint:** `wp-json/bumbershoot/v1/artists`

### CPT UI Settings

| Setting | Value |
|---|---|
| Post Type Slug | `bumbershoot_artist` |
| Plural Label | Artists |
| Singular Label | Artist |
| Public | Yes |
| Has Archive | No |
| Show in REST | Yes |
| Menu Icon | `dashicons-groups` |
| Supports | Title, Editor (bio), Thumbnail |

---

## Fields

### Profile Fields

| Field Label | Field Name | Field Type | Required | Notes |
|---|---|---|---|---|
| Pronouns | `artist_pronouns` | Text | ❌ | e.g., "she/her", "they/them" |
| Origin / Hometown | `artist_origin` | Text | ❌ | e.g., "Seattle, WA" or "Philadelphia, PA" |
| Short Bio | `artist_bio_short` | Textarea | ✅ | Max 300 characters; used in list views |
| Full Bio | `artist_bio_full` | WYSIWYG / Textarea | ❌ | Used in artist detail screen |
| Genre / Discipline | `artist_genre` | Select + Other | ❌ | See options below |
| Artist Type | `artist_type` | Select | ✅ | Differentiates performers from speakers, etc. |
| Photo | (WP native Featured Image) | Image | ✅ | Minimum 600×600px; used as avatar and hero |

### External Links

| Field Label | Field Name | Field Type | Required | Notes |
|---|---|---|---|---|
| Spotify URL | `artist_spotify_url` | URL | ❌ | Direct artist profile link |
| Apple Music URL | `artist_apple_music_url` | URL | ❌ | |
| Bandcamp URL | `artist_bandcamp_url` | URL | ❌ | |
| SoundCloud URL | `artist_soundcloud_url` | URL | ❌ | |
| YouTube URL | `artist_youtube_url` | URL | ❌ | Artist channel or featured video |
| Website URL | `artist_website_url` | URL | ❌ | Official artist/band website |
| Instagram URL | `artist_instagram_url` | URL | ❌ | |

> ⚠️ The app should treat all external links as optional and render only the ones that are populated. Do not link to X/Twitter — omit that field.

### Metadata

| Field Label | Field Name | Field Type | Required | Notes |
|---|---|---|---|---|
| Is Headliner | `artist_is_headliner` | True/False | ❌ | Used to surface top-billed acts |
| Is Local Artist | `artist_is_local` | True/False | ❌ | For filtering Seattle/Pacific NW artists |
| Content Advisory | `artist_content_advisory` | Text | ❌ | e.g., "Explicit lyrics" |

---

## Artist Type Options

| Value | Label |
|---|---|
| `musician` | Musician / Band |
| `dj` | DJ |
| `comedian` | Comedian |
| `visual-artist` | Visual Artist |
| `speaker` | Speaker / Panelist |
| `performer` | Performer (other) |

---

## Genre / Discipline Options

| Value | Label |
|---|---|
| `indie-rock` | Indie Rock |
| `hip-hop` | Hip-Hop / Rap |
| `electronic` | Electronic / EDM |
| `r-and-b` | R&B / Soul |
| `pop` | Pop |
| `folk` | Folk / Americana |
| `jazz` | Jazz |
| `classical` | Classical |
| `world` | World Music |
| `comedy` | Comedy |
| `visual-art` | Visual Art |
| `mixed-media` | Mixed Media |
| `other` | Other |

---

## Sample JSON Output

```json
{
  "id": 201,
  "title": "Mt. Joy",
  "slug": "mt-joy",
  "type": "musician",
  "genre": "indie-rock",
  "origin": "Philadelphia, PA",
  "pronouns": null,
  "bio_short": "Philadelphia indie folk band known for lush harmonies and heartfelt lyrics. Touring in support of their 2024 album.",
  "bio_full": "Mt. Joy formed in Los Angeles in 2016 and quickly gained a devoted following...",
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
}
```

See `wp/sample-data/artists.sample.json` for a full dataset.

---

## Relationship to Events

Artists are linked to events via the `event_artists` field on the `bumbershoot_event` post type. The relationship is maintained from the Event side, not the Artist side. When the API serializes an event, it includes embedded artist objects (or at minimum artist IDs). When the API serializes an artist, it includes the IDs of associated events.

---

## Editorial Notes

- **One post per artist/act.** A band is one post; a solo artist is one post.
- **Featured Image is required.** A placeholder is acceptable during development, but all artists should have photos before launch.
- **External links should be verified** before publishing. Broken links on launch day are a bad look.
- **`is_local`** should be set for any artist from Washington State — this enables a "Local Artists" filter if the frontend adds it.
- **Bios should be written by the festival** or provided by artist management — do not pull from Wikipedia verbatim.
