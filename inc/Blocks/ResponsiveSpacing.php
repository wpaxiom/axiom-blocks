<?php
/**
 * Central responsive-spacing wiring.
 *
 * Turns padding/margin responsive for EVERY Axiom block that has spacing, without
 * editing each block.json or render.php:
 *  - injects the 16 *Tablet / *Mobile attributes into any Axiom block that already
 *    declares `paddingTop`;
 *  - at render, adds a per-instance class to the block's wrapper and queues the
 *    Tablet/Mobile CSS (Desktop stays inline, unchanged → back-compat).
 *
 * Exception: advanced-button applies spacing to an inner element, not its wrapper,
 * so it wires responsive spacing in its own render.php and is skipped here.
 *
 * @package AxiomBlocks\Blocks
 * @since 1.0.3
 */

namespace AxiomBlocks\Blocks;

use AxiomBlocks\Frontend\ResponsiveStyles;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Central responsive spacing.
 *
 * @since 1.0.3
 */
class ResponsiveSpacing {

	/**
	 * Blocks that handle responsive spacing themselves (spacing not on the wrapper).
	 *
	 * @var string[]
	 */
	private const SELF_WIRED = array( 'axiom-blocks/advanced-button' );

	/**
	 * Initialize.
	 *
	 * @return void
	 */
	public static function init(): void {
		add_filter( 'register_block_type_args', array( self::class, 'inject_attributes' ), 10, 2 );
		add_filter( 'render_block', array( self::class, 'render' ), 10, 2 );
	}

	/**
	 * Inject *Tablet / *Mobile spacing attributes into Axiom blocks that have spacing.
	 *
	 * @param array  $args Block type registration args.
	 * @param string $name Block name.
	 * @return array
	 */
	public static function inject_attributes( array $args, string $name ): array {
		if ( 0 !== strpos( $name, 'axiom-blocks/' ) ) {
			return $args;
		}
		if ( ! isset( $args['attributes']['paddingTop'] ) ) {
			return $args;
		}
		foreach ( array_values( Responsive::spacing_map() ) as $base ) {
			foreach ( array( 'Tablet', 'Mobile' ) as $device ) {
				$key = $base . $device;
				if ( ! isset( $args['attributes'][ $key ] ) ) {
					$args['attributes'][ $key ] = array(
						'type'    => 'string',
						'default' => '',
					);
				}
			}
		}
		return $args;
	}

	/**
	 * Add the per-instance class + queue Tablet/Mobile CSS for a rendered block.
	 *
	 * @param string $block_content Rendered block HTML.
	 * @param array  $block         Parsed block.
	 * @return string
	 */
	public static function render( string $block_content, array $block ): string {
		$name = $block['blockName'] ?? '';
		if ( 0 !== strpos( $name, 'axiom-blocks/' ) || in_array( $name, self::SELF_WIRED, true ) ) {
			return $block_content;
		}
		// WP_HTML_Tag_Processor is WP 6.2+. On older WP, responsive spacing simply
		// degrades to the inline Desktop value (no fatal).
		if ( ! class_exists( '\WP_HTML_Tag_Processor' ) ) {
			return $block_content;
		}

		$attributes = $block['attrs'] ?? array();
		$map        = Responsive::spacing_map();
		if ( ! Responsive::has_overrides( $attributes, $map ) ) {
			return $block_content;
		}

		$instance_class = Responsive::instance_class( $attributes, $map );
		ResponsiveStyles::add( Responsive::css( $instance_class, $attributes, $map ) );

		if ( '' === trim( $block_content ) ) {
			return $block_content;
		}
		$processor = new \WP_HTML_Tag_Processor( $block_content );
		if ( $processor->next_tag() ) {
			$processor->add_class( $instance_class );
			return $processor->get_updated_html();
		}
		return $block_content;
	}
}
