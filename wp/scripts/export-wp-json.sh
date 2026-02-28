#!/usr/bin/env bash
# =============================================================================
# export-wp-json.sh
# Bumbershoot Festival Companion — WordPress JSON Export
#
# Fetches all custom API endpoints and writes them as JSON files to
# wp/sample-data/, creating timestamped backups alongside.
#
# Usage:
#   ./scripts/export-wp-json.sh                        # use WP_BASE_URL from env
#   WP_BASE_URL=http://localhost:10003 ./scripts/export-wp-json.sh
#   WP_BASE_URL=https://cms.bumbershoot.com ./scripts/export-wp-json.sh
#
# Requirements:
#   - curl
#   - python3 (for JSON pretty-printing)
#   - WordPress must be running with custom endpoints registered
#
# Exit codes:
#   0  All exports successful
#   1  One or more exports failed
# =============================================================================

set -euo pipefail

# ─── Configuration ────────────────────────────────────────────────────────────

BASE_URL="${WP_BASE_URL:-http://localhost:10003}"
API_PATH="/wp-json/bumbershoot/v1"
FULL_BASE="${BASE_URL}${API_PATH}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
OUTPUT_DIR="${PROJECT_ROOT}/wp/sample-data"
BACKUP_DIR="${OUTPUT_DIR}/backups"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"

CURL_TIMEOUT=30
CURL_OPTS="--silent --fail --max-time ${CURL_TIMEOUT} --location"

# ─── Colours ──────────────────────────────────────────────────────────────────

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # no colour

# ─── Helpers ──────────────────────────────────────────────────────────────────

info()    { echo -e "${BLUE}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*" >&2; }

require_command() {
  if ! command -v "$1" &>/dev/null; then
    error "Required command not found: $1"
    exit 1
  fi
}

pretty_json() {
  python3 -c "import sys, json; print(json.dumps(json.load(sys.stdin), indent=2, ensure_ascii=False))"
}

# ─── Pre-flight checks ────────────────────────────────────────────────────────

require_command curl
require_command python3

mkdir -p "$OUTPUT_DIR"
mkdir -p "$BACKUP_DIR"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Bumbershoot WP JSON Exporter"
echo "  Source:  ${FULL_BASE}"
echo "  Output:  ${OUTPUT_DIR}"
echo "  Time:    ${TIMESTAMP}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ─── Connectivity check ───────────────────────────────────────────────────────

info "Checking WordPress connectivity..."

if ! curl ${CURL_OPTS} "${BASE_URL}/wp-json/" > /dev/null 2>&1; then
  error "Cannot reach WordPress at ${BASE_URL}"
  error "Ensure WordPress is running and the URL is correct."
  exit 1
fi

success "WordPress is reachable."
echo ""

# ─── Export function ──────────────────────────────────────────────────────────

FAILURES=0

export_endpoint() {
  local endpoint="$1"     # e.g. schedule
  local filename="$2"     # e.g. events.sample.json
  local url="${FULL_BASE}/${endpoint}"
  local output_file="${OUTPUT_DIR}/${filename}"
  local backup_file="${BACKUP_DIR}/${filename%.json}-${TIMESTAMP}.json"

  info "Exporting /${endpoint} → ${filename}"

  # Backup existing file if it exists
  if [[ -f "$output_file" ]]; then
    cp "$output_file" "$backup_file"
  fi

  # Fetch and pretty-print
  local response
  if response=$(curl ${CURL_OPTS} "$url"); then
    echo "$response" | pretty_json > "$output_file"

    # Validate the output is parseable
    if python3 -c "import json, sys; json.load(open('${output_file}'))" 2>/dev/null; then
      local count
      count=$(python3 -c "
import json, sys
d = json.load(open('${output_file}'))
# Try common count fields
for key in ['event_count','venue_count','artist_count','vendor_count','announcement_count']:
    if key in d:
        print(d[key])
        sys.exit()
print('?')
")
      success "/${endpoint} → ${filename} (${count} records)"
    else
      error "/${endpoint} returned invalid JSON"
      FAILURES=$((FAILURES + 1))
    fi
  else
    error "/${endpoint} — request failed (HTTP error or timeout)"
    # Restore backup if we had one
    if [[ -f "$backup_file" ]]; then
      cp "$backup_file" "$output_file"
      warn "Restored previous version from backup."
    fi
    FAILURES=$((FAILURES + 1))
  fi
}

# ─── Run exports (order matters: venues/artists before events) ────────────────

export_endpoint "venues"        "venues.sample.json"
export_endpoint "artists"       "artists.sample.json"
export_endpoint "vendors"       "vendors.sample.json"
export_endpoint "schedule"      "events.sample.json"
export_endpoint "announcements" "announcements.sample.json"

# ─── Summary ──────────────────────────────────────────────────────────────────

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [[ $FAILURES -eq 0 ]]; then
  success "All exports completed successfully."
  echo ""
  echo "  Files written to:  ${OUTPUT_DIR}"
  echo "  Backups saved to:  ${BACKUP_DIR}"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  exit 0
else
  error "${FAILURES} export(s) failed. Check output above."
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  exit 1
fi
