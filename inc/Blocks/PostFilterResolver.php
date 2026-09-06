<?php
/**
 * Post Filter resolver.
 *
 * A Post Filter bar never sends query arguments to the load-more route; that
 * would let a client widen a grid's query or dictate server behaviour. Instead
 * it names a base grid key (which the grid already registered) plus a small set
 * of validated filter tokens. This class applies those tokens onto the author's
 * saved base args, derives a deterministic variant key, and stores the variant
 * payload under that key in the same store PostGridTemplates uses, so the route
 * and a fresh page load with the same URL resolve to the same transient.
 *
 * The security surface is the same as Post Grid: nothing the client sends can
 * widen a query beyond the fixed whitelists here, introduce markup, or do
 * anything except narrow the author's saved result set.
 *
 * @package AxiomBlocks\Blocks
 * @since 1.0.8
 */

namespace AxiomBlocks\Blocks;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Derives and stores Post Grid filter variants.
 */
class PostFilterResolver {

	/**
	 * Whitelisted search-field character cap.
	 */
	const MAX_SEARCH = 100;

	/**
	 * Whitelisted orderby values (mirrors Post Grid's render.php).
	 */
	const ORDERBY = array( 'date', 'modified', 'title', 'menu_order', 'rand', 'comment_count' );

	/**
	 * Whitelisted order values.
	 */
	const ORDER = array( 'ASC', 'DESC' );

	/**
	 * Per-request map of grid anchor → base key, so a filter bar rendered after
	 * its target grid can emit the grid's key without a lookup round-trip.
	 *
	 * @var array<string,string>
	 */
	private static array $anchor_keys = array();

	/**
	 * Record which base key a grid anchor maps to, once the grid renders.
	 *
	 * @param string $anchor The grid's id/anchor (empty anchors are skipped).
	 * @param string $key    The grid's base template key.
	 * @return void
	 */
	public static function record_anchor( string $anchor, string $key ): void {
		if ( '' === $anchor ) {
			return;
		}
		self::$anchor_keys[ $anchor ] = $key;
	}

	/**
	 * Look up a grid's base key by its anchor for the current request.
	 *
	 * Only populated if the grid rendered before the caller in the same page
	 * render. A URL `ab_f_base` param takes precedence where one is present.
	 *
	 * @param string $anchor The grid's id/anchor.
	 * @return string The base key, or '' when unknown.
	 */
	public static function key_for_anchor( string $anchor ): string {
		return self::$anchor_keys[ $anchor ] ?? '';
	}

	/**
	 * Whether this request is a reset, meaning "back to the unfiltered grid".
	 *
	 * The grid uses it to drop every other token. The bar's field blocks use it
	 * to skip prefilling themselves from the URL, so a reset does not leave a
	 * search box holding a term the grid is no longer filtered by.
	 *
	 * @param array $get The GET array (already unslashed).
	 * @return bool True when a reset is active.
	 */
	public static function is_reset( array $get ): bool {
		return isset( $get['ab_f_reset'] ) && '1' === (string) $get['ab_f_reset'];
	}

	/**
	 * Read validated filter tokens from a GET array (`ab_f_*`).
	 *
	 * @param array $get  The GET array (already unslashed).
	 * @param array $base The base grid args, used to know the grid's taxonomy.
	 * @return array Associative filter token set, empty when nothing is active.
	 */
	public static function tokens_from_get( array $get, array $base ): array {
		$filter = array();

		// A reset always wins: it means "back to the unfiltered grid".
		if ( self::is_reset( $get ) ) {
			return $filter;
		}

		if ( isset( $get['ab_f_s'] ) && '' !== $get['ab_f_s'] ) {
			$s = sanitize_text_field( wp_unslash( (string) $get['ab_f_s'] ) );
			if ( '' !== $s ) {
				$filter['s'] = substr( $s, 0, self::MAX_SEARCH );
			}
		}

		$base_tax = (string) ( $base['taxonomy'] ?? '' );
		if ( '' !== $base_tax && isset( $get[ 'ab_f_tax_' . $base_tax ] ) ) {
			$raw   = wp_unslash( (string) $get[ 'ab_f_tax_' . $base_tax ] );
			$terms = array_filter( array_map( 'absint', explode( ',', $raw ) ) );
			if ( ! empty( $terms ) ) {
				$filter['tax_' . $base_tax ] = array_values( array_unique( $terms ) );
			}
		}

		if ( isset( $get['ab_f_sort'] ) ) {
			$sort = self::parse_sort( wp_unslash( (string) $get['ab_f_sort'] ) );
			if ( null !== $sort ) {
				$filter['orderby'] = $sort['orderby'];
				$filter['order']   = $sort['order'];
			}
		}

		return $filter;
	}

