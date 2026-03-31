<?php
/**
 * Bumbershoot_Endpoint_Changes
 *
 * GET /wp-json/bumbershoot/v1/changes?since=<ISO 8601>
 *
 * Lightweight change-detection feed. Returns a summary of which content has
 * changed since a given timestamp. The app reads `has_changes` first — if
 * false, no further fetching is needed.
 *
 * For events, change detection uses event_last_changed (ACF field) first,
 * then falls back to post_modified if event_last_changed is not set.
 * The union of both queries is returned so nothing is missed.
 *
 * For all other post types, post_modified is used as the change signal.
 *
 * @package BumbershootFestival
 */

defined( 'ABSPATH' ) || exit;

class Bumbershoot_Endpoint_Changes {

	public function __construct() {
		register_rest_route(
			Bumbershoot_API::NAMESPACE,
			'/changes',
			[
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => [ $this, 'get_changes' ],
				'permission_callback' => '__return_true',
				'args'                => $this->get_args(),
			]
		);
	}

	/**
	 * Endpoint handler.
	 */
	public function get_changes( WP_REST_Request $request ): WP_REST_Response {

		// `since` is required — return 400 if missing or unparseable.
		$since_raw = $request->get_param( 'since' );
		if ( ! $since_raw ) {
			return new WP_REST_Response(
				[ 'code' => 'missing_since', 'message' => 'The since parameter is required (ISO 8601 datetime).' ],
				400
			);
		}

		$since_mysql = Bumbershoot_ACF_Compat::to_mysql_datetime( sanitize_text_field( $since_raw ) );
		if ( ! $since_mysql ) {
			return new WP_REST_Response(
				[ 'code' => 'invalid_since', 'message' => 'The since parameter could not be parsed as a valid datetime.' ],
				400
			);
		}

		// Optionally limit which types to check.
		$types_param = $request->get_param( 'types' );
		$check_types = $types_param
			? array_map( 'trim', explode( ',', sanitize_text_field( $types_param ) ) )
			: [ 'events', 'announcements', 'venues', 'artists', 'vendors' ];

		// ── Gather changes per type ───────────────────────────────────────────

		$datasets = [];
 
		if ( in_array( 'events', $check_types, true ) ) {
			$datasets['events'] = $this->get_event_changes( $since_mysql );
		}
 
		if ( in_array( 'announcements', $check_types, true ) ) {
			$datasets['announcements'] = $this->get_post_changes( 'bumbershoot_announcement', $since_mysql );
		}
 
		if ( in_array( 'venues', $check_types, true ) ) {
			$datasets['venues'] = $this->get_post_changes( 'bumbershoot_venue', $since_mysql );
		}
 
		if ( in_array( 'artists', $check_types, true ) ) {
			$datasets['artists'] = $this->get_post_changes( 'bumbershoot_artist', $since_mysql );
		}
 
		if ( in_array( 'vendors', $check_types, true ) ) {
			$datasets['vendors'] = $this->get_post_changes( 'bumbershoot_vendor', $since_mysql );
		}
 
		// has_changes is true if any dataset has changed: true.
		$has_changes = false;
		foreach ( $datasets as $dataset ) {
			if ( $dataset['changed'] ?? false ) {
				$has_changes = true;
				break;
			}
		}
 
		$data = [
			'checked_at'  => current_time( 'c' ),
			'since'       => Bumbershoot_ACF_Compat::format_datetime( $since_mysql ),
			'has_changes' => $has_changes,
			'datasets'    => $datasets,
		];
 
		$response = new WP_REST_Response( $data, 200 );
 
		return Bumbershoot_Cache_Headers::apply(
			$response,
			$request,
			Bumbershoot_Cache_Headers::CHANGES
			// No Last-Modified on the changes endpoint — it's always fresh.
		);
	}
	// ── Private helpers ───────────────────────────────────────────────────────

	/**
	 * Detects changed events using both event_last_changed (ACF) and
	 * post_modified, then unions the results.
	 *
	 * Also separates cancelled events from other changes.
	 */
	private function get_event_changes( string $since_mysql ): array {

		// ① Events where event_last_changed > since (editorial tracking field).
		$by_last_changed = new WP_Query( [
			'post_type'      => 'bumbershoot_event',
			'post_status'    => 'publish',
			'posts_per_page' => -1,
			'fields'         => 'ids',
			'meta_query'     => [
				[
					'key'     => 'event_last_changed',
					'value'   => $since_mysql,
					'compare' => '>',
					'type'    => 'DATETIME',
				],
			],
		] );

		// ② Events where post_modified > since AND event_last_changed is not set
		// (graceful fallback for posts that were saved before the field existed).
		$by_post_modified = new WP_Query( [
			'post_type'      => 'bumbershoot_event',
			'post_status'    => 'publish',
			'posts_per_page' => -1,
			'fields'         => 'ids',
			'date_query'     => [
				[
					'after'   => $since_mysql,
					'column'  => 'post_modified',
					'inclusive' => false,
				],
			],
			'meta_query'     => [
				[
					'key'     => 'event_last_changed',
					'compare' => 'NOT EXISTS',
				],
			],
		] );

		// Union both result sets.
		$all_ids = array_unique(
			array_merge(
				(array) $by_last_changed->posts,
				(array) $by_post_modified->posts
			)
		);

		// Separate cancelled events from updated events.
		$updated   = [];
		$cancelled = [];

		foreach ( $all_ids as $id ) {
			$status = Bumbershoot_ACF_Compat::string( 'event_status', (int) $id ) ?? 'scheduled';
			if ( $status === 'cancelled' ) {
				$cancelled[] = (int) $id;
			} else {
				$updated[] = (int) $id;
			}
		}

		return [
			'updated'   => $updated,
			'cancelled' => $cancelled,
			'count'     => count( $all_ids ),
		];
	}

	/**
	 * Generic change detection for non-event post types using post_modified.
	 *
	 * @param string $post_type   CPT slug.
	 * @param string $since_mysql MySQL datetime string.
	 * @param string $key         Key name for changed IDs ('updated' or 'new').
	 */
	private function get_post_changes( string $post_type, string $since_mysql, string $key ): array {

		$query = new WP_Query( [
			'post_type'      => $post_type,
			'post_status'    => 'publish',
			'posts_per_page' => -1,
			'fields'         => 'ids',
			'date_query'     => [
				[
					'after'     => $since_mysql,
					'column'    => 'post_modified',
					'inclusive' => false,
				],
			],
		] );

		$ids = array_map( 'intval', $query->posts );

		return [
			$key    => $ids,
			'count' => count( $ids ),
		];
	}

	private function get_args(): array {
		return [
			'since' => [
				'description'       => 'Return changes after this ISO 8601 datetime.',
				'type'              => 'string',
				'required'          => true,
				'sanitize_callback' => 'sanitize_text_field',
			],
			'types' => [
				'description'       => 'Comma-separated list of content types to check.',
				'type'              => 'string',
				'sanitize_callback' => 'sanitize_text_field',
			],
		];
	}
}
