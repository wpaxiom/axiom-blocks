<?php
/**
 * Trust Badge SVG library — PHP mirror of badges.js so frontend render
 * doesn't depend on the JS bundle.
 *
 * @package AxiomBlocks\Blocks\TrustBadges
 */

namespace AxiomBlocks\Blocks\TrustBadges;

use AxiomBlocks\Blocks\AllowedHtml;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Get the trust badge library.
 *
 * @return array<string, array{label: string, group: string, paths?: string, file?: string, monoFile?: string}> Badge registry.
 */
function get_badges(): array {
	return array(
		// ── Payment (file-based brand logos) ──────────────────────────
		'visa'            => array(
			'label'    => 'Visa',
			'group'    => 'payment',
			'file'     => 'visa.svg',
			'monoFile' => 'monochrome/visa.svg',
		),
		'mastercard'      => array(
			'label'    => 'Mastercard',
			'group'    => 'payment',
			'file'     => 'mastercard.svg',
			'monoFile' => 'monochrome/mastercard.svg',
		),
		'amex'            => array(
			'label'    => 'Amex',
			'group'    => 'payment',
			'file'     => 'amex.svg',
			'monoFile' => 'monochrome/amex.svg',
		),
		'discover'        => array(
			'label'    => 'Discover',
			'group'    => 'payment',
			'file'     => 'discover.svg',
			'monoFile' => 'monochrome/discover.svg',
		),
		'paypal'          => array(
			'label'    => 'PayPal',
			'group'    => 'payment',
			'file'     => 'paypal.svg',
			'monoFile' => 'monochrome/paypal.svg',
		),
		'apple-pay'       => array(
			'label'    => 'Apple Pay',
			'group'    => 'payment',
			'file'     => 'apple-pay.svg',
			'monoFile' => 'monochrome/apple-pay.svg',
		),
		'google-pay'      => array(
			'label'    => 'Google Pay',
			'group'    => 'payment',
			'file'     => 'google-pay.svg',
			'monoFile' => 'monochrome/google-pay.svg',
		),
		'stripe'          => array(
			'label'    => 'Stripe',
			'group'    => 'payment',
			'file'     => 'stripe.svg',
			'monoFile' => 'monochrome/stripe.svg',
		),

		// ── Security (inline stylized) ─────────────────────────────────
		'ssl-secure'      => array(
			'label' => 'SSL Secure',
			'group' => 'security',
			'paths' => '<path d="M12 2.5l7.5 2.5v6c0 5-3.5 8.5-7.5 10.5-4-2-7.5-5.5-7.5-10.5v-6L12 2.5z"/><rect x="9.5" y="10" width="5" height="4.5" rx=".6"/><path d="M10.5 10V8.5a1.5 1.5 0 013 0V10"/>',
		),
		'encrypted'       => array(
			'label' => '256-bit Encrypted',
			'group' => 'security',
			'paths' => '<rect x="5" y="10" width="14" height="10" rx="1.5"/><path d="M7.5 10V7.5a4.5 4.5 0 019 0V10"/><circle cx="12" cy="14.5" r="1" fill="currentColor" stroke="none"/><path d="M12 15.5v2"/>',
		),
		'secure-checkout' => array(
			'label' => 'Secure Checkout',
			'group' => 'security',
			'paths' => '<path d="M12 2.5l7.5 2.5v6c0 5-3.5 8.5-7.5 10.5-4-2-7.5-5.5-7.5-10.5v-6L12 2.5z"/><path d="M8.5 12l2.5 2.5L15.5 10"/>',
		),

		// ── Service (inline stylized) ──────────────────────────────────
		'free-shipping'   => array(
			'label' => 'Free Shipping',
			'group' => 'service',
			'paths' => '<path d="M2.5 7h10v9h-10z"/><path d="M12.5 10h4l3 3v3h-7z"/><circle cx="6.5" cy="17.5" r="1.6"/><circle cx="16" cy="17.5" r="1.6"/><path d="M2.5 13h10"/>',
		),
		'money-back'      => array(
			'label' => 'Money-Back Guarantee',
			'group' => 'service',
			'paths' => '<circle cx="12" cy="12" r="9"/><path d="M14 9.5h-3a1.5 1.5 0 000 3h2a1.5 1.5 0 010 3H10M12 8v1M12 15.5v1"/>',
		),
		'returns'         => array(
			'label' => '30-Day Returns',
			'group' => 'service',
			'paths' => '<path d="M4 11.5a8 8 0 0114-4.5l2 2"/><path d="M20 4v5h-5"/><path d="M20 12.5a8 8 0 01-14 4.5l-2-2"/><path d="M4 20v-5h5"/>',
		),
	);
}

/**
 * Public URL to a file-based badge asset (brand logos shipped with the plugin).
 *
 * @param string $id         Badge slug.
 * @param string $color_mode 'color' or 'mono'.
 * @return string URL, or empty string if the badge has no file asset.
 */
function get_badge_image_url( string $id, string $color_mode = 'color' ): string {
	$badges = get_badges();
	if ( ! isset( $badges[ $id ] ) || empty( $badges[ $id ]['file'] ) ) {
		return '';
	}
	$badge    = $badges[ $id ];
	$filename = ( 'mono' === $color_mode && ! empty( $badge['monoFile'] ) )
		? $badge['monoFile']
		: $badge['file'];
	return plugins_url( 'assets/' . $filename, __FILE__ );
}

/**
 * Render an inline-stylized trust badge (security / service icons).
 *
 * Only badges defined with a `paths` field — file-based brand logos are
 * emitted as <img> by the render template using get_badge_image_url().
 *
 * @param string $id   Badge slug.
 * @param int    $size Badge size in pixels.
 * @return string SVG markup, or empty string.
 */
function render_badge_svg( string $id, int $size = 24 ): string {
	$badges = get_badges();
	if ( ! isset( $badges[ $id ] ) || empty( $badges[ $id ]['paths'] ) ) {
		return '';
	}
	return sprintf(
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="%d" height="%d" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">%s</svg>',
		$size,
		$size,
		wp_kses( $badges[ $id ]['paths'], AllowedHtml::svg() )
	);
}
