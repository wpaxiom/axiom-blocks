<?php
/**
 * Safe CSS grid track lists.
 *
 * The same deliberately small grammar the CSS Grid block accepts (see
 * src/blocks/css-grid/tracks.js and the `grid-track-list` format in
 * Responsive.php): space-separated fr/px/rem/em/%/vw/vh lengths and the
 * keywords auto, min-content and max-content, at most 12 tracks. Anything else
 * is rejected, so a typo falls back to equal columns instead of reaching the
 * page as broken CSS.
 *
 * New code uses this class. The CSS Grid block keeps its own copy until it is
 * next touched, so a shipped block is not changed for a refactor.
 *
 * @package AxiomBlocks\Blocks
 * @since 1.1.0
 */

namespace AxiomBlocks\Blocks;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Grid track helpers.
 */
final class GridTracks {

	const TOKEN = '/^(?:0|(?:\d+(?:\.\d+)?|\.\d+)(?:fr|px|rem|em|%|vw|vh)|auto|min-content|max-content)$/i';

	/**
	 * A safe track list, or '' when the value is not one.
	 *
	 * @param mixed $value Raw value.
	 * @return string
	 */
	public static function safe_list( $value ): string {
		$value = preg_replace( '/\s+/', ' ', trim( (string) $value ) );
		if ( '' === $value ) {
			return '';
		}
		$tokens = explode( ' ', $value );
		if ( count( $tokens ) > 12 ) {
			return '';
		}
		foreach ( $tokens as $token ) {
			if ( ! preg_match( self::TOKEN, $token ) ) {
				return '';
			}
		}
		return $value;
	}

	/**
	 * Equal columns.
	 *
	 * @param mixed $count Column count.
	 * @return string
	 */
	public static function equal( $count ): string {
		$count = max( 1, min( 12, (int) $count ) );
		return 'repeat(' . $count . ', minmax(0, 1fr))';
	}

	/**
	 * The template for one device: custom tracks when valid, else equal columns.
	 *
	 * @param mixed $columns Column count.
	 * @param mixed $tracks  Custom tracks.
	 * @return string
	 */
	public static function template( $columns, $tracks ): string {
		$safe = self::safe_list( $tracks );
		return '' !== $safe ? $safe : self::equal( $columns );
	}

	/**
	 * Number of columns a template creates.
	 *
	 * @param string $template Template.
	 * @return int
	 */
	public static function count( string $template ): int {
		if ( preg_match( '/^repeat\((\d+),/i', trim( $template ), $m ) ) {
			return (int) $m[1];
		}
		$template = trim( $template );
		return '' === $template ? 0 : count( explode( ' ', $template ) );
	}

	/**
	 * Which devices resolve to a single column, as `is-stacked-{device}` classes.
	 * Tablet inherits desktop and mobile inherits tablet, as everywhere else.
	 *
	 * @param array  $attrs       Block attributes.
	 * @param string $columns_key Base attribute for the column count.
	 * @param string $tracks_key  Base attribute for custom tracks.
	 * @param int    $fallback    Column count when unset.
	 * @return string[]
	 */
	public static function stacked_classes( array $attrs, string $columns_key, string $tracks_key, int $fallback = 1 ): array {
		$classes = array();
		$columns = $attrs[ $columns_key ] ?? $fallback;
		$tracks  = (string) ( $attrs[ $tracks_key ] ?? '' );

		// The raw values the responsive CSS compares against: a device value only
		// overrides when it differs from the next larger device's raw value
		// (Responsive::diff_value), so this walk applies the same rule.
		$prev_cols   = (string) ( $attrs[ $columns_key ] ?? '' );
		$prev_tracks = $tracks;

		foreach ( array(
			'desktop' => '',
			'tablet'  => 'Tablet',
			'mobile'  => 'Mobile',
		) as $device => $suffix ) {
			if ( '' !== $suffix ) {
				$device_cols   = (string) ( $attrs[ $columns_key . $suffix ] ?? '' );
				$device_tracks = (string) ( $attrs[ $tracks_key . $suffix ] ?? '' );
				if ( '' !== $device_cols && $device_cols !== $prev_cols ) {
					$columns = $device_cols;
					$tracks  = '';
				}
				if ( '' !== $device_tracks && $device_tracks !== $prev_tracks && '' !== self::safe_list( $device_tracks ) ) {
					$tracks = $device_tracks;
				}
				$prev_cols   = '' !== $device_cols ? $device_cols : $prev_cols;
				$prev_tracks = '' !== $device_tracks ? $device_tracks : $prev_tracks;
			}
			if ( 1 === self::count( self::template( $columns, $tracks ) ) ) {
				$classes[] = 'is-stacked-' . $device;
			}
		}
		return $classes;
	}
}
