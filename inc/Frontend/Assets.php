<?php
/**
 * Frontend Assets
 *
 * @package AxiomBlocks\Frontend
 * @since 1.0.0
 */

namespace AxiomBlocks\Frontend;

use AxiomBlocks\Admin\Settings;
use AxiomBlocks\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Frontend Assets Class
 *
 * Handles frontend asset enqueueing.
 */
class Assets {

	/**
	 * Initialize
	 *
	 * @return void
	 */
	public static function init(): void {
		add_action( 'wp_enqueue_scripts', array( self::class, 'enqueue' ) );
	}

	/**
	 * Enqueue frontend assets
	 *
	 * @return void
	 */
	public static function enqueue(): void {

		if ( ! Settings::is_assets_conditional() || self::has_axiom_blocks_block() ) {
			wp_enqueue_style( 'axiom-blocks-style' );
		}

		if ( self::needs_rest_api() ) {
			wp_register_script( 'axiom-blocks-api', false, array(), Plugin::VERSION, true );
			wp_localize_script(
				'axiom-blocks-api',
				'axiomBlocksApi',
				array(
					'root'  => esc_url_raw( rest_url() ),
					'nonce' => wp_create_nonce( 'wp_rest' ),
				)
			);
			wp_enqueue_script( 'axiom-blocks-api' );
		}
	}

	/**
	 * Check if current page has axiom-blocks blocks
	 *
	 * @return bool
	 */
	private static function has_axiom_blocks_block(): bool {
		return has_block( 'axiom-blocks/advanced-section' )
			|| has_block( 'axiom-blocks/device-visibility' )
			|| has_block( 'axiom-blocks/countdown-timer' )
			|| has_block( 'axiom-blocks/copy-to-clipboard' )
			|| has_block( 'axiom-blocks/star-rating' )
			|| has_block( 'axiom-blocks/reading-progress-bar' )
			|| has_block( 'axiom-blocks/shape-divider' )
			|| has_block( 'axiom-blocks/tabs' )
			|| has_block( 'axiom-blocks/before-after-slider' )
			|| has_block( 'axiom-blocks/trust-badges' )
			|| has_block( 'axiom-blocks/free-shipping-progress' );
	}

	/**
	 * Pages that need the REST API global (window.axiomBlocksApi).
	 * Add new API-consuming blocks to this list as they're built.
	 *
	 * @return bool
	 */
	private static function needs_rest_api(): bool {
		return has_block( 'axiom-blocks/free-shipping-progress' );
	}
}
