<?php
/**
 * Bumbershoot_Endpoint_Venues
 *
 * GET /wp-json/bumbershoot/v1/venues
 *
 * Returns all active venues and POIs. Only posts where venue_is_active is
 * true are included. Venue data is mostly static — 24-hour cache TTL.
 *
 * @package BumbershootFestival
 */

defined( 'ABSPATH' ) || exit;

class Bumbershoot_Endpoint_Venues {

	public function __construct() {
		register_rest_route(
			Bumbershoot_API::NAMESPACE,
			'/venues',
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

		$query_args = [
			'post_type'      => 'bumbershoot_venue',
			'post_status'    => 'publish',
			'posts_per_page' => -1,
			'orderby'        => 'title',
			'order'          => 'ASC',
			'meta_query'     => [
				'relation' => 'AND',
				// Always filter to active venues only.
				[
					'key'   => 'venue_is_active',
					'value' => '1',
				],
			],
		];

		// ── Filter: type ──────────────────────────────────────────────────────
		$type = $request->get_param( 'type' );
		if ( $type ) {
			$query_args['meta_query'][] = [
				'key'     => 'venue_type',
				'value'   => sanitize_text_field( $type ),
				'compare' => '=',
			];
		}

		// ── Filter: accessible_only ───────────────────────────────────────────
		if ( $request->get_param( 'accessible_only' ) ) {
			$query_args['meta_query'][] = [
				'key'   => 'venue_is_accessible',
				'value' => '1',
			];
		}

		$query  = new WP_Query( $query_args );
		$venues = [];

		foreach ( $query->posts as $post ) {
			$venues[] = Bumbershoot_Response_Formatter::venue( $post );
		}

		// Last-Modified: most recently changed venue post.
		$last_modified = null;
		if ( ! empty( $query->posts ) ) {
			$dates = wp_list_pluck( $query->posts, 'post_modified' );
			rsort( $dates );
			$last_modified = Bumbershoot_ACF_Compat::format_datetime( $dates[0] );
		}

		$data = [
			'generated_at' => current_time( 'c' ),
			'venue_count'  => count( $venues ),
			'venues'       => $venues,
		];

		$response = new WP_REST_Response( $data, 200 );

		return Bumbershoot_Cache_Headers::apply(
			$response,
			$request,
			Bumbershoot_Cache_Headers::STATIC_DATA,
			$last_modified
		);
	}

	private function get_args(): array {
		return [
			'type' => [
				'description'       => 'Filter by venue type.',
				'type'              => 'string',
				'enum'              => [
					'main-stage', 'secondary-stage', 'gallery', 'food-area',
					'info-booth', 'first-aid', 'restrooms', 'entry-point',
					'water-station', 'merch', 'parking', 'other',
				],
				'sanitize_callback' => 'sanitize_text_field',
			],
			'accessible_only' => [
				'description' => 'Return only accessible venues.',
				'type'        => 'boolean',
				'default'     => false,
			],
		];
	}
}
