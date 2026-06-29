<?php
/**
 * CustomIcons — site-wide library of user-added SVG icons.
 *
 * Stored once in a single option and surfaced through the shared icon picker, so
 * a custom icon added in one block is available to every block. Blocks save a
 * reference of the form `custom:<id>`; the SVG is resolved at render time by
 * Icons::get(), so editing a custom icon updates it everywhere and saved markup
 * stays tiny.
 *
 * @package AxiomBlocks\Blocks
 * @since 1.1.0
 */

namespace AxiomBlocks\Blocks;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Custom icon store.
 *
 * @since 1.1.0
 */
class CustomIcons {

	/**
	 * Option name holding the custom icon list.
	 *
	 * @var string
	 */
	const OPTION = 'axiom_blocks_custom_icons';

	/**
	 * Prefix that marks an icon reference as a custom icon.
	 *
	 * @var string
	 */
	const PREFIX = 'custom:';

	/**
	 * All stored custom icons.
	 *
	 * @return array<int, array{id:string,label:string,svg:string}>
	 */
	public static function all(): array {
		$stored = get_option( self::OPTION, array() );
		return is_array( $stored ) ? array_values( $stored ) : array();
	}

	/**
	 * Resolve a single custom icon's SVG by reference.
	 *
	 * @param string $id Reference such as `custom:ab12cd`.
	 * @return string Sanitized SVG markup, or empty string when unknown.
	 */
	public static function get( string $id ): string {
		foreach ( self::all() as $icon ) {
			if ( ( $icon['id'] ?? '' ) === $id ) {
				return (string) ( $icon['svg'] ?? '' );
			}
		}
		return '';
	}

	/**
	 * Add a custom icon.
	 *
	 * @param string $label Human label (auto-generated when blank).
	 * @param string $svg   Raw SVG markup.
	 * @return array{id:string,label:string,svg:string}|null Stored icon, or null when the SVG is invalid.
	 */
	public static function add( string $label, string $svg ): ?array {
		$svg = self::sanitize_svg( $svg );
		if ( '' === $svg ) {
			return null;
		}

		$icons = self::all();

		$label = sanitize_text_field( $label );
		if ( '' === $label ) {
			$label = sprintf(
				/* translators: %d: next custom-icon number. */
				__( 'Custom %d', 'axiom-blocks' ),
				count( $icons ) + 1
			);
		}

		$icon = array(
			'id'    => self::generate_id( $icons ),
			'label' => $label,
			'svg'   => $svg,
		);

		$icons[] = $icon;
		update_option( self::OPTION, $icons );

		return $icon;
	}

	/**
	 * Delete a custom icon by reference.
	 *
	 * @param string $id Reference such as `custom:ab12cd`.
	 * @return bool True when an icon was removed.
	 */
	public static function delete( string $id ): bool {
		$icons    = self::all();
		$filtered = array_values(
			array_filter(
				$icons,
				static function ( $icon ) use ( $id ) {
					return ( $icon['id'] ?? '' ) !== $id;
				}
			)
		);

		if ( count( $filtered ) === count( $icons ) ) {
			return false;
		}

		update_option( self::OPTION, $filtered );
		return true;
	}

	/**
	 * Count published/draft content that references a custom icon.
	 *
	 * Used to refuse deletion while an icon is still in use. Revisions, autosaves
	 * and trashed content are excluded.
	 *
	 * @param string $id Reference such as `custom:ab12cd`.
	 * @return int Number of posts/templates referencing the icon.
	 */
	public static function usage_count( string $id ): int {
		global $wpdb;

		$like = '%' . $wpdb->esc_like( $id ) . '%';

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- One-off content scan for a delete guard; no suitable WP_Query/caching path for a LIKE over post_content.
		$count = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT COUNT(ID) FROM {$wpdb->posts}
				WHERE post_content LIKE %s
				AND post_type != 'revision'
				AND post_status NOT IN ( 'trash', 'auto-draft', 'inherit' )",
				$like
			)
		);

		return (int) $count;
	}

	/**
	 * Generate an id not already present in the list.
	 *
	 * @param array<int, array{id:string}> $icons Existing icons.
	 * @return string Reference such as `custom:ab12cd`.
	 */
	private static function generate_id( array $icons ): string {
		$existing = array_column( $icons, 'id' );
		do {
			$id = self::PREFIX . strtolower( wp_generate_password( 8, false, false ) );
		} while ( in_array( $id, $existing, true ) );
		return $id;
	}

	/**
	 * Sanitize raw SVG markup down to the shared SVG allowlist.
	 *
	 * @param string $svg Raw markup.
	 * @return string Sanitized SVG, or empty string when it is not a valid <svg>.
	 */
	private static function sanitize_svg( string $svg ): string {
		$svg = trim( $svg );
		if ( '' === $svg || false === stripos( $svg, '<svg' ) ) {
			return '';
		}

		$clean = wp_kses( $svg, AllowedHtml::svg() );

		return false === stripos( $clean, '<svg' ) ? '' : $clean;
	}
}
