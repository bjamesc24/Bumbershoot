<?php
/**
 * Bumbershoot Festival Companion — Custom Post Type Registration
 *
 * Registers all five custom post types used by the festival app:
 *   - bumbershoot_event
 *   - bumbershoot_venue
 *   - bumbershoot_announcement
 *   - bumbershoot_artist
 *   - bumbershoot_vendor
 *
 * Usage: Include or require this file from your theme's functions.php,
 *        or place it inside a dedicated mu-plugin or site plugin.
 *
 * @package BumbershootFestival
 * @version 1.0.0
 */

defined( 'ABSPATH' ) || exit;

// ─────────────────────────────────────────────────────────────────────────────
// Hook all registrations onto init
// ─────────────────────────────────────────────────────────────────────────────

add_action( 'init', 'bumbershoot_register_post_types', 0 );

function bumbershoot_register_post_types(): void {
	bumbershoot_register_event_cpt();
	bumbershoot_register_venue_cpt();
	bumbershoot_register_announcement_cpt();
	bumbershoot_register_artist_cpt();
	bumbershoot_register_vendor_cpt();
}


// ─────────────────────────────────────────────────────────────────────────────
// EVENT
// ─────────────────────────────────────────────────────────────────────────────

function bumbershoot_register_event_cpt(): void {
	$labels = [
		'name'               => 'Events',
		'singular_name'      => 'Event',
		'menu_name'          => 'Events',
		'add_new'            => 'Add New',
		'add_new_item'       => 'Add New Event',
		'edit_item'          => 'Edit Event',
		'new_item'           => 'New Event',
		'view_item'          => 'View Event',
		'search_items'       => 'Search Events',
		'not_found'          => 'No events found',
		'not_found_in_trash' => 'No events found in Trash',
	];

	$args = [
		'labels'              => $labels,
		'public'              => true,
		'publicly_queryable'  => true,
		'show_ui'             => true,
		'show_in_menu'        => true,
		'show_in_rest'        => true,           // required for Gutenberg + REST API access
		'rest_base'           => 'bumbershoot-events',
		'query_var'           => true,
		'rewrite'             => [ 'slug' => 'events' ],
		'capability_type'     => 'post',
		'has_archive'         => false,
		'hierarchical'        => false,
		'menu_position'       => 5,
		'menu_icon'           => 'dashicons-calendar-alt',
		'supports'            => [ 'title', 'editor', 'thumbnail', 'revisions' ],
	];

	register_post_type( 'bumbershoot_event', $args );
}


// ─────────────────────────────────────────────────────────────────────────────
// VENUE
// ─────────────────────────────────────────────────────────────────────────────

function bumbershoot_register_venue_cpt(): void {
	$labels = [
		'name'               => 'Venues',
		'singular_name'      => 'Venue',
		'menu_name'          => 'Venues',
		'add_new'            => 'Add New',
		'add_new_item'       => 'Add New Venue',
		'edit_item'          => 'Edit Venue',
		'new_item'           => 'New Venue',
		'view_item'          => 'View Venue',
		'search_items'       => 'Search Venues',
		'not_found'          => 'No venues found',
		'not_found_in_trash' => 'No venues found in Trash',
	];

	$args = [
		'labels'             => $labels,
		'public'             => true,
		'publicly_queryable' => true,
		'show_ui'            => true,
		'show_in_menu'       => true,
		'show_in_rest'       => true,
		'rest_base'          => 'bumbershoot-venues',
		'query_var'          => true,
		'rewrite'            => [ 'slug' => 'venues' ],
		'capability_type'    => 'post',
		'has_archive'        => false,
		'hierarchical'       => false,
		'menu_position'      => 6,
		'menu_icon'          => 'dashicons-location-alt',
		'supports'           => [ 'title', 'editor', 'thumbnail', 'revisions' ],
	];

	register_post_type( 'bumbershoot_venue', $args );
}


// ─────────────────────────────────────────────────────────────────────────────
// ANNOUNCEMENT
// ─────────────────────────────────────────────────────────────────────────────

