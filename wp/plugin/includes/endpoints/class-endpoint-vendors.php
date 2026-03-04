<?php
/**
 * Bumbershoot_Endpoint_Vendors
 *
 * GET /wp-json/bumbershoot/v1/vendors
 *
 * Returns all active vendors and booths. Only posts where vendor_is_active
 * is true are included. Supports filtering by type, day, dietary options,
 * accessibility, and keyword.
 *
 * @package BumbershootFestival
 */

defined( 'ABSPATH' ) || exit;

class Bumbershoot_Endpoint_Vendors {

	public function __construct() {
		register_rest_route(
			Bumbershoot_API::NAMESPACE,
			'/vendors',
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
			'post_type'      => 'bumbershoot_vendor',
			'post_status'    => 'publish',
			'posts_per_page' => -1,
			'orderby'        => 'title',
			'order'          => 'ASC',
			'meta_query'     => [
				'relation' => 'AND',
				// Always filter to active vendors only.
				[
					'key'   => 'vendor_is_active',
					'value' => '1',
				],
			],
		];

		// ── Filter: type ──────────────────────────────────────────────────────
		$type = $request->get_param( 'type' );
		if ( $type ) {
			$query_args['meta_query'][] = [
				'key'     => 'vendor_type',
				'value'   => sanitize_text_field( $type ),
				'compare' => '=',
			];
		}

		// ── Filter: day ───────────────────────────────────────────────────────
		// ACF checkbox arrays are serialised in the DB; LIKE against the
		// serialised string is the standard WP approach for array meta queries.
		$day = $request->get_param( 'day' );
		if ( $day ) {
			$query_args['meta_query'][] = [
				'key'     => 'vendor_days_active',
				'value'   => '"' . sanitize_text_field( $day ) . '"',
				'compare' => 'LIKE',
			];
		}

		// ── Filter: dietary ───────────────────────────────────────────────────
		$dietary = $request->get_param( 'dietary' );
		if ( $dietary ) {
			$query_args['meta_query'][] = [
				'key'     => 'vendor_dietary_options',
				'value'   => '"' . sanitize_text_field( $dietary ) . '"',
				'compare' => 'LIKE',
			];
		}

		// ── Filter: accessible_only ───────────────────────────────────────────
		if ( $request->get_param( 'accessible_only' ) ) {
			$query_args['meta_query'][] = [
				'key'   => 'vendor_is_accessible',
				'value' => '1',
			];
		}

		// ── Filter: keyword search ────────────────────────────────────────────
		$q = $request->get_param( 'q' );
		if ( $q ) {
			$query_args['s'] = sanitize_text_field( $q );
		}

		$query   = new WP_Query( $query_args );
		$vendors = [];

		foreach ( $query->posts as $post ) {
			$vendors[] = Bumbershoot_Response_Formatter::vendor( $post );
		}

		// Last-Modified from most recently updated post.
		$last_modified = null;
		if ( ! empty( $query->posts ) ) {
			$dates = wp_list_pluck( $query->posts, 'post_modified' );
			rsort( $dates );
			$last_modified = Bumbershoot_ACF_Compat::format_datetime( $dates[0] );
		}

		$data = [
			'generated_at' => current_time( 'c' ),
			'vendor_count' => count( $vendors ),
			'vendors'      => $vendors,
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
				'description'       => 'Filter by vendor type.',
				'type'              => 'string',
				'enum'              => [
					'food', 'beverage', 'merchandise', 'artist-merch',
					'art-vendor', 'sponsor-activation', 'nonprofit', 'info', 'other',
				],
				'sanitize_callback' => 'sanitize_text_field',
			],
			'day' => [
				'description'       => 'Filter by active festival day.',
				'type'              => 'string',
				'enum'              => [ 'day-1', 'day-2', 'day-3' ],
				'sanitize_callback' => 'sanitize_text_field',
			],
			'dietary' => [
				'description'       => 'Filter food vendors by dietary option.',
				'type'              => 'string',
				'enum'              => [ 'vegan', 'vegetarian', 'gluten-free', 'halal', 'kosher' ],
				'sanitize_callback' => 'sanitize_text_field',
			],
			'accessible_only' => [
				'description' => 'Return only accessible vendors.',
				'type'        => 'boolean',
				'default'     => false,
			],
			'q' => [
				'description'       => 'Keyword search across vendor name and description.',
				'type'              => 'string',
				'sanitize_callback' => 'sanitize_text_field',
			],
		];
	}
}
