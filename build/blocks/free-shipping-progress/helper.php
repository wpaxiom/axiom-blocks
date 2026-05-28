<?php
/**
 * Free Shipping Progress — shared helpers.
 *
 * Threshold detection (auto vs override), cart subtotal snapshot, and message
 * formatting — used by both render.php and the REST endpoint so the visible
 * value never drifts between first paint and live re-renders.
 *
 * @package AxiomBlocks\Blocks\FreeShippingProgress
 */

declare(strict_types=1);

namespace AxiomBlocks\Blocks\FreeShippingProgress;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Helper class for Free Shipping Progress block.
 *
 * Provides threshold detection, cart subtotal calculation, and message formatting.
 */
class Helper {

	/**
	 * Walk active shipping zones and return the smallest min_amount across any
	 * enabled `free_shipping` method. Returns 0.0 when no zone offers free
	 * shipping (or WC isn't active), so the caller can decide what to do.
	 *
	 * Caching: the lookup is cheap (zones are already loaded by WC), but we
	 * memoize per-request to avoid re-walking on every block on the page.
	 */
	public static function detect_threshold(): float {
		static $cached = null;
		if ( null !== $cached ) {
			return $cached;
		}

		if ( ! class_exists( 'WC_Shipping_Zones' ) ) {
			return 0.0;
		}

		$min = INF;

		$zones = \WC_Shipping_Zones::get_zones();
		// Include the "Locations not covered" rest-of-the-world zone (id 0).
		$rest_of_world = \WC_Shipping_Zones::get_zone( 0 );
		if ( $rest_of_world ) {
			$zones[] = array( 'shipping_methods' => $rest_of_world->get_shipping_methods( true ) );
		}

		foreach ( $zones as $zone ) {
			$methods = $zone['shipping_methods'] ?? array();
			foreach ( $methods as $method ) {
				if ( 'free_shipping' !== $method->id || 'yes' !== $method->enabled ) {
					continue;
				}
				// Requires option values: empty, min_amount, coupon, either, or both.
				$requires = $method->get_option( 'requires', '' );
				$amount   = (float) $method->get_option( 'min_amount', 0 );
				if ( $amount > 0 && in_array( $requires, array( 'min_amount', 'either', 'both' ), true ) ) {
					if ( $amount < $min ) {
						$min = $amount;
					}
				}
			}
		}

		$cached = ( INF === $min ? 0.0 : $min );
		return $cached;
	}

	/**
	 * Resolve the active threshold from block attributes.
	 *
	 * @param array $attrs Block attributes.
	 * @return float Threshold value.
	 */
	public static function resolve_threshold( array $attrs ): float {
		$mode = $attrs['thresholdMode'] ?? 'auto';
		if ( 'custom' === $mode ) {
			return max( 0.0, (float) ( $attrs['customThreshold'] ?? 0 ) );
		}
		return self::detect_threshold();
	}

	/**
	 * Cart subtotal — explicitly excluding tax and shipping. Matches what the
	 * customer sees as the line-item subtotal at the cart, regardless of how
	 * the store displays prices.
	 */
	public static function cart_subtotal_excl_tax(): float {
		if ( ! function_exists( 'WC' ) || ! WC()->cart ) {
			return 0.0;
		}
		// get_subtotal() returns line items only, excl tax & shipping.
		return (float) WC()->cart->get_subtotal();
	}

	/**
	 * Build the live snapshot used by both first paint and the REST endpoint.
	 * Returns a structured array — never echoes anything.
	 *
	 * @param array $attrs Block attributes.
	 * @return array{
	 *   threshold:float, subtotal:float, remaining:float, percent:float,
	 *   qualified:bool, empty:bool, message_html:string,
	 * }
	 */
	public static function snapshot( array $attrs ): array {
		$threshold = self::resolve_threshold( $attrs );
		$subtotal  = self::cart_subtotal_excl_tax();
		$empty     = $subtotal <= 0;
		$remaining = max( 0.0, $threshold - $subtotal );
		$qualified = $threshold > 0 && $subtotal >= $threshold;

		$percent = ( $threshold > 0 )
			? min( 100.0, ( $subtotal / $threshold ) * 100.0 )
			: 0.0;

		$message_html = self::format_message( $attrs, $qualified, $remaining );

		return array(
			'threshold'    => $threshold,
			'subtotal'     => $subtotal,
			'remaining'    => $remaining,
			'percent'      => $percent,
			'qualified'    => $qualified,
			'empty'        => $empty,
			'message_html' => $message_html,
		);
	}

	/**
	 * Replace {amount_left} token with formatted price; sanitize the rest.
	 * Returns ready-to-echo HTML (price tag wrapped in an element so JS can
	 * surgically swap it on live updates).
	 *
	 * @param array $attrs      Block attributes.
	 * @param bool  $qualified  Whether the order qualifies for free shipping.
	 * @param float $remaining  Amount remaining to reach threshold.
	 * @return string Formatted message HTML.
	 */
	public static function format_message( array $attrs, bool $qualified, float $remaining ): string {
		$tpl = $qualified
			? (string) ( $attrs['messageQualified'] ?? '' )
			: (string) ( $attrs['messageBefore'] ?? '' );

		if ( '' === $tpl ) {
			return '';
		}

		$price_html = function_exists( 'wc_price' )
			? wc_price( $remaining )
			: '$' . number_format( $remaining, 2 );

		// Wrap so the JS can find and replace just the amount.
		$amount_html = '<span class="axiom-blocks-fsp__amount-left">' . $price_html . '</span>';

		// Sanitize the template, then inject the (already-safe) amount span.
		$safe_tpl = wp_kses(
			$tpl,
			array(
				'strong' => array(),
				'em'     => array(),
				'span'   => array( 'class' => true ),
				'br'     => array(),
			)
		);

		return str_replace( '{amount_left}', $amount_html, $safe_tpl );
	}

	/**
	 * Determine whether the block should render anything for the current cart
	 * (respecting the "hide when empty / qualified" attributes).
	 *
	 * @param array $attrs    Block attributes.
	 * @param array $snapshot Data snapshot.
	 * @return bool Whether to render.
	 */
	public static function should_render( array $attrs, array $snapshot ): bool {
		if ( ! empty( $attrs['hideWhenEmpty'] ) && $snapshot['empty'] ) {
			return false;
		}
		if ( ! empty( $attrs['hideWhenQualified'] ) && $snapshot['qualified'] ) {
			return false;
		}
		// If no threshold could be detected and the user didn't override, hide
		// rather than show an always-0% bar.
		if ( $snapshot['threshold'] <= 0 ) {
			return false;
		}
		return true;
	}
}
