<?php
/**
 * Blocks Utility Class
 *
 * @package AxiomBlocks\Blocks
 * @since 1.0.0
 */

namespace AxiomBlocks\Blocks;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Utility class for managing Axiom Blocks blocks.
 */
class Blocks {

	/**
	 * Block catalog — only blocks that actually have a build folder.
	 * Roadmap entries live in axiom-blocks-block-tracker.csv, not here.
	 *
	 * @var array
	 */
	private static array $config = array(
		// ── Layout ───────────────────────────────────────────────────────────
		array(
			'id'          => 'device-visibility',
			'name'        => 'Device Visibility',
			'category'    => 'layout',
			'tier'        => 'free',
			'description' => 'Show/hide content by device type',
			'icon'        => 'hidden',
		),
		array(
			'id'          => 'advanced-section',
			'name'        => 'Advanced Section',
			'category'    => 'layout',
			'tier'        => 'free',
			'description' => 'Full-width container with backgrounds and overlays',
			'icon'        => 'cover-image',
		),
		array(
			'id'          => 'shape-divider',
			'name'        => 'Shape Divider',
			'category'    => 'layout',
			'tier'        => 'free',
			'description' => '5 shapes: wave, curve, triangle, tilt, slant',
			'icon'        => 'editor-ul',
		),
		array(
			'id'          => 'reading-progress-bar',
			'name'        => 'Reading Progress Bar',
			'category'    => 'layout',
			'tier'        => 'free',
			'description' => 'Sticky scroll progress indicator',
			'icon'        => 'editor-justify',
		),

		// ── Content ──────────────────────────────────────────────────────────
		array(
			'id'          => 'tabs',
			'name'        => 'Tabs',
			'category'    => 'content',
			'tier'        => 'free',
			'description' => 'Horizontal tabs with any blocks inside',
			'icon'        => 'table-col-after',
		),
		array(
			'id'          => 'countdown-timer',
			'name'        => 'Countdown Timer',
			'category'    => 'content',
			'tier'        => 'free',
			'description' => 'Live countdown to a target date',
			'icon'        => 'clock',
		),
		array(
			'id'          => 'copy-to-clipboard',
			'name'        => 'Copy to Clipboard',
			'category'    => 'content',
			'tier'        => 'free',
			'description' => 'Button that copies text or code snippets',
			'icon'        => 'clipboard',
		),
		array(
			'id'          => 'star-rating',
			'name'        => 'Star Rating',
			'category'    => 'content',
			'tier'        => 'free',
			'description' => '5-star display block for reviews',
			'icon'        => 'star-filled',
		),
		array(
			'id'          => 'before-after-slider',
			'name'        => 'Before/After Slider',
			'category'    => 'content',
			'tier'        => 'free',
			'description' => 'Drag to compare two images',
			'icon'        => 'leftright',
		),
		array(
			'id'          => 'pricing-table',
			'name'        => 'Pricing Table',
			'category'    => 'content',
			'tier'        => 'free',
			'description' => 'Pricing plans with feature lists and CTAs',
			'icon'        => 'money-alt',
		),
		array(
			'id'          => 'advanced-button',
			'name'        => 'Advanced Button',
			'category'    => 'content',
			'tier'        => 'free',
			'description' => 'Button with icons, hover states, and sub-captions',
			'icon'        => 'button',
		),
		array(
			'id'          => 'advanced-heading',
			'name'        => 'Advanced Heading',
			'category'    => 'content',
			'tier'        => 'free',
			'description' => 'Heading with highlight spans, sub-heading, and accent line',
			'icon'        => 'heading',
		),
		array(
			'id'          => 'icon',
			'name'        => 'Icon',
			'category'    => 'content',
			'tier'        => 'free',
			'description' => 'Library or custom SVG icon with shape, colour, and link',
			'icon'        => 'star-filled',
		),
		array(
			'id'          => 'icon-list',
			'name'        => 'Icon List',
			'category'    => 'content',
			'tier'        => 'free',
			'description' => 'List with a custom icon on every row',
			'icon'        => 'editor-ul',
		),
		array(
			'id'          => 'accordion',
			'name'        => 'Accordion',
			'category'    => 'content',
			'tier'        => 'free',
			'description' => 'Collapsible panels for FAQs and disclosures',
			'icon'        => 'list-view',
		),
		array(
			'id'          => 'notice',
			'name'        => 'Notice / Alert',
			'category'    => 'content',
			'tier'        => 'free',
			'description' => 'Dismissible info, success, warning, or error message',
			'icon'        => 'warning',
		),
		array(
			'id'          => 'counter-group',
			'name'        => 'Counter',
			'category'    => 'content',
			'tier'        => 'free',
			'description' => 'Animated count-up statistics with icons and labels',
			'icon'        => 'chart-bar',
		),
		array(
			'id'          => 'testimonials',
			'name'        => 'Testimonials',
			'category'    => 'content',
			'tier'        => 'free',
			'description' => 'Grid, carousel, or marquee testimonials with ratings',
			'icon'        => 'format-quote',
		),

		// ── WooCommerce ──────────────────────────────────────────────────────
		array(
			'id'          => 'trust-badges',
			'name'        => 'Trust Badges',
			'category'    => 'woocommerce',
			'tier'        => 'wc-free',
			'description' => 'Secure checkout icons with presets',
			'icon'        => 'shield',
		),
		array(
			'id'          => 'free-shipping-progress',
			'name'        => 'Free Shipping Progress',
			'category'    => 'woocommerce',
			'tier'        => 'wc-free',
			'description' => 'Add $X more for free shipping bar',
			'icon'        => 'car',
		),
	);

	/**
	 * Get all registered blocks.
	 *
	 * @return array The block configurations.
	 */
	public static function get_all(): array {
		return self::$config;
	}

	/**
	 * All blocks default to enabled. Users can opt out per-block from the
	 * dashboard.
	 */
	public static function get_default_enabled(): array {
		$defaults = array();
		foreach ( self::$config as $block ) {
			$defaults[ $block['id'] ] = true;
		}
		return $defaults;
	}

	/**
	 * Get all enabled blocks.
	 *
	 * @return array The enabled block settings.
	 */
	public static function get_enabled(): array {
		$saved = get_option( 'axiom_blocks_enabled_blocks', array() );
		return array_merge( self::get_default_enabled(), is_array( $saved ) ? $saved : array() );
	}

	/**
	 * Check if a specific block is enabled.
	 *
	 * @param string $block_id The block ID.
	 * @return bool True if enabled, false otherwise.
	 */
	public static function is_enabled( string $block_id ): bool {
		$enabled = self::get_enabled();
		return $enabled[ $block_id ] ?? false;
	}

	/**
	 * Set the enabled state for a specific block.
	 *
	 * @param string $block_id The block ID.
	 * @param bool   $enabled Whether the block should be enabled.
	 * @return void
	 */
	public static function set_enabled( string $block_id, bool $enabled ): void {
		$blocks              = self::get_enabled();
		$blocks[ $block_id ] = $enabled;
		update_option( 'axiom_blocks_enabled_blocks', $blocks );
	}

	/**
	 * Get all disabled block IDs.
	 *
	 * @return array List of disabled block IDs.
	 */
	public static function get_disabled(): array {
		$enabled  = self::get_enabled();
		$disabled = array();
		foreach ( self::$config as $block ) {
			if ( empty( $enabled[ $block['id'] ] ) ) {
				$disabled[] = $block['id'];
			}
		}
		return $disabled;
	}
}
