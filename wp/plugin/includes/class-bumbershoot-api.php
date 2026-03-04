<?php
/**
 * Bumbershoot_API
 *
 * Registers all REST routes under the bumbershoot/v1 namespace.
 * Each route delegates to a dedicated endpoint class.
 *
 * @package BumbershootFestival
 */

defined( 'ABSPATH' ) || exit;

class Bumbershoot_API {

	const NAMESPACE = 'bumbershoot/v1';

	/**
	 * Called on rest_api_init. Instantiates each endpoint class, which
	 * self-registers its route inside its constructor.
	 */
	public static function register_routes(): void {
		new Bumbershoot_Endpoint_Schedule();
		new Bumbershoot_Endpoint_Events();
		new Bumbershoot_Endpoint_Venues();
		new Bumbershoot_Endpoint_Artists();
		new Bumbershoot_Endpoint_Vendors();
		new Bumbershoot_Endpoint_Announcements();
		new Bumbershoot_Endpoint_Changes();
	}
}
