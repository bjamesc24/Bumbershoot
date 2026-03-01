# How to Seed WordPress with Sample Data

## Overview

This document explains how to populate a fresh WordPress installation with the sample data in `wp/sample-data/` so that the backend is ready for frontend development and testing before real festival content is available.

Seeding is the process of creating real WordPress posts from the JSON files in this repo.

---

## Prerequisites

Before seeding, ensure:

- [ ] WordPress is installed and accessible (local or staging)
- [ ] Custom post types are registered (`bumbershoot_event`, `bumbershoot_venue`, `bumbershoot_announcement`, `bumbershoot_artist`, `bumbershoot_vendor`)
- [ ] ACF (or equivalent) field groups are configured to match the schemas in `wp/post-types/`
- [ ] Custom API endpoints are registered under the `bumbershoot/v1` namespace
- [ ] WordPress admin credentials are available
- [ ] WP-CLI is installed (strongly recommended for scripted seeding)

---

## Method 1: Manual Entry via WordPress Admin (No Code)

Best for small teams and early-stage setup. Go one content type at a time.

### Seed order (follow relationships)

Because events reference venues and artists, you must seed in this order:

```
1. Venues        (no dependencies)
2. Artists       (no dependencies)
3. Vendors       (no dependencies)
4. Events        (references venues + artists)
5. Announcements (references events + venues)
```

### Steps for each record

1. Go to **WordPress Admin → [Post Type] → Add New**
2. Set the **Title** to the `title` field from the JSON
3. Set the **Featured Image** if a `photo_url` or `thumbnail_url` exists (use a placeholder image for now)
4. Fill in each ACF field from the corresponding JSON record
5. Set **Status** to `Published`
6. Click **Publish**

For relationships (e.g., `event_venue`, `event_artists`): the related post must already exist, then you can select it via the ACF relationship field.

> 💡 Tip: Keep the JSON file open in one window and WordPress admin in another. Work through each sample record methodically.

---

## Method 2: WP-CLI with Custom PHP (Recommended for Developers)

WP-CLI allows you to create posts programmatically from the command line. This is faster, more repeatable, and less error-prone than manual entry.

### Install WP-CLI (if not already installed)

```bash
curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
chmod +x wp-cli.phar
sudo mv wp-cli.phar /usr/local/bin/wp
wp --version
```

### Seed venues

```bash
wp eval '
$venues = json_decode(file_get_contents("/path/to/wp/sample-data/venues.sample.json"), true);
foreach ($venues["venues"] as $venue) {
  $post_id = wp_insert_post([
    "post_title"  => $venue["title"],
    "post_name"   => $venue["slug"],
    "post_type"   => "bumbershoot_venue",
    "post_status" => "publish",
  ]);
  update_field("venue_type",              $venue["type"],              $post_id);
  update_field("venue_short_name",        $venue["short_name"],        $post_id);
  update_field("venue_lat",               $venue["lat"],               $post_id);
  update_field("venue_lng",               $venue["lng"],               $post_id);
  update_field("venue_area_note",         $venue["area_note"],         $post_id);
  update_field("venue_capacity",          $venue["capacity"],          $post_id);
  update_field("venue_is_accessible",     $venue["is_accessible"],     $post_id);
  update_field("venue_accessibility_notes", $venue["accessibility_notes"], $post_id);
  update_field("venue_amenities",         $venue["amenities"],         $post_id);
  update_field("venue_is_active",         $venue["is_active"],         $post_id);
  echo "Created venue: " . $venue["title"] . " (ID: $post_id)\n";
}
'
```

> **Note:** `update_field()` is an ACF function. If you're not using ACF, replace with `update_post_meta()` and adjust the field keys accordingly.

### Seed artists

```bash
wp eval '
$artists = json_decode(file_get_contents("/path/to/wp/sample-data/artists.sample.json"), true);
foreach ($artists["artists"] as $artist) {
  $post_id = wp_insert_post([
    "post_title"   => $artist["title"],
    "post_name"    => $artist["slug"],
    "post_type"    => "bumbershoot_artist",
    "post_status"  => "publish",
    "post_content" => $artist["bio_full"] ?? "",
  ]);
  update_field("artist_type",        $artist["type"],          $post_id);
  update_field("artist_genre",       $artist["genre"],         $post_id);
  update_field("artist_origin",      $artist["origin"],        $post_id);
  update_field("artist_pronouns",    $artist["pronouns"],      $post_id);
  update_field("artist_bio_short",   $artist["bio_short"],     $post_id);
  update_field("artist_is_headliner",$artist["is_headliner"],  $post_id);
  update_field("artist_is_local",    $artist["is_local"],      $post_id);
  update_field("artist_spotify_url", $artist["links"]["spotify"],   $post_id);
  update_field("artist_website_url", $artist["links"]["website"],   $post_id);
  update_field("artist_instagram_url",$artist["links"]["instagram"],$post_id);
  echo "Created artist: " . $artist["title"] . " (ID: $post_id)\n";
}
'
```

