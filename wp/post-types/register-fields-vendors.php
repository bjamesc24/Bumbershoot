<?php
/**
 * Bumbershoot Festival Companion — ACF Field Registration: Vendors
 *
 * Registers the ACF field group "Vendor Details" for the bumbershoot_vendor post type.
 * Fields mirror the schema defined in post-types/vendors.md.
 *
 * @package BumbershootFestival
 * @version 1.0.0
 */

defined( 'ABSPATH' ) || exit;

add_action( 'acf/init', 'bumbershoot_register_vendor_fields' );

function bumbershoot_register_vendor_fields(): void {
	if ( ! function_exists( 'acf_add_local_field_group' ) ) {
		return;
	}

	acf_add_local_field_group( [
		'key'    => 'group_bumbershoot_vendor',
		'title'  => 'Vendor Details',
		'fields' => [

			// ── IDENTITY ─────────────────────────────────────────────────────

			[
				'key'      => 'field_vendor_type',
				'label'    => 'Vendor Type',
				'name'     => 'vendor_type',
				'type'     => 'select',
				'required' => 1,
				'choices'  => [
					'food'               => 'Food Vendor',
					'beverage'           => 'Beverage / Bar',
					'merchandise'        => 'Merchandise (Festival)',
					'artist-merch'       => 'Artist Merchandise',
					'art-vendor'         => 'Art Vendor / Gallery',
					'sponsor-activation' => 'Sponsor Activation',
					'nonprofit'          => 'Nonprofit / Community',
					'info'               => 'Information / Services',
					'other'              => 'Other',
				],
				'allow_null'    => 0,
				'return_format' => 'value',
			],
			[
				'key'          => 'field_vendor_booth_name',
				'label'        => 'Booth / Location Name',
				'name'         => 'vendor_booth_name',
				'type'         => 'text',
				'required'     => 0,
				'instructions' => 'Specific booth label shown on map. e.g. "Food Court Row A, Booth 3".',
			],
			[
				'key'          => 'field_vendor_description_short',
				'label'        => 'Short Description',
				'name'         => 'vendor_description_short',
				'type'         => 'textarea',
				'required'     => 1,
				'instructions' => 'Max 200 characters. Used in list and map popup.',
				'rows'         => 3,
				'maxlength'    => 200,
			],
			[
				'key'          => 'field_vendor_description_full',
				'label'        => 'Full Description',
				'name'         => 'vendor_description_full',
				'type'         => 'wysiwyg',
				'required'     => 0,
				'tabs'         => 'all',
				'toolbar'      => 'basic',
				'media_upload' => 0,
			],

			// ── FOOD-SPECIFIC ────────────────────────────────────────────────

			[
				'key'   => 'field_vendor_food_tab',
				'label' => 'Food Details',
				'name'  => 'vendor_food_tab',
				'type'  => 'tab',
			],
			[
				'key'          => 'field_vendor_cuisine',
				'label'        => 'Cuisine Type',
				'name'         => 'vendor_cuisine',
				'type'         => 'text',
				'required'     => 0,
				'instructions' => 'Food vendors only. e.g. "Thai street food", "Hawaiian-Korean fusion", "Vegan".',
			],
			[
				'key'      => 'field_vendor_dietary_options',
				'label'    => 'Dietary Options',
				'name'     => 'vendor_dietary_options',
				'type'     => 'checkbox',
				'required' => 0,
				'choices'  => [
					'vegan'       => 'Vegan',
					'vegetarian'  => 'Vegetarian',
					'gluten-free' => 'Gluten-Free',
					'halal'       => 'Halal',
					'kosher'      => 'Kosher',
				],
				'return_format' => 'value',
				'layout'        => 'horizontal',
			],
			[
				'key'      => 'field_vendor_price_range',
				'label'    => 'Approximate Price Range',
				'name'     => 'vendor_price_range',
				'type'     => 'select',
				'required' => 0,
				'choices'  => [
					'$'   => '$ — Budget-friendly',
					'$$'  => '$$ — Mid-range',
					'$$$' => '$$$ — Premium',
				],
				'allow_null'    => 1,
				'return_format' => 'value',
			],

			// ── OPERATIONAL ──────────────────────────────────────────────────

			[
				'key'   => 'field_vendor_ops_tab',
				'label' => 'Operations',
				'name'  => 'vendor_ops_tab',
				'type'  => 'tab',
			],
			[
				'key'          => 'field_vendor_hours',
				'label'        => 'Operating Hours',
				'name'         => 'vendor_hours',
				'type'         => 'textarea',
				'required'     => 0,
				'instructions' => 'Plain text. e.g. "Day 1–3: 11:00 AM – 9:00 PM".',
				'rows'         => 3,
			],
			[
				'key'      => 'field_vendor_payment_methods',
				'label'    => 'Payment Methods',
				'name'     => 'vendor_payment_methods',
				'type'     => 'checkbox',
				'required' => 0,
				'choices'  => [
					'cash'        => 'Cash',
					'card'        => 'Credit / Debit Card',
					'mobile-pay'  => 'Mobile Pay (Apple Pay, Google Pay)',
				],
				'return_format' => 'value',
				'layout'        => 'horizontal',
			],
			[
				'key'          => 'field_vendor_is_accessible',
				'label'        => 'Is Accessible',
				'name'         => 'vendor_is_accessible',
				'type'         => 'true_false',
				'required'     => 1,
				'instructions' => 'Booth is accessible to wheelchair users.',
				'default_value'=> 1,
				'ui'           => 1,
				'ui_on_text'   => 'Yes',
				'ui_off_text'  => 'No',
			],
			[
				'key'      => 'field_vendor_days_active',
				'label'    => 'Festival Days Active',
				'name'     => 'vendor_days_active',
				'type'     => 'checkbox',
				'required' => 1,
				'choices'  => [
					'day-1' => 'Day 1 — Saturday Aug 30',
					'day-2' => 'Day 2 — Sunday Aug 31',
					'day-3' => 'Day 3 — Monday Sep 1',
				],
				'return_format' => 'value',
				'layout'        => 'horizontal',
			],
			[
				'key'          => 'field_vendor_is_active',
				'label'        => 'Is Active',
				'name'         => 'vendor_is_active',
				'type'         => 'true_false',
				'required'     => 1,
				'instructions' => 'Set to No to hide this vendor from the app without deleting it.',
				'default_value'=> 1,
				'ui'           => 1,
				'ui_on_text'   => 'Active',
				'ui_off_text'  => 'Hidden',
			],

			// ── LOCATION ─────────────────────────────────────────────────────

			[
				'key'   => 'field_vendor_location_tab',
				'label' => 'Map Location',
				'name'  => 'vendor_location_tab',
				'type'  => 'tab',
			],
			[
				'key'           => 'field_vendor_venue',
				'label'         => 'Venue / Zone',
				'name'          => 'vendor_venue',
				'type'          => 'post_object',
				'required'      => 0,
				'instructions'  => 'The festival zone or area this vendor is in. Used for map grouping if exact coordinates are not set.',
				'post_type'     => [ 'bumbershoot_venue' ],
				'return_format' => 'id',
				'allow_null'    => 1,
				'multiple'      => 0,
				'ui'            => 1,
			],
			[
				'key'          => 'field_vendor_lat',
				'label'        => 'Exact Latitude',
				'name'         => 'vendor_lat',
				'type'         => 'number',
				'required'     => 0,
				'instructions' => 'Optional. Only set if this vendor needs its own map pin separate from the zone.',
				'step'         => 'any',
			],
			[
				'key'          => 'field_vendor_lng',
				'label'        => 'Exact Longitude',
				'name'         => 'vendor_lng',
				'type'         => 'number',
				'required'     => 0,
				'instructions' => 'Optional. Only set if this vendor needs its own map pin separate from the zone.',
				'step'         => 'any',
			],

			// ── SPONSOR & EXTERNAL ───────────────────────────────────────────

			[
				'key'   => 'field_vendor_sponsor_tab',
				'label' => 'Sponsor & Links',
				'name'  => 'vendor_sponsor_tab',
				'type'  => 'tab',
			],
			[
				'key'          => 'field_vendor_is_sponsor',
				'label'        => 'Is Sponsor',
				'name'         => 'vendor_is_sponsor',
				'type'         => 'true_false',
				'required'     => 0,
				'instructions' => 'Marks official Bumbershoot sponsors.',
				'default_value'=> 0,
				'ui'           => 1,
			],
			[
				'key'      => 'field_vendor_sponsor_tier',
				'label'    => 'Sponsor Tier',
				'name'     => 'vendor_sponsor_tier',
				'type'     => 'select',
				'required' => 0,
				'choices'  => [
					'presenting' => 'Presenting',
					'gold'       => 'Gold',
					'silver'     => 'Silver',
					'community'  => 'Community',
				],
				'allow_null'    => 1,
				'return_format' => 'value',
				'instructions'  => 'Only relevant if Is Sponsor is checked.',
				'conditional_logic' => [
					[
						[
							'field'    => 'field_vendor_is_sponsor',
							'operator' => '==',
							'value'    => '1',
						],
					],
				],
			],
			[
				'key'   => 'field_vendor_website_url',
				'label' => 'Website URL',
				'name'  => 'vendor_website_url',
				'type'  => 'url',
				'required' => 0,
			],
			[
				'key'   => 'field_vendor_instagram_url',
				'label' => 'Instagram URL',
				'name'  => 'vendor_instagram_url',
				'type'  => 'url',
				'required' => 0,
			],
		],

		'location' => [
			[
				[
					'param'    => 'post_type',
					'operator' => '==',
					'value'    => 'bumbershoot_vendor',
				],
			],
		],
		'menu_order'            => 0,
		'position'              => 'normal',
		'style'                 => 'default',
		'label_placement'       => 'top',
		'instruction_placement' => 'label',
		'active'                => true,
		'description'           => 'Identity, food, operational, location, and sponsor fields for festival vendors.',
	] );
}
