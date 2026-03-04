<?php
/**
 * Bumbershoot_Response_Formatter
 *
 * Transforms WP_Post objects (plus their ACF meta) into the structured arrays
 * defined in the OpenAPI spec (wp/endpoints/openapi.yaml).
 *
 * All public methods accept a WP_Post and return an associative array ready
 * to be passed to WP_REST_Response.
 *
 * @package BumbershootFestival
 */

defined( 'ABSPATH' ) || exit;

class Bumbershoot_Response_Formatter {

	// ── EVENTS ────────────────────────────────────────────────────────────────

	/**
	 * Minimal event shape — used in the /schedule list.
	 */
	public static function event_summary( WP_Post $post ): array {
		$id = $post->ID;

		// Resolve venue for embedded name fields.
		$venue_id   = Bumbershoot_ACF_Compat::int( 'event_venue', $id );
		$venue_name = '';
		$venue_short = '';
		if ( $venue_id ) {
			$venue_name  = Bumbershoot_ACF_Compat::string( 'venue_short_name', $venue_id ) ?? get_the_title( $venue_id );
			$venue_short = Bumbershoot_ACF_Compat::string( 'venue_short_name', $venue_id ) ?? $venue_name;
		}

		return [
			'id'               => $id,
			'title'            => get_the_title( $post ),
			'slug'             => $post->post_name,
			'category'         => Bumbershoot_ACF_Compat::string( 'event_category', $id ),
			'tags'             => Bumbershoot_ACF_Compat::arr( 'event_tags', $id ),
			'start_time'       => Bumbershoot_ACF_Compat::datetime( 'event_start_time', $id ),
			'end_time'         => Bumbershoot_ACF_Compat::datetime( 'event_end_time', $id ),
			'day'              => Bumbershoot_ACF_Compat::string( 'event_day', $id ),
			'venue_id'         => $venue_id,
			'venue_name'       => get_the_title( $venue_id ) ?: '',
			'venue_short_name' => $venue_short,
			'status'           => Bumbershoot_ACF_Compat::string( 'event_status', $id ) ?? 'scheduled',
			'status_note'      => Bumbershoot_ACF_Compat::string( 'event_status_note', $id ),
			'is_highlighted'   => Bumbershoot_ACF_Compat::bool( 'event_is_highlighted', $id ),
			'artist_ids'       => Bumbershoot_ACF_Compat::arr( 'event_artists', $id ),
			'last_changed'     => self::event_last_changed( $id, $post ),
		];
	}

	/**
	 * Full event shape — used in /events/{id}.
	 */
	public static function event_detail( WP_Post $post ): array {
		$id      = $post->ID;
		$summary = self::event_summary( $post );

		// Embed full venue object.
		$venue_id   = Bumbershoot_ACF_Compat::int( 'event_venue', $id );
		$venue_data = null;
		if ( $venue_id ) {
			$venue_post = get_post( $venue_id );
			if ( $venue_post instanceof WP_Post ) {
				$venue_data = self::venue_embed( $venue_post );
			}
		}

		// Embed full artist objects.
		$artist_ids  = Bumbershoot_ACF_Compat::arr( 'event_artists', $id );
		$artists     = [];
		foreach ( $artist_ids as $artist_id ) {
			$artist_post = get_post( (int) $artist_id );
			if ( $artist_post instanceof WP_Post ) {
				$artists[] = self::artist_embed( $artist_post );
			}
		}

		// Images.
		$thumbnail_id       = get_post_thumbnail_id( $id );
		$featured_image_url = $thumbnail_id
			? wp_get_attachment_image_url( $thumbnail_id, 'large' )
			: null;
		$thumbnail_url      = $thumbnail_id
			? wp_get_attachment_image_url( $thumbnail_id, 'medium' )
			: null;

		// Full description — fall back to short description if full is empty.
		$desc_short = Bumbershoot_ACF_Compat::string( 'event_description_short', $id );
		$desc_full  = Bumbershoot_ACF_Compat::string( 'event_description_full', $id ) ?? $desc_short;

		return array_merge( $summary, [
			'description_short'  => $desc_short,
			'description_full'   => $desc_full,
			'venue'              => $venue_data,
			'artists'            => $artists,
			'featured_image_url' => $featured_image_url ?: null,
			'thumbnail_url'      => $thumbnail_url ?: null,
		] );
	}

	// ── VENUES ────────────────────────────────────────────────────────────────

