<?php
/**
 * Responsive helper — emits per-breakpoint CSS for responsive controls.
 *
 * Matches WordPress's native device preview exactly (core `use-resize-canvas`):
 * Tablet canvas = 780px, Mobile canvas = 360px. Per-device values are applied via
 * media queries at those exact widths, so the native preview equals the live site.
 *
 * Desktop values keep rendering inline on the wrapper (unchanged / back-compat);
 * this helper only emits a scoped <style> for Tablet/Mobile overrides, and only
 * when they are set and differ from the larger breakpoint (diff-filtered).
 *
 * @package AxiomBlocks\Blocks
 * @since 1.0.3
 */

namespace AxiomBlocks\Blocks;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Responsive CSS helper.
 *
 * @since 1.0.3
 */
class Responsive {

	/**
	 * Native WordPress device canvas widths (px).
	 */
	public const TABLET_MAX = 780;
	public const MOBILE_MAX = 360;

	/**
	 * CSS property => base attribute key map for spacing (padding/margin).
	 *
	 * @return array<string, string>
	 */
	public static function spacing_map(): array {
		return array(
			'padding-top'    => 'paddingTop',
			'padding-right'  => 'paddingRight',
			'padding-bottom' => 'paddingBottom',
			'padding-left'   => 'paddingLeft',
			'margin-top'     => 'marginTop',
			'margin-right'   => 'marginRight',
			'margin-bottom'  => 'marginBottom',
			'margin-left'    => 'marginLeft',
		);
	}

	/**
	 * CSS property => base attribute suffix map for typography. The suffix is
	 * prefixed per typography group (e.g. 'heading' + 'FontSize' => 'headingFontSize';
	 * empty prefix => 'fontSize'). Mirrors the JS KEYS list in TypographyPanel.
	 *
	 * @return array<string, string>
	 */
	public static function typography_map(): array {
		return array(
			'font-family'     => 'fontFamily',
			'font-weight'     => 'fontWeight',
			'font-size'       => 'fontSize',
			'line-height'     => 'lineHeight',
			'letter-spacing'  => 'letterSpacing',
			'text-transform'  => 'textTransform',
			'text-decoration' => 'textDecoration',
			'text-align'      => 'textAlign',
		);
	}

	/**
	 * Compose a prefixed, camelCase attribute key — ('heading','fontSize') =>
	 * 'headingFontSize'; ('', 'fontSize') => 'fontSize'.
	 *
	 * @param string $prefix Group prefix ('' for none).
	 * @param string $suffix Base attribute suffix (camelCase).
	 * @return string
	 */
	public static function prefixed( string $prefix, string $suffix ): string {
		if ( '' === $prefix ) {
			return $suffix;
		}
		return $prefix . strtoupper( $suffix[0] ) . substr( $suffix, 1 );
	}

	/**
	 * Build responsive typography CSS for a block instance. Unlike spacing (one
	 * value set on the wrapper), typography lands on inner elements, so each group
	 * carries its own selector. Output is scoped under the per-instance wrapper class.
	 *
	 * @param string                $instance_class Per-instance class (no leading dot).
	 * @param array                 $attributes     Block attributes.
	 * @param array<string, string> $targets        Group prefix => CSS selector
	 *                                              (relative to the wrapper).
	 * @return string The CSS, or '' when there are no overrides.
	 */
	public static function typography_css( string $instance_class, array $attributes, array $targets ): string {
		$map     = self::typography_map();
		$wrapper = '.' . sanitize_html_class( $instance_class );
		$tablet  = '';
		$mobile  = '';

		foreach ( $targets as $prefix => $selector ) {
			$tablet_decl = '';
			$mobile_decl = '';
			foreach ( $map as $css_prop => $suffix ) {
				$base_key    = self::prefixed( $prefix, $suffix );
				$tablet_val  = self::diff_value( $attributes, $base_key, 'Tablet' );
				$mobile_val  = self::diff_value( $attributes, $base_key, 'Mobile' );
				if ( null !== $tablet_val ) {
					$tablet_decl .= $css_prop . ':' . $tablet_val . ' !important;';
				}
				if ( null !== $mobile_val ) {
					$mobile_decl .= $css_prop . ':' . $mobile_val . ' !important;';
				}
			}
			// An empty selector means the typography lands on the wrapper itself
			// (e.g. icon-list), so target the instance class directly.
			$scoped = '' === $selector ? $wrapper : $wrapper . ' ' . $selector;
			if ( '' !== $tablet_decl ) {
				$tablet .= $scoped . '{' . $tablet_decl . '}';
			}
			if ( '' !== $mobile_decl ) {
				$mobile .= $scoped . '{' . $mobile_decl . '}';
			}
		}

		$css = '';
		if ( '' !== $tablet ) {
			$css .= '@media (max-width:' . self::TABLET_MAX . 'px){' . $tablet . '}';
		}
		if ( '' !== $mobile ) {
			$css .= '@media (max-width:' . self::MOBILE_MAX . 'px){' . $mobile . '}';
		}
		return $css;
	}

