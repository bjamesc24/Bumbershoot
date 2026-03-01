<?php
/**
 * Bumbershoot Festival Companion — ACF Field Registration: Announcements
 *
 * Registers the ACF field group "Announcement Details" for the
 * bumbershoot_announcement post type.
 * Fields mirror the schema defined in post-types/announcements.md.
 *
 * @package BumbershootFestival
 * @version 1.0.0
 */

defined( 'ABSPATH' ) || exit;

add_action( 'acf/init', 'bumbershoot_register_announcement_fields' );

function bumbershoot_register_announcement_fields(): void {
	if ( ! function_exists( 'acf_add_local_field_group' ) ) {
		return;
	}

	acf_add_local_field_group( [
		'key'    => 'group_bumbershoot_announcement',
		'title'  => 'Announcement Details',
		'fields' => [

			// ── CLASSIFICATION ───────────────────────────────────────────────

			[
				'key'      => 'field_announcement_type',
				'label'    => 'Announcement Type',
				'name'     => 'announcement_type',
				'type'     => 'select',
				'required' => 1,
				'choices'  => [
					'schedule-change' => 'Schedule Change',
					'cancellation'    => 'Cancellation',
					'weather'         => 'Weather Alert',
					'entry'           => 'Entry & Gates',
					'transport'       => 'Transport & Parking',
					'service'         => 'Services & Amenities',
					'general'         => 'General Info',
					'emergency'       => 'Emergency Notice',
				],
				'allow_null'    => 0,
				'return_format' => 'value',
			],
			[
				'key'      => 'field_announcement_priority',
				'label'    => 'Priority Level',
				'name'     => 'announcement_priority',
				'type'     => 'select',
				'required' => 1,
				'choices'  => [
					'normal'    => 'Normal',
					'important' => 'Important',
					'urgent'    => 'Urgent',
				],
				'default_value' => 'normal',
				'allow_null'    => 0,
				'return_format' => 'value',
			],
			[
				'key'          => 'field_announcement_is_pinned',
				'label'        => 'Pin to Top of Feed',
				'name'         => 'announcement_is_pinned',
				'type'         => 'true_false',
				'required'     => 0,
				'instructions' => 'Pinned announcements always appear first regardless of publish date.',
				'default_value'=> 0,
				'ui'           => 1,
				'ui_on_text'   => 'Pinned',
				'ui_off_text'  => 'Normal',
			],

			// ── TIMING & LIFECYCLE ───────────────────────────────────────────

			[
				'key'           => 'field_announcement_expires_at',
				'label'         => 'Expires At',
				'name'          => 'announcement_expires_at',
				'type'          => 'date_time_picker',
				'required'      => 0,
				'instructions'  => 'Optional. After this time the announcement is hidden from the app. Leave blank for permanent announcements.',
				'display_format'=> 'd/m/Y g:i a',
				'return_format' => 'Y-m-d H:i:s',
				'first_day'     => 1,
			],
			[
				'key'      => 'field_announcement_day',
				'label'    => 'Festival Day',
				'name'     => 'announcement_day',
				'type'     => 'select',
				'required' => 0,
				'choices'  => [
					'pre-festival' => 'Pre-Festival',
					'day-1'        => 'Day 1 — Saturday Aug 30',
					'day-2'        => 'Day 2 — Sunday Aug 31',
					'day-3'        => 'Day 3 — Monday Sep 1',
					'all-days'     => 'All Days',
				],
				'allow_null'    => 1,
				'return_format' => 'value',
			],

			// ── LINKED CONTENT ───────────────────────────────────────────────

			[
				'key'           => 'field_announcement_related_event',
				'label'         => 'Related Event',
				'name'          => 'announcement_related_event',
				'type'          => 'post_object',
				'required'      => 0,
				'instructions'  => 'Link to the specific event this announcement is about.',
				'post_type'     => [ 'bumbershoot_event' ],
				'return_format' => 'id',
				'allow_null'    => 1,
				'multiple'      => 0,
				'ui'            => 1,
			],
			[
				'key'           => 'field_announcement_related_venue',
				'label'         => 'Related Venue',
				'name'          => 'announcement_related_venue',
				'type'          => 'post_object',
				'required'      => 0,
				'instructions'  => 'Link to a specific venue or POI if this announcement is location-specific.',
				'post_type'     => [ 'bumbershoot_venue' ],
				'return_format' => 'id',
				'allow_null'    => 1,
				'multiple'      => 0,
				'ui'            => 1,
			],
			[
				'key'          => 'field_announcement_external_url',
				'label'        => 'External Link URL',
				'name'         => 'announcement_external_url',
				'type'         => 'url',
				'required'     => 0,
				'instructions' => 'Optional link to more information.',
			],
			[
				'key'          => 'field_announcement_external_url_label',
				'label'        => 'External Link Label',
				'name'         => 'announcement_external_url_label',
				'type'         => 'text',
				'required'     => 0,
				'instructions' => 'Button label text for the link. e.g. "View Updated Schedule". Required if External Link URL is set.',
				'maxlength'    => 60,
			],
		],

		'location' => [
			[
				[
					'param'    => 'post_type',
					'operator' => '==',
					'value'    => 'bumbershoot_announcement',
				],
			],
		],
		'menu_order'            => 0,
		'position'              => 'normal',
		'style'                 => 'default',
		'label_placement'       => 'top',
		'instruction_placement' => 'label',
		'active'                => true,
		'description'           => 'Classification, timing, and linked content fields for festival announcements.',
	] );
}
