<?php
/**
 * Bumbershoot_Endpoint_Schedule
 *
 * GET /wp-json/bumbershoot/v1/schedule
 *
 * Returns all published events in minimal shape, sorted by start_time ASC.
 * Supports filtering by day, stage (venue slug), category, keyword, and
 * a `since` timestamp for lightweight change polling.
 *
 * @package BumbershootFestival
 */

defined( 'ABSPATH' ) || exit;

class Bumbershoot_Endpoint_Schedule {

	public function __construct() {
		register_rest_route(
			Bumbershoot_API::NAMESPACE,
			'/schedule',
			[
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => [ $this, 'get_items' ],
				'permission_callback' => '__return_true', // public endpoint
				'args'                => $this->get_args(),
			]
		);
	}

	/**
	 * Endpoint handler.
	 */
	public function get_items( WP_REST_Request $request ): WP_REST_Response {

		$query_args = [
			'post_type'      => 'bumbershoot_event',
			'post_status'    => 'publish',
			'posts_per_page' => -1,
			'orderby'        => 'meta_value',
			'meta_key'       => 'event_start_time',
			'order'          => 'ASC',
			'meta_query'     => [ 'relation' => 'AND' ],
		];

		// ── Filter: day ───────────────────────────────────────────────────────
		$day = $request->get_param( 'day' );
		if ( $day ) {
			$query_args['meta_query'][] = [
				'key'     => 'event_day',
				'value'   => sanitize_text_field( $day ),
				'compare' => '=',
			];
		}

		// ── Filter: stage (venue slug) ────────────────────────────────────────
		$stage = $request->get_param( 'stage' );
		if ( $stage ) {
			$venue = get_page_by_path( sanitize_text_field( $stage ), OBJECT, 'bumbershoot_venue' );
			if ( $venue instanceof WP_Post ) {
				$query_args['meta_query'][] = [
					'key'   => 'event_venue',
					'value' => $venue->ID,
				];
			} else {
				// Unknown stage slug — return empty result set cleanly.
				return $this->build_response( [], $request );
			}
		}

		// ── Filter: category ──────────────────────────────────────────────────
		$category = $request->get_param( 'category' );
		if ( $category ) {
			$query_args['meta_query'][] = [
				'key'     => 'event_category',
				'value'   => sanitize_text_field( $category ),
				'compare' => '=',
			];
		}

		// ── Filter: keyword search ────────────────────────────────────────────
		$q = $request->get_param( 'q' );
		if ( $q ) {
			$query_args['s'] = sanitize_text_field( $q );
		}

		// ── Filter: since (change-polling lightweight mode) ───────────────────
		$since = $request->get_param( 'since' );
		if ( $since ) {
			$since_mysql = Bumbershoot_ACF_Compat::to_mysql_datetime( sanitize_text_field( $since ) );
			if ( $since_mysql ) {
				$query_args['meta_query'][] = [
					'key'     => 'event_last_changed',
					'value'   => $since_mysql,
					'compare' => '>',
					'type'    => 'DATETIME',
				];
			}
		}

		$query  = new WP_Query( $query_args );
		$events = [];

		foreach ( $query->posts as $post ) {
			$events[] = Bumbershoot_Response_Formatter::event_summary( $post );
		}

		return $this->build_response( $events, $request );
	}

	/**
	 * Wraps event array in the standard response envelope and applies cache headers.
	 */
	private function build_response( array $events, WP_REST_Request $request ): WP_REST_Response {
		// Determine Last-Modified from the most recently changed event.
		$last_modified = null;
		if ( ! empty( $events ) ) {
			$timestamps = array_filter( array_column( $events, 'last_changed' ) );
			if ( $timestamps ) {
				rsort( $timestamps );
				$last_modified = $timestamps[0];
			}
		}

		$data = [
			'generated_at' => current_time( 'c' ),
			'event_count'  => count( $events ),
			'events'       => $events,
		];

		$response = new WP_REST_Response( $data, 200 );

		return Bumbershoot_Cache_Headers::apply(
			$response,
			$request,
			Bumbershoot_Cache_Headers::SCHEDULE,
			$last_modified
		);
	}

	/**
	 * Declares and validates accepted query parameters.
	 */
	private function get_args(): array {
		$day_enum = [ 'day-1', 'day-2', 'day-3' ];

		return [
			'day' => [
				'description'       => 'Filter by festival day.',
				'type'              => 'string',
				'enum'              => $day_enum,
				'sanitize_callback' => 'sanitize_text_field',
				'validate_callback' => function ( $v ) use ( $day_enum ) {
					return in_array( $v, $day_enum, true );
				},
			],
			'stage' => [
				'description'       => 'Filter by venue slug.',
				'type'              => 'string',
				'sanitize_callback' => 'sanitize_title',
			],
			'category' => [
				'description'       => 'Filter by event category.',
				'type'              => 'string',
				'enum'              => [
					'music', 'comedy', 'visual-art', 'performance-art',
					'panel', 'workshop', 'family', 'other',
				],
				'sanitize_callback' => 'sanitize_text_field',
			],
			'q' => [
				'description'       => 'Keyword search across title and description.',
				'type'              => 'string',
				'sanitize_callback' => 'sanitize_text_field',
			],
			'since' => [
				'description'       => 'Return events changed after this ISO 8601 timestamp.',
				'type'              => 'string',
				'sanitize_callback' => 'sanitize_text_field',
			],
		];
	}
}