	/**
	 * Stable per-instance class for a block's responsive typography attributes.
	 *
	 * @param array                 $attributes Block attributes.
	 * @param array<string, string> $targets    Group prefix => CSS selector.
	 * @return string Class name (e.g. 'ab-rt-1a2b3c4d').
	 */
	public static function typography_instance_class( array $attributes, array $targets ): string {
		$parts = array();
		foreach ( array_keys( $targets ) as $prefix ) {
			foreach ( array_values( self::typography_map() ) as $suffix ) {
				$base_key = self::prefixed( $prefix, $suffix );
				foreach ( array( '', 'Tablet', 'Mobile' ) as $device ) {
					$parts[] = (string) ( $attributes[ $base_key . $device ] ?? '' );
				}
			}
		}
		return 'ab-rt-' . substr( md5( implode( '|', $parts ) ), 0, 8 );
	}

	/**
	 * True when a block has any Tablet/Mobile typography override worth emitting.
	 *
	 * @param array                 $attributes Block attributes.
	 * @param array<string, string> $targets    Group prefix => CSS selector.
	 * @return bool
	 */
	public static function typography_has_overrides( array $attributes, array $targets ): bool {
		foreach ( array_keys( $targets ) as $prefix ) {
			foreach ( array_values( self::typography_map() ) as $suffix ) {
				$base_key = self::prefixed( $prefix, $suffix );
				if ( '' !== (string) ( $attributes[ $base_key . 'Tablet' ] ?? '' )
					|| '' !== (string) ( $attributes[ $base_key . 'Mobile' ] ?? '' ) ) {
					return true;
				}
			}
		}
		return false;
	}

	/**
	 * Build the raw responsive CSS for a block instance's Tablet/Mobile overrides.
	 *
	 * Returns CSS text only (no <style> tag) — it is delivered via
	 * wp_add_inline_style() (see Frontend\ResponsiveStyles), never echoed, so
	 * Plugin Check stays happy.
	 *
	 * @param string                $instance_class Per-instance class (no leading dot).
	 * @param array                 $attributes     Block attributes.
	 * @param array<string, string> $map            CSS property => base attribute key
	 *                                              (e.g. 'padding-top' => 'paddingTop').
	 * @return string The CSS, or '' when there are no overrides.
	 */
	public static function css( string $instance_class, array $attributes, array $map ): string {
		$tablet_rule = self::device_rule( $instance_class, $attributes, $map, 'Tablet' );
		$mobile_rule = self::device_rule( $instance_class, $attributes, $map, 'Mobile' );

		$css = '';
		if ( '' !== $tablet_rule ) {
			$css .= '@media (max-width:' . self::TABLET_MAX . 'px){' . $tablet_rule . '}';
		}
		if ( '' !== $mobile_rule ) {
			$css .= '@media (max-width:' . self::MOBILE_MAX . 'px){' . $mobile_rule . '}';
		}

		return $css;
	}

	/**
	 * Stable per-instance class for a block's responsive attributes. Identical
	 * overrides dedupe to one rule; different overrides get distinct classes.
	 *
	 * @param array                 $attributes Block attributes.
	 * @param array<string, string> $map        CSS property => base attribute key.
	 * @return string Class name (e.g. 'ab-r-1a2b3c4d').
	 */
	public static function instance_class( array $attributes, array $map ): string {
		$parts = array();
		foreach ( $map as $base_key ) {
			// Desktop included: the diff-filter compares against it, so it affects
			// the emitted CSS — two blocks must not share a class unless all three
			// values match for every property.
			foreach ( array( '', 'Tablet', 'Mobile' ) as $device ) {
				$parts[] = (string) ( $attributes[ $base_key . $device ] ?? '' );
			}
		}
		return 'ab-r-' . substr( md5( implode( '|', $parts ) ), 0, 8 );
	}

