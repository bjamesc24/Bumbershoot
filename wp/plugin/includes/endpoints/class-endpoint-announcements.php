<?php
/**
 * Bumbershoot_Endpoint_Announcements
 *
 * GET /wp-json/bumbershoot/v1/announcements
 *
 * Returns all non-expired announcements, sorted with pinned items first,
 * then by published_at descending (newest first).
 *
 * Expiry is filtered server-side — the app never sees stale warnings.
 *
 * @package BumbershootFestival
 */

defined( 'ABSPATH' ) || exit;

class Bumbershoot_Endpoint_Announcements {

	public function __construct() {
		register_rest_route(
			Bumbershoot_API::NAMESPACE,
			'/announcements',
			[
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => [ $this, 'get_items' ],
				'permission_callback' => '__return_true',
				'args'                => $this->get_args(),
			]
		);
	}

	/**
	 * Endpoint handler.
	 */
	public function get_items( WP_REST_Request $request ): WP_REST_Response {

		$now_mysql = current_time( 'Y-m-d H:i:s' );
		$limit     = min( (int) ( $request->get_param( 'limit' ) ?? 50 ), 100 );

		$query_args = [
			'post_type'      => 'bumbershoot_announcement',
			'post_status'    => 'publish',
			'posts_per_page' => $limit,
			'orderby'        => 'date',
			'order'          => 'DESC',
			// Exclude expired announcements: either expires_at doesn't exist,
			// is empty, or is in the future.
			'meta_query'     => [
				'relation' => 'AND',
				[
					'relation' => 'OR',
					[
						'key'     => 'announcement_expires_at',
						'compare' => 'NOT EXISTS',
					],
					[
						'key'     => 'announcement_expires_at',
						'value'   => '',
						'compare' => '=',
					],
					[
						'key'     => 'announcement_expires_at',
						'value'   => $now_mysql,
						'compare' => '>',
						'type'    => 'DATETIME',
					],
				],
			],
		];

		// ── Filter: day ───────────────────────────────────────────────────────
		$day = $request->get_param( 'day' );
		if ( $day ) {
			$query_args['meta_query'][] = [
				'key'     => 'announcement_day',
				'value'   => sanitize_text_field( $day ),
				'compare' => '=',
			];
		}

		// ── Filter: type ──────────────────────────────────────────────────────
		$type = $request->get_param( 'type' );
		if ( $type ) {
			$query_args['meta_query'][] = [
				'key'     => 'announcement_type',
				'value'   => sanitize_text_field( $type ),
				'compare' => '=',
			];
		}

		// ── Filter: priority ──────────────────────────────────────────────────
		$priority = $request->get_param( 'priority' );
		if ( $priority ) {
			$query_args['meta_query'][] = [
				'key'     => 'announcement_priority',
				'value'   => sanitize_text_field( $priority ),
				'compare' => '=',
			];
		}

		// ── Filter: since ─────────────────────────────────────────────────────
		$since = $request->get_param( 'since' );
		if ( $since ) {
			$query_args['date_query'] = [
				[
					'after'     => sanitize_text_field( $since ),
					'column'    => 'post_date',
					'inclusive' => false,
				],
			];
		}

		$query         = new WP_Query( $query_args );
		$announcements = [];

		foreach ( $query->posts as $post ) {
			$announcements[] = Bumbershoot_Response_Formatter::announcement( $post );
		}

		// Sort: pinned items first, then by published_at DESC.
		// WP_Query can't sort by meta + date together cleanly, so we sort in PHP.
		usort( $announcements, static function ( array $a, array $b ): int {
			// Pinned items bubble to top.
			if ( $a['is_pinned'] !== $b['is_pinned'] ) {
				return $b['is_pinned'] <=> $a['is_pinned']; // true > false
			}
			// Within same pin-group, newest first.
			return strcmp( $b['published_at'] ?? '', $a['published_at'] ?? '' );
		} );

		// Last-Modified: most recently published announcement.
		$last_modified = null;
		if ( ! empty( $announcements ) ) {
			$dates = array_filter( array_column( $announcements, 'published_at' ) );
			if ( $dates ) {
				rsort( $dates );
				$last_modified = $dates[0];
			}
		}

		$data = [
			'generated_at'       => current_time( 'c' ),
			'announcement_count' => count( $announcements ),
			'announcements'      => $announcements,
		];

		$response = new WP_REST_Response( $data, 200 );

		return Bumbershoot_Cache_Headers::apply(
			$response,
			$request,
			Bumbershoot_Cache_Headers::SCHEDULE, // same cadence as schedule
			$last_modified
		);
	}

	private function get_args(): array {
		return [
			'day' => [
				'description'       => 'Filter by festival day.',
				'type'              => 'string',
				'enum'              => [ 'day-1', 'day-2', 'day-3', 'all-days', 'pre-festival' ],
				'sanitize_callback' => 'sanitize_text_field',
			],
			'type' => [
				'description'       => 'Filter by announcement type.',
				'type'              => 'string',
				'enum'              => [
					'schedule-change', 'cancellation', 'weather', 'entry',
					'transport', 'service', 'general', 'emergency',
				],
				'sanitize_callback' => 'sanitize_text_field',
			],
			'priority' => [
				'description'       => 'Filter by priority level.',
				'type'              => 'string',
				'enum'              => [ 'normal', 'important', 'urgent' ],
				'sanitize_callback' => 'sanitize_text_field',
			],
			'since' => [
				'description'       => 'Return only announcements published after this ISO 8601 timestamp.',
				'type'              => 'string',
				'sanitize_callback' => 'sanitize_text_field',
			],
			'limit' => [
				'description'       => 'Maximum results to return. Default 50, max 100.',
				'type'              => 'integer',
				'default'           => 50,
				'minimum'           => 1,
				'maximum'           => 100,
				'sanitize_callback' => 'absint',
			],
		];
	}
}
