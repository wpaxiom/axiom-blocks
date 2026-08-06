<?php
/**
 * Plugin Name:       Axiom Blocks - Page Builder & FSE Kit
 * Plugin URI:        https://www.wpaxiom.com/plugins/axiom-blocks
 * Description:       A powerful block collection and page builder toolkit for Gutenberg and Full Site Editing (FSE). Built for extensibility with WooCommerce and third-party integrations.
 * Version:           1.0.6
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * Author:            WPAxiom
 * Author URI:        https://wpaxiom.com
 * License:           GPL-2.0+
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       axiom-blocks
 * Domain Path:       /languages
 * Tags:              gutenberg, blocks, page builder, fse, full site editing, kit, editor
 *
 * @package AxiomBlocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Define plugin constants.
define( 'AXIOM_BLOCKS_VERSION', '1.0.6' );
define( 'AXIOM_BLOCKS_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'AXIOM_BLOCKS_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'AXIOM_BLOCKS_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );

// Autoloader.
$axiom_blocks_autoloader = AXIOM_BLOCKS_PLUGIN_DIR . 'vendor/autoload.php';
if ( file_exists( $axiom_blocks_autoloader ) ) {
	require_once $axiom_blocks_autoloader;
} else {
	// Fallback if composer install hasn't been run.
	add_action(
		'admin_notices',
		function () {
			echo '<div class="notice notice-error"><p>';
			echo esc_html__( 'Axiom Blocks requires Composer dependencies. Please run "composer install" in the plugin directory.', 'axiom-blocks' );
			echo '</p></div>';
		}
	);
	return;
}

// Initialize plugin.
\AxiomBlocks\Plugin::get_instance();

/**
 * Activation hook
 *
 * @return void
 */
function axiom_blocks_activate(): void {
	// Activation logic here.
	flush_rewrite_rules();
}
register_activation_hook( __FILE__, __NAMESPACE__ . '\\axiom_blocks_activate' );

/**
 * Deactivation hook
 *
 * @return void
 */
function axiom_blocks_deactivate(): void {
	// Deactivation logic here.
	flush_rewrite_rules();
}
register_deactivation_hook( __FILE__, __NAMESPACE__ . '\\axiom_blocks_deactivate' );
