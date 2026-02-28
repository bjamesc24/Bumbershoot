<?php
/**
 * Bumbershoot Festival Companion — ACF Field Registration: Events
 *
 * Registers the ACF field group "Event Details" for the bumbershoot_event post type.
 * Requires Advanced Custom Fields PRO or ACF Free (v5.0+).
 *
 * Fields mirror the schema defined in post-types/events.md.
 *
 * @package BumbershootFestival
 * @version 1.0.0
 */

defined( 'ABSPATH' ) || exit;

add_action( 'acf/init', 'bumbershoot_register_event_fields' );

function bumbershoot_register_event_fields(): void {
	if ( ! function_exists( 'acf_add_local_field_group' ) ) {
		return;
	}

	acf_add_local_field_group( [
		'key'      => 'group_bumbershoot_event',
		'title'    => 'Event Details',
		'fields'   => [

			// ── SCHEDULING ──────────────────────────────────────────────────

			[
				'key'           => 'field_event_start_time',
				'label'         => 'Start Time',
				'name'          => 'event_start_time',
				'type'          => 'date_time_picker',
				'required'      => 1,
				'instructions'  => 'Use Pacific Time (America/Los_Angeles). Format: YYYY-MM-DD HH:MM:SS',
				'display_format'=> 'd/m/Y g:i a',
				'return_format' => 'Y-m-d H:i:s',
				'first_day'     => 1,
			],
			[
				'key'           => 'field_event_end_time',
				'label'         => 'End Time',
				'name'          => 'event_end_time',
				'type'          => 'date_time_picker',
				'required'      => 1,
				'instructions'  => 'Must be after Start Time.',
				'display_format'=> 'd/m/Y g:i a',
				'return_format' => 'Y-m-d H:i:s',
				'first_day'     => 1,
			],
			[
				'key'      => 'field_event_day',
				'label'    => 'Festival Day',
				'name'     => 'event_day',
				'type'     => 'select',
				'required' => 1,
				'choices'  => [
					'day-1' => 'Day 1 — Saturday Aug 30',
					'day-2' => 'Day 2 — Sunday Aug 31',
					'day-3' => 'Day 3 — Monday Sep 1',
				],
				'default_value' => '',
				'allow_null'    => 0,
				'return_format' => 'value',
			],
			[
				'key'          => 'field_event_venue',
				'label'        => 'Venue',
				'name'         => 'event_venue',
				'type'         => 'post_object',
				'required'     => 1,
				'post_type'    => [ 'bumbershoot_venue' ],
				'return_format'=> 'id',
				'allow_null'   => 0,
				'multiple'     => 0,
				'ui'           => 1,
			],

			// ── CONTENT ─────────────────────────────────────────────────────

			[
				'key'          => 'field_event_description_short',
				'label'        => 'Short Description',
				'name'         => 'event_description_short',
				'type'         => 'textarea',
				'required'     => 1,
				'instructions' => 'Max 200 characters. Used in schedule list view.',
				'rows'         => 3,
				'maxlength'    => 200,
			],
			[
				'key'          => 'field_event_description_full',
				'label'        => 'Full Description',
				'name'         => 'event_description_full',
				'type'         => 'wysiwyg',
				'required'     => 0,
				'instructions' => 'Used on the event detail screen.',
				'tabs'         => 'all',
				'toolbar'      => 'basic',
				'media_upload' => 0,
			],
			[
				'key'      => 'field_event_category',
				'label'    => 'Category',
				'name'     => 'event_category',
				'type'     => 'select',
				'required' => 1,
				'choices'  => [
					'music'           => 'Music',
					'comedy'          => 'Comedy',
					'visual-art'      => 'Visual Art',
					'performance-art' => 'Performance Art',
					'panel'           => 'Panel / Talk',
					'workshop'        => 'Workshop',
					'family'          => 'Family Activity',
					'other'           => 'Other',
				],
				'allow_null'    => 0,
				'return_format' => 'value',
			],
			[
				'key'      => 'field_event_tags',
				'label'    => 'Tags',
				'name'     => 'event_tags',
				'type'     => 'checkbox',
				'required' => 0,
				'choices'  => [
					'family-friendly'  => 'Family Friendly',
					'18-plus'          => '18+',
					'all-ages'         => 'All Ages',
					'accessible'       => 'Accessibility Accommodations Available',
					'free-with-entry'  => 'Free with Festival Entry',
					'limited-capacity' => 'Limited Capacity',
					'headliner'        => 'Headliner',
				],
				'return_format' => 'value',
				'layout'        => 'vertical',
				'toggle'        => 0,
			],

			// ── RELATIONSHIPS ────────────────────────────────────────────────

			[
				'key'           => 'field_event_artists',
				'label'         => 'Artists',
				'name'          => 'event_artists',
				'type'          => 'relationship',
				'required'      => 0,
				'post_type'     => [ 'bumbershoot_artist' ],
				'return_format' => 'id',
				'min'           => 0,
				'max'           => '',
				'filters'       => [ 'search' ],
				'elements'      => [],
			],
			[
				'key'           => 'field_event_vendors',
				'label'         => 'Vendors at Event',
				'name'          => 'event_vendors',
				'type'          => 'relationship',
				'required'      => 0,
				'post_type'     => [ 'bumbershoot_vendor' ],
				'return_format' => 'id',
				'min'           => 0,
				'max'           => '',
				'filters'       => [ 'search' ],
				'elements'      => [],
			],

			// ── STATUS & CHANGE TRACKING ─────────────────────────────────────

			[
				'key'      => 'field_event_status',
				'label'    => 'Event Status',
				'name'     => 'event_status',
				'type'     => 'select',
				'required' => 1,
				'choices'  => [
					'scheduled'    => 'Scheduled',
					'cancelled'    => 'Cancelled',
					'moved'        => 'Moved',
					'time-changed' => 'Time Changed',
				],
				'default_value' => 'scheduled',
				'allow_null'    => 0,
				'return_format' => 'value',
			],
			[
				'key'          => 'field_event_status_note',
				'label'        => 'Status Note',
				'name'         => 'event_status_note',
				'type'         => 'text',
				'required'     => 0,
				'instructions' => 'Shown to app users when status is not "Scheduled". e.g. "Stage moved to Fisher Green due to weather."',
				'maxlength'    => 300,
			],
			[
				'key'           => 'field_event_last_changed',
				'label'         => 'Last Data Change',
				'name'          => 'event_last_changed',
				'type'          => 'date_time_picker',
				'required'      => 1,
				'instructions'  => 'CRITICAL: Update this field every time any other field on this event changes. Drives the /changes endpoint.',
				'display_format'=> 'd/m/Y g:i a',
				'return_format' => 'Y-m-d H:i:s',
				'first_day'     => 1,
			],
			[
				'key'          => 'field_event_is_highlighted',
				'label'        => 'Is Highlighted',
				'name'         => 'event_is_highlighted',
				'type'         => 'true_false',
				'required'     => 0,
				'instructions' => 'Check for headliners and featured events.',
				'default_value'=> 0,
				'ui'           => 1,
				'ui_on_text'   => 'Yes',
				'ui_off_text'  => 'No',
			],
		],

		// ── LOCATION ─────────────────────────────────────────────────────────

		'location' => [
			[
				[
					'param'    => 'post_type',
					'operator' => '==',
					'value'    => 'bumbershoot_event',
				],
			],
		],
		'menu_order'            => 0,
		'position'              => 'normal',
		'style'                 => 'default',
		'label_placement'       => 'top',
		'instruction_placement' => 'label',
		'hide_on_screen'        => [],
		'active'                => true,
		'description'           => 'Core scheduling and content fields for festival events.',
	] );
}


// ─────────────────────────────────────────────────────────────────────────────
// Auto-update event_last_changed on save
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Automatically sets event_last_changed to the current timestamp whenever
 * a bumbershoot_event post is saved. This ensures the /changes endpoint
 * is always accurate even if the editorial team forgets to update it manually.
 */
add_action( 'acf/save_post', 'bumbershoot_auto_update_event_last_changed', 20 );

function bumbershoot_auto_update_event_last_changed( int|string $post_id ): void {
	if ( get_post_type( $post_id ) !== 'bumbershoot_event' ) {
		return;
	}

	// Only update if the post is being published or updated (not auto-save/revision)
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}

	$now = current_time( 'Y-m-d H:i:s' );
	update_field( 'event_last_changed', $now, $post_id );
}