	/**
	 * Full venue shape — used in /venues list.
	 */
	public static function venue( WP_Post $post ): array {
		$id = $post->ID;
		return [
			'id'                   => $id,
			'title'                => get_the_title( $post ),
			'slug'                 => $post->post_name,
			'short_name'           => Bumbershoot_ACF_Compat::string( 'venue_short_name', $id ),
			'type'                 => Bumbershoot_ACF_Compat::string( 'venue_type', $id ),
			'lat'                  => Bumbershoot_ACF_Compat::raw( 'venue_lat', $id ) !== null
				? (float) Bumbershoot_ACF_Compat::raw( 'venue_lat', $id )
				: null,
			'lng'                  => Bumbershoot_ACF_Compat::raw( 'venue_lng', $id ) !== null
				? (float) Bumbershoot_ACF_Compat::raw( 'venue_lng', $id )
				: null,
			'map_zoom'             => Bumbershoot_ACF_Compat::int( 'venue_map_zoom', $id ),
			'area_note'            => Bumbershoot_ACF_Compat::string( 'venue_area_note', $id ),
			'capacity'             => Bumbershoot_ACF_Compat::int( 'venue_capacity', $id ),
			'is_accessible'        => Bumbershoot_ACF_Compat::bool( 'venue_is_accessible', $id ),
			'accessibility_notes'  => Bumbershoot_ACF_Compat::string( 'venue_accessibility_notes', $id ),
			'amenities'            => Bumbershoot_ACF_Compat::arr( 'venue_amenities', $id ),
			'is_active'            => Bumbershoot_ACF_Compat::bool( 'venue_is_active', $id ),
		];
	}

	/**
	 * Minimal venue shape embedded inside event detail responses.
	 */
	public static function venue_embed( WP_Post $post ): array {
		$id = $post->ID;
		return [
			'id'                  => $id,
			'title'               => get_the_title( $post ),
			'short_name'          => Bumbershoot_ACF_Compat::string( 'venue_short_name', $id ),
			'slug'                => $post->post_name,
			'type'                => Bumbershoot_ACF_Compat::string( 'venue_type', $id ),
			'lat'                 => Bumbershoot_ACF_Compat::raw( 'venue_lat', $id ) !== null
				? (float) Bumbershoot_ACF_Compat::raw( 'venue_lat', $id )
				: null,
			'lng'                 => Bumbershoot_ACF_Compat::raw( 'venue_lng', $id ) !== null
				? (float) Bumbershoot_ACF_Compat::raw( 'venue_lng', $id )
				: null,
			'area_note'           => Bumbershoot_ACF_Compat::string( 'venue_area_note', $id ),
			'is_accessible'       => Bumbershoot_ACF_Compat::bool( 'venue_is_accessible', $id ),
			'accessibility_notes' => Bumbershoot_ACF_Compat::string( 'venue_accessibility_notes', $id ),
			'amenities'           => Bumbershoot_ACF_Compat::arr( 'venue_amenities', $id ),
		];
	}

	// ── ARTISTS ───────────────────────────────────────────────────────────────

	/**
	 * Full artist shape — used in /artists list.
	 */
	public static function artist( WP_Post $post ): array {
		$id = $post->ID;

		// Collect IDs of events that list this artist.
		$event_ids = self::events_for_artist( $id );

		return [
			'id'               => $id,
			'title'            => get_the_title( $post ),
			'slug'             => $post->post_name,
			'type'             => Bumbershoot_ACF_Compat::string( 'artist_type', $id ),
			'genre'            => Bumbershoot_ACF_Compat::string( 'artist_genre', $id ),
			'origin'           => Bumbershoot_ACF_Compat::string( 'artist_origin', $id ),
			'pronouns'         => Bumbershoot_ACF_Compat::string( 'artist_pronouns', $id ),
			'bio_short'        => Bumbershoot_ACF_Compat::string( 'artist_bio_short', $id ),
			'bio_full'         => Bumbershoot_ACF_Compat::string( 'artist_bio_full', $id ),
			'is_headliner'     => Bumbershoot_ACF_Compat::bool( 'artist_is_headliner', $id ),
			'is_local'         => Bumbershoot_ACF_Compat::bool( 'artist_is_local', $id ),
			'content_advisory' => Bumbershoot_ACF_Compat::string( 'artist_content_advisory', $id ),
			'photo_url'        => self::featured_image_url( $id, 'medium' ),
			'links'            => self::artist_links( $id ),
			'event_ids'        => $event_ids,
		];
	}

