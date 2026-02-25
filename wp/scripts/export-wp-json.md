# How to Export WordPress Data as JSON

## Overview

This document describes how to export Bumbershoot festival data from WordPress as static JSON files. These exports serve two purposes:

1. **Development & testing** — provide the mobile app with realistic data before WordPress is fully set up or deployed
2. **Offline snapshot / backup** — create a frozen copy of the schedule that can be bundled with the app or served from a CDN as a fallback

---

## Method 1: Using the Live Custom API Endpoints (Primary)

Once the custom endpoints are registered in WordPress (see `endpoints/`), exporting is as simple as fetching each endpoint and saving the response.

### Manual export via browser or curl

```bash
# From your terminal, with WordPress running locally or deployed

BASE_URL="https://cms.bumbershoot.com/wp-json/bumbershoot/v1"
# or for local dev:
BASE_URL="http://localhost:10003/wp-json/bumbershoot/v1"

# Export each dataset
curl "$BASE_URL/schedule"       -o sample-data/events.sample.json
curl "$BASE_URL/venues"         -o sample-data/venues.sample.json
curl "$BASE_URL/announcements"  -o sample-data/announcements.sample.json
curl "$BASE_URL/artists"        -o sample-data/artists.sample.json
curl "$BASE_URL/vendors"        -o sample-data/vendors.sample.json
```

### Automated export script (run from project root)

Create a shell script `scripts/export-wp-json.sh`:

```bash
#!/bin/bash
set -e

BASE_URL="${WP_BASE_URL:-http://localhost:10003/wp-json/bumbershoot/v1}"
OUTPUT_DIR="wp/sample-data"

echo "Exporting from: $BASE_URL"
echo "Writing to: $OUTPUT_DIR"

endpoints=("schedule" "venues" "announcements" "artists" "vendors")
filenames=("events.sample" "venues.sample" "announcements.sample" "artists.sample" "vendors.sample")

for i in "${!endpoints[@]}"; do
  endpoint="${endpoints[$i]}"
  filename="${filenames[$i]}"
  echo "  → Exporting /$endpoint ..."
  curl -sf "$BASE_URL/$endpoint" | python3 -m json.tool > "$OUTPUT_DIR/$filename.json"
  echo "     Saved to $OUTPUT_DIR/$filename.json"
done

echo ""
echo "✅ Export complete."
```

Make it executable:

```bash
chmod +x scripts/export-wp-json.sh
./scripts/export-wp-json.sh
```

To export from the staging/production server:

```bash
WP_BASE_URL="https://cms.bumbershoot.com/wp-json/bumbershoot/v1" ./scripts/export-wp-json.sh
```

---

## Method 2: WordPress Admin Export (Simple, No Plugin)

If the custom endpoints aren't ready, you can export raw WordPress data using the native export tool — though the output format will be XML (not JSON) and will need to be converted.

1. Go to **WordPress Admin → Tools → Export**
2. Select the post type you want to export (e.g., "Events")
3. Click **Download Export File** — saves as an `.xml` file (WordPress eXtended RSS / WXR format)
4. Convert using a tool like `wxr-to-json` or write a custom parser

> ⚠️ This method is a last resort. The WXR format is verbose and the conversion adds complexity. Prefer Method 1 whenever possible.

---

## Method 3: WP-CLI (For Developers with Server Access)

If you have WP-CLI installed and shell access to the WordPress server, you can query and export data directly from the command line.

```bash
# List all events as JSON
wp post list --post_type=bumbershoot_event --post_status=publish --format=json

# Get a specific post's content and meta
wp post get 101 --format=json
wp post meta list 101 --format=json

# Export using custom PHP evaluation
wp eval '
$events = get_posts([
  "post_type"   => "bumbershoot_event",
  "numberposts" => -1,
  "post_status" => "publish",
]);
echo json_encode($events, JSON_PRETTY_PRINT);
' > /tmp/events-raw.json
```

> Note: WP-CLI exports raw WordPress post objects with WordPress-internal fields, not the clean API-shaped JSON from your custom endpoints. Post-processing will be required to reshape the data.

---

## Using JSON Exports in the Mobile App

The exported JSON files in `wp/sample-data/` are structured to match the custom endpoint response format exactly. The mobile app's service layer (`app/src/services/`) can be configured to read from these files instead of hitting the live API — useful for:

- Running the app fully offline during development
- Testing the UI with edge-case data (cancelled events, announcements, etc.)
- Seeding the local cache for demo/presentation purposes

To enable this in the app, set `USE_MOCK_DATA=true` in the app's `.env` file (implement this toggle in `app/src/services/apiClient.ts`).

---

## Pre-Festival Export Checklist

Before festival day, perform a final export and keep a timestamped snapshot:

```bash
TIMESTAMP=$(date +%Y%m%d-%H%M)
./scripts/export-wp-json.sh
cp -r wp/sample-data/ wp/sample-data-backup-$TIMESTAMP/
echo "Snapshot saved: wp/sample-data-backup-$TIMESTAMP"
```

This gives you a known-good state to fall back to if the live API encounters issues during the festival.
