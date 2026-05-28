<?php
/**
 * Admin Dashboard
 *
 * @package AxiomBlocks\Admin
 * @since 1.0.0
 */

namespace AxiomBlocks\Admin;

use AxiomBlocks\Blocks\Blocks;
use AxiomBlocks\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Admin Dashboard Class
 *
 * Handles admin UI only.
 */
class Dashboard {

	/**
	 * Initialize
	 *
	 * @return void
	 */
	public static function init(): void {
		add_action( 'admin_menu', array( self::class, 'add_menu' ) );
		add_action( 'admin_init', array( self::class, 'register_settings' ) );
		add_action( 'admin_enqueue_scripts', array( self::class, 'enqueue_assets' ) );
		add_action( 'admin_enqueue_scripts', array( self::class, 'enqueue_menu_icon_styles' ) );
	}

	/**
	 * Add admin menu
	 *
	 * @return void
	 */
	public static function add_menu(): void {
		$icon_url = AXIOM_BLOCKS_PLUGIN_URL . 'src/admin/assets/icons/axiom-blocks-icon-white.svg';

		add_menu_page(
			__( 'Axiom Blocks', 'axiom-blocks' ),
			__( 'Axiom Blocks', 'axiom-blocks' ),
			'manage_options',
			'axiom-blocks-dashboard',
			array( self::class, 'render' ),
			$icon_url,
			30
		);

		add_submenu_page(
			'axiom-blocks-dashboard',
			__( 'Dashboard', 'axiom-blocks' ),
			__( 'Dashboard', 'axiom-blocks' ),
			'manage_options',
			'axiom-blocks-dashboard',
			array( self::class, 'render' )
		);
	}

	/**
	 * Register settings
	 *
	 * @return void
	 */
	public static function register_settings(): void {
		register_setting(
			'axiom_blocks_options',
			'axiom_blocks_enabled_blocks',
			array(
				'type'              => 'array',
				'default'           => Blocks::get_default_enabled(),
				'sanitize_callback' => array( self::class, 'sanitize_enabled_blocks' ),
			)
		);
	}

	/**
	 * Sanitize enabled blocks
	 *
	 * @param mixed $input Input data.
	 * @return array
	 */
	public static function sanitize_enabled_blocks( $input ): array {
		$sanitized = array();
		if ( ! is_array( $input ) ) {
			return $sanitized;
		}

		// Get all valid block IDs for validation.
		$valid_blocks = array();
		foreach ( Blocks::get_all() as $block ) {
			$valid_blocks[ $block['id'] ] = true;
		}

		foreach ( $input as $block => $enabled ) {
			// Sanitize the block ID key.
			$sanitized_key = sanitize_key( $block );

			// Only include if it's a known block ID.
			if ( isset( $valid_blocks[ $sanitized_key ] ) ) {
				$sanitized[ $sanitized_key ] = filter_var( $enabled, FILTER_VALIDATE_BOOLEAN );
			}
		}

		return $sanitized;
	}

	/**
	 * Enqueue admin assets
	 *
	 * @param string $hook Current admin page.
	 * @return void
	 */
	public static function enqueue_assets( string $hook ): void {
		if ( 'toplevel_page_axiom-blocks-dashboard' !== $hook ) {
			return;
		}

		wp_enqueue_style(
			'axiom-blocks-dm-sans',
			'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500&display=swap',
			array(),
			Plugin::VERSION
		);

		$admin_js  = AXIOM_BLOCKS_PLUGIN_DIR . 'build/admin.js';
		$admin_css = AXIOM_BLOCKS_PLUGIN_DIR . 'build/admin.css';

		wp_enqueue_script(
			'axiom-blocks-admin',
			AXIOM_BLOCKS_PLUGIN_URL . 'build/admin.js',
			array( 'wp-element', 'wp-components', 'wp-api-fetch', 'wp-i18n' ),
			file_exists( $admin_js ) ? (string) filemtime( $admin_js ) : Plugin::VERSION,
			true
		);

		wp_enqueue_style(
			'axiom-blocks-admin',
			AXIOM_BLOCKS_PLUGIN_URL . 'build/admin.css',
			array(),
			file_exists( $admin_css ) ? (string) filemtime( $admin_css ) : Plugin::VERSION
		);

		$data = apply_filters(
			'axiom_blocks_dashboard_data',
			array(
				'version'   => Plugin::VERSION,
				'restUrl'   => rest_url( 'axiom-blocks/v1' ),
				'nonce'     => wp_create_nonce( 'wp_rest' ),
				'proActive' => false,
			)
		);

		wp_localize_script( 'axiom-blocks-admin', 'axiomBlocksData', $data );
	}

	/**
	 * Enqueue menu icon styles using wp_add_inline_style.
	 *
	 * @param string $hook Current admin page.
	 * @return void
	 */
	public static function enqueue_menu_icon_styles( string $hook ): void {

		wp_register_style( 'axiom-blocks-menu-icon', false, array(), Plugin::VERSION );
		wp_enqueue_style( 'axiom-blocks-menu-icon' );

		$active_url = AXIOM_BLOCKS_PLUGIN_URL . 'src/admin/assets/icons/axiom-blocks-icon-active.svg';

		$css = '
			#adminmenu #toplevel_page_axiom-blocks-dashboard .wp-menu-image img { opacity: 0.7; }
			#adminmenu #toplevel_page_axiom-blocks-dashboard:hover .wp-menu-image img,
			#adminmenu #toplevel_page_axiom-blocks-dashboard.wp-has-current-submenu .wp-menu-image img,
			#adminmenu #toplevel_page_axiom-blocks-dashboard.current .wp-menu-image img {
				content: url(' . esc_url( $active_url ) . ');
				opacity: 1;
			}
		';

		wp_add_inline_style( 'axiom-blocks-menu-icon', $css );
	}

	/**
	 * Render dashboard
	 *
	 * @return void
	 */
	public static function render(): void {
		echo '<div id="axiom-blocks-admin-root"></div>';
	}
}
