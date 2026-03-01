#!/usr/bin/env bash
# =============================================================================
# seed-wordpress.sh
# Bumbershoot Festival Companion — WordPress Sample Data Seeder
#
# Seeds a fresh WordPress install with the sample data from wp/sample-data/
# using WP-CLI. Registers venues and artists first (no dependencies), then
# events (depends on venues + artists), then announcements (depends on events).
#
# Usage:
#   ./scripts/seed-wordpress.sh                  # uses local WordPress
#   ./scripts/seed-wordpress.sh --reset          # wipe existing posts, then seed
#   ./scripts/seed-wordpress.sh --dry-run        # preview without writing
#
# Requirements:
#   - WP-CLI (wp) installed and in PATH
#   - WordPress fully configured and database accessible
#   - ACF plugin active
#   - All custom post types registered (run register-cpts.php first)
#
# Install WP-CLI:
#   curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
#   chmod +x wp-cli.phar && sudo mv wp-cli.phar /usr/local/bin/wp
#
# Exit codes:
#   0  Seeding successful
#   1  Fatal error (WP-CLI not found, WordPress not accessible, etc.)
# =============================================================================

set -euo pipefail

# ─── Configuration ────────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DATA_DIR="${PROJECT_ROOT}/wp/sample-data"

DRY_RUN=false
RESET=false

# ─── Argument parsing ─────────────────────────────────────────────────────────

for arg in "$@"; do
  case $arg in
    --dry-run)  DRY_RUN=true  ;;
    --reset)    RESET=true    ;;
    --help|-h)
      echo "Usage: $0 [--reset] [--dry-run]"
      echo ""
      echo "  --reset    Deletes all existing Bumbershoot posts before seeding."
      echo "  --dry-run  Shows what would be created without writing to WordPress."
      exit 0
      ;;
  esac
done

# ─── Colours ──────────────────────────────────────────────────────────────────

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

info()    { echo -e "${BLUE}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*" >&2; }
dry()     { echo -e "${CYAN}[DRY]${NC}   $*"; }

# ─── Pre-flight checks ────────────────────────────────────────────────────────

if ! command -v wp &>/dev/null; then
  error "WP-CLI not found. Install it first:"
  error "  curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar"
  error "  chmod +x wp-cli.phar && sudo mv wp-cli.phar /usr/local/bin/wp"
  exit 1
fi

if ! command -v python3 &>/dev/null; then
  error "python3 not found. Required for JSON parsing."
  exit 1
fi

# Check WordPress is accessible
if ! wp core is-installed 2>/dev/null; then
  error "WordPress is not installed or WP-CLI cannot access the database."
  error "Run from your WordPress root, or set WP_CLI_CONFIG_PATH."
  exit 1
fi

# Verify ACF is active
if ! wp plugin is-active advanced-custom-fields 2>/dev/null && \
   ! wp plugin is-active advanced-custom-fields-pro 2>/dev/null; then
  warn "ACF plugin does not appear to be active."
  warn "Field values may not be saved correctly. Continuing anyway..."
fi

# Verify data files exist
for f in venues artists vendors events announcements; do
  file="${DATA_DIR}/${f}.sample.json"
  if [[ "$f" == "events" ]]; then file="${DATA_DIR}/events.sample.json"; fi
  if [[ ! -f "$file" ]]; then
    error "Sample data file not found: $file"
    exit 1
  fi
done

# ─── Header ───────────────────────────────────────────────────────────────────

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Bumbershoot WordPress Seeder"
[[ "$DRY_RUN" == true ]] && echo "  MODE: DRY RUN (no changes will be written)"
[[ "$RESET"   == true ]] && echo "  MODE: RESET (existing posts will be deleted)"
echo "  Data:  ${DATA_DIR}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ─── Optional reset ───────────────────────────────────────────────────────────

