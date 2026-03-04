<?php
/**
 * Bumbershoot_ACF_Compat
 *
 * Abstracts field reading so the codebase is not hard-coupled to ACF.
 *
 * If ACF is active, get_field() is used — it returns processed, type-cast
 * values (e.g. relationship fields as post IDs, checkboxes as arrays).
 *
 * If ACF is NOT active, get_post_meta() is used against the raw meta key.
 * WordPress auto-unserialises arrays stored by ACF, so checkbox / relationship
 * values still come back as arrays. Boolean true_false fields come back as
 * '1' / '' and are cast to bool by the typed helpers below.
 *
 * TO SWAP FROM ACF → NATIVE META (or vice-versa):
 *   Change the single condition in self::raw() — nothing else needs to change.
 *
 * @package BumbershootFestival
 */

defined( 'ABSPATH' ) || exit;

class Bumbershoot_ACF_Compat {

	// ── Core reader ───────────────────────────────────────────────────────────

	/**
	 * Returns the raw field value. Use the typed helpers below in most cases.
	 *
	 * @param string $field   ACF field name (same as meta key).
	 * @param int    $post_id WordPress post ID.
	 * @return mixed
	 */
	public static function raw( string $field, int $post_id ): mixed {
		if ( function_exists( 'get_field' ) ) {
			// ACF path: returns type-appropriate value.
			return get_field( $field, $post_id );
		}

		// Native meta path: returns raw string, or unserialized array.
		$value = get_post_meta( $post_id, $field, true );
		return $value !== '' ? $value : null;
	}

	// ── Typed helpers ─────────────────────────────────────────────────────────

	/**
	 * Returns a string value, or null if empty.
	 */
	public static function string( string $field, int $post_id ): ?string {
		$value = self::raw( $field, $post_id );
		if ( $value === null || $value === '' ) {
			return null;
		}
		return (string) $value;
	}

	/**
	 * Returns an integer value, or null if empty.
	 */
	public static function int( string $field, int $post_id ): ?int {
		$value = self::raw( $field, $post_id );
		if ( $value === null || $value === '' ) {
			return null;
		}
		return (int) $value;
	}

	/**
	 * Returns a boolean.
	 * ACF true_false stores '1' for true and '' for false.
	 */
	public static function bool( string $field, int $post_id ): bool {
		$value = self::raw( $field, $post_id );
		return (bool) $value;
	}

	/**
	 * Returns an array. Safe even when ACF returns null or a scalar.
	 * Used for checkbox, relationship, and post_object (multiple) fields.
	 */
	public static function arr( string $field, int $post_id ): array {
		$value = self::raw( $field, $post_id );
		if ( is_array( $value ) ) {
			return array_values( array_filter( $value ) );
		}
		if ( empty( $value ) ) {
			return [];
		}
		return [ $value ];
	}

	/**
	 * Returns a datetime string formatted as ISO 8601 with timezone offset,
	 * e.g. "2025-08-30T19:00:00-07:00".
	 *
	 * ACF stores date_time_picker values as "Y-m-d H:i:s" in the site timezone.
	 * We parse them against the WordPress site timezone and re-format.
	 *
	 * Returns null if the field is empty or unparseable.
	 */
	public static function datetime( string $field, int $post_id ): ?string {
		$value = self::string( $field, $post_id );
		if ( $value === null ) {
			return null;
		}
		return self::format_datetime( $value );
	}

	/**
	 * Converts a stored datetime string to ISO 8601 with timezone offset.
	 * Can be called directly with a raw string (e.g. post_modified).
	 */
	public static function format_datetime( string $value ): ?string {
		if ( empty( $value ) ) {
			return null;
		}
		try {
			$tz = wp_timezone();
			$dt = new DateTime( $value, $tz );
			return $dt->format( DateTime::ATOM ); // e.g. 2025-08-30T19:00:00-07:00
		} catch ( Exception $e ) {
			return null;
		}
	}

	/**
	 * Converts a datetime string to a MySQL-compatible format for meta_query
	 * comparisons (DATETIME type). Returns null on failure.
	 */
	public static function to_mysql_datetime( string $value ): ?string {
		try {
			$tz = wp_timezone();
			$dt = new DateTime( $value, $tz );
			return $dt->format( 'Y-m-d H:i:s' );
		} catch ( Exception $e ) {
			return null;
		}
	}
}
