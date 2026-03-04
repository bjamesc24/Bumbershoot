<?php
/**
 * Bumbershoot_Endpoint_Artists
 *
 * GET /wp-json/bumbershoot/v1/artists
 *
 * Returns all artist profiles. Sorted alphabetically by title.
 * Supports filtering by type, genre, headliner status, local flag, and keyword.
 *
 * @package BumbershootFestival
 */

defined( 'ABSPATH' ) || exit;

class Bumbershoot_Endpoint_Artists {

	public function __construct() {
		register_rest_route(
			Bumbershoot_API::NAMESPACE,
			'/artists',
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
			'post_type'      => 'bumbershoot_artist',
			'post_status'    => 'publish',
			'posts_per_page' => -1,
			'orderby'        => 'title',
			'order'          => 'ASC',
			'meta_query'     => [ 'relation' => 'AND' ],
		];

		// ── Filter: type ──────────────────────────────────────────────────────
		$type = $request->get_param( 'type' );
		if ( $type ) {
			$query_args['meta_query'][] = [
				'key'     => 'artist_type',
				'value'   => sanitize_text_field( $type ),
				'compare' => '=',
			];
		}

		// ── Filter: genre ─────────────────────────────────────────────────────
		$genre = $request->get_param( 'genre' );
		if ( $genre ) {
			$query_args['meta_query'][] = [
				'key'     => 'artist_genre',
				'value'   => sanitize_text_field( $genre ),
				'compare' => '=',
			];
		}

		// ── Filter: headliners_only ───────────────────────────────────────────
		if ( $request->get_param( 'headliners_only' ) ) {
			$query_args['meta_query'][] = [
				'key'   => 'artist_is_headliner',
				'value' => '1',
			];
		}

		// ── Filter: local_only ────────────────────────────────────────────────
		if ( $request->get_param( 'local_only' ) ) {
			$query_args['meta_query'][] = [
				'key'   => 'artist_is_local',
				'value' => '1',
			];
		}

		// ── Filter: keyword search ────────────────────────────────────────────
		$q = $request->get_param( 'q' );
		if ( $q ) {
			$query_args['s'] = sanitize_text_field( $q );
		}

		$query   = new WP_Query( $query_args );
		$artists = [];

		foreach ( $query->posts as $post ) {
			$artists[] = Bumbershoot_Response_Formatter::artist( $post );
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
			'artist_count' => count( $artists ),
			'artists'      => $artists,
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
				'description'       => 'Filter by artist type.',
				'type'              => 'string',
				'enum'              => [ 'musician', 'dj', 'comedian', 'visual-artist', 'speaker', 'performer' ],
				'sanitize_callback' => 'sanitize_text_field',
			],
			'genre' => [
				'description'       => 'Filter by genre.',
				'type'              => 'string',
				'enum'              => [
					'indie-rock', 'hip-hop', 'electronic', 'r-and-b', 'pop',
					'folk', 'jazz', 'classical', 'world', 'comedy',
					'visual-art', 'mixed-media', 'other',
				],
				'sanitize_callback' => 'sanitize_text_field',
			],
			'headliners_only' => [
				'description' => 'Return only headliner artists.',
				'type'        => 'boolean',
				'default'     => false,
			],
			'local_only' => [
				'description' => 'Return only Washington State / Pacific NW artists.',
				'type'        => 'boolean',
				'default'     => false,
			],
			'q' => [
				'description'       => 'Keyword search across artist name and short bio.',
				'type'              => 'string',
				'sanitize_callback' => 'sanitize_text_field',
			],
		];
	}
}