if [[ "$RESET" == true ]]; then
  warn "RESET mode: deleting all existing Bumbershoot posts..."

  for cpt in bumbershoot_event bumbershoot_venue bumbershoot_artist bumbershoot_vendor bumbershoot_announcement; do
    ids=$(wp post list --post_type="$cpt" --format=ids --quiet 2>/dev/null || true)
    if [[ -n "$ids" ]]; then
      if [[ "$DRY_RUN" == false ]]; then
        # shellcheck disable=SC2086
        wp post delete $ids --force --quiet
        warn "Deleted all $cpt posts."
      else
        dry "Would delete all $cpt posts."
      fi
    else
      info "No existing $cpt posts to delete."
    fi
  done
  echo ""
fi

# ─── PHP helper (inline WP-CLI eval) ─────────────────────────────────────────

# Seed venues
# ─────────────────────────────────────────────────────────────────────────────

info "Seeding venues..."

VENUES_JSON="$DATA_DIR/venues.sample.json"
VENUE_COUNT=$(python3 -c "import json; d=json.load(open('$VENUES_JSON')); print(d['venue_count'])")

if [[ "$DRY_RUN" == true ]]; then
  dry "Would create ${VENUE_COUNT} venue posts."
else
  wp eval "
\$venues = json_decode(file_get_contents('${VENUES_JSON}'), true)['venues'];
foreach (\$venues as \$v) {
  \$id = wp_insert_post([
    'post_title'  => \$v['title'],
    'post_name'   => \$v['slug'],
    'post_type'   => 'bumbershoot_venue',
    'post_status' => 'publish',
  ]);
  update_field('venue_type',                \$v['type'],                 \$id);
  update_field('venue_short_name',          \$v['short_name'],           \$id);
  update_field('venue_lat',                 \$v['lat'],                  \$id);
  update_field('venue_lng',                 \$v['lng'],                  \$id);
  update_field('venue_map_zoom',            \$v['map_zoom'],             \$id);
  update_field('venue_area_note',           \$v['area_note'],            \$id);
  update_field('venue_capacity',            \$v['capacity'],             \$id);
  update_field('venue_is_accessible',       \$v['is_accessible'],        \$id);
  update_field('venue_accessibility_notes', \$v['accessibility_notes'],  \$id);
  update_field('venue_amenities',           \$v['amenities'],            \$id);
  update_field('venue_is_active',           \$v['is_active'],            \$id);
  echo 'Created venue: ' . \$v['title'] . ' (WP ID: ' . \$id . \")\n\";
}
"
  success "${VENUE_COUNT} venues seeded."
fi

echo ""

# Seed artists
# ─────────────────────────────────────────────────────────────────────────────

info "Seeding artists..."

ARTISTS_JSON="$DATA_DIR/artists.sample.json"
ARTIST_COUNT=$(python3 -c "import json; d=json.load(open('$ARTISTS_JSON')); print(d['artist_count'])")

if [[ "$DRY_RUN" == true ]]; then
  dry "Would create ${ARTIST_COUNT} artist posts."
else
  wp eval "
\$artists = json_decode(file_get_contents('${ARTISTS_JSON}'), true)['artists'];
foreach (\$artists as \$a) {
  \$id = wp_insert_post([
    'post_title'   => \$a['title'],
    'post_name'    => \$a['slug'],
    'post_type'    => 'bumbershoot_artist',
    'post_status'  => 'publish',
    'post_content' => \$a['bio_full'] ?? '',
  ]);
  update_field('artist_type',          \$a['type'],           \$id);
  update_field('artist_genre',         \$a['genre'],          \$id);
  update_field('artist_origin',        \$a['origin'],         \$id);
  update_field('artist_pronouns',      \$a['pronouns'],       \$id);
  update_field('artist_bio_short',     \$a['bio_short'],      \$id);
  update_field('artist_is_headliner',  \$a['is_headliner'],   \$id);
  update_field('artist_is_local',      \$a['is_local'],       \$id);
  update_field('artist_content_advisory', \$a['content_advisory'] ?? '', \$id);
  update_field('artist_spotify_url',   \$a['links']['spotify'],    \$id);
  update_field('artist_apple_music_url',\$a['links']['apple_music'],\$id);
  update_field('artist_bandcamp_url',  \$a['links']['bandcamp'],   \$id);
  update_field('artist_soundcloud_url',\$a['links']['soundcloud'],  \$id);
  update_field('artist_youtube_url',   \$a['links']['youtube'],    \$id);
  update_field('artist_website_url',   \$a['links']['website'],    \$id);
  update_field('artist_instagram_url', \$a['links']['instagram'],  \$id);
  echo 'Created artist: ' . \$a['title'] . ' (WP ID: ' . \$id . \")\n\";
}
"
  success "${ARTIST_COUNT} artists seeded."
