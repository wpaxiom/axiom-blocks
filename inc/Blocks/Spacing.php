<?php
/**
 * Spacing helper — shared padding/margin attribute handling.
 *
 * @package AxiomBlocks\Blocks
 * @since 1.0.0
 */

namespace AxiomBlocks\Blocks;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Spacing helper class — shared padding/margin attribute handling.
 *
 * @since 1.0.0
 */
class Spacing {

	/**
	 * CSS property ↔ attribute key map.
	 *
	 * @var array<string, string>
	 */
	private const MAP = array(
		'padding-top'    => 'paddingTop',
		'padding-right'  => 'paddingRight',
		'padding-bottom' => 'paddingBottom',
		'padding-left'   => 'paddingLeft',
		'margin-top'     => 'marginTop',
		'margin-right'   => 'marginRight',
		'margin-bottom'  => 'marginBottom',
		'margin-left'    => 'marginLeft',
	);

	/**
	 * Build inline style declarations from block attributes.
	 * Returns something like "padding-top: 10px; margin-bottom: 20px" (no trailing semicolon).
	 *
	 * @param array $attributes Block attributes.
	 * @return string
	 */
	public static function inline_style( array $attributes ): string {
		$parts = array();
		foreach ( self::MAP as $css => $attr ) {
			if ( ! empty( $attributes[ $attr ] ) ) {
				$parts[] = $css . ': ' . esc_attr( $attributes[ $attr ] );
			}
		}
		return implode( '; ', $parts );
	}

	/**
	 * Merge spacing declarations into an existing inline-style string.
	 *
	 * @param string $existing Existing inline style (no trailing semicolon expected).
	 * @param array  $attributes Block attributes.
	 * @return string
	 */
	public static function merge( string $existing, array $attributes ): string {
		$spacing = self::inline_style( $attributes );
		if ( '' === $existing ) {
			return $spacing;
		}
		if ( '' === $spacing ) {
			return $existing;
		}
		return rtrim( $existing, '; ' ) . '; ' . $spacing;
	}
}
