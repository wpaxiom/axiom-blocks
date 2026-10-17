<?php
/**
 * First steps on the Help tab.
 *
 * The first-steps checklist, worked out on the server so the Help tab shows
 * real progress:
 *
 * - "Used an Axiom block on a page": any published post whose content holds an
 *   Axiom block comment. Once found it is remembered for good; until then the
 *   answer is cached for 12 hours and the cache is dropped on every save.
 * - "Sent a test email": a test email from the Email tab went out.
 * - "Received your first form entry": at least one entry exists. Only listed
 *   while the Contact Form block is enabled.
 *
 * @package AxiomBlocks\Admin
 * @since 1.1.0
 */

namespace AxiomBlocks\Admin;

use AxiomBlocks\Blocks\Blocks;
use AxiomBlocks\Email\EmailSettings;
use AxiomBlocks\Forms\Entries;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * First-steps checklist.
 */
final class Onboarding {

	const BLOCK_USED_OPTION = 'axiom_blocks_block_used';

	const BLOCK_CHECK_TRANSIENT = 'axiom_blocks_block_used_check';

	/**
	 * Wire hooks.
	 *
	 * @return void
	 */
	public static function init(): void {
		add_action( 'save_post', array( self::class, 'clear_block_check' ) );
	}

	/**
	 * Everything the first-steps section needs.
	 *
	 * @return array
	 */
	public static function state(): array {
		$form_on = Blocks::is_enabled( 'contact-form' );
		return array(
			'formOn'    => $form_on,
			'checklist' => array(
				'block' => self::block_used(),
				'test'  => EmailSettings::test_passed(),
				'entry' => $form_on && Entries::total() > 0,
			),
		);
	}

	/**
	 * Whether any published post uses an Axiom block.
	 *
	 * @return bool
	 */
	public static function block_used(): bool {
		if ( get_option( self::BLOCK_USED_OPTION ) ) {
			return true;
		}
		$cached = get_transient( self::BLOCK_CHECK_TRANSIENT );
		if ( false !== $cached ) {
			return '1' === $cached;
		}

		global $wpdb;
		$like = '%' . $wpdb->esc_like( '<!-- wp:axiom-blocks/' ) . '%';
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- One LIMIT 1 lookup, cached in a transient and then in an option.
		$found = (bool) $wpdb->get_var(
			$wpdb->prepare(
				"SELECT ID FROM {$wpdb->posts} WHERE post_status = 'publish' AND post_type <> 'revision' AND post_content LIKE %s LIMIT 1",
				$like
			)
		);

		if ( $found ) {
			update_option( self::BLOCK_USED_OPTION, 1, false );
			delete_transient( self::BLOCK_CHECK_TRANSIENT );
		} else {
			set_transient( self::BLOCK_CHECK_TRANSIENT, '0', 12 * HOUR_IN_SECONDS );
		}
		return $found;
	}

	/**
	 * Drop the cached "not yet" answer so the next dashboard load checks again.
	 *
	 * @return void
	 */
	public static function clear_block_check(): void {
		if ( ! get_option( self::BLOCK_USED_OPTION ) ) {
			delete_transient( self::BLOCK_CHECK_TRANSIENT );
		}
	}
}