function bumbershoot_register_announcement_cpt(): void {
	$labels = [
		'name'               => 'Announcements',
		'singular_name'      => 'Announcement',
		'menu_name'          => 'Announcements',
		'add_new'            => 'Add New',
		'add_new_item'       => 'Add New Announcement',
		'edit_item'          => 'Edit Announcement',
		'new_item'           => 'New Announcement',
		'view_item'          => 'View Announcement',
		'search_items'       => 'Search Announcements',
		'not_found'          => 'No announcements found',
		'not_found_in_trash' => 'No announcements found in Trash',
	];

	$args = [
		'labels'             => $labels,
		'public'             => true,
		'publicly_queryable' => true,
		'show_ui'            => true,
		'show_in_menu'       => true,
		'show_in_rest'       => true,
		'rest_base'          => 'bumbershoot-announcements',
		'query_var'          => true,
		'rewrite'            => [ 'slug' => 'announcements' ],
		'capability_type'    => 'post',
		'has_archive'        => false,
		'hierarchical'       => false,
		'menu_position'      => 7,
		'menu_icon'          => 'dashicons-megaphone',
		'supports'           => [ 'title', 'editor', 'thumbnail', 'revisions' ],
	];

	register_post_type( 'bumbershoot_announcement', $args );
}


// ─────────────────────────────────────────────────────────────────────────────
// ARTIST
// ─────────────────────────────────────────────────────────────────────────────

function bumbershoot_register_artist_cpt(): void {
	$labels = [
		'name'               => 'Artists',
		'singular_name'      => 'Artist',
		'menu_name'          => 'Artists',
		'add_new'            => 'Add New',
		'add_new_item'       => 'Add New Artist',
		'edit_item'          => 'Edit Artist',
		'new_item'           => 'New Artist',
		'view_item'          => 'View Artist',
		'search_items'       => 'Search Artists',
		'not_found'          => 'No artists found',
		'not_found_in_trash' => 'No artists found in Trash',
	];

	$args = [
		'labels'             => $labels,
		'public'             => true,
		'publicly_queryable' => true,
		'show_ui'            => true,
		'show_in_menu'       => true,
		'show_in_rest'       => true,
		'rest_base'          => 'bumbershoot-artists',
		'query_var'          => true,
		'rewrite'            => [ 'slug' => 'artists' ],
		'capability_type'    => 'post',
		'has_archive'        => false,
		'hierarchical'       => false,
		'menu_position'      => 8,
		'menu_icon'          => 'dashicons-groups',
		'supports'           => [ 'title', 'editor', 'thumbnail', 'revisions' ],
	];

	register_post_type( 'bumbershoot_artist', $args );
}


// ─────────────────────────────────────────────────────────────────────────────
// VENDOR
// ─────────────────────────────────────────────────────────────────────────────

function bumbershoot_register_vendor_cpt(): void {
	$labels = [
		'name'               => 'Vendors',
		'singular_name'      => 'Vendor',
		'menu_name'          => 'Vendors',
		'add_new'            => 'Add New',
		'add_new_item'       => 'Add New Vendor',
		'edit_item'          => 'Edit Vendor',
		'new_item'           => 'New Vendor',
		'view_item'          => 'View Vendor',
		'search_items'       => 'Search Vendors',
		'not_found'          => 'No vendors found',
		'not_found_in_trash' => 'No vendors found in Trash',
	];

	$args = [
		'labels'             => $labels,
		'public'             => true,
		'publicly_queryable' => true,
		'show_ui'            => true,
		'show_in_menu'       => true,
		'show_in_rest'       => true,
		'rest_base'          => 'bumbershoot-vendors',
		'query_var'          => true,
		'rewrite'            => [ 'slug' => 'vendors' ],
		'capability_type'    => 'post',
		'has_archive'        => false,
		'hierarchical'       => false,
		'menu_position'      => 9,
		'menu_icon'          => 'dashicons-store',
		'supports'           => [ 'title', 'editor', 'thumbnail', 'revisions' ],
	];

	register_post_type( 'bumbershoot_vendor', $args );
}
