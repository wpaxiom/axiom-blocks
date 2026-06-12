<?php
/**
 * Block Registry
 *
 * @package AxiomBlocks\Blocks
 * @since 1.0.0
 */

namespace AxiomBlocks\Blocks;

use AxiomBlocks\Admin\Settings;
use AxiomBlocks\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Block Registry Class
 *
 * Handles registration of all blocks.
 */
class Registry {

	/**
	 * Register all blocks
	 *
	 * @return void
	 */
	public static function register(): void {
		self::register_scripts();
		self::register_advanced_section();
		self::register_device_visibility();
		self::register_countdown_timer();
		self::register_copy_to_clipboard();
		self::register_star_rating();
		self::register_reading_progress_bar();
		self::register_shape_divider();
		self::register_tabs();
		self::register_tab_panel();
		self::register_before_after_slider();
		self::register_pricing_table();
		self::register_pricing_plan();
		self::register_button_group();
		self::register_advanced_button();
		self::register_advanced_heading();
		self::register_icon();
		self::register_icon_list();
		self::register_trust_badges();
		self::register_free_shipping_progress();

		// Handle frontend rendering of disabled blocks.
		add_filter( 'render_block', array( self::class, 'render_disabled_block_frontend' ), 10, 2 );
	}

	/**
	 * Register block scripts
	 *
	 * @return void
	 */
	private static function register_scripts(): void {
		$editor_js  = AXIOM_BLOCKS_PLUGIN_DIR . 'build/index.js';
		$editor_css = AXIOM_BLOCKS_PLUGIN_DIR . 'build/index.css';
		$style_css  = AXIOM_BLOCKS_PLUGIN_DIR . 'build/style-index.css';

		wp_register_script(
			'axiom-blocks-editor',
			AXIOM_BLOCKS_PLUGIN_URL . 'build/index.js',
			array( 'wp-blocks', 'wp-element', 'wp-editor', 'wp-components', 'wp-i18n' ),
			file_exists( $editor_js ) ? (string) filemtime( $editor_js ) : Plugin::VERSION,
			true
		);

		wp_register_style(
			'axiom-blocks-editor-style',
			AXIOM_BLOCKS_PLUGIN_URL . 'build/index.css',
			array(),
			file_exists( $editor_css ) ? (string) filemtime( $editor_css ) : Plugin::VERSION
		);

		wp_register_style(
			'axiom-blocks-style',
			AXIOM_BLOCKS_PLUGIN_URL . 'build/style-index.css',
			array(),
			file_exists( $style_css ) ? (string) filemtime( $style_css ) : Plugin::VERSION
		);
	}

	/**
	 * Register Advanced Section Block
	 *
	 * @return void
	 */
	private static function register_advanced_section(): void {
		register_block_type( AXIOM_BLOCKS_PLUGIN_DIR . 'build/blocks/advanced-section' );
	}

	/**
	 * Register Device Visibility Block
	 *
	 * @return void
	 */
	private static function register_device_visibility(): void {
		register_block_type( AXIOM_BLOCKS_PLUGIN_DIR . 'build/blocks/device-visibility' );
	}

	/**
	 * Register Countdown Timer Block
	 *
	 * @return void
	 */
	private static function register_countdown_timer(): void {
		register_block_type( AXIOM_BLOCKS_PLUGIN_DIR . 'build/blocks/countdown-timer' );
	}

	/**
	 * Register Copy to Clipboard Block
	 *
	 * @return void
	 */
	private static function register_copy_to_clipboard(): void {
		register_block_type( AXIOM_BLOCKS_PLUGIN_DIR . 'build/blocks/copy-to-clipboard' );
	}

	/**
	 * Register Star Rating Block
	 *
	 * @return void
	 */
	private static function register_star_rating(): void {
		register_block_type( AXIOM_BLOCKS_PLUGIN_DIR . 'build/blocks/star-rating' );
	}

	/**
	 * Register Reading Progress Bar Block
	 *
	 * @return void
	 */
	private static function register_reading_progress_bar(): void {
		register_block_type( AXIOM_BLOCKS_PLUGIN_DIR . 'build/blocks/reading-progress-bar' );
	}

	/**
	 * Register Shape Divider Block
	 *
	 * @return void
	 */
	private static function register_shape_divider(): void {
		register_block_type( AXIOM_BLOCKS_PLUGIN_DIR . 'build/blocks/shape-divider' );
	}

