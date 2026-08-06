<?php
/**
 * Universal hover interactions (lift + transition) for every Axiom block.
 *
 * Injects `abHoverLift` + `abTransition` attributes into every `axiom-blocks/*`
 * block (mirrors the JS blocks.registerBlockType filter in src/interactions.js)
 * and, at render, adds a `.ab-has-hover` class + `--ab-hover-lift` /
 * `--ab-hover-tr` inline vars to the block's first tag. The `:hover` rule lives
 * in src/style.scss (the shared `axiom-blocks-style` sheet). Lift 0/unset ⇒ no
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
 * Central universal hover interactions.
 *
 * @since 1.1.0
 */
class Interactions {

	/**
	 * Hook the attribute injector and the render-time class/var adder.
	 *
	 * @return void
	 */
	public static function init(): void {
		add_filter( 'register_block_type_args', array( self::class, 'inject_attributes' ), 10, 2 );
		add_filter( 'render_block', array( self::class, 'add_interactions' ), 10, 2 );
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
	 * Register the two attributes server-side so they land in $block['attrs'].
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
		foreach ( array( 'abHoverLift', 'abTransition' ) as $key ) {
			if ( ! isset( $args['attributes'][ $key ] ) ) {
				$args['attributes'][ $key ] = array(
					'type'    => 'string',
					'default' => '',
				);
			}
		}
		return $args;
	}

	/**
	 * Add the `.ab-has-hover` class + lift/transition vars to the first tag.
	 *
	 * @param string $block_content Rendered block HTML.
	 * @param array  $block         Parsed block.
	 * @return string
	 */
	public static function add_interactions( string $block_content, array $block ): string {
		$name = $block['blockName'] ?? '';
		if ( ! is_string( $name ) || ! self::is_target( $name ) ) {
			return $block_content;
		}

		$attrs = $block['attrs'] ?? array();
		$lift  = isset( $attrs['abHoverLift'] ) ? (int) $attrs['abHoverLift'] : 0;
		if ( $lift <= 0 || '' === trim( $block_content ) ) {
			return $block_content;
		}
		if ( ! class_exists( '\WP_HTML_Tag_Processor' ) ) {
			return $block_content;
		}

		$transition = isset( $attrs['abTransition'] )
			&& preg_match( '/^[0-9.]+s$/', (string) $attrs['abTransition'] )
			? $attrs['abTransition']
			: '0.25s';

		$vars = '--ab-hover-lift:-' . $lift . 'px;--ab-hover-tr:' . $transition . ';';

		$processor = new \WP_HTML_Tag_Processor( $block_content );
		if ( $processor->next_tag() ) {
			$existing = $processor->get_attribute( 'style' );
			$existing = is_string( $existing ) ? rtrim( $existing, '; ' ) . ';' : '';
			$processor->set_attribute( 'style', $existing . $vars );
			$processor->add_class( 'ab-has-hover' );
			return $processor->get_updated_html();
		}
		return $block_content;
	}
}