	/**
	 * Minimal artist shape embedded inside event detail responses.
	 */
	public static function artist_embed( WP_Post $post ): array {
		$id = $post->ID;
		return [
			'id'          => $id,
			'title'       => get_the_title( $post ),
			'slug'        => $post->post_name,
			'type'        => Bumbershoot_ACF_Compat::string( 'artist_type', $id ),
			'genre'       => Bumbershoot_ACF_Compat::string( 'artist_genre', $id ),
			'origin'      => Bumbershoot_ACF_Compat::string( 'artist_origin', $id ),
			'bio_short'   => Bumbershoot_ACF_Compat::string( 'artist_bio_short', $id ),
			'is_headliner'=> Bumbershoot_ACF_Compat::bool( 'artist_is_headliner', $id ),
			'is_local'    => Bumbershoot_ACF_Compat::bool( 'artist_is_local', $id ),
			'photo_url'   => self::featured_image_url( $id, 'medium' ),
			'links'       => self::artist_links( $id ),
		];
	}

	// ── VENDORS ───────────────────────────────────────────────────────────────

	/**
	 * Full vendor shape — used in /vendors list.
	 */
	public static function vendor( WP_Post $post ): array {
		$id = $post->ID;

		$venue_id = Bumbershoot_ACF_Compat::int( 'vendor_venue', $id );

		$lat_raw = Bumbershoot_ACF_Compat::raw( 'vendor_lat', $id );
		$lng_raw = Bumbershoot_ACF_Compat::raw( 'vendor_lng', $id );

		return [
			'id'                  => $id,
			'title'               => get_the_title( $post ),
			'slug'                => $post->post_name,
			'type'                => Bumbershoot_ACF_Compat::string( 'vendor_type', $id ),
			'booth_name'          => Bumbershoot_ACF_Compat::string( 'vendor_booth_name', $id ),
			'description_short'   => Bumbershoot_ACF_Compat::string( 'vendor_description_short', $id ),
			'description_full'    => Bumbershoot_ACF_Compat::string( 'vendor_description_full', $id ),
			'cuisine'             => Bumbershoot_ACF_Compat::string( 'vendor_cuisine', $id ),
			'dietary_options'     => Bumbershoot_ACF_Compat::arr( 'vendor_dietary_options', $id ),
			'price_range'         => Bumbershoot_ACF_Compat::string( 'vendor_price_range', $id ),
			'operating_hours'     => Bumbershoot_ACF_Compat::string( 'vendor_hours', $id ),
			'payment_methods'     => Bumbershoot_ACF_Compat::arr( 'vendor_payment_methods', $id ),
			'is_accessible'       => Bumbershoot_ACF_Compat::bool( 'vendor_is_accessible', $id ),
			'days_active'         => Bumbershoot_ACF_Compat::arr( 'vendor_days_active', $id ),
			'is_active'           => Bumbershoot_ACF_Compat::bool( 'vendor_is_active', $id ),
			'is_sponsor'          => Bumbershoot_ACF_Compat::bool( 'vendor_is_sponsor', $id ),
			'sponsor_tier'        => Bumbershoot_ACF_Compat::string( 'vendor_sponsor_tier', $id ),
			'venue_id'            => $venue_id,
			'lat'                 => $lat_raw !== null && $lat_raw !== '' ? (float) $lat_raw : null,
			'lng'                 => $lng_raw !== null && $lng_raw !== '' ? (float) $lng_raw : null,
			'thumbnail_url'       => self::featured_image_url( $id, 'medium' ),
			'website_url'         => Bumbershoot_ACF_Compat::string( 'vendor_website_url', $id ),
			'instagram_url'       => Bumbershoot_ACF_Compat::string( 'vendor_instagram_url', $id ),
		];
	}

	// ── ANNOUNCEMENTS ─────────────────────────────────────────────────────────