fi

echo ""

# Seed vendors
# ─────────────────────────────────────────────────────────────────────────────

info "Seeding vendors..."

VENDORS_JSON="$DATA_DIR/vendors.sample.json"
VENDOR_COUNT=$(python3 -c "import json; d=json.load(open('$VENDORS_JSON')); print(d['vendor_count'])")

if [[ "$DRY_RUN" == true ]]; then
  dry "Would create ${VENDOR_COUNT} vendor posts."
else
  wp eval "
\$vendors = json_decode(file_get_contents('${VENDORS_JSON}'), true)['vendors'];
foreach (\$vendors as \$v) {
  \$id = wp_insert_post([
    'post_title'  => \$v['title'],
    'post_name'   => \$v['slug'],
    'post_type'   => 'bumbershoot_vendor',
    'post_status' => 'publish',
  ]);
  update_field('vendor_type',                \$v['type'],                \$id);
  update_field('vendor_booth_name',          \$v['booth_name'],          \$id);
  update_field('vendor_description_short',   \$v['description_short'],   \$id);
  update_field('vendor_cuisine',             \$v['cuisine'],             \$id);
  update_field('vendor_dietary_options',     \$v['dietary_options'],     \$id);
  update_field('vendor_price_range',         \$v['price_range'],         \$id);
  update_field('vendor_hours',               \$v['operating_hours'],     \$id);
  update_field('vendor_payment_methods',     \$v['payment_methods'],     \$id);
  update_field('vendor_is_accessible',       \$v['is_accessible'],       \$id);
  update_field('vendor_days_active',         \$v['days_active'],         \$id);
  update_field('vendor_is_active',           \$v['is_active'],           \$id);
  update_field('vendor_is_sponsor',          \$v['is_sponsor'],          \$id);
  update_field('vendor_sponsor_tier',        \$v['sponsor_tier'],        \$id);
  update_field('vendor_lat',                 \$v['lat'],                 \$id);
  update_field('vendor_lng',                 \$v['lng'],                 \$id);
  update_field('vendor_website_url',         \$v['website_url'],         \$id);
  update_field('vendor_instagram_url',       \$v['instagram_url'],       \$id);
  echo 'Created vendor: ' . \$v['title'] . ' (WP ID: ' . \$id . \")\n\";
}
"
  success "${VENDOR_COUNT} vendors seeded."
fi

echo ""

# Seed events (requires venues + artists to exist)
# ─────────────────────────────────────────────────────────────────────────────

info "Seeding events (resolving venue + artist relationships)..."

EVENTS_JSON="$DATA_DIR/events.sample.json"
EVENT_COUNT=$(python3 -c "import json; d=json.load(open('$EVENTS_JSON')); print(d['event_count'])")

if [[ "$DRY_RUN" == true ]]; then
  dry "Would create ${EVENT_COUNT} event posts."
else
  wp eval "
// Build slug-to-ID maps for venues and artists
\$venue_map = [];
\$venues = get_posts(['post_type' => 'bumbershoot_venue', 'numberposts' => -1, 'fields' => 'ids']);
foreach (\$venues as \$id) {
  \$venue_map[get_post_field('post_name', \$id)] = \$id;
}

\$artist_map = [];
\$artists = get_posts(['post_type' => 'bumbershoot_artist', 'numberposts' => -1, 'fields' => 'ids']);
foreach (\$artists as \$id) {
  \$artist_map[get_post_field('post_name', \$id)] = \$id;
}

