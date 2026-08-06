<?php
/**
 * Universal scroll-in entrance animation for every Axiom block.
 *
 * Injects `abEntrance` into every `axiom-blocks/*` block (mirrors the JS
 * blocks.registerBlockType filter in src/entrance.js) and, at render, adds
 * `ab-entrance ab-entrance-{type}` to the block's first tag. The CSS-only,
 * scroll-driven reveal lives in src/style.scss. An unset/invalid value ⇒ no
 * class ⇒ byte-identical output ⇒ back-compat safe.
 *
 * @package AxiomBlocks\Blocks
 * @since 1.1.0
 */

namespace AxiomBlocks\Blocks;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Central universal entrance animation control.
 *
 * @since 1.1.0
 */
class Entrance {

	/**
	 * Allowed entrance types.
	 *
	 * @var string[]
	 */
	private const TYPES = array(
		'fade',
		'fade-up',
		'fade-down',
		'fade-left',
		'fade-right',
		'zoom-in',
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
	 * Whether a block name is an Axiom block.
	 *
	 * @param string $name Block name.
	 * @return bool
	 */
	private static function is_target( string $name ): bool {
		return 0 === strpos( $name, 'axiom-blocks/' );
	}

	/**
	 * Register the attribute server-side so it lands in $block['attrs'].
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
		if ( ! isset( $args['attributes']['abEntrance'] ) ) {
			$args['attributes']['abEntrance'] = array(
				'type'    => 'string',
				'default' => '',
			);
		}
		return $args;
	}

	/**
	 * Add the entrance classes to the block's first tag.
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

		$attrs = $block['attrs'] ?? array();
		$type  = isset( $attrs['abEntrance'] ) ? (string) $attrs['abEntrance'] : '';
		if ( ! in_array( $type, self::TYPES, true ) || '' === trim( $block_content ) ) {
			return $block_content;
		}
		if ( ! class_exists( '\WP_HTML_Tag_Processor' ) ) {
			return $block_content;
		}

		$processor = new \WP_HTML_Tag_Processor( $block_content );
		if ( $processor->next_tag() ) {
			$processor->add_class( 'ab-entrance' );
			$processor->add_class( 'ab-entrance-' . $type );
			return $processor->get_updated_html();
		}
		return $block_content;
	}
}
