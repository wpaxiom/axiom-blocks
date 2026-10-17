<?php
/**
 * System info for support requests.
 *
 * The Help tab shows these lines in a box with a copy button, so a user can
 * paste them into a forum post. Nothing here is sent anywhere by the plugin.
 * No URLs, emails or keys: versions, settings and yes/no flags only.
 *
 * @package AxiomBlocks\Admin
 * @since 1.1.0
 */

namespace AxiomBlocks\Admin;

use AxiomBlocks\Blocks\Blocks;
use AxiomBlocks\Email\EmailSettings;
use AxiomBlocks\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Builds the system info lines.
 */
final class SystemInfo {

	/**
	 * Label => value pairs, in display order.
	 *
	 * @return array
	 */
	public static function rows(): array {
		global $wp_version;

		$theme = wp_get_theme();
		$all   = Blocks::get_all();
		// Count only catalogue blocks. The saved option can also hold child
		// and Pro block ids, which would push the count past the total.
		$enabled = count( array_filter( array_intersect_key( Blocks::get_enabled(), array_column( $all, 'id', 'id' ) ) ) );
		$mail    = EmailSettings::get();
		$yes     = __( 'Yes', 'axiom-blocks' );
		$no      = __( 'No', 'axiom-blocks' );

		$rows = array(
			__( 'Axiom Blocks', 'axiom-blocks' )           => Plugin::VERSION,
			__( 'Axiom Blocks Pro', 'axiom-blocks' )       => defined( 'AXIOM_BLOCKS_PRO_VERSION' ) ? (string) constant( 'AXIOM_BLOCKS_PRO_VERSION' ) : __( 'Not installed', 'axiom-blocks' ),
			__( 'WordPress', 'axiom-blocks' )              => (string) $wp_version,
			__( 'PHP', 'axiom-blocks' )                    => PHP_VERSION,
			__( 'Theme', 'axiom-blocks' )                  => $theme->get( 'Name' ) . ' ' . $theme->get( 'Version' ),
			__( 'Block theme', 'axiom-blocks' )            => function_exists( 'wp_is_block_theme' ) && wp_is_block_theme() ? $yes : $no,
			__( 'WooCommerce', 'axiom-blocks' )            => defined( 'WC_VERSION' ) ? (string) constant( 'WC_VERSION' ) : __( 'Not active', 'axiom-blocks' ),
			__( 'Multisite', 'axiom-blocks' )              => is_multisite() ? $yes : $no,
			__( 'Language', 'axiom-blocks' )               => get_locale(),
			/* translators: 1: enabled blocks, 2: all blocks. */
			__( 'Blocks enabled', 'axiom-blocks' )         => sprintf( __( '%1$d of %2$d', 'axiom-blocks' ), $enabled, count( $all ) ),
			__( 'Conditional assets', 'axiom-blocks' )     => Settings::is_assets_conditional() ? $yes : $no,
			__( 'Form email route', 'axiom-blocks' )       => 'resend' === $mail['route'] ? 'Resend' : __( 'WordPress mail', 'axiom-blocks' ),
			__( 'Resend key set', 'axiom-blocks' )         => EmailSettings::key_status()['has_key'] ? $yes : $no,
			__( 'Last form email failed', 'axiom-blocks' ) => null !== EmailSettings::last_error() ? $yes : $no,
		);

		$out = array();
		foreach ( $rows as $label => $value ) {
			$out[] = array(
				'label' => (string) $label,
				'value' => (string) $value,
			);
		}
		return $out;
	}
}
