<?php
/**
 * AllowedHtml - shared HTML allowlists for wp_kses calls across blocks.
 *
 * @package AxiomBlocks\Blocks
 * @since 1.0.0
 */

namespace AxiomBlocks\Blocks;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * AllowedHtml helper - shared wp_kses allowlists.
 *
 * Use these when echoing markup that wp_kses_post() would otherwise strip:
 * inline SVG, and the form controls a nested block may emit. For general post
 * content, continue using wp_kses_post().
 *
 * @since 1.0.0
 */
class AllowedHtml {

	/**
	 * Post-content allowlist merged with the SVG and form allowlists.
	 *
	 * Use this only on wrapper blocks whose inner blocks legitimately emit SVG
	 * or form controls (e.g. pricing-table wraps pricing-plan which renders
	 * feature-icon SVGs; advanced-section can wrap a post-filter bar). Without
	 * the merge, the post-content kses would strip markup that the nested block
	 * already correctly escaped.
	 *
	 * @return array<string, array<string, bool>>
	 */
	public static function post_with_svg(): array {
		$allowed = array_merge( wp_kses_allowed_html( 'post' ), self::svg(), self::form() );
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
	 * Allowlist for form controls.
	 *
	 * `wp_kses_allowed_html( 'post' )` carries `button`, `label`, `textarea`,
	 * `fieldset` and `legend`, but not `form`, `input`, `select`, `option` or
	 * `optgroup`. A wrapper block running its inner content through the post
	 * allowlist therefore deletes the form element and both controls of a
	 * nested Post Filter bar, leaving the option text behind as bare text.
	 *
	 * Only the five missing tags are declared here. Re-declaring one the post
	 * allowlist already carries would replace core's attribute set with this
	 * one and narrow it.
	 *
	 * @return array<string, array<string, bool>>
	 */
	public static function form(): array {
		// Mirrors core's _wp_add_global_attributes(), which the post allowlist
		// applies to its own tags but cannot apply to tags added here.
		$g = array(
			'aria-controls'    => true,
			'aria-current'     => true,
			'aria-describedby' => true,
			'aria-expanded'    => true,
			'aria-hidden'      => true,
			'aria-label'       => true,
			'aria-labelledby'  => true,
			'aria-live'        => true,
			'class'            => true,
			'dir'              => true,
			'hidden'           => true,
			'id'               => true,
			'lang'             => true,
			'role'             => true,
			'style'            => true,
			'tabindex'         => true,
			'title'            => true,
		);

		return array(
			'form'     => array_merge(
				$g,
				array(
					'accept-charset' => true,
					'action'         => true,
					'autocomplete'   => true,
					'enctype'        => true,
					'method'         => true,
					'name'           => true,
					'novalidate'     => true,
					'target'         => true,
				)
			),
			'input'    => array_merge(
				$g,
				array(
					'accept'       => true,
					'autocomplete' => true,
					'checked'      => true,
					'disabled'     => true,
					'list'         => true,
					'max'          => true,
					'maxlength'    => true,
					'min'          => true,
					'minlength'    => true,
					'multiple'     => true,
					'name'         => true,
					'pattern'      => true,
					'placeholder'  => true,
					'readonly'     => true,
					'required'     => true,
					'size'         => true,
					'step'         => true,
					'type'         => true,
					'value'        => true,
				)
			),
			'select'   => array_merge(
				$g,
				array(
					'autocomplete' => true,
					'disabled'     => true,
					'multiple'     => true,
					'name'         => true,
					'required'     => true,
					'size'         => true,
				)
			),
			'option'   => array_merge(
				$g,
				array(
					'disabled' => true,
					'label'    => true,
					'selected' => true,
					'value'    => true,
				)
			),
			'optgroup' => array_merge(
				$g,
				array(
					'disabled' => true,
					'label'    => true,
				)
			),
		);
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
