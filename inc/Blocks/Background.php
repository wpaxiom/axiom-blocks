<?php
/**
 * Shared background builder — mirrors the JS getBackgroundVars in
 * src/components/BackgroundControl.js. Given a block's attributes, an element
 * `prefix` ('' → bgType…, 'item' → itemBgType…) and the color attribute key
 * (which may be a legacy solid-color attr, e.g. 'itemBg'), returns the CSS
 * `background` shorthand: solid color, gradient, or image (+ overlay).
 *
 * Color type / unset ⇒ the color attr (legacy back-compat). Gradient/image ⇒
 * built from the prefixed attrs. Emit the result into a CSS var consumed by the
 * block's style.scss.
 *
 * @package AxiomBlocks\Blocks
 */

namespace AxiomBlocks\Blocks;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Background value builder.
 */
class Background {

	/**
	 * Compose a prefixed, camelCase attribute key.
	 *
	 * @param string $prefix Element prefix ('' for none).
	 * @param string $key    Base key (e.g. 'bgType').
	 * @return string
	 */
	private static function camel( string $prefix, string $key ): string {
		if ( '' === $prefix ) {
			return $key;
		}
		return $prefix . ucfirst( $key );
	}

	/**
	 * Build a CSS gradient from N stops.
	 *
	 * @param string $type  'linear' | 'radial'.
	 * @param mixed  $angle Linear angle (deg).
	 * @param mixed  $stops Array of { color, position } stops.
	 * @return string
	 */
	private static function gradient( $type, $angle, $stops ): string {
		$list = array();
		foreach ( (array) $stops as $stop ) {
			if ( ! empty( $stop['color'] ) ) {
				$list[] = $stop['color'] . ' ' . ( isset( $stop['position'] ) ? $stop['position'] : 0 ) . '%';
			}
		}
		if ( count( $list ) < 2 ) {
			return '';
		}
		$body = implode( ', ', $list );
		return 'radial' === $type
			? 'radial-gradient(circle, ' . $body . ')'
			: 'linear-gradient(' . ( null !== $angle ? $angle : 90 ) . 'deg, ' . $body . ')';
	}

	/**
	 * Overlay background string (color or gradient), mirroring the JS
	 * buildOverlayBackground in BackgroundControl.js.
	 *
	 * @param callable $get Value-getter: $get( 'bgOverlayType' ) → attr value.
	 * @return string
	 */
	private static function overlay_background( callable $get ): string {
		$type = (string) ( $get( 'bgOverlayType' ) ?? 'color' );
		if ( 'gradient' === $type ) {
			$from  = (string) ( $get( 'bgOverlayGradFrom' ) ?? '#000000' );
			$to    = (string) ( $get( 'bgOverlayGradTo' ) ?? 'rgba(0,0,0,0)' );
			$stops = $from . ' 0%, ' . $to . ' 100%';
			return 'radial' === (string) ( $get( 'bgOverlayGradType' ) ?? 'linear' )
				? 'radial-gradient(circle, ' . $stops . ')'
				: 'linear-gradient(' . (int) ( $get( 'bgOverlayGradAngle' ) ?? 180 ) . 'deg, ' . $stops . ')';
		}
		return (string) ( $get( 'bgOverlay' ) ?? '' );
	}