	/**
	 * Validate client-supplied filter tokens (already decoded from JSON/params)
	 * against the base args' taxonomy, then return a normalized token set.
	 *
	 * @param array $tokens Raw tokens from the request body/params.
	 * @param array $base   Base args saved by the grid.
	 * @return array Normalized, whitelisted tokens.
	 */
	public static function validate_tokens( array $tokens, array $base ): array {
		$filter   = array();
		$base_tax = (string) ( $base['taxonomy'] ?? '' );

		// A reset token always wins.
		if ( ! empty( $tokens['reset'] ) ) {
			return $filter;
		}

		if ( isset( $tokens['s'] ) && is_string( $tokens['s'] ) ) {
			$s = substr( sanitize_text_field( $tokens['s'] ), 0, self::MAX_SEARCH );
			if ( '' !== $s ) {
				$filter['s'] = $s;
			}
		}

		// The taxonomy a filter may target is the one the base grid is bound to.
		if ( '' !== $base_tax && isset( $tokens[ 'tax_' . $base_tax ] ) && is_array( $tokens[ 'tax_' . $base_tax ] ) ) {
			$terms = array_filter( array_map( 'absint', $tokens[ 'tax_' . $base_tax ] ) );
			if ( ! empty( $terms ) ) {
				$filter[ 'tax_' . $base_tax ] = array_values( array_unique( $terms ) );
			}
		}

		if ( isset( $tokens['sort'] ) && is_string( $tokens['sort'] ) ) {
			$sort = self::parse_sort( $tokens['sort'] );
			if ( null !== $sort ) {
				$filter['orderby'] = $sort['orderby'];
				$filter['order']   = $sort['order'];
			}
		}

		return $filter;
	}

	/**
	 * Split and whitelist a `orderby|order` sort token into its two halves.
	 *
	 * Both halves must match the fixed whitelists, or the token is rejected.
	 *
	 * @param string $raw The raw `orderby|order` pair.
	 * @return array|null ['orderby' => ..., 'order' => ...], or null when invalid.
	 */
	public static function parse_sort( string $raw ): ?array {
		// The `|` is a delimiter, not a key character: run the raw value
		// through wp_unslash, split on `|` FIRST, then sanitize each half.
		// Running the whole string through sanitize_key would strip the pipe
		// and reject every sort (a `date|desc` becomes `datedesc`). Each half
		// is a plain key with no delimiter, so sanitize_key is safe there, and
		// both halves are checked against the fixed whitelists regardless.
		$raw  = (string) wp_unslash( $raw );
		$bits = explode( '|', $raw );
		if ( 2 !== count( $bits ) ) {
			return null;
		}
		$orderby = sanitize_key( $bits[0] );
		$order   = strtoupper( sanitize_key( $bits[1] ) );
		if ( ! in_array( $orderby, self::ORDERBY, true ) || ! in_array( $order, self::ORDER, true ) ) {
			return null;
		}
		return array( 'orderby' => $orderby, 'order' => $order );
	}

	/**
	 * Apply validated filter tokens onto the author's base args to produce the
	 * variant args. Never widens anything: search and term filters only narrow,
	 * and order/orderby come from a fixed whitelist.
	 *
	 * @param array $base   Base args (the grid author's saved query).
	 * @param array $filter Normalized filter tokens.
	 * @return array Variant args ready to run.
	 */
	public static function apply_filter( array $base, array $filter ): array {
		$args = $base;

		if ( isset( $filter['s'] ) ) {
			$args['s'] = $filter['s'];
		} else {
			unset( $args['s'] );
		}

		$taxonomy = (string) ( $base['taxonomy'] ?? '' );
		if ( '' !== $taxonomy && isset( $filter[ 'tax_' . $taxonomy ] ) ) {
			// The bar's term selection replaces the author's pinned taxonomy
			// filter for this variant.
			$terms = $filter[ 'tax_' . $taxonomy ];
			// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query -- A taxonomy filter is the block's purpose; term_id + a single clause is the cheapest form available.
			$args['tax_query'] = array(
				array(
					'taxonomy' => $taxonomy,
					'field'    => 'term_id',
					'terms'    => array_values( $terms ),
				),
			);
		}
		// When the bar carries no term selection for the grid's taxonomy, the
		// author's own tax_query (if any) is left untouched: a search or sort
		// must narrow inside the author's pinned taxonomy, never widen past it.

		if ( isset( $filter['orderby'] ) ) {
			$args['orderby'] = $filter['orderby'];
		}
		if ( isset( $filter['order'] ) ) {
			$args['order'] = $filter['order'];
		}

		// The bar shows a results count/pagination, so the variant needs totals.
		// All values still derive from validated tokens, so this widens no trust.
		$args['no_found_rows'] = false;

		// A variant is a fresh, page-1 view; normalise pagination so every caller
		// that derives the variant key (the grid on a reload, the route on the
		// no-reload fetch) produces exactly the same args and therefore the same
		// key, instead of diverging on leftover base page state.
		unset( $args['paged'], $args['offset'] );

		return $args;
	}

	/**
	 * Resolve a base grid payload plus validated filter tokens into a stored
	 * variant payload (base payload when no tokens are active).
	 *
	 * @param string $base_key Base grid template key.
	 * @param array  $filter   Normalized filter tokens.
	 * @return array|null Variant payload (card/feat/args/attr), or null on an unknown base.
	 */
	public static function resolve( string $base_key, array $filter ): ?array {
		$base = PostGridTemplates::get( $base_key );
		if ( null === $base ) {
			return null;
		}

		if ( empty( $filter ) ) {
			return $base;
		}

		$variant_args = self::apply_filter( $base['args'], $filter );
		$variant_key  = substr( md5( wp_json_encode( array( $base['card'], $base['feat'], $variant_args ) ) ), 0, 16 );

		$payload = array(
			'card' => $base['card'],
			'feat' => $base['feat'],
			'args' => $variant_args,
			'attr' => $base['attr'],
		);

		return array_merge( $payload, array( 'variant_key' => $variant_key ) );
	}
}
