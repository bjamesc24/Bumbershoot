<?php
/**
 * Plugin Name:       Bumbershoot Festival API
 * Plugin URI:        https://github.com/your-org/bumbershoot-festival-companion
 * Description:       Registers public REST API endpoints for the Bumbershoot Festival
 *                    Companion mobile app. All endpoints are read-only and unauthenticated.
 * Version:           1.0.0
 * Requires at least: 6.0
 * Requires PHP:      8.0
 * Author:            Bumbershoot Backend Team
 * License:           MIT
 *
 * @package BumbershootFestival
 */

defined( 'ABSPATH' ) || exit;

define( 'BUMBERSHOOT_API_VERSION', '1.0.0' );
define( 'BUMBERSHOOT_API_DIR', plugin_dir_path( __FILE__ ) );

// ── Helpers (load first — endpoints depend on these) ──────────────────────────
require_once BUMBERSHOOT_API_DIR . 'includes/helpers/class-acf-compat.php';
require_once BUMBERSHOOT_API_DIR . 'includes/helpers/class-response-formatter.php';
require_once BUMBERSHOOT_API_DIR . 'includes/helpers/class-cache-headers.php';

// ── Endpoints ─────────────────────────────────────────────────────────────────
require_once BUMBERSHOOT_API_DIR . 'includes/endpoints/class-endpoint-schedule.php';
require_once BUMBERSHOOT_API_DIR . 'includes/endpoints/class-endpoint-events.php';
require_once BUMBERSHOOT_API_DIR . 'includes/endpoints/class-endpoint-venues.php';
require_once BUMBERSHOOT_API_DIR . 'includes/endpoints/class-endpoint-artists.php';
require_once BUMBERSHOOT_API_DIR . 'includes/endpoints/class-endpoint-vendors.php';
require_once BUMBERSHOOT_API_DIR . 'includes/endpoints/class-endpoint-announcements.php';
require_once BUMBERSHOOT_API_DIR . 'includes/endpoints/class-endpoint-changes.php';

// ── Main API class ────────────────────────────────────────────────────────────
require_once BUMBERSHOOT_API_DIR . 'includes/class-bumbershoot-api.php';

// ── Bootstrap ─────────────────────────────────────────────────────────────────
add_action( 'rest_api_init', [ 'Bumbershoot_API', 'register_routes' ] );