### Seed events (after venues and artists are seeded)

Events reference venues by ID. Since WordPress will assign new IDs during seeding, you'll need to build a slug-to-ID map before inserting events.

```bash
wp eval '
// Build slug-to-ID map for venues
$venue_map = [];
$venues = get_posts(["post_type" => "bumbershoot_venue", "numberposts" => -1, "fields" => "ids"]);
foreach ($venues as $id) {
  $venue_map[get_post_field("post_name", $id)] = $id;
}

// Build slug-to-ID map for artists
$artist_map = [];
$artists = get_posts(["post_type" => "bumbershoot_artist", "numberposts" => -1, "fields" => "ids"]);
foreach ($artists as $id) {
  $artist_map[get_post_field("post_name", $id)] = $id;
}

$events = json_decode(file_get_contents("/path/to/wp/sample-data/events.sample.json"), true);
foreach ($events["events"] as $event) {
  $post_id = wp_insert_post([
    "post_title"  => $event["title"],
    "post_name"   => $event["slug"],
    "post_type"   => "bumbershoot_event",
    "post_status" => "publish",
  ]);
  
  // Venue relationship — look up by slug
  $venue_slug = sanitize_title($event["venue_name"]);
  $venue_id   = $venue_map[$venue_slug] ?? null;
  if ($venue_id) update_field("event_venue", $venue_id, $post_id);

  update_field("event_start_time",      $event["start_time"],      $post_id);
  update_field("event_end_time",        $event["end_time"],        $post_id);
  update_field("event_day",             $event["day"],             $post_id);
  update_field("event_category",        $event["category"],        $post_id);
  update_field("event_tags",            $event["tags"],            $post_id);
  update_field("event_status",          $event["status"],          $post_id);
  update_field("event_status_note",     $event["status_note"],     $post_id);
  update_field("event_is_highlighted",  $event["is_highlighted"],  $post_id);
  update_field("event_last_changed",    $event["last_changed"],    $post_id);

  echo "Created event: " . $event["title"] . " (ID: $post_id)\n";
}
'
```

---

## Method 3: Directly Use the Sample JSON Files as Mocks

If WordPress isn't ready and the mobile app needs to run against something, the sample JSON files can be served as static files — no WordPress needed.

### Option A: Simple local static file server

```bash
cd bumbershoot-festival-companion/wp/sample-data

# Python 3
python3 -m http.server 8888

# Now access:
# http://localhost:8888/events.sample.json
# http://localhost:8888/venues.sample.json
# etc.
```

Then point the app's `API_BASE_URL` in `.env` to `http://localhost:8888/` and update the service files to fetch `events.sample.json` instead of `schedule`.

### Option B: Bundle as local assets in the app

Copy the JSON files into `app/src/assets/` and import them directly in the service files:

```typescript
// app/src/services/scheduleService.ts (mock mode)
import mockSchedule from '../assets/events.sample.json';

export async function fetchSchedule() {
  if (process.env.USE_MOCK_DATA === 'true') {
    return mockSchedule;
  }
  // ... live API fetch
}
```

---

## Verify the Seed

After seeding, verify the data is accessible by hitting the API endpoints:

```bash
BASE="http://localhost:10003/wp-json/bumbershoot/v1"

echo "--- Schedule ---"
curl -s "$BASE/schedule" | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'{d[\"event_count\"]} events')"

echo "--- Venues ---"
curl -s "$BASE/venues" | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'{d[\"venue_count\"]} venues')"

echo "--- Artists ---"
curl -s "$BASE/artists" | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'{d[\"artist_count\"]} artists')"

echo "--- Vendors ---"
curl -s "$BASE/vendors" | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'{d[\"vendor_count\"]} vendors')"

echo "--- Announcements ---"
curl -s "$BASE/announcements" | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'{d[\"announcement_count\"]} announcements')"
```

Expected output from sample data:

```
--- Schedule ---
8 events
--- Venues ---
12 venues
--- Artists ---
8 artists
--- Vendors ---
7 vendors
--- Announcements ---
5 announcements
```

---

## Resetting the Seed (Start Fresh)

To wipe all custom post type content and re-seed:

```bash
# ⚠️ Destructive — removes all posts of these types
wp post delete $(wp post list --post_type=bumbershoot_event --format=ids) --force
wp post delete $(wp post list --post_type=bumbershoot_venue --format=ids) --force
wp post delete $(wp post list --post_type=bumbershoot_artist --format=ids) --force
wp post delete $(wp post list --post_type=bumbershoot_vendor --format=ids) --force
wp post delete $(wp post list --post_type=bumbershoot_announcement --format=ids) --force

echo "All custom posts deleted. Ready to re-seed."
```

Then re-run the seeding steps above.
