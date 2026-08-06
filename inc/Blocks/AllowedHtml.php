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
		$allowed = array_merge( wp_kses_allowed_html( 'post' ), self::svg() );
		// Wrapper blocks aggregate arbitrary inner blocks; many carry data-*
		// attributes (interactivity, config). Allow the data-* wildcard on every
		// element so nested blocks keep working through the wrapper's kses.
		foreach ( $allowed as $tag => $attrs ) {
			if ( is_array( $attrs ) ) {
				$allowed[ $tag ]['data-*'] = true;
			}
		}
		return $allowed;
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
		// Element/attribute KEYS must be lowercase: wp_kses lowercases element and
		// attribute names before lookup, but preserves the original case in the
		// rendered output (so SVG `linearGradient`/`viewBox` still render).
		//
		// Shared presentation attributes allowed on every shape/group element, so
		// arbitrary inner-block SVG (icons, ratings, dividers) survives the kses in
		// wrapper blocks instead of being silently stripped.
		$p = array(
			'fill'              => true,
			'fill-rule'         => true,
			'fill-opacity'      => true,
			'stroke'            => true,
			'stroke-width'      => true,
			'stroke-linecap'    => true,
			'stroke-linejoin'   => true,
			'stroke-dasharray'  => true,
			'stroke-dashoffset' => true,
			'stroke-miterlimit' => true,
			'stroke-opacity'    => true,
			'clip-rule'         => true,
			'opacity'           => true,
			'color'             => true,
			'transform'         => true,
			'style'             => true,
			'class'             => true,
			'id'                => true,
			'mask'              => true,
			'clip-path'         => true,
			'filter'            => true,
		);

		return array(
			'svg'            => array_merge(
				$p,
				array(
					'xmlns'               => true,
					'xmlns:xlink'         => true,
					'version'             => true,
					'viewbox'             => true,
					'viewBox'             => true,
					'width'               => true,
					'height'              => true,
					'x'                   => true,
					'y'                   => true,
					'aria-hidden'         => true,
					'aria-label'          => true,
					'role'                => true,
					'focusable'           => true,
					'preserveaspectratio' => true,
				)
			),
			'g'              => array_merge( $p, array( 'transform' => true ) ),
			'title'          => array(),
			'desc'           => array(),
			'defs'           => array( 'id' => true ),
			'path'           => array_merge( $p, array( 'd' => true ) ),
			'rect'           => array_merge( $p, array( 'x' => true, 'y' => true, 'width' => true, 'height' => true, 'rx' => true, 'ry' => true ) ),
			'circle'         => array_merge( $p, array( 'cx' => true, 'cy' => true, 'r' => true ) ),
			'ellipse'        => array_merge( $p, array( 'cx' => true, 'cy' => true, 'rx' => true, 'ry' => true ) ),
			'line'           => array_merge( $p, array( 'x1' => true, 'y1' => true, 'x2' => true, 'y2' => true ) ),
			'polygon'        => array_merge( $p, array( 'points' => true ) ),
			'polyline'       => array_merge( $p, array( 'points' => true ) ),
			'text'           => array_merge( $p, array( 'x' => true, 'y' => true, 'dx' => true, 'dy' => true, 'text-anchor' => true, 'font-size' => true, 'font-family' => true, 'font-weight' => true, 'letter-spacing' => true ) ),
			'tspan'          => array_merge( $p, array( 'x' => true, 'y' => true, 'dx' => true, 'dy' => true ) ),
			'use'            => array_merge( $p, array( 'href' => true, 'xlink:href' => true, 'x' => true, 'y' => true, 'width' => true, 'height' => true ) ),
			'lineargradient' => array( 'id' => true, 'x1' => true, 'y1' => true, 'x2' => true, 'y2' => true, 'gradientunits' => true, 'gradienttransform' => true, 'spreadmethod' => true ),
			'radialgradient' => array( 'id' => true, 'cx' => true, 'cy' => true, 'r' => true, 'fx' => true, 'fy' => true, 'gradientunits' => true, 'gradienttransform' => true, 'spreadmethod' => true ),
			'stop'           => array( 'offset' => true, 'stop-color' => true, 'stop-opacity' => true, 'style' => true ),
			'mask'           => array( 'id' => true, 'x' => true, 'y' => true, 'width' => true, 'height' => true, 'maskunits' => true, 'maskcontentunits' => true ),
			'clippath'       => array( 'id' => true, 'clippathunits' => true ),
			'pattern'        => array( 'id' => true, 'x' => true, 'y' => true, 'width' => true, 'height' => true, 'patternunits' => true, 'patterncontentunits' => true, 'patterntransform' => true, 'viewbox' => true ),
			'symbol'         => array( 'id' => true, 'viewbox' => true, 'preserveaspectratio' => true ),
			'marker'         => array( 'id' => true, 'markerwidth' => true, 'markerheight' => true, 'refx' => true, 'refy' => true, 'orient' => true, 'markerunits' => true, 'viewbox' => true ),
			'foreignobject'  => array( 'x' => true, 'y' => true, 'width' => true, 'height' => true ),
			'filter'         => array( 'id' => true, 'x' => true, 'y' => true, 'width' => true, 'height' => true, 'filterunits' => true ),
			'fegaussianblur' => array( 'in' => true, 'stddeviation' => true, 'result' => true, 'edgemode' => true ),
			'feoffset'       => array( 'in' => true, 'dx' => true, 'dy' => true, 'result' => true ),
			'feblend'        => array( 'in' => true, 'in2' => true, 'mode' => true, 'result' => true ),
			'fecolormatrix'  => array( 'in' => true, 'type' => true, 'values' => true, 'result' => true ),
			'fecomposite'    => array( 'in' => true, 'in2' => true, 'operator' => true, 'k1' => true, 'k2' => true, 'k3' => true, 'k4' => true, 'result' => true ),
			'feflood'        => array( 'flood-color' => true, 'flood-opacity' => true, 'result' => true ),
			'femerge'        => array( 'result' => true ),
			'femergenode'    => array( 'in' => true ),
			'fedropshadow'   => array( 'dx' => true, 'dy' => true, 'stddeviation' => true, 'flood-color' => true, 'flood-opacity' => true ),
		);
	}
}