	/**
	 * Resolve the CSS `background` shorthand for one element.
	 *
	 * @param array  $attrs     Block attributes.
	 * @param string $prefix    Element prefix ('' | 'item' | 'itemHover' | …).
	 * @param string $color_key Color attribute key (may be a legacy attr).
	 * @return string CSS value, or '' when nothing is set.
	 */
	public static function value( array $attrs, string $prefix, string $color_key ): string {
		$get = static function ( $key ) use ( $attrs, $prefix ) {
			$k = self::camel( $prefix, $key );
			return $attrs[ $k ] ?? null;
		};

		$type = (string) ( $get( 'bgType' ) ?? '' );

		// The rich overlay layer (separate ::after) is active when a block sets
		// an opacity or a gradient overlay; a flat color overlay then moves out
		// of the shorthand (see layer_vars). Otherwise it stays baked in, exactly
		// as accordion / advanced-button render today.
		$overlay_opacity = (float) ( $get( 'bgOverlayOpacity' ) ?? 0 );
		$use_layer       = $overlay_opacity > 0 || 'gradient' === (string) ( $get( 'bgOverlayType' ) ?? 'color' );

		if ( 'gradient' === $type ) {
			return self::gradient( $get( 'bgGradType' ), $get( 'bgGradAngle' ), $get( 'bgGradStops' ) );
		}

		if ( 'image' === $type ) {
			$image = $get( 'bgImage' );
			if ( empty( $image['url'] ) ) {
				return (string) ( $attrs[ $color_key ] ?? '' );
			}
			$position = $get( 'bgImagePosition' ) ? $get( 'bgImagePosition' ) : 'center center';
			$size     = $get( 'bgImageSize' ) ? $get( 'bgImageSize' ) : 'cover';
			$repeat   = $get( 'bgImageRepeat' ) ? $get( 'bgImageRepeat' ) : 'no-repeat';
			$layer    = "url('" . esc_url( $image['url'] ) . "') {$position} / {$size} {$repeat}";
			$overlay  = (string) ( $get( 'bgOverlay' ) ?? '' );
			return ( '' !== $overlay && ! $use_layer )
				? 'linear-gradient(' . $overlay . ', ' . $overlay . '), ' . $layer
				: $layer;
		}

		// Color type or unset ⇒ the color attribute (legacy-safe).
		return (string) ( $attrs[ $color_key ] ?? '' );
	}

	/**
	 * Additive CSS-var declarations for the extended background options
	 * (attachment, parallax, and the separate overlay layer). Mirrors the
	 * additive vars in getBackgroundVars. Returns complete "var: value" strings
	 * ready to append to a block's style parts; empty when nothing is set, so
	 * blocks that don't use these options emit nothing (back-compat).
	 *
	 * @param array  $attrs      Block attributes.
	 * @param string $prefix     Element prefix ('' | 'item' | …).
	 * @param string $var_prefix CSS var prefix without leading '--' (e.g. 'ab-acc-item').
	 * @return string[] CSS declarations.
	 */
	public static function layer_vars( array $attrs, string $prefix, string $var_prefix ): array {
		$get = static function ( $key ) use ( $attrs, $prefix ) {
			$k = self::camel( $prefix, $key );
			return $attrs[ $k ] ?? null;
		};

		$vars = array();
		$type = (string) ( $get( 'bgType' ) ?? '' );
		$image = $get( 'bgImage' );

		if ( 'image' === $type && ! empty( $image['url'] ) ) {
			$attachment = (string) ( $get( 'bgImageAttachment' ) ?? '' );
			if ( '' !== $attachment && 'scroll' !== $attachment ) {
				$vars[] = '--' . $var_prefix . '-attach: ' . $attachment;
			}
			if ( ! empty( $get( 'bgParallax' ) ) ) {
				$speed  = max( 0, min( 100, (int) ( $get( 'bgParallaxSpeed' ) ?? 30 ) ) );
				$vars[] = '--' . $var_prefix . '-parallax: 1';
				$vars[] = '--' . $var_prefix . '-parallax-speed: ' . (string) ( $speed / 100 );
			}
		}

		$overlay_opacity = (float) ( $get( 'bgOverlayOpacity' ) ?? 0 );
		if ( $overlay_opacity > 0 || 'gradient' === (string) ( $get( 'bgOverlayType' ) ?? 'color' ) ) {
			$overlay_bg = self::overlay_background( $get );
			if ( '' !== $overlay_bg ) {
				$vars[] = '--' . $var_prefix . '-overlay-bg: ' . $overlay_bg;
				$vars[] = '--' . $var_prefix . '-overlay-opacity: ' . (string) ( $overlay_opacity / 100 );
				$blend  = (string) ( $get( 'bgOverlayBlend' ) ?? '' );
				if ( '' !== $blend && 'normal' !== $blend ) {
					$vars[] = '--' . $var_prefix . '-overlay-blend: ' . $blend;
				}
			}
		}

		return $vars;
	}
}
