<?php
/**
 * Bumbershoot Festival Companion — ACF Field Registration: Venues
 *
 * Registers the ACF field group "Venue Details" for the bumbershoot_venue post type.
 * Fields mirror the schema defined in post-types/venues.md.
 *
 * @package BumbershootFestival
 * @version 1.0.0
 */

defined( 'ABSPATH' ) || exit;

add_action( 'acf/init', 'bumbershoot_register_venue_fields' );

function bumbershoot_register_venue_fields(): void {
	if ( ! function_exists( 'acf_add_local_field_group' ) ) {
		return;
	}

	acf_add_local_field_group( [
		'key'    => 'group_bumbershoot_venue',
		'title'  => 'Venue Details',
		'fields' => [

			// ── IDENTITY ─────────────────────────────────────────────────────

			[
				'key'      => 'field_venue_type',
				'label'    => 'Venue Type',
				'name'     => 'venue_type',
				'type'     => 'select',
				'required' => 1,
				'choices'  => [
					'main-stage'      => 'Main Stage',
					'secondary-stage' => 'Secondary Stage',
					'gallery'         => 'Gallery / Exhibition',
					'food-area'       => 'Food & Drink Area',
					'info-booth'      => 'Info Booth',
					'first-aid'       => 'First Aid Station',
					'restrooms'       => 'Restrooms',
					'entry-point'     => 'Entry / Gate',
					'water-station'   => 'Water Station',
					'merch'           => 'Merchandise',
					'parking'         => 'Parking / Transit',
					'other'           => 'Other POI',
				],
				'allow_null'    => 0,
				'return_format' => 'value',
			],
			[
				'key'          => 'field_venue_short_name',
				'label'        => 'Short Name',
				'name'         => 'venue_short_name',
				'type'         => 'text',
				'required'     => 1,
				'instructions' => 'Used on map pin labels. Max 20 characters.',
				'maxlength'    => 20,
			],

			// ── COORDINATES ──────────────────────────────────────────────────

			[
				'key'          => 'field_venue_lat',
				'label'        => 'Latitude',
				'name'         => 'venue_lat',
				'type'         => 'number',
				'required'     => 1,
				'instructions' => 'Decimal degrees. e.g. 47.6203. Verify against Seattle Center site map.',
				'step'         => 'any',
				'min'          => 47.6,
				'max'          => 47.65,
			],
			[
				'key'          => 'field_venue_lng',
				'label'        => 'Longitude',
				'name'         => 'venue_lng',
				'type'         => 'number',
				'required'     => 1,
				'instructions' => 'Decimal degrees. e.g. -122.3500. Verify against Seattle Center site map.',
				'step'         => 'any',
				'min'          => -122.40,
				'max'          => -122.32,
			],
			[
				'key'          => 'field_venue_map_zoom',
				'label'        => 'Map Zoom Level',
				'name'         => 'venue_map_zoom',
				'type'         => 'number',
				'required'     => 0,
				'instructions' => 'Suggested map zoom when this venue is focused. Default 16. Range 14–18.',
				'default_value'=> 16,
				'min'          => 14,
				'max'          => 18,
				'step'         => 1,
			],
			[
				'key'          => 'field_venue_area_note',
				'label'        => 'Area Note',
				'name'         => 'venue_area_note',
				'type'         => 'text',
				'required'     => 0,
				'instructions' => 'Human-readable location hint shown to users. e.g. "Near the International Fountain, south lawn."',
			],

			// ── CAPACITY & ACCESSIBILITY ─────────────────────────────────────

			[
				'key'          => 'field_venue_capacity',
				'label'        => 'Estimated Capacity',
				'name'         => 'venue_capacity',
				'type'         => 'number',
				'required'     => 0,
				'instructions' => 'Rough capacity. Leave blank for non-stage venues.',
				'min'          => 0,
				'step'         => 1,
			],
			[
				'key'          => 'field_venue_is_accessible',
				'label'        => 'Is Accessible',
				'name'         => 'venue_is_accessible',
				'type'         => 'true_false',
				'required'     => 1,
				'instructions' => 'ADA / wheelchair accessible.',
				'default_value'=> 1,
				'ui'           => 1,
				'ui_on_text'   => 'Yes',
				'ui_off_text'  => 'No',
			],
			[
				'key'          => 'field_venue_accessibility_notes',
				'label'        => 'Accessibility Notes',
				'name'         => 'venue_accessibility_notes',
				'type'         => 'textarea',
				'required'     => 0,
				'instructions' => 'Specific accessibility detail. e.g. "Dedicated ADA viewing area on the east side."',
				'rows'         => 3,
			],

			// ── OPERATIONAL ──────────────────────────────────────────────────

			[
				'key'          => 'field_venue_amenities',
				'label'        => 'Amenities',
				'name'         => 'venue_amenities',
				'type'         => 'checkbox',
				'required'     => 0,
				'instructions' => 'Amenities at or near this venue.',
				'choices'      => [
					'restrooms'   => 'Restrooms',
					'water-station' => 'Water Station',
					'first-aid'   => 'First Aid Nearby',
					'food-nearby' => 'Food / Drink Nearby',
					'merch'       => 'Merchandise',
				],
				'return_format' => 'value',
				'layout'        => 'vertical',
			],
			[
				'key'          => 'field_venue_is_active',
				'label'        => 'Is Active',
				'name'         => 'venue_is_active',
				'type'         => 'true_false',
				'required'     => 1,
				'instructions' => 'Set to No to hide this venue from the app without deleting it.',
				'default_value'=> 1,
				'ui'           => 1,
				'ui_on_text'   => 'Active',
				'ui_off_text'  => 'Hidden',
			],
		],

		'location' => [
			[
				[
					'param'    => 'post_type',
					'operator' => '==',
					'value'    => 'bumbershoot_venue',
				],
			],
		],
		'menu_order'            => 0,
		'position'              => 'normal',
		'style'                 => 'default',
		'label_placement'       => 'top',
		'instruction_placement' => 'label',
		'active'                => true,
		'description'           => 'Location, map, and accessibility fields for festival venues and POIs.',
	] );
}
