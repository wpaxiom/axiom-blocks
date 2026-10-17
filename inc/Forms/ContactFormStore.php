<?php
/**
 * Contact Form store.
 *
 * The submit route must not take recipients, a subject or a field list from the
 * browser: that would turn every form into an open mail relay. So a form
 * registers its own configuration here when it renders, under a key derived
 * from that configuration, and the browser sends back only the key.
 *
 * Unlike the Post Grid template store, entries are options rather than
 * transients. A full-page cache can serve a form for weeks; if the key expired
 * after a day, every older cached page would reject its submissions. To keep
 * page views from writing to the database, an entry is written only when it is
 * new, and its last-seen date is refreshed at most once a day. A daily cron
 * removes keys no page has rendered for STALE_DAYS.
 *
 * @package AxiomBlocks\Forms
 * @since 1.1.0
 */

namespace AxiomBlocks\Forms;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Remembers rendered Contact Form configurations.
 */
class ContactFormStore {

	/**
	 * Option name prefix for one form configuration.
	 */
	const PREFIX = 'axiom_blocks_cf_';

	/**
	 * Option holding key => last-seen date, used by garbage collection.
	 */
	const INDEX = 'axiom_blocks_cf_index';

	/**
	 * Days a key survives without being rendered.
	 */
	const STALE_DAYS = 90;

	/**
	 * Register a configuration and return its key.
	 *
	 * @param array $config Form configuration (see ContactFormConfig shape in render.php).
	 * @return string 16-character key.
	 */
	public static function register( array $config ): string {
		$key   = self::key_for( $config );
		$name  = self::PREFIX . $key;
		$today = gmdate( 'Y-m-d' );
		$entry = get_option( $name, null );

		if ( ! is_array( $entry ) ) {
			add_option(
				$name,
				array(
					'config'    => $config,
					'last_seen' => $today,
				),
				'',
				'no'
			);
			self::touch_index( $key, $today );
		} elseif ( ( $entry['last_seen'] ?? '' ) !== $today ) {
			$entry['last_seen'] = $today;
			update_option( $name, $entry, 'no' );
			self::touch_index( $key, $today );
		}

		return $key;
	}

	/**
	 * The configuration stored under a key, or null.
	 *
	 * @param string $key Store key.
	 * @return array|null
	 */
	public static function get( string $key ): ?array {
		if ( ! preg_match( '/^[a-f0-9]{16}$/', $key ) ) {
			return null;
		}
		$entry = get_option( self::PREFIX . $key, null );
		if ( ! is_array( $entry ) || ! isset( $entry['config'] ) || ! is_array( $entry['config'] ) ) {
			return null;
		}
		return $entry['config'];
	}

	/**
	 * Deterministic key for a configuration.
	 *
	 * @param array $config Form configuration.
	 * @return string
	 */
	public static function key_for( array $config ): string {
		return substr( md5( (string) wp_json_encode( $config ) ), 0, 16 );
	}

	/**
	 * Remove keys no page has rendered for STALE_DAYS. Runs from the daily cron.
	 *
	 * @param int|null $now Unix time, for tests.
	 * @return int Number of keys removed.
	 */
	public static function collect_garbage( ?int $now = null ): int {
		$index = get_option( self::INDEX, array() );
		if ( ! is_array( $index ) || empty( $index ) ) {
			return 0;
		}
		$cutoff  = gmdate( 'Y-m-d', ( $now ?? time() ) - self::STALE_DAYS * DAY_IN_SECONDS );
		$removed = 0;
		foreach ( $index as $key => $seen ) {
			if ( (string) $seen < $cutoff ) {
				delete_option( self::PREFIX . $key );
				unset( $index[ $key ] );
				++$removed;
			}
		}
		if ( $removed ) {
			update_option( self::INDEX, $index, 'no' );
		}
		return $removed;
	}

	/**
	 * Record a key's last-seen date in the index.
	 *
	 * @param string $key   Store key.
	 * @param string $today Y-m-d.
	 * @return void
	 */
	private static function touch_index( string $key, string $today ): void {
		$index = get_option( self::INDEX, array() );
		if ( ! is_array( $index ) ) {
			$index = array();
		}
		$index[ $key ] = $today;
		update_option( self::INDEX, $index, 'no' );
	}
}
