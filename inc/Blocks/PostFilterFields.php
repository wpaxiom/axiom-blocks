<?php
/**
 * Post Filter field anatomy.
 *
 * Every control in a filter bar is the same shape: an optional label plus a
 * control, sized by a width preset. The four child blocks share that shape, so
 * they share this helper rather than each re-deriving the classes and vars.
 *
 * Mirrors fieldClass() / fieldVars() / showsLabel() in
 * src/blocks/post-filter/shared.js. Change one, change the other, or the editor
 * and the frontend drift apart.
 *
 * @package AxiomBlocks\Blocks
 * @since 1.0.8
 */

namespace AxiomBlocks\Blocks;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Shared markup helpers for Post Filter child controls.
 */
class PostFilterFields {

	/**
	 * Width presets a field may take. Anything else is ignored.
	 */
	const WIDTHS = array( 'full', 'half', 'custom' );

	/**
	 * Label positions a field may take. The empty default stacks the label
	 * above its control.
	 */
	const LABEL_POSITIONS = array( 'inline', 'hidden' );

	/**
	 * Build the modifier classes for a field wrapper.
	 *
	 * @param array $attributes Block attributes.
	 * @return string Space-joined classes, empty when nothing applies.
	 */
	public static function classes( array $attributes ): string {
		$classes = array();

		$width = (string) ( $attributes['width'] ?? '' );
		if ( in_array( $width, self::WIDTHS, true ) ) {
			$classes[] = 'ab-pff--w-' . $width;
		}

		$position = (string) ( $attributes['labelPosition'] ?? '' );
		if ( in_array( $position, self::LABEL_POSITIONS, true ) ) {
			$classes[] = 'ab-pff--label-' . $position;
		}

		return implode( ' ', $classes );
	}

	/**
	 * Build the field wrapper's own CSS custom properties, as `prop: value`
	 * parts ready to merge with a block's style string.
	 *
	 * @param array $attributes Block attributes.
	 * @return array List of declarations.
	 */
	public static function style_parts( array $attributes ): array {
		$parts = array();

		if ( ! empty( $attributes['widthCustom'] ) ) {
			$parts[] = '--ab-pff-w: ' . $attributes['widthCustom'];
		}
		if ( ! empty( $attributes['labelGap'] ) ) {
			$parts[] = '--ab-pff-label-gap: ' . $attributes['labelGap'];
		}

		return $parts;
	}

	/**
	 * Whether a field renders its label. An empty label hides it regardless,
	 * which is how the shipped fields already behave.
	 *
	 * @param array $attributes Block attributes.
	 * @return bool True when the label should render.
	 */
	public static function shows_label( array $attributes ): bool {
		if ( isset( $attributes['showLabel'] ) && ! $attributes['showLabel'] ) {
			return false;
		}
		return '' !== (string) ( $attributes['label'] ?? '' );
	}
}
