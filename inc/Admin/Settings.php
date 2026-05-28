<?php
/**
 * General plugin settings.
 *
 * Stores the dashboard's "general" toggles (WooCommerce Integration, Load
 * Assets Conditionally, etc.) in a single option row.
 *
 * @package AxiomBlocks\Admin
 * @since 1.0.0
 */

namespace AxiomBlocks\Admin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * General plugin settings.
 *
 * @package AxiomBlocks\Admin
 */
final class Settings {

	const OPTION_KEY = 'axiom_blocks_general_settings';

	/**
	 * Default values, also used by Reset Defaults.
	 *
	 * @var array
	 */
	private const DEFAULTS = array(
		'woocommerce_integration' => true,
		'conditional_assets'      => true,
	);

	/**
	 * Gets the default settings.
	 *
	 * @return array Default settings array.
	 */
	public static function get_defaults(): array {
		return self::DEFAULTS;
	}

	/**
	 * Gets the current settings (merged with defaults).
	 *
	 * @return array Current settings merged with defaults.
	 */
	public static function get(): array {
		$saved = get_option( self::OPTION_KEY, array() );
		return array_merge( self::DEFAULTS, is_array( $saved ) ? $saved : array() );
	}

	/**
	 * Updates the settings.
	 *
	 * @param array $input Raw input array.
	 * @return array Sanitized settings that were saved.
	 */
	public static function update( array $input ): array {
		$current   = self::get();
		$sanitized = array();
		foreach ( self::DEFAULTS as $key => $default ) {
			$sanitized[ $key ] = array_key_exists( $key, $input )
				? (bool) $input[ $key ]
				: $current[ $key ];
		}
		update_option( self::OPTION_KEY, $sanitized );
		return $sanitized;
	}

	/**
	 * Resets settings to defaults.
	 *
	 * @return array Default settings.
	 */
	public static function reset(): array {
		delete_option( self::OPTION_KEY );
		return self::DEFAULTS;
	}

	/**
	 * Checks if WooCommerce integration is enabled.
	 *
	 * @return bool True if WooCommerce integration is enabled.
	 */
	public static function is_woocommerce_enabled(): bool {
		return (bool) self::get()['woocommerce_integration'];
	}

	/**
	 * Checks if assets should be loaded conditionally.
	 *
	 * @return bool True if assets should be loaded conditionally.
	 */
	public static function is_assets_conditional(): bool {
		return (bool) self::get()['conditional_assets'];
	}
}