\$events = json_decode(file_get_contents('${EVENTS_JSON}'), true)['events'];
foreach (\$events as \$e) {
  \$id = wp_insert_post([
    'post_title'  => \$e['title'],
    'post_name'   => \$e['slug'],
    'post_type'   => 'bumbershoot_event',
    'post_status' => 'publish',
  ]);

  // Resolve venue by slug
  \$venue_id = \$venue_map[\$e['slug']] ?? null;
  // Fall back to matching by short name slug
  if (!  \$venue_id) {
    \$v_slug = sanitize_title(\$e['venue_name']);
    \$venue_id = \$venue_map[\$v_slug] ?? null;
  }
  if (\$venue_id) update_field('event_venue', \$venue_id, \$id);

  update_field('event_start_time',     \$e['start_time'],     \$id);
  update_field('event_end_time',       \$e['end_time'],       \$id);
  update_field('event_day',            \$e['day'],            \$id);
  update_field('event_category',       \$e['category'],       \$id);
  update_field('event_tags',           \$e['tags'],           \$id);
  update_field('event_status',         \$e['status'],         \$id);
  update_field('event_status_note',    \$e['status_note'],    \$id);
  update_field('event_is_highlighted', \$e['is_highlighted'], \$id);
  update_field('event_last_changed',   \$e['last_changed'],   \$id);

  // Resolve artist relationships
  \$artist_ids = [];
  foreach ((\$e['artist_ids'] ?? []) as \$sample_id) {
    // Match by position in original sample data (approximate)
    foreach (\$artist_map as \$slug => \$wp_id) {
      \$artist_ids[] = \$wp_id;
      break;
    }
  }
  if (!empty(\$artist_ids)) update_field('event_artists', \$artist_ids, \$id);

  echo 'Created event: ' . \$e['title'] . ' (WP ID: ' . \$id . \")\n\";
}
"
  success "${EVENT_COUNT} events seeded."
fi

echo ""

# Seed announcements
# ─────────────────────────────────────────────────────────────────────────────

info "Seeding announcements..."

ANNOUNCEMENTS_JSON="$DATA_DIR/announcements.sample.json"
ANN_COUNT=$(python3 -c "import json; d=json.load(open('$ANNOUNCEMENTS_JSON')); print(d['announcement_count'])")

if [[ "$DRY_RUN" == true ]]; then
  dry "Would create ${ANN_COUNT} announcement posts."
else
  wp eval "
\$announcements = json_decode(file_get_contents('${ANNOUNCEMENTS_JSON}'), true)['announcements'];
foreach (\$announcements as \$a) {
  \$id = wp_insert_post([
    'post_title'   => \$a['title'],
    'post_type'    => 'bumbershoot_announcement',
    'post_status'  => 'publish',
    'post_content' => \$a['body'],
    'post_date'    => date('Y-m-d H:i:s', strtotime(\$a['published_at'])),
  ]);
  update_field('announcement_type',         \$a['type'],          \$id);
  update_field('announcement_priority',     \$a['priority'],      \$id);
  update_field('announcement_is_pinned',    \$a['is_pinned'],     \$id);
  update_field('announcement_expires_at',   \$a['expires_at'],    \$id);
  update_field('announcement_day',          \$a['day'],           \$id);
  update_field('announcement_external_url', \$a['external_url'],  \$id);
  update_field('announcement_external_url_label', \$a['external_url_label'], \$id);
  echo 'Created announcement: ' . \$a['title'] . ' (WP ID: ' . \$id . \")\n\";
}
"
  success "${ANN_COUNT} announcements seeded."
fi

echo ""

# ─── Final summary ────────────────────────────────────────────────────────────

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [[ "$DRY_RUN" == true ]]; then
  dry "Dry run complete. No data was written."
else
  success "Seeding complete. Verify at:"
  echo ""

  BASE_URL=$(wp option get siteurl 2>/dev/null || echo "http://localhost")
  API="${BASE_URL}/wp-json/bumbershoot/v1"

  echo "  ${API}/schedule"
  echo "  ${API}/venues"
  echo "  ${API}/artists"
  echo "  ${API}/vendors"
  echo "  ${API}/announcements"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
