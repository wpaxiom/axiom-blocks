<?php
/**
 * Universal position / z-index / offsets for every Axiom block.
 *
 * Injects `abPosition` / `abZIndex` / `abOffset*` attributes into every
 * `axiom-blocks/*` block (mirrors the JS blocks.registerBlockType filter in
 * src/position.js) and, at render, applies inline `position` + offsets +
 * `z-index` to the block's first tag. An unset/invalid position ⇒ no output ⇒
 * byte-identical output ⇒ back-compat safe.
 *
 * @package AxiomBlocks\Blocks
 * @since 1.1.0
 */

namespace AxiomBlocks\Blocks;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Central universal position control.
 *
 * @since 1.1.0
 */
class Position {

	/**
	 * Allowed CSS position keywords.
	 *
	 * @var string[]
	 */
	private const POSITIONS = array( 'relative', 'absolute', 'fixed', 'sticky' );

	/**
	 * Offset attribute key => CSS property.
	 *
	 * @var array<string, string>
	 */
	private const OFFSETS = array(
		'abOffsetTop'    => 'top',
		'abOffsetRight'  => 'right',
		'abOffsetBottom' => 'bottom',
		'abOffsetLeft'   => 'left',
	);

	/**
	 * Hook the attribute injector and the render-time style adder.
	 *
	 * @return void
	 */
	public static function init(): void {
		add_filter( 'register_block_type_args', array( self::class, 'inject_attributes' ), 10, 2 );
		add_filter( 'render_block', array( self::class, 'add_position' ), 10, 2 );
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
		$keys = array_merge(
			array( 'abPosition', 'abZIndex' ),
			array_keys( self::OFFSETS )
		);
		foreach ( $keys as $key ) {
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
	 * Apply inline position / offsets / z-index to the block's first tag.
	 *
	 * @param string $block_content Rendered block HTML.
	 * @param array  $block         Parsed block.
	 * @return string
	 */
	public static function add_position( string $block_content, array $block ): string {
		$name = $block['blockName'] ?? '';
		if ( ! is_string( $name ) || ! self::is_target( $name ) ) {
			return $block_content;
		}

		$attrs    = $block['attrs'] ?? array();
		$position = isset( $attrs['abPosition'] ) ? (string) $attrs['abPosition'] : '';
		if ( ! in_array( $position, self::POSITIONS, true ) || '' === trim( $block_content ) ) {
			return $block_content;
		}
		if ( ! class_exists( '\WP_HTML_Tag_Processor' ) ) {
			return $block_content;
		}

		$css = 'position:' . $position . ';';
		foreach ( self::OFFSETS as $key => $prop ) {
			$val = isset( $attrs[ $key ] ) ? (string) $attrs[ $key ] : '';
			if ( '' !== $val && preg_match( '/^-?[0-9.]+(px|%|em|rem|vh|vw)?$/', $val ) ) {
				$css .= $prop . ':' . $val . ';';
			}
		}
		$z = isset( $attrs['abZIndex'] ) ? (string) $attrs['abZIndex'] : '';
		if ( '' !== $z && preg_match( '/^-?[0-9]+$/', $z ) ) {
			$css .= 'z-index:' . $z . ';';
		}

		// `absolute` keeps the block itself in normal flow — so its native align
		// width, the theme block-gap and its margin/padding controls all stay on
		// the block and keep working — and floats only its CHILDREN in an inner
		// layer anchored to the block. `bottom` is skipped on purpose: once its
		// content floats, the host collapses to ~0 height, so a top+bottom pair
		// would force `inset:0` (a 0px box). Meaningful offsets are top/left/right.
		if ( 'absolute' === $position ) {
			$inner_css = 'position:absolute;';
			foreach ( array( 'abOffsetTop' => 'top', 'abOffsetLeft' => 'left', 'abOffsetRight' => 'right' ) as $key => $prop ) {
				$val = isset( $attrs[ $key ] ) ? (string) $attrs[ $key ] : '';
				if ( '' !== $val && preg_match( '/^-?[0-9.]+(px|%|em|rem|vh|vw)?$/', $val ) ) {
					$inner_css .= $prop . ':' . $val . ';';
				}
			}
			if ( empty( $attrs['abOffsetLeft'] ) && empty( $attrs['abOffsetRight'] ) ) {
				// No horizontal offset ⇒ span the block's align width (align=full
				// → full, align=none → content), so width follows native align.
				$inner_css .= 'left:0;right:0;';
			}
			if ( '' !== $z && preg_match( '/^-?[0-9]+$/', $z ) ) {
				$inner_css .= 'z-index:' . $z . ';';
			}

			$processor = new \WP_HTML_Tag_Processor( $block_content );
			if ( ! $processor->next_tag() ) {
				return $block_content;
			}
			$existing = $processor->get_attribute( 'style' );
			$existing = is_string( $existing ) ? rtrim( $existing, '; ' ) . ';' : '';
			$processor->set_attribute( 'style', $existing . 'position:relative;' );
			$processor->add_class( 'ab-has-position' );
			$processor->add_class( 'ab-position-host' );
			$html = $processor->get_updated_html();

			// Wrap the block's inner HTML (its children) in the absolute layer,
			// leaving the block's own opening/closing tag — and every layout it
			// owns — untouched.
			$open_end    = strpos( $html, '>' );
			$close_start = strrpos( $html, '</' );
			if ( false === $open_end || false === $close_start || $close_start <= $open_end ) {
				return $html;
			}
			$open  = substr( $html, 0, $open_end + 1 );
			$body  = substr( $html, $open_end + 1, $close_start - $open_end - 1 );
			$close = substr( $html, $close_start );

			return $open
				. '<div class="ab-position-inner ab-has-position ab-position-absolute" style="' . esc_attr( $inner_css ) . '">'
				. $body
				. '</div>'
				. $close;
		}

		// relative / sticky / fixed apply directly on the block's own tag. In-flow
		// modes keep native align width and their flow; `fixed` sits on the block
		// itself so the block's own transform (e.g. ab-entrance) can't void it.
		$processor = new \WP_HTML_Tag_Processor( $block_content );
		if ( $processor->next_tag() ) {
			$existing = $processor->get_attribute( 'style' );
			$existing = is_string( $existing ) ? rtrim( $existing, '; ' ) . ';' : '';
			$processor->set_attribute( 'style', $existing . $css );
			$processor->add_class( 'ab-has-position' );
			// Mode class so a `:has()` rule can turn the parent into the
			// positioning context for absolute blocks (see src/style.scss).
			$processor->add_class( 'ab-position-' . $position );
			return $processor->get_updated_html();
		}
		return $block_content;
	}
}
