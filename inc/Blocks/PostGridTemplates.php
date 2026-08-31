<?php
/**
 * Post Grid template store.
 *
 * The load-more route has to render more cards after the page is already in the
 * browser. It must NOT accept block markup or query arguments from the request:
 * that would let anyone render arbitrary blocks, or widen the query, server-side.
 *
 * So the grid registers its own card template and resolved query args here when
 * it renders, keyed by a hash of exactly those two things. The route can then
 * only replay a template this site actually rendered, with the args the author
 * saved. The client contributes nothing but a key and a page number.
 *
 * Entries are transients rather than options: they are a cache of authored
 * content, safe to lose, and they refresh on every page view.
 *
 * @package AxiomBlocks\Blocks
 * @since 1.0.7
 */

namespace AxiomBlocks\Blocks;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Remembers Post Grid card templates for the load-more route.
 */
class PostGridTemplates {

	/**
	 * Transient key prefix.
	 */
	const PREFIX = 'ab_pg_tpl_';

	/**
	 * How long a registered template stays replayable.
	 */
	const TTL = DAY_IN_SECONDS;

	/**
	 * Store a grid's template + resolved args under its key.
	 *
	 * Re-registering the same key is a no-op beyond refreshing the TTL, so a busy
	 * page does not churn the object cache.
	 *
	 * @param string $key     16-char template hash.
	 * @param array  $payload Card template, featured template, args, attributes.
	 * @return void
	 */
	public static function remember( string $key, array $payload ): void {
		if ( '' === $key ) {
			return;
		}
		set_transient( self::PREFIX . $key, $payload, self::TTL );
	}

	/**
	 * Fetch a previously registered template.
	 *
	 * @param string $key 16-char template hash.
	 * @return array|null Payload, or null when the key is unknown or expired.
	 */
	public static function get( string $key ): ?array {
		if ( '' === $key ) {
			return null;
		}
		$payload = get_transient( self::PREFIX . $key );
		if ( ! is_array( $payload ) || ! isset( $payload['card'], $payload['args'] ) ) {
			return null;
		}
		return $payload;
	}
}
