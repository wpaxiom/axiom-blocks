<?php
/**
 * Universal device visibility for every Axiom block.
 *
 * Injects three boolean attributes (hideDesktop/hideTablet/hideMobile) into
 * every `axiom-blocks/*` block (mirrors the JS blocks.registerBlockType filter
 * in src/deviceVisibility.js) and, at render, adds the matching
 * `.ab-hide-{device}` class to the block's first tag. The media rules live in
 * src/style.scss (the shared `axiom-blocks-style` sheet). All-false ⇒ no class
 * ⇒ byte-identical output ⇒ back-compat safe.
 *
 * The standalone Device Visibility block keeps its own showOn* controls and is
 * excluded.
 *
 * @package AxiomBlocks\Blocks
 * @since 1.1.0
 */

namespace AxiomBlocks\Blocks;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Central universal device visibility.
 *
 * @since 1.1.0
 */
class DeviceVisibility {

	/**
	 * Attribute key => the class added when that attribute is true.
	 *
	 * @var array<string, string>
	 */
	private const MAP = array(
		'hideDesktop' => 'ab-hide-desktop',
		'hideTablet'  => 'ab-hide-tablet',
		'hideMobile'  => 'ab-hide-mobile',
	);

	/**
	 * Hook the attribute injector and the render-time class adder.
	 *
	 * @return void
	 */
	public static function init(): void {
		add_filter( 'register_block_type_args', array( self::class, 'inject_attributes' ), 10, 2 );
		add_filter( 'render_block', array( self::class, 'add_classes' ), 10, 2 );
	}

	/**
	 * Whether a block name is a target (an Axiom block that isn't the standalone
	 * Device Visibility block).
	 *
	 * @param string $name Block name.
	 * @return bool
	 */
	private static function is_target( string $name ): bool {
		return 0 === strpos( $name, 'axiom-blocks/' )
			&& 'axiom-blocks/device-visibility' !== $name;
	}

	/**
	 * Register the three boolean attributes server-side so they land in
	 * $block['attrs'] at render.
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
		foreach ( array_keys( self::MAP ) as $key ) {
			if ( ! isset( $args['attributes'][ $key ] ) ) {
				$args['attributes'][ $key ] = array(
					'type'    => 'boolean',
					'default' => false,
				);
			}
		}
		return $args;
	}

	/**
	 * Add the `.ab-hide-{device}` class(es) to the block's first tag.
	 *
	 * @param string $block_content Rendered block HTML.
	 * @param array  $block         Parsed block.
	 * @return string
	 */
	public static function add_classes( string $block_content, array $block ): string {
		$name = $block['blockName'] ?? '';
		if ( ! is_string( $name ) || ! self::is_target( $name ) ) {
			return $block_content;
		}

		$attrs   = $block['attrs'] ?? array();
		$classes = array();
		foreach ( self::MAP as $key => $class ) {
			if ( ! empty( $attrs[ $key ] ) ) {
				$classes[] = $class;
			}
		}

		if ( empty( $classes ) || '' === trim( $block_content ) ) {
			return $block_content;
		}
		if ( ! class_exists( '\WP_HTML_Tag_Processor' ) ) {
			return $block_content;
		}

		$processor = new \WP_HTML_Tag_Processor( $block_content );
		if ( $processor->next_tag() ) {
			foreach ( $classes as $class ) {
				$processor->add_class( $class );
			}
			return $processor->get_updated_html();
		}
		return $block_content;
	}
}