	/**
	 * Full announcement shape — used in /announcements list.
	 */
	public static function announcement( WP_Post $post ): array {
		$id = $post->ID;

		// Related event reference.
		$related_event_id = Bumbershoot_ACF_Compat::int( 'announcement_related_event', $id );
		$related_event    = null;
		if ( $related_event_id ) {
			$e = get_post( $related_event_id );
			if ( $e instanceof WP_Post ) {
				$related_event = [
					'id'    => $e->ID,
					'title' => get_the_title( $e ),
					'slug'  => $e->post_name,
				];
			}
		}

		// Related venue reference.
		$related_venue_id = Bumbershoot_ACF_Compat::int( 'announcement_related_venue', $id );
		$related_venue    = null;
		if ( $related_venue_id ) {
			$v = get_post( $related_venue_id );
			if ( $v instanceof WP_Post ) {
				$related_venue = [
					'id'         => $v->ID,
					'title'      => get_the_title( $v ),
					'short_name' => Bumbershoot_ACF_Compat::string( 'venue_short_name', $v->ID ),
				];
			}
		}

		// Body: use ACF field if present, fall back to post_content.
		$body = wp_strip_all_tags( $post->post_content );

		return [
			'id'                 => $id,
			'title'              => get_the_title( $post ),
			'body'               => $body,
			'type'               => Bumbershoot_ACF_Compat::string( 'announcement_type', $id ),
			'priority'           => Bumbershoot_ACF_Compat::string( 'announcement_priority', $id ) ?? 'normal',
			'is_pinned'          => Bumbershoot_ACF_Compat::bool( 'announcement_is_pinned', $id ),
			'published_at'       => Bumbershoot_ACF_Compat::format_datetime( $post->post_date ),
			'expires_at'         => Bumbershoot_ACF_Compat::datetime( 'announcement_expires_at', $id ),
			'day'                => Bumbershoot_ACF_Compat::string( 'announcement_day', $id ),
			'related_event'      => $related_event,
			'related_venue'      => $related_venue,
			'external_url'       => Bumbershoot_ACF_Compat::string( 'announcement_external_url', $id ),
			'external_url_label' => Bumbershoot_ACF_Compat::string( 'announcement_external_url_label', $id ),
		];
	}

	// ── PRIVATE HELPERS ───────────────────────────────────────────────────────

	/**
	 * Returns the event_last_changed value, falling back to post_modified
	 * if the field is not set. (Per spec: graceful fallback.)
	 */
	public static function event_last_changed( int $post_id, WP_Post $post ): ?string {
		$last_changed = Bumbershoot_ACF_Compat::datetime( 'event_last_changed', $post_id );
		if ( $last_changed !== null ) {
			return $last_changed;
		}
		// Fallback: use WordPress post_modified (stored in site timezone).
		return Bumbershoot_ACF_Compat::format_datetime( $post->post_modified );
	}

	/**
	 * Returns a featured image URL at a given WP image size, or null.
	 */
	private static function featured_image_url( int $post_id, string $size = 'medium' ): ?string {
		$thumbnail_id = get_post_thumbnail_id( $post_id );
		if ( ! $thumbnail_id ) {
			return null;
		}
		$url = wp_get_attachment_image_url( $thumbnail_id, $size );
		return $url ?: null;
	}

	/**
	 * Builds the artist links object. All keys are always present; null if unset.
	 */
	private static function artist_links( int $post_id ): array {
		return [
			'spotify'     => Bumbershoot_ACF_Compat::string( 'artist_spotify_url', $post_id ),
			'apple_music' => Bumbershoot_ACF_Compat::string( 'artist_apple_music_url', $post_id ),
			'bandcamp'    => Bumbershoot_ACF_Compat::string( 'artist_bandcamp_url', $post_id ),
			'soundcloud'  => Bumbershoot_ACF_Compat::string( 'artist_soundcloud_url', $post_id ),
			'youtube'     => Bumbershoot_ACF_Compat::string( 'artist_youtube_url', $post_id ),
			'website'     => Bumbershoot_ACF_Compat::string( 'artist_website_url', $post_id ),
			'instagram'   => Bumbershoot_ACF_Compat::string( 'artist_instagram_url', $post_id ),
		];
	}

	/**
	 * Finds all event IDs that reference a given artist via event_artists.
	 * This is the reverse lookup: artist → events.
	 */
	private static function events_for_artist( int $artist_id ): array {
		$query = new WP_Query( [
			'post_type'      => 'bumbershoot_event',
			'post_status'    => 'publish',
			'posts_per_page' => -1,
			'fields'         => 'ids',
			'meta_query'     => [
				[
					'key'     => 'event_artists',
					'value'   => '"' . $artist_id . '"',
					'compare' => 'LIKE',
				],
			],
		] );
		return $query->posts;
	}
}
