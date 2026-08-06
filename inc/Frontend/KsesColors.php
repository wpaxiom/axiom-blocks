<?php
/**
 * Allow CSS color functions and gradient composites through kses filtering.
 *
 * safecss_filter_attr() strips allowed functions (var, calc, …) from a
 * declaration's value before testing it for unsafe characters, but rgb()/
 * rgba()/hsl()/hsla() and gradient functions are not on that list — the
 * leftover parentheses fail the test and the whole declaration is silently
 * dropped. This filter re-tests after removing strictly-matched color
 * functions and gradient composites whose arguments are safe.
 *
 * @package AxiomBlocks\Frontend
 * @since 1.0.6
 */

namespace AxiomBlocks\Frontend;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Rescues color functions and gradient composites from safecss_filter_attr().
 *
 * @since 1.0.6
 */
class KsesColors {

	/**
	 * Strictly-matched color functions: only digits, dots, commas, percent
	 * signs, spaces, and slashes may appear between the parentheses.
	 */
	private const COLOR_FN_PATTERN = '/\b(?:rgb|rgba|hsl|hsla)\(\s*[0-9.,%\s\/]*\)/i';

	/**
	 * Gradient functions used in composite background values (e.g.
	 * `linear-gradient(…), url(…) center / cover`). Core's built-in gradient
	 * check only matches when the ENTIRE value is a gradient; composites
	 * (gradient + url) slip through with unmatched parentheses.
	 *
	 * Matches: linear-gradient, radial-gradient, conic-gradient, and their
	 * repeating variants. Inner content may contain nested color functions
	 * (rgb/rgba/hsl/hsla), hex colors, percentages, angles, and commas.
	 */
	private const GRADIENT_FN_PATTERN = '/(?:repeating-)?(?:linear|radial|conic)-gradient\((?:[^()]|\([^()]*\))*\)/i';

	/**
	 * URL functions in composite values (e.g. `linear-gradient(…), url(…)`).
	 * Core's URL check only fires when the value STARTS with `url(`, so
	 * composites where `url()` appears after a gradient slip through with
	 * unmatched parentheses.
	 */
	private const URL_FN_PATTERN = '/url\(\s*[\'"][^"\']*[\'"]\s*\)/i';

	/**
	 * Initialize.
	 *
	 * @return void
	 */
	public static function init(): void {
		add_filter( 'safecss_filter_attr_allow_css', array( self::class, 'allow_color_functions' ), 10, 2 );
	}

	/**
	 * Re-test a rejected declaration with color functions and gradients removed.
	 *
	 * @param bool   $allow_css       Whether the declaration passed core's test.
	 * @param string $css_test_string The declaration under test (allowed
	 *                                functions already stripped by core).
	 * @return bool
	 */
	public static function allow_color_functions( $allow_css, $css_test_string ) {
		if ( $allow_css ) {
			return $allow_css;
		}

		$stripped = (string) $css_test_string;

		// Strip gradient composites first (they may contain nested color fns).
		$stripped = preg_replace( self::GRADIENT_FN_PATTERN, '', $stripped );

		// Strip URL functions in composites (e.g. `linear-gradient(…), url(…)`)
		// where core's URL check didn't fire because value didn't start with url().
		$stripped = preg_replace( self::URL_FN_PATTERN, '', $stripped );

		// Strip remaining standalone color functions.
		$stripped = preg_replace( self::COLOR_FN_PATTERN, '', $stripped );

		if ( null === $stripped || $stripped === $css_test_string ) {
			return $allow_css;
		}

		// Core's own unsafe-character test, applied to the remainder.
		return ! preg_match( '%[\\\(&=}]|/\*%', $stripped );
	}
}
