<?php
/**
 * Responsive styles delivery.
 *
 * Dynamic blocks render during `the_content` (after wp_head), so per-instance
 * responsive CSS can't attach to a head stylesheet. We accumulate it during
 * render and print it once in the footer through the WordPress styles API
 * (wp_add_inline_style on a src-less handle) — never a raw echoed <style>, so
 * Plugin Check passes.
 *
 * @package AxiomBlocks\Frontend
 * @since 1.0.3
 */

namespace AxiomBlocks\Frontend;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Collects per-block responsive CSS and prints it via the styles API.
 *
 * @since 1.0.3
 */
class ResponsiveStyles {

	private const HANDLE = 'axiom-blocks-responsive';

	/**
	 * Accumulated CSS for the current request.
	 *
	 * @var string
	 */
	private static string $css = '';

	/**
	 * Initialize.
	 *
	 * @return void
	 */
	public static function init(): void {
		add_action( 'wp_footer', array( self::class, 'print_styles' ), 1 );
	}

	/**
	 * Queue a block instance's responsive CSS (called from render.php).
	 *
	 * @param string $css Raw CSS (no <style> tag).
	 * @return void
	 */
	public static function add( string $css ): void {
		if ( '' !== $css ) {
			self::$css .= $css;
		}
	}

	/**
	 * Print all collected responsive CSS in the footer via the styles API.
	 *
	 * @return void
	 */
	public static function print_styles(): void {
		if ( '' === self::$css ) {
			return;
		}
		wp_register_style( self::HANDLE, false, array(), AXIOM_BLOCKS_VERSION );
		wp_add_inline_style( self::HANDLE, self::$css );
		wp_print_styles( self::HANDLE );
		self::$css = '';
	}
}