	/**
	 * Register Tabs Block
	 *
	 * @return void
	 */
	private static function register_tabs(): void {
		register_block_type( AXIOM_BLOCKS_PLUGIN_DIR . 'build/blocks/tabs' );
	}

	/**
	 * Register Tab Panel Block (child of Tabs)
	 *
	 * @return void
	 */
	private static function register_tab_panel(): void {
		register_block_type( AXIOM_BLOCKS_PLUGIN_DIR . 'build/blocks/tabs/tab-panel' );
	}

	/**
	 * Register Before/After Slider Block
	 *
	 * @return void
	 */
	private static function register_before_after_slider(): void {
		register_block_type( AXIOM_BLOCKS_PLUGIN_DIR . 'build/blocks/before-after-slider' );
	}

	/**
	 * Register Pricing Table Block
	 *
	 * @return void
	 */
	private static function register_pricing_table(): void {
		register_block_type( AXIOM_BLOCKS_PLUGIN_DIR . 'build/blocks/pricing-table' );
	}

	/**
	 * Register Pricing Plan Block (child of Pricing Table)
	 *
	 * @return void
	 */
	private static function register_pricing_plan(): void {
		register_block_type( AXIOM_BLOCKS_PLUGIN_DIR . 'build/blocks/pricing-table/pricing-plan' );
	}

	/**
	 * Register Button Group Block (parent of Advanced Button)
	 *
	 * @return void
	 */
	private static function register_button_group(): void {
		register_block_type( AXIOM_BLOCKS_PLUGIN_DIR . 'build/blocks/button-group' );
	}

	/**
	 * Register Advanced Button Block
	 *
	 * @return void
	 */
	private static function register_advanced_button(): void {
		register_block_type( AXIOM_BLOCKS_PLUGIN_DIR . 'build/blocks/advanced-button' );
	}

	/**
	 * Register Advanced Heading Block
	 *
	 * @return void
	 */
	private static function register_advanced_heading(): void {
		register_block_type( AXIOM_BLOCKS_PLUGIN_DIR . 'build/blocks/advanced-heading' );
	}

	/**
	 * Register Icon Block
	 *
	 * @return void
	 */
	private static function register_icon(): void {
		register_block_type( AXIOM_BLOCKS_PLUGIN_DIR . 'build/blocks/icon' );
	}

	/**
	 * Register Icon List Block
	 *
	 * @return void
	 */
	private static function register_icon_list(): void {
		register_block_type( AXIOM_BLOCKS_PLUGIN_DIR . 'build/blocks/icon-list' );
	}

	/**
	 * Register Trust Badges Block
	 *
	 * @return void
	 */
	private static function register_trust_badges(): void {
		if ( ! Settings::is_woocommerce_enabled() ) {
			return;
		}
		register_block_type( AXIOM_BLOCKS_PLUGIN_DIR . 'build/blocks/trust-badges' );
	}

	/**
	 * Register Free Shipping Progress Block
	 *
	 * @return void
	 */
	private static function register_free_shipping_progress(): void {
		if ( ! Settings::is_woocommerce_enabled() ) {
			return;
		}
		register_block_type( AXIOM_BLOCKS_PLUGIN_DIR . 'build/blocks/free-shipping-progress' );
	}

	/**
	 * Render nothing for disabled blocks on frontend.
	 *
	 * @param string $block_content Block content.
	 * @param array  $block         Block data.
	 * @return string Modified content.
	 */
	public static function render_disabled_block_frontend( string $block_content, array $block ): string {
		// Only process on frontend (not admin).
		if ( is_admin() ) {
			return $block_content;
		}

		if ( empty( $block['blockName'] ) || 0 !== strpos( $block['blockName'], 'axiom-blocks/' ) ) {
			return $block_content;
		}

		$block_id = str_replace( 'axiom-blocks/', '', $block['blockName'] );
		$enabled  = Blocks::get_enabled();

		// Child/internal blocks are not independently toggleable in the dashboard.
		// If a block is not in the enabled map, leave it alone so parent blocks
		// such as Tabs can render their dynamic child panels.
		if ( ! array_key_exists( $block_id, $enabled ) || ! empty( $enabled[ $block_id ] ) ) {
			return $block_content;
		}

		// Frontend: render nothing for disabled blocks.
		return '';
	}
}
