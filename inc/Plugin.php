<?php
/**
 * Axiom Blocks Plugin
 *
 *  █████╗ ██╗  ██╗██╗ ██████╗ ███╗   ███╗    ██████╗ ██╗      ██████╗  ██████╗██╗  ██╗███████╗
 * ██╔══██╗╚██╗██╔╝██║██╔═══██╗████╗ ████║    ██╔══██╗██║     ██╔═══██╗██╔════╝██║ ██╔╝██╔════╝
 * ███████║ ╚███╔╝ ██║██║   ██║██╔████╔██║    ██████╔╝██║     ██║   ██║██║     █████╔╝ ███████╗
 * ██╔══██║ ██╔██╗ ██║██║   ██║██║╚██╔╝██║    ██╔══██╗██║     ██║   ██║██║     ██╔═██╗ ╚════██║
 * ██║  ██║██╔╝ ██╗██║╚██████╔╝██║ ╚═╝ ██║    ██████╔╝███████╗╚██████╔╝╚██████╗██║  ██╗███████║
 * ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝ ╚═════╝ ╚═╝     ╚═╝    ╚═════╝ ╚══════╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝╚══════╝
 *
 * @package AxiomBlocks
 * @since 1.0.0
 */

namespace AxiomBlocks;

use AxiomBlocks\Admin\Dashboard;
use AxiomBlocks\Admin\Feedback;
use AxiomBlocks\API\Routes;
use AxiomBlocks\Blocks\Blocks;
use AxiomBlocks\Blocks\Registry;
use AxiomBlocks\Frontend\Assets;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Main Plugin Class
 *
 * Orchestrates all plugin functionality.
 */
final class Plugin {

	/**
	 * Single instance
	 *
	 * @var self|null
	 */
	private static ?self $instance = null;

	/**
	 * Plugin version
	 *
	 * @var string
	 */
	const VERSION = '1.0.3';

	/**
	 * Get instance
	 *
	 * @return self
	 */
	public static function get_instance(): self {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Constructor
	 */
	private function __construct() {
		$this->init();
	}

	/**
	 * Initialize plugin
	 *
	 * @return void
	 */
	private function init(): void {
		// Register blocks.
		add_action( 'init', array( Registry::class, 'register' ) );

		// Register block category.
		add_filter( 'block_categories_all', array( $this, 'register_category' ), 10, 2 );

		// Frontend assets.
		Assets::init();

		// Admin UI.
		if ( is_admin() ) {
			Dashboard::init();
			Feedback::init();
		}

		// REST API (always loaded for both admin and frontend).
		Routes::register();

		// Editor JS (runs in the parent admin page).
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_editor_assets' ) );

		// the frontend style is enqueued conditionally by Frontend\Assets.
		add_action( 'enqueue_block_assets', array( $this, 'enqueue_iframe_styles' ) );
	}

	/**
	 * Register block category
	 *
	 * @param array   $categories Block categories.
	 * @param WP_Post $_post      Post object.
	 * @return array
	 */
	public function register_category( array $categories, $_post ): array {
		return array_merge(
			$categories,
			array(
				array(
					'slug'  => 'axiom-blocks',
					'title' => __( 'Axiom Blocks', 'axiom-blocks' ),
					'icon'  => 'grid-view',
				),
			)
		);
	}

	/**
	 * Enqueue editor assets
	 *
	 * @return void
	 */
	public function enqueue_editor_assets(): void {
		wp_enqueue_script( 'axiom-blocks-editor' );

		$mimes                = get_allowed_mime_types();
		$svg_upload_supported = isset( $mimes['svg'] ) || in_array( 'image/svg+xml', $mimes, true );

		wp_localize_script(
			'axiom-blocks-editor',
			'axiomBlocksSettings',
			array(
				'enabledBlocks'      => Blocks::get_enabled(),
				'svgUploadSupported' => $svg_upload_supported,
			)
		);
	}

	/**
	 * Enqueue styles that need to live inside the block-editor iframe.
	 *
	 * @return void
	 */
	public function enqueue_iframe_styles(): void {
		if ( ! is_admin() ) {
			return;
		}
		wp_enqueue_style( 'axiom-blocks-style' );
		wp_enqueue_style( 'axiom-blocks-editor-style' );
	}
}
