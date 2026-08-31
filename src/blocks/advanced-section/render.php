<?php
/**
 * Advanced Section Block — server-side render.
 *
 * Single-wrapper structure so WordPress's native layout system
 * (theme.json contentSize / wideSize + the Inner blocks use content width
 *  toggle) applies to our direct children correctly.
 *
 * Background + overlay use the shared Background builder (BackgroundControl).
 * A fallback reads the legacy bespoke attrs (backgroundType, gradient*, overlay*)
 * for posts saved before the migration ran.
 *
 * @package AxiomBlocks
 * @var array  $attributes Block attributes.
 * @var string $content    Rendered inner blocks.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use AxiomBlocks\Blocks\Spacing;
use AxiomBlocks\Blocks\Responsive;
use AxiomBlocks\Blocks\AllowedHtml;
use AxiomBlocks\Blocks\Background;
use AxiomBlocks\Frontend\ResponsiveStyles;

// ── Background (shared BackgroundControl schema, with legacy fallback) ─────
$axiom_blocks_bg_type = $attributes['bgType'] ?? '';

// Legacy fallback: posts saved before the migration still carry the old attrs.
if ( '' === $axiom_blocks_bg_type && ! empty( $attributes['backgroundType'] ) ) {
	$axiom_blocks_legacy = $attributes;
	$axiom_blocks_legacy['bgType']            = $axiom_blocks_legacy['backgroundType'] ?? '';
	$axiom_blocks_legacy['bgColor']           = $axiom_blocks_legacy['backgroundColor'] ?? '';
	$axiom_blocks_legacy['bgGradType']        = $axiom_blocks_legacy['gradientType'] ?? 'linear';
	$axiom_blocks_legacy['bgGradAngle']       = $axiom_blocks_legacy['gradientAngle'] ?? 90;
	$axiom_blocks_legacy['bgImage']           = $axiom_blocks_legacy['backgroundImage'] ?? null;
	$axiom_blocks_legacy['bgImageSize']       = $axiom_blocks_legacy['backgroundSize'] ?? 'cover';
	$axiom_blocks_legacy['bgImagePosition']   = $axiom_blocks_legacy['backgroundPosition'] ?? 'center center';
	$axiom_blocks_legacy['bgImageRepeat']     = $axiom_blocks_legacy['backgroundRepeat'] ?? 'no-repeat';
	$axiom_blocks_legacy['bgImageAttachment'] = $axiom_blocks_legacy['backgroundAttachment'] ?? 'scroll';
	$axiom_blocks_legacy['bgParallax']        = ! empty( $axiom_blocks_legacy['enableParallax'] );
	$axiom_blocks_legacy['bgParallaxSpeed']   = $axiom_blocks_legacy['parallaxSpeed'] ?? 30;
	$axiom_blocks_legacy['bgOverlay']         = $axiom_blocks_legacy['overlayColor'] ?? '';
	$axiom_blocks_legacy['bgOverlayType']     = $axiom_blocks_legacy['overlayType'] ?? 'color';
	$axiom_blocks_legacy['bgOverlayGradType'] = $axiom_blocks_legacy['overlayGradientType'] ?? 'linear';
	$axiom_blocks_legacy['bgOverlayGradAngle'] = $axiom_blocks_legacy['overlayGradientAngle'] ?? 180;
	$axiom_blocks_legacy['bgOverlayGradFrom'] = $axiom_blocks_legacy['overlayGradientFromColor'] ?? '#000000';
	$axiom_blocks_legacy['bgOverlayGradTo']   = $axiom_blocks_legacy['overlayGradientToColor'] ?? 'rgba(0,0,0,0)';
	$axiom_blocks_legacy['bgOverlayOpacity']  = $axiom_blocks_legacy['overlayOpacity'] ?? 0;
	$axiom_blocks_legacy['bgOverlayBlend']    = $axiom_blocks_legacy['overlayBlendMode'] ?? 'normal';

	// Rebuild gradient stops from the legacy discrete attrs.
	$axiom_blocks_stops = array();
	if ( 'gradient' === $axiom_blocks_legacy['bgType'] ) {
		$axiom_blocks_stops[] = array(
			'color'    => $axiom_blocks_legacy['gradientFromColor'] ?? '#4f46e5',
			'position' => $axiom_blocks_legacy['gradientFromStop'] ?? 0,
		);
		if ( ! empty( $axiom_blocks_legacy['gradientUseMidStop'] ) ) {
			$axiom_blocks_stops[] = array(
				'color'    => $axiom_blocks_legacy['gradientMidColor'] ?? '#9333ea',
				'position' => $axiom_blocks_legacy['gradientMidStop'] ?? 50,
			);
		}
		$axiom_blocks_stops[] = array(
			'color'    => $axiom_blocks_legacy['gradientToColor'] ?? '#ec4899',
			'position' => $axiom_blocks_legacy['gradientToStop'] ?? 100,
		);
	}
	$axiom_blocks_legacy['bgGradStops'] = $axiom_blocks_stops;

	$attributes = $axiom_blocks_legacy; // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound -- $attributes is the WordPress-provided render template variable.
	$axiom_blocks_bg_type = $attributes['bgType'];
}

$axiom_blocks_bg_parts = array();

$axiom_blocks_bg_value = Background::value( $attributes, '', 'bgColor' );
if ( '' !== $axiom_blocks_bg_value ) {
	$axiom_blocks_bg_parts[] = '--ab-sec-bg: ' . $axiom_blocks_bg_value;
}
foreach ( Background::layer_vars( $attributes, '', 'ab-sec' ) as $axiom_blocks_var ) {
	$axiom_blocks_bg_parts[] = $axiom_blocks_var;
}

// ── Border / radius / shadow (design-system Container part) ────────────────
$axiom_blocks_border_style  = $attributes['borderStyle'] ?? 'none';
$axiom_blocks_border_width  = (int) ( $attributes['borderWidth'] ?? 0 );
$axiom_blocks_border_color  = $attributes['borderColor'] ?? '#000000';
$axiom_blocks_border_radius = (int) ( $attributes['borderRadius'] ?? 0 );

if ( 'none' !== $axiom_blocks_border_style ) {
	$axiom_blocks_bg_parts[] = '--ab-sec-bs: ' . esc_attr( $axiom_blocks_border_style );
}
if ( '' !== $axiom_blocks_border_color ) {
	$axiom_blocks_bg_parts[] = '--ab-sec-bc: ' . esc_attr( $axiom_blocks_border_color );
}
if ( $axiom_blocks_border_width > 0 ) {
	$axiom_blocks_bg_parts[] = '--ab-sec-bw: ' . (int) $axiom_blocks_border_width . 'px';
}
foreach ( array( 'top', 'right', 'bottom', 'left' ) as $axiom_blocks_side ) {
	$axiom_blocks_val = $attributes[ 'border' . ucfirst( $axiom_blocks_side ) . 'Width' ] ?? '';
	if ( '' !== $axiom_blocks_val ) {
		$axiom_blocks_bg_parts[] = '--ab-sec-bw-' . $axiom_blocks_side . ': ' . esc_attr( $axiom_blocks_val );
	}
}
if ( $axiom_blocks_border_radius > 0 ) {
	$axiom_blocks_bg_parts[] = '--ab-sec-radius: ' . (int) $axiom_blocks_border_radius . 'px';
}
$axiom_blocks_radius_map = array(
	'tl' => 'radiusTopLeft',
	'tr' => 'radiusTopRight',
	'br' => 'radiusBottomRight',
	'bl' => 'radiusBottomLeft',
);
foreach ( $axiom_blocks_radius_map as $axiom_blocks_suffix => $axiom_blocks_attr_key ) {
	$axiom_blocks_val = $attributes[ $axiom_blocks_attr_key ] ?? '';
	if ( '' !== $axiom_blocks_val ) {
		$axiom_blocks_bg_parts[] = '--ab-sec-radius-' . $axiom_blocks_suffix . ': ' . esc_attr( $axiom_blocks_val );
	}
}
if ( ! empty( $attributes['sectionShadow'] ) ) {
	$axiom_blocks_bg_parts[] = '--ab-sec-shadow: ' . esc_attr( $attributes['sectionShadow'] );
}

// ── Size (L5) — desktop inline; Tablet/Mobile via ResponsiveProps ──────────
foreach ( array( 'width' => '--ab-sec-w', 'maxWidth' => '--ab-sec-mw' ) as $axiom_blocks_size_key => $axiom_blocks_size_var ) {
	if ( ! empty( $attributes[ $axiom_blocks_size_key ] ) ) {
		$axiom_blocks_bg_parts[] = $axiom_blocks_size_var . ': ' . esc_attr( $attributes[ $axiom_blocks_size_key ] );
	}
}

// ── Min-height + alignment ─────────────────────────────────────────────────
$axiom_blocks_min_height        = $attributes['minHeight'] ?? '400px';
$axiom_blocks_mobile_min_height = $attributes['mobileMinHeight'] ?? '';
$axiom_blocks_v_align           = $attributes['verticalAlign'] ?? 'center';
$axiom_blocks_h_align           = $attributes['horizontalAlign'] ?? 'center';

$axiom_blocks_v_map = array(
	'top'    => 'flex-start',
	'center' => 'center',
	'bottom' => 'flex-end',
);
$axiom_blocks_h_map = array(
	'left'   => 'flex-start',
	'center' => 'center',
	'right'  => 'flex-end',
);

$axiom_blocks_bg_parts[] = '--axiom-blocks-section-min-h: ' . esc_attr( $axiom_blocks_min_height );
$axiom_blocks_bg_parts[] = 'min-height: var(--axiom-blocks-section-min-h, 400px)';
$axiom_blocks_bg_parts[] = '--axiom-blocks-section-justify: ' . esc_attr( $axiom_blocks_v_map[ $axiom_blocks_v_align ] ?? 'center' );
$axiom_blocks_bg_parts[] = '--axiom-blocks-section-align: ' . esc_attr( $axiom_blocks_h_map[ $axiom_blocks_h_align ] ?? 'center' );

// align-items only moves a child narrower than the section, so full-width
// children ignore it. contentAlign carries the same choice through as
// text-align, which descendants inherit. Empty on blocks saved before this
// shipped, so their rendering is unchanged.
$axiom_blocks_content_align = $attributes['contentAlign'] ?? '';
if ( in_array( $axiom_blocks_content_align, array( 'left', 'center', 'right' ), true ) ) {
	$axiom_blocks_bg_parts[] = '--ab-sec-ta: ' . $axiom_blocks_content_align;
}

// ── Layout engine (L6) ─────────────────────────────────────────────────────
$axiom_blocks_layout_type = $attributes['layoutType'] ?? 'constrained';
$axiom_blocks_layout_gap  = '' !== ( $attributes['layoutGap'] ?? '' ) ? $attributes['layoutGap'] : '0';
if ( 'flex' === $axiom_blocks_layout_type ) {
	$axiom_blocks_bg_parts[] = '--ab-sec-fd: ' . esc_attr( $attributes['flexDirection'] ?? 'row' );
	$axiom_blocks_bg_parts[] = '--ab-sec-fw: ' . esc_attr( $attributes['flexWrap'] ?? 'wrap' );
	$axiom_blocks_bg_parts[] = '--ab-sec-jc: ' . esc_attr( $attributes['flexJustify'] ?? 'center' );
	$axiom_blocks_bg_parts[] = '--ab-sec-ai: ' . esc_attr( $attributes['flexAlign'] ?? 'center' );
	$axiom_blocks_bg_parts[] = '--ab-sec-gap: ' . esc_attr( $axiom_blocks_layout_gap );
} elseif ( 'grid' === $axiom_blocks_layout_type ) {
	$axiom_blocks_bg_parts[] = '--ab-sec-cols: ' . (int) ( $attributes['gridColumns'] ?? 3 );
	$axiom_blocks_bg_parts[] = '--ab-sec-ai: ' . esc_attr( $attributes['flexAlign'] ?? 'stretch' );
	$axiom_blocks_bg_parts[] = '--ab-sec-gap: ' . esc_attr( $axiom_blocks_layout_gap );
}

// ── Parallax ───────────────────────────────────────────────────────────────
$axiom_blocks_is_parallax = ! empty( $attributes['bgParallax'] )
	&& 'image' === $axiom_blocks_bg_type
	&& ! empty( $attributes['bgImage']['url'] );

if ( $axiom_blocks_is_parallax ) {
	$axiom_blocks_bg_parts[] = 'background-image: none';
	$axiom_blocks_bg_parts[] = "--ab-bg-image: url('" . esc_url( $attributes['bgImage']['url'] ) . "')";
	$axiom_blocks_bg_parts[] = '--ab-bg-size: ' . esc_attr( $attributes['bgImageSize'] ?? 'cover' );
	$axiom_blocks_bg_parts[] = '--ab-bg-position: ' . esc_attr( $attributes['bgImagePosition'] ?? 'center center' );
	$axiom_blocks_bg_parts[] = '--ab-bg-repeat: ' . esc_attr( $attributes['bgImageRepeat'] ?? 'no-repeat' );
}

$axiom_blocks_wrapper_style = Spacing::merge( implode( '; ', $axiom_blocks_bg_parts ), $attributes );

$axiom_blocks_wrapper_classes = array(
	'axiom-blocks-section',
	'axiom-blocks-section--' . ( $axiom_blocks_bg_type ?: 'none' ),
	'is-h-' . $axiom_blocks_h_align,
	'is-v-' . $axiom_blocks_v_align,
);
if ( 'flex' === $axiom_blocks_layout_type ) {
	$axiom_blocks_wrapper_classes[] = 'axiom-blocks-section--layout-flex';
} elseif ( 'grid' === $axiom_blocks_layout_type ) {
	$axiom_blocks_wrapper_classes[] = 'axiom-blocks-section--layout-grid';
}

// Custom breakpoint (L6): below the chosen width, collapse to a single stacked
// column. Scoped to this instance's class — no change to the global pipeline.
$axiom_blocks_stack_at = (int) ( $attributes['layoutStackAt'] ?? 0 );
if ( $axiom_blocks_stack_at > 0 && in_array( $axiom_blocks_layout_type, array( 'flex', 'grid' ), true ) ) {
	$axiom_blocks_bp_class          = 'ab-secbp-' . substr( md5( $axiom_blocks_layout_type . '|' . $axiom_blocks_stack_at ), 0, 8 );
	$axiom_blocks_wrapper_classes[] = $axiom_blocks_bp_class;
	ResponsiveStyles::add(
		'@media (max-width:' . $axiom_blocks_stack_at . 'px){.' . $axiom_blocks_bp_class
		. '{grid-template-columns:1fr !important;flex-direction:column !important}}'
	);
}
if ( $axiom_blocks_is_parallax ) {
	$axiom_blocks_wrapper_classes[] = 'has-parallax';
}

// Retired mobileMinHeight folds into the cascade as the Tablet override.
$axiom_blocks_mh_attrs = $attributes;
if ( empty( $axiom_blocks_mh_attrs['minHeightTablet'] ) && '' !== $axiom_blocks_mobile_min_height ) {
	$axiom_blocks_mh_attrs['minHeightTablet'] = $axiom_blocks_mobile_min_height;
}
$axiom_blocks_mh_map = array( 'min-height' => 'minHeight' );
if ( Responsive::has_overrides( $axiom_blocks_mh_attrs, $axiom_blocks_mh_map ) ) {
	$axiom_blocks_mh_class          = Responsive::instance_class( $axiom_blocks_mh_attrs, $axiom_blocks_mh_map );
	$axiom_blocks_wrapper_classes[] = $axiom_blocks_mh_class;
	ResponsiveStyles::add( Responsive::css( $axiom_blocks_mh_class, $axiom_blocks_mh_attrs, $axiom_blocks_mh_map ) );
}

$axiom_blocks_block_supports = WP_Block_Supports::get_instance()->apply_block_supports();

if ( ! empty( $attributes['className'] ) ) {
	$axiom_blocks_wrapper_classes[] = $attributes['className'];
}
if ( ! empty( $axiom_blocks_block_supports['class'] ) ) {
	$axiom_blocks_wrapper_classes[] = $axiom_blocks_block_supports['class'];
}
$axiom_blocks_class_attr = trim( implode( ' ', array_filter( $axiom_blocks_wrapper_classes ) ) );

$axiom_blocks_merged_style_parts = array_filter(
	array(
		rtrim( trim( $axiom_blocks_block_supports['style'] ?? '' ), ';' ),
		rtrim( trim( $axiom_blocks_wrapper_style ), ';' ),
	)
);
$axiom_blocks_style_attr         = safecss_filter_attr( implode( ';', $axiom_blocks_merged_style_parts ) );

$axiom_blocks_id_attr = $axiom_blocks_block_supports['id'] ?? '';

$axiom_blocks_parallax_speed = max( 0, min( 100, (int) ( $attributes['bgParallaxSpeed'] ?? 30 ) ) );
$axiom_blocks_parallax_data  = $axiom_blocks_is_parallax
	? number_format( $axiom_blocks_parallax_speed / 100, 2, '.', '' )
	: '';
?>
<div <?php echo '' !== $axiom_blocks_id_attr ? 'id="' . esc_attr( $axiom_blocks_id_attr ) . '" ' : ''; ?> class="<?php echo esc_attr( $axiom_blocks_class_attr ); ?>" <?php echo '' !== $axiom_blocks_style_attr ? ' style="' . esc_attr( $axiom_blocks_style_attr ) . '"' : ''; ?> <?php echo '' !== $axiom_blocks_parallax_data ? ' data-parallax-speed="' . esc_attr( $axiom_blocks_parallax_data ) . '"' : ''; ?>>
	<?php echo wp_kses( $content, AllowedHtml::post_with_svg() ); ?>
</div>
