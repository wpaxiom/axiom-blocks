<?php
/**
 * Typography helper — shared font/size/spacing/align attribute handling.
 *
 * Supports a `prefix` so a single block can carry multiple typography groups
 * (e.g. heading, name, price). Pass the same prefix on the JS side.
 *
 * @package AxiomBlocks\Blocks
 * @since 1.0.0
 */

namespace AxiomBlocks\Blocks;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Typography helper class — shared font/size/spacing/align attribute handling.
 *
 * Supports a `prefix` so a single block can carry multiple typography groups
 * (e.g. heading, name, price). Pass the same prefix on the JS side.
 *
 * @since 1.0.0
 */
class Typography {

	/**
	 * CSS property ↔ camelCase attribute key (without prefix).
	 *
	 * @var array<string, string>
	 */
	private const MAP = array(
		'font-family'     => 'fontFamily',
		'font-weight'     => 'fontWeight',
		'font-size'       => 'fontSize',
		'line-height'     => 'lineHeight',
		'letter-spacing'  => 'letterSpacing',
		'text-transform'  => 'textTransform',
		'text-decoration' => 'textDecoration',
		'text-align'      => 'textAlign',
	);

	/**
	 * Apply prefix to an attribute key — e.g. ('heading', 'fontFamily') → 'headingFontFamily'.
	 *
	 * @param string $prefix Attribute prefix.
	 * @param string $attr   Attribute key.
	 * @return string Prefixed attribute key.
	 */
	private static function key( string $prefix, string $attr ): string {
		if ( '' === $prefix ) {
			return $attr;
		}
		return $prefix . strtoupper( $attr[0] ) . substr( $attr, 1 );
	}

	/**
	 * Build inline style declarations from block attributes.
	 * Returns something like "font-size: 18px; line-height: 1.4" (no trailing semicolon).
	 *
	 * @param array  $attributes Block attributes.
	 * @param string $prefix     Optional attribute prefix (e.g. 'heading').
	 * @return string
	 */
	public static function inline_style( array $attributes, string $prefix = '' ): string {
		$parts = array();
		foreach ( self::MAP as $css => $attr ) {
			$key = self::key( $prefix, $attr );
			if ( ! empty( $attributes[ $key ] ) ) {
				// Return raw CSS values — escaping happens at the echo site
				// (safecss_filter_attr and/or esc_attr). Pre-escaping here turns a
				// quoted font-family (e.g. "Courier New") into &quot; entities, whose
				// trailing ';' then breaks safecss_filter_attr's declaration parsing.
				$parts[] = $css . ': ' . (string) $attributes[ $key ];
			}
		}
		return implode( '; ', $parts );
	}

	/**
	 * Merge typography declarations into an existing inline-style string.
	 *
	 * @param string $existing   Existing inline style (no trailing semicolon expected).
	 * @param array  $attributes Block attributes.
	 * @param string $prefix     Optional attribute prefix.
	 * @return string
	 */
	public static function merge( string $existing, array $attributes, string $prefix = '' ): string {
		$typo = self::inline_style( $attributes, $prefix );
		if ( '' === $existing ) {
			return $typo;
		}
		if ( '' === $typo ) {
			return $existing;
		}
		return rtrim( $existing, '; ' ) . '; ' . $typo;
	}
}
