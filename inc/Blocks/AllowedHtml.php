<?php
/**
 * AllowedHtml — shared HTML allowlists for wp_kses calls across blocks.
 *
 * @package AxiomBlocks\Blocks
 * @since 1.0.0
 */

namespace AxiomBlocks\Blocks;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * AllowedHtml helper — shared wp_kses allowlists.
 *
 * Use this when echoing inline SVG markup that wp_kses_post() would otherwise
 * strip. For general post content, continue using wp_kses_post() — this helper
 * is intentionally SVG-only.
 *
 * @since 1.0.0
 */
class AllowedHtml {

	/**
	 * Post-content allowlist merged with the SVG allowlist.
	 *
	 * Use this only on wrapper blocks whose inner blocks legitimately emit SVG
	 * (e.g. pricing-table wraps pricing-plan which renders feature-icon SVGs).
	 * Without the merge, the post-content kses would strip the SVG that the
	 * nested block already correctly escaped.
	 *
	 * @return array<string, array<string, bool>>
	 */
	public static function post_with_svg(): array {
		return array_merge( wp_kses_allowed_html( 'post' ), self::svg() );
	}

	/**
	 * Allowlist for short WooCommerce-aware messages.
	 *
	 * Use when echoing strings that may contain:
	 *  - basic inline formatting from a user template (strong, em, br),
	 *  - class-wrapped spans (e.g. `<span class="my-amount-wrap">…</span>`),
	 *  - `wc_price()` output, which wraps the value in `<bdi>` for RTL safety.
	 *
	 * `wp_kses_post()` does not include `<bdi>` in its allowlist, so
	 * re-escaping wc_price() output through it would strip the directional
	 * isolation. This list keeps `<bdi>` intact.
	 *
	 * @return array<string, array<string, bool>>
	 */
	public static function wc_message(): array {
		return array(
			'strong' => array(),
			'em'     => array(),
			'br'     => array(),
			'span'   => array( 'class' => true ),
			'bdi'    => array( 'class' => true ),
		);
	}

	/**
	 * SVG allowlist for inline SVG markup.
	 *
	 * Union of every SVG tag/attribute combination currently used by axiom-blocks
	 * blocks (copy-to-clipboard, star-rating, trust-badges, pricing-plan).
	 *
	 * @return array<string, array<string, bool>>
	 */
	public static function svg(): array {
		return array(
			'svg'            => array(
				'xmlns'               => true,
				'xmlns:xlink'         => true,
				'version'             => true,
				'viewbox'             => true,
				'viewBox'             => true,
				'width'               => true,
				'height'              => true,
				'fill'                => true,
				'stroke'              => true,
				'stroke-width'        => true,
				'stroke-linecap'      => true,
				'stroke-linejoin'     => true,
				'aria-hidden'         => true,
				'class'               => true,
				'style'               => true,
				'preserveaspectratio' => true,
			),
			// Element/attribute KEYS must be lowercase: wp_kses lowercases
			// element and attribute names before looking them up in this array,
			// but preserves the original case in the rendered output (so SVG
			// `linearGradient`/`viewBox` render correctly to the browser).
			'title'          => array(),
			'defs'           => array( 'id' => true ),
			'lineargradient' => array(
				'id'                => true,
				'x1'                => true,
				'y1'                => true,
				'x2'                => true,
				'y2'                => true,
				'gradientunits'     => true,
				'gradienttransform' => true,
				'spreadmethod'      => true,
			),
			'radialgradient' => array(
				'id'                => true,
				'cx'                => true,
				'cy'                => true,
				'r'                 => true,
				'fx'                => true,
				'fy'                => true,
				'gradientunits'     => true,
				'gradienttransform' => true,
				'spreadmethod'      => true,
			),
			'stop'           => array(
				'offset'       => true,
				'stop-color'   => true,
				'stop-opacity' => true,
			),
			'use'            => array(
				'href'         => true,
				'xlink:href'   => true,
				'x'            => true,
				'y'            => true,
				'width'        => true,
				'height'       => true,
				'fill'         => true,
				'fill-rule'    => true,
				'fill-opacity' => true,
				'transform'    => true,
			),
			'g'              => array(
				'id'        => true,
				'fill'      => true,
				'stroke'    => true,
				'transform' => true,
				'opacity'   => true,
			),
			'path'           => array(
				'id'              => true,
				'd'               => true,
				'fill'            => true,
				'fill-rule'       => true,
				'fill-opacity'    => true,
				'clip-rule'       => true,
				'stroke'          => true,
				'stroke-width'    => true,
				'stroke-linecap'  => true,
				'stroke-linejoin' => true,
				'transform'       => true,
				'opacity'         => true,
			),
			'rect'           => array(
				'x'      => true,
				'y'      => true,
				'width'  => true,
				'height' => true,
				'rx'     => true,
				'ry'     => true,
				'fill'   => true,
				'stroke' => true,
			),
			'circle'         => array(
				'cx'     => true,
				'cy'     => true,
				'r'      => true,
				'fill'   => true,
				'stroke' => true,
			),
			'ellipse'        => array(
				'cx'     => true,
				'cy'     => true,
				'rx'     => true,
				'ry'     => true,
				'fill'   => true,
				'stroke' => true,
			),
			'polygon'        => array(
				'points' => true,
				'fill'   => true,
				'stroke' => true,
			),
			'polyline'       => array(
				'points' => true,
				'fill'   => true,
				'stroke' => true,
			),
			'line'           => array(
				'x1'     => true,
				'y1'     => true,
				'x2'     => true,
				'y2'     => true,
				'stroke' => true,
			),
		);
	}
}
