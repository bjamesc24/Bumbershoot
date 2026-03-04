<?php
/**
 * Bumbershoot_Endpoint_Events
 *
 * GET /wp-json/bumbershoot/v1/events/{id}
 *
 * Returns the full detail record for a single event, including embedded
 * venue and artist objects. Called on-demand when a user taps an event.
 *
 * Cache TTL is longer than the schedule list (1 hour vs 30 minutes).
 * Events with a non-"scheduled" status get a short 5-minute TTL so that
 * changes propagate quickly to users who are already viewing the detail.
 *
 * @package BumbershootFestival
 */

defined( 'ABSPATH' ) || exit;

class Bumbershoot_Endpoint_Events {

	public function __construct() {
		register_rest_route(
			Bumbershoot_API::NAMESPACE,
			'/events/(?P<id>\d+)',
			[
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => [ $this, 'get_item' ],
				'permission_callback' => '__return_true',
				'args'                => [
					'id' => [
						'description'       => 'WordPress post ID of the event.',
						'type'              => 'integer',
						'required'          => true,
						'sanitize_callback' => 'absint',
					],
				],
			]
		);
	}

	/**
	 * Endpoint handler.
	 */
	public function get_item( WP_REST_Request $request ): WP_REST_Response {
		$id   = (int) $request->get_param( 'id' );
		$post = get_post( $id );

		// 404 if the post doesn't exist or is not a published event.
		if (
			! $post instanceof WP_Post ||
			$post->post_type !== 'bumbershoot_event' ||
			$post->post_status !== 'publish'
		) {
			return new WP_REST_Response(
				[ 'code' => 'not_found', 'message' => 'No published event found with that ID.' ],
				404
			);
		}

		$data     = Bumbershoot_Response_Formatter::event_detail( $post );
		$response = new WP_REST_Response( $data, 200 );

		// Use a shorter cache TTL for events that have changed status.
		$status        = $data['status'] ?? 'scheduled';
		$cache_control = ( $status !== 'scheduled' )
			? Bumbershoot_Cache_Headers::CHANGED_EVENT
			: Bumbershoot_Cache_Headers::EVENT_DETAIL;

		return Bumbershoot_Cache_Headers::apply(
			$response,
			$request,
			$cache_control,
			$data['last_changed'] ?? null
		);
	}
}
