<?php
/**
 * Bumbershoot_Cache_Headers
 *
 * Applies HTTP caching headers to a WP_REST_Response and handles
 * conditional requests (If-None-Match → 304 Not Modified).
 *
 * Usage in an endpoint callback:
 *
 *   $response = new WP_REST_Response( $data, 200 );
 *   return Bumbershoot_Cache_Headers::apply(
 *       $response,
 *       $request,
 *       Bumbershoot_Cache_Headers::SCHEDULE,
 *       $last_modified_datetime_string
 *   );
 *
 * @package BumbershootFestival
 */

defined( 'ABSPATH' ) || exit;

class Bumbershoot_Cache_Headers {

	// ── Cache-Control presets (matches openapi.yaml spec) ─────────────────────

	/** 30 minutes — schedule and announcements */
	const SCHEDULE = 'public, max-age=1800, stale-while-revalidate=60';

	/** 1 hour — individual event detail pages */
	const EVENT_DETAIL = 'public, max-age=3600, stale-while-revalidate=60';

	/** 24 hours — venues, artists, vendors (mostly static) */
	const STATIC_DATA = 'public, max-age=86400, stale-while-revalidate=3600';

	/** 1 minute — changes feed (must be fresh) */
	const CHANGES = 'public, max-age=60';

	/** 5 minutes — changed/cancelled events (short TTL so updates propagate) */
	const CHANGED_EVENT = 'public, max-age=300, stale-while-revalidate=30';

	// ─────────────────────────────────────────────────────────────────────────

	/**
	 * Applies caching headers to the response and returns it.
	 * If the request includes a matching If-None-Match header, returns 304.
	 *
	 * @param WP_REST_Response $response       The response to decorate.
	 * @param WP_REST_Request  $request        The incoming request (for If-None-Match).
	 * @param string           $cache_control  Cache-Control header value.
	 * @param string|null      $last_modified  ISO 8601 datetime of the most recently
	 *                                         changed record in the response.
	 * @return WP_REST_Response
	 */
	public static function apply(
		WP_REST_Response $response,
		WP_REST_Request $request,
		string $cache_control,
		?string $last_modified = null
	): WP_REST_Response {

		// Generate ETag from a stable hash of the response data.
		$data = $response->get_data();
		$etag = '"' . md5( wp_json_encode( $data ) ) . '"';

		// Apply headers.
		$response->header( 'Cache-Control', $cache_control );
		$response->header( 'ETag', $etag );
		$response->header( 'Vary', 'Accept-Encoding' );

		if ( $last_modified !== null ) {
			// HTTP requires Last-Modified in RFC 7231 format (GMT).
			try {
				$dt = new DateTime( $last_modified );
				$dt->setTimezone( new DateTimeZone( 'UTC' ) );
				$response->header( 'Last-Modified', $dt->format( 'D, d M Y H:i:s' ) . ' GMT' );
			} catch ( Exception $e ) {
				// Non-fatal: omit Last-Modified if the date is unparseable.
			}
		}

		// 304 Not Modified: if the client already has this version, say so.
		$if_none_match = $request->get_header( 'If-None-Match' );
		if ( $if_none_match && $if_none_match === $etag ) {
			return new WP_REST_Response( null, 304 );
		}

		return $response;
	}
}
