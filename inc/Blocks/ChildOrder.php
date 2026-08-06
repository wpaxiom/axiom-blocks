<?php
/**
 * Universal per-child flex/grid order for Axiom blocks (L6 reorder).
 *
 * Injects `abOrder` / `abOrderTablet` / `abOrderMobile` into every `axiom-blocks/*`
 * block (mirrors src/childOrder.js) and, at render, applies a desktop `order`
 * inline plus Tablet/Mobile `order` overrides via the shared Responsive helper
 * (so a child can reorder on mobile inside a flex/grid Advanced Section). `order`
 * is inert outside a flex/grid parent, and an unset value ⇒ no output ⇒
 * byte-identical / back-compat safe.
 *
 * @package AxiomBlocks\Blocks
 * @since 1.1.0
 */

namespace AxiomBlocks\Blocks;

use AxiomBlocks\Frontend\ResponsiveStyles;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Central universal child-order control.
 *
 * @since 1.1.0
 */
class ChildOrder {

	/**
	 * Responsive spec for the `order` property.
	 *
	 * @var array<int, array<string, string>>
	 */
	private const SPECS = array(
		array(
			'prop'     => 'order',
			'key'      => 'abOrder',
			'selector' => '',
			'format'   => '',
			'type'     => 'number',
		),
	);

	/**
	 * Hook the attribute injector and the render-time order emitter.
	 *
	 * @return void
	 */
	public static function init(): void {
		add_filter( 'register_block_type_args', array( self::class, 'inject_attributes' ), 10, 2 );
		add_filter( 'render_block', array( self::class, 'add_order' ), 10, 2 );
	}

	/**
	 * Whether a block name is an Axiom block.
	 *
	 * @param string $name Block name.
	 * @return bool
	 */
	private static function is_target( string $name ): bool {
		return 0 === strpos( $name, 'axiom-blocks/' );
	}

	/**
	 * Register the attributes server-side so they land in $block['attrs'].
	 *
	 * @param array  $args Block type args.
	 * @param string $name Block name.
	 * @return array
	 */
	public static function inject_attributes( array $args, string $name ): array {
		if ( ! self::is_target( (string) $name ) ) {
			return $args;
		}
		if ( ! isset( $args['attributes'] ) || ! is_array( $args['attributes'] ) ) {
			$args['attributes'] = array();
		}
		foreach ( array( 'abOrder', 'abOrderTablet', 'abOrderMobile' ) as $key ) {
			if ( ! isset( $args['attributes'][ $key ] ) ) {
				$args['attributes'][ $key ] = array( 'type' => 'number' );
			}
		}
		return $args;
	}

	/**
	 * Apply desktop `order` inline + Tablet/Mobile overrides via the Responsive helper.
	 *
	 * @param string $block_content Rendered block HTML.
	 * @param array  $block         Parsed block.
	 * @return string
	 */
	public static function add_order( string $block_content, array $block ): string {
		$name = $block['blockName'] ?? '';
		if ( ! is_string( $name ) || ! self::is_target( $name ) ) {
			return $block_content;
		}

		$attrs   = $block['attrs'] ?? array();
		$desktop = $attrs['abOrder'] ?? '';
		$has_resp = Responsive::props_has_overrides( $attrs, self::SPECS );
		if ( ( '' === (string) $desktop && ! $has_resp ) || '' === trim( $block_content ) ) {
			return $block_content;
		}
		if ( ! class_exists( '\WP_HTML_Tag_Processor' ) ) {
			return $block_content;
		}

		$processor = new \WP_HTML_Tag_Processor( $block_content );
		if ( ! $processor->next_tag() ) {
			return $block_content;
		}

		// Desktop order inline (Tablet/Mobile rules below carry !important, so they
		// still win at their breakpoints).
		if ( '' !== (string) $desktop && preg_match( '/^-?\d+$/', (string) $desktop ) ) {
			$existing = $processor->get_attribute( 'style' );
			$existing = is_string( $existing ) ? rtrim( $existing, '; ' ) . ';' : '';
			$processor->set_attribute( 'style', $existing . 'order:' . (int) $desktop . ';' );
		}

		if ( $has_resp ) {
			$instance_class = Responsive::props_instance_class( $attrs, self::SPECS );
			ResponsiveStyles::add( Responsive::props_css( $instance_class, $attrs, self::SPECS ) );
			$processor->add_class( $instance_class );
		}

		return $processor->get_updated_html();
	}
}