	/**
	 * True when a block has any Tablet/Mobile override worth emitting.
	 *
	 * @param array                 $attributes Block attributes.
	 * @param array<string, string> $map        CSS property => base attribute key.
	 * @return bool
	 */
	public static function has_overrides( array $attributes, array $map ): bool {
		foreach ( $map as $base_key ) {
			if ( '' !== (string) ( $attributes[ $base_key . 'Tablet' ] ?? '' )
				|| '' !== (string) ( $attributes[ $base_key . 'Mobile' ] ?? '' ) ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Build responsive CSS for arbitrary per-block single-value props (columns, gap,
	 * …). Each spec: [ 'prop' => CSS property, 'key' => base attr key,
	 * 'selector' => selector relative to wrapper ('' = wrapper itself),
	 * 'format' => optional value formatter ('grid-columns' | raw) ].
	 *
	 * @param string $instance_class Per-instance class (no leading dot).
	 * @param array  $attributes     Block attributes.
	 * @param array  $specs          List of prop specs.
	 * @return string The CSS, or '' when there are no overrides.
	 */
	public static function props_css( string $instance_class, array $attributes, array $specs ): string {
		$wrapper = '.' . sanitize_html_class( $instance_class );
		$tablet  = array();
		$mobile  = array();

		foreach ( $specs as $spec ) {
			$selector = (string) ( $spec['selector'] ?? '' );
			$scoped   = '' === $selector ? $wrapper : $wrapper . ' ' . $selector;
			$format   = (string) ( $spec['format'] ?? '' );
			$prop     = (string) $spec['prop'];

			$map = ( isset( $spec['map'] ) && is_array( $spec['map'] ) ) ? $spec['map'] : null;

			$tablet_val = self::diff_value( $attributes, $spec['key'], 'Tablet' );
			$mobile_val = self::diff_value( $attributes, $spec['key'], 'Mobile' );

			if ( null !== $tablet_val ) {
				$out = self::output_value( $format, $map, $tablet_val );
				if ( null !== $out ) {
					$tablet[ $scoped ][] = $prop . ':' . $out . ' !important;';
				}
			}
			if ( null !== $mobile_val ) {
				$out = self::output_value( $format, $map, $mobile_val );
				if ( null !== $out ) {
					$mobile[ $scoped ][] = $prop . ':' . $out . ' !important;';
				}
			}
		}

		$css = '';
		$css .= self::wrap_media( self::TABLET_MAX, $tablet );
		$css .= self::wrap_media( self::MOBILE_MAX, $mobile );
		return $css;
	}

	/**
	 * Stable per-instance class for a block's responsive prop attributes.
	 *
	 * @param array $attributes Block attributes.
	 * @param array $specs      List of prop specs.
	 * @return string Class name (e.g. 'ab-rc-1a2b3c4d').
	 */
	public static function props_instance_class( array $attributes, array $specs ): string {
		$parts = array();
		foreach ( $specs as $spec ) {
			foreach ( array( '', 'Tablet', 'Mobile' ) as $device ) {
				$parts[] = (string) ( $attributes[ $spec['key'] . $device ] ?? '' );
			}
		}
		return 'ab-rc-' . substr( md5( implode( '|', $parts ) ), 0, 8 );
	}

	/**
	 * True when a block has any Tablet/Mobile prop override worth emitting.
	 *
	 * @param array $attributes Block attributes.
	 * @param array $specs      List of prop specs.
	 * @return bool
	 */
	public static function props_has_overrides( array $attributes, array $specs ): bool {
		foreach ( $specs as $spec ) {
			if ( '' !== (string) ( $attributes[ $spec['key'] . 'Tablet' ] ?? '' )
				|| '' !== (string) ( $attributes[ $spec['key'] . 'Mobile' ] ?? '' ) ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Wrap per-selector declaration lists in a max-width media query.
	 *
	 * @param int   $max_width Breakpoint.
	 * @param array $byScoped  selector => string[] declarations.
	 * @return string
	 */
	private static function wrap_media( int $max_width, array $byScoped ): string {
		if ( empty( $byScoped ) ) {
			return '';
		}
		$rules = '';
		foreach ( $byScoped as $scoped => $declarations ) {
			$rules .= $scoped . '{' . implode( '', $declarations ) . '}';
		}
		return '@media (max-width:' . $max_width . 'px){' . $rules . '}';
	}

	/**
	 * Format a validated value for output. 'grid-columns' wraps a column count as a
	 * repeat() track list; anything else is passed through unchanged.
	 *
	 * @param string $format Format name.
	 * @param string $value  Validated value.
	 * @return string
	 */
	private static function format_value( string $format, string $value ): string {
		if ( 'grid-columns' === $format ) {
			return 'repeat(' . $value . ', minmax(0, 1fr))';
		}
		if ( 'px' === $format ) {
			return $value . 'px';
		}
		return $value;
	}

	/**
	 * Resolve a value to its CSS output. When a spec carries a value-map (e.g.
	 * alignment: left => flex-start), the stored attribute value is the lookup key
	 * and an unmapped value emits nothing; otherwise the value is formatted.
	 *
	 * @param string     $format Format name.
	 * @param array|null $map    Optional value => CSS map.
	 * @param string     $value  Validated value.
	 * @return string|null CSS value, or null to emit nothing.
	 */
	private static function output_value( string $format, $map, string $value ) {
		if ( null !== $map ) {
			return $map[ $value ] ?? null;
		}
		return self::format_value( $format, $value );
	}

	/**
	 * Build the CSS rule for one device, diff-filtered against the larger breakpoint.
	 *
	 * @param string                $instance_class Per-instance class.
	 * @param array                 $attributes     Block attributes.
	 * @param array<string, string> $map            CSS property => base attribute key.
	 * @param string                $device         'Tablet' | 'Mobile'.
	 * @return string The `.class{…}` rule, or '' when nothing differs.
	 */
	private static function device_rule( string $instance_class, array $attributes, array $map, string $device ): string {
		$declarations = '';
		foreach ( $map as $css_prop => $base_key ) {
			$value = self::diff_value( $attributes, $base_key, $device );
			if ( null !== $value ) {
				$declarations .= $css_prop . ':' . $value . ' !important;';
			}
		}
		return '' === $declarations
			? ''
			: '.' . sanitize_html_class( $instance_class ) . '{' . $declarations . '}';
	}

	/**
	 * Effective value for a device only when it differs from the larger breakpoint.
	 *
	 * @param array  $attributes Block attributes.
	 * @param string $base_key   Base attribute key.
	 * @param string $device     'Tablet' | 'Mobile'.
	 * @return string|null Sanitized value, or null when there's nothing to emit.
	 */
	private static function diff_value( array $attributes, string $base_key, string $device ) {
		$desktop = (string) ( $attributes[ $base_key ] ?? '' );
		$tablet  = (string) ( $attributes[ $base_key . 'Tablet' ] ?? '' );

		if ( 'Tablet' === $device ) {
			if ( '' === $tablet || $tablet === $desktop ) {
				return null;
			}
			return self::safe_value( $tablet );
		}

		$mobile           = (string) ( $attributes[ $base_key . 'Mobile' ] ?? '' );
		$effective_tablet = '' !== $tablet ? $tablet : $desktop;
		if ( '' === $mobile || $mobile === $effective_tablet ) {
			return null;
		}
		return self::safe_value( $mobile );
	}

	/**
	 * Allow only safe CSS length/calc characters so a value can't break out of the
	 * <style> context. Returns null on anything suspicious.
	 *
	 * @param string $value Raw attribute value.
	 * @return string|null
	 */
	private static function safe_value( string $value ) {
		$value = trim( $value );
		if ( '' === $value ) {
			return null;
		}
		// digits, letters, dot, sign, %, spaces, parens, commas, quotes
		// (px/em/%/calc/var/clamp + quoted font-family names). No `}`/`<`/`;` so a
		// value can't break out of the CSS context.
		if ( preg_match( '/^[0-9a-zA-Z.\-%(),\s"\']+$/', $value ) ) {
			return $value;
		}
		return null;
	}
}
