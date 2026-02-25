<?php
/**
 * Bumbershoot Festival Companion — ACF Field Registration: Artists
 *
 * Registers the ACF field group "Artist Details" for the bumbershoot_artist post type.
 * Fields mirror the schema defined in post-types/artists.md.
 *
 * @package BumbershootFestival
 * @version 1.0.0
 */

defined( 'ABSPATH' ) || exit;

add_action( 'acf/init', 'bumbershoot_register_artist_fields' );

function bumbershoot_register_artist_fields(): void {
	if ( ! function_exists( 'acf_add_local_field_group' ) ) {
		return;
	}

	acf_add_local_field_group( [
		'key'    => 'group_bumbershoot_artist',
		'title'  => 'Artist Details',
		'fields' => [

			// ── PROFILE ──────────────────────────────────────────────────────

			[
				'key'      => 'field_artist_type',
				'label'    => 'Artist Type',
				'name'     => 'artist_type',
				'type'     => 'select',
				'required' => 1,
				'choices'  => [
					'musician'     => 'Musician / Band',
					'dj'           => 'DJ',
					'comedian'     => 'Comedian',
					'visual-artist'=> 'Visual Artist',
					'speaker'      => 'Speaker / Panelist',
					'performer'    => 'Performer (other)',
				],
				'allow_null'    => 0,
				'return_format' => 'value',
			],
			[
				'key'      => 'field_artist_genre',
				'label'    => 'Genre / Discipline',
				'name'     => 'artist_genre',
				'type'     => 'select',
				'required' => 0,
				'choices'  => [
					'indie-rock'  => 'Indie Rock',
					'hip-hop'     => 'Hip-Hop / Rap',
					'electronic'  => 'Electronic / EDM',
					'r-and-b'     => 'R&B / Soul',
					'pop'         => 'Pop',
					'folk'        => 'Folk / Americana',
					'jazz'        => 'Jazz',
					'classical'   => 'Classical',
					'world'       => 'World Music',
					'comedy'      => 'Comedy',
					'visual-art'  => 'Visual Art',
					'mixed-media' => 'Mixed Media',
					'other'       => 'Other',
				],
				'allow_null'    => 1,
				'return_format' => 'value',
			],
			[
				'key'          => 'field_artist_origin',
				'label'        => 'Origin / Hometown',
				'name'         => 'artist_origin',
				'type'         => 'text',
				'required'     => 0,
				'instructions' => 'e.g. "Seattle, WA" or "Philadelphia, PA"',
			],
			[
				'key'          => 'field_artist_pronouns',
				'label'        => 'Pronouns',
				'name'         => 'artist_pronouns',
				'type'         => 'text',
				'required'     => 0,
				'instructions' => 'e.g. "she/her", "they/them". Leave blank if not provided.',
			],
			[
				'key'          => 'field_artist_bio_short',
				'label'        => 'Short Bio',
				'name'         => 'artist_bio_short',
				'type'         => 'textarea',
				'required'     => 1,
				'instructions' => 'Max 300 characters. Used in schedule and list views.',
				'rows'         => 4,
				'maxlength'    => 300,
			],
			[
				'key'          => 'field_artist_bio_full',
				'label'        => 'Full Bio',
				'name'         => 'artist_bio_full',
				'type'         => 'wysiwyg',
				'required'     => 0,
				'instructions' => 'Used on the artist detail screen. Written by festival or provided by artist management.',
				'tabs'         => 'all',
				'toolbar'      => 'basic',
				'media_upload' => 0,
			],

			// ── METADATA ─────────────────────────────────────────────────────

			[
				'key'          => 'field_artist_is_headliner',
				'label'        => 'Is Headliner',
				'name'         => 'artist_is_headliner',
				'type'         => 'true_false',
				'required'     => 0,
				'default_value'=> 0,
				'ui'           => 1,
				'ui_on_text'   => 'Yes',
				'ui_off_text'  => 'No',
			],
			[
				'key'          => 'field_artist_is_local',
				'label'        => 'Is Local Artist',
				'name'         => 'artist_is_local',
				'type'         => 'true_false',
				'required'     => 0,
				'instructions' => 'Check for any artist from Washington State or the Pacific Northwest.',
				'default_value'=> 0,
				'ui'           => 1,
				'ui_on_text'   => 'Local',
				'ui_off_text'  => 'Not local',
			],
			[
				'key'          => 'field_artist_content_advisory',
				'label'        => 'Content Advisory',
				'name'         => 'artist_content_advisory',
				'type'         => 'text',
				'required'     => 0,
				'instructions' => 'e.g. "Explicit lyrics", "Adult themes". Shown to users on the detail screen.',
				'maxlength'    => 100,
			],

			// ── EXTERNAL LINKS ───────────────────────────────────────────────

			[
				'key'   => 'field_artist_links_tab',
				'label' => 'Platform Links',
				'name'  => 'artist_links_tab',
				'type'  => 'tab',
			],
			[
				'key'          => 'field_artist_spotify_url',
				'label'        => 'Spotify URL',
				'name'         => 'artist_spotify_url',
				'type'         => 'url',
				'required'     => 0,
				'instructions' => 'Direct link to artist profile on Spotify.',
			],
			[
				'key'   => 'field_artist_apple_music_url',
				'label' => 'Apple Music URL',
				'name'  => 'artist_apple_music_url',
				'type'  => 'url',
				'required' => 0,
			],
			[
				'key'   => 'field_artist_bandcamp_url',
				'label' => 'Bandcamp URL',
				'name'  => 'artist_bandcamp_url',
				'type'  => 'url',
				'required' => 0,
			],
			[
				'key'   => 'field_artist_soundcloud_url',
				'label' => 'SoundCloud URL',
				'name'  => 'artist_soundcloud_url',
				'type'  => 'url',
				'required' => 0,
			],
			[
				'key'   => 'field_artist_youtube_url',
				'label' => 'YouTube URL',
				'name'  => 'artist_youtube_url',
				'type'  => 'url',
				'required' => 0,
				'instructions' => 'Artist channel or a featured video.',
			],
			[
				'key'   => 'field_artist_website_url',
				'label' => 'Website URL',
				'name'  => 'artist_website_url',
				'type'  => 'url',
				'required' => 0,
				'instructions' => 'Official artist or band website.',
			],
			[
				'key'   => 'field_artist_instagram_url',
				'label' => 'Instagram URL',
				'name'  => 'artist_instagram_url',
				'type'  => 'url',
				'required' => 0,
			],
		],

		'location' => [
			[
				[
					'param'    => 'post_type',
					'operator' => '==',
					'value'    => 'bumbershoot_artist',
				],
			],
		],
		'menu_order'            => 0,
		'position'              => 'normal',
		'style'                 => 'default',
		'label_placement'       => 'top',
		'instruction_placement' => 'label',
		'active'                => true,
		'description'           => 'Profile, metadata, and platform link fields for festival artists.',
	] );
}
