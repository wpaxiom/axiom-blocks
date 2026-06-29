<?php
/**
 * Advanced Section Block — server-side render.
 *
 * Single-wrapper structure so WordPress's native layout system
 * (theme.json contentSize / wideSize + the Inner blocks use content width
 *  toggle) applies to our direct children correctly.
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
use AxiomBlocks\Frontend\ResponsiveStyles;

$axiom_blocks_bg_type         = $attributes['backgroundType'] ?? 'color';
$axiom_blocks_bg_color        = $attributes['backgroundColor'] ?? '';
$axiom_blocks_grad_type       = $attributes['gradientType'] ?? 'linear';
$axiom_blocks_grad_angle      = (int) ( $attributes['gradientAngle'] ?? 135 );
$axiom_blocks_grad_from       = $attributes['gradientFromColor'] ?? '#4f46e5';
$axiom_blocks_grad_to         = $attributes['gradientToColor'] ?? '#ec4899';
$axiom_blocks_grad_use_mid    = ! empty( $attributes['gradientUseMidStop'] );
$axiom_blocks_grad_mid        = $attributes['gradientMidColor'] ?? '#9333ea';
$axiom_blocks_grad_from_s     = (int) ( $attributes['gradientFromStop'] ?? 0 );
$axiom_blocks_grad_mid_s      = (int) ( $attributes['gradientMidStop'] ?? 50 );
$axiom_blocks_grad_to_s       = (int) ( $attributes['gradientToStop'] ?? 100 );
$axiom_blocks_bg_image        = $attributes['backgroundImage'] ?? null;
$axiom_blocks_bg_size         = $attributes['backgroundSize'] ?? 'cover';
$axiom_blocks_bg_position     = $attributes['backgroundPosition'] ?? 'center center';
$axiom_blocks_bg_repeat       = $attributes['backgroundRepeat'] ?? 'no-repeat';
$axiom_blocks_bg_attachment   = $attributes['backgroundAttachment'] ?? 'scroll';
$axiom_blocks_enable_parallax = ! empty( $attributes['enableParallax'] );
$axiom_blocks_parallax_speed  = max( 0, min( 100, (int) ( $attributes['parallaxSpeed'] ?? 30 ) ) );

$axiom_blocks_overlay_type  = $attributes['overlayType'] ?? 'color';
$axiom_blocks_overlay_color = $attributes['overlayColor'] ?? '';
$axiom_blocks_ov_grad_type  = $attributes['overlayGradientType'] ?? 'linear';
$axiom_blocks_ov_grad_angle = (int) ( $attributes['overlayGradientAngle'] ?? 180 );
$axiom_blocks_ov_grad_from  = $attributes['overlayGradientFromColor'] ?? '#000000';
$axiom_blocks_ov_grad_to    = $attributes['overlayGradientToColor'] ?? 'rgba(0,0,0,0)';
$axiom_blocks_overlay_op    = max( 0, min( 100, (int) ( $attributes['overlayOpacity'] ?? 0 ) ) ) / 100;
$axiom_blocks_overlay_blend = $attributes['overlayBlendMode'] ?? 'normal';

if ( 'gradient' === $axiom_blocks_overlay_type ) {
	$axiom_blocks_overlay_bg = 'radial' === $axiom_blocks_ov_grad_type
		? sprintf( 'radial-gradient(circle, %s 0%%, %s 100%%)', $axiom_blocks_ov_grad_from, $axiom_blocks_ov_grad_to )
		: sprintf( 'linear-gradient(%ddeg, %s 0%%, %s 100%%)', $axiom_blocks_ov_grad_angle, $axiom_blocks_ov_grad_from, $axiom_blocks_ov_grad_to );
} else {
	$axiom_blocks_overlay_bg = '' !== $axiom_blocks_overlay_color ? $axiom_blocks_overlay_color : 'transparent';
}

$axiom_blocks_min_height        = $attributes['minHeight'] ?? '400px';
$axiom_blocks_mobile_min_height = $attributes['mobileMinHeight'] ?? '';
$axiom_blocks_v_align           = $attributes['verticalAlign'] ?? 'center';
$axiom_blocks_h_align           = $attributes['horizontalAlign'] ?? 'center';

$axiom_blocks_border_style  = $attributes['borderStyle'] ?? 'none';
$axiom_blocks_border_width  = (int) ( $attributes['borderWidth'] ?? 0 );
$axiom_blocks_border_color  = $attributes['borderColor'] ?? '#000000';
$axiom_blocks_border_radius = (int) ( $attributes['borderRadius'] ?? 0 );

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

// Background declarations.
$axiom_blocks_bg_parts = array();
switch ( $axiom_blocks_bg_type ) {
	case 'gradient':
		$axiom_blocks_stops = $axiom_blocks_grad_use_mid
			? sprintf(
				'%s %d%%, %s %d%%, %s %d%%',
				esc_attr( $axiom_blocks_grad_from ),
				$axiom_blocks_grad_from_s,
				esc_attr( $axiom_blocks_grad_mid ),
				$axiom_blocks_grad_mid_s,
				esc_attr( $axiom_blocks_grad_to ),
				$axiom_blocks_grad_to_s
			)
			: sprintf(
				'%s %d%%, %s %d%%',
				esc_attr( $axiom_blocks_grad_from ),
				$axiom_blocks_grad_from_s,
				esc_attr( $axiom_blocks_grad_to ),
				$axiom_blocks_grad_to_s
			);
		if ( 'radial' === $axiom_blocks_grad_type ) {
			$axiom_blocks_bg_parts[] = 'background: radial-gradient(circle, ' . $axiom_blocks_stops . ')';
		} else {
			$axiom_blocks_bg_parts[] = 'background: linear-gradient(' . (int) $axiom_blocks_grad_angle . 'deg, ' . $axiom_blocks_stops . ')';
		}
		break;
	case 'image':
		if ( ! empty( $axiom_blocks_bg_image['url'] ) ) {
			$axiom_blocks_bg_parts[] = "background-image: url('" . esc_url( $axiom_blocks_bg_image['url'] ) . "')";
			$axiom_blocks_bg_parts[] = 'background-size: ' . esc_attr( $axiom_blocks_bg_size );
			$axiom_blocks_bg_parts[] = 'background-position: ' . esc_attr( $axiom_blocks_bg_position );
			$axiom_blocks_bg_parts[] = 'background-repeat: ' . esc_attr( $axiom_blocks_bg_repeat );
			$axiom_blocks_bg_parts[] = 'background-attachment: ' . esc_attr( $axiom_blocks_bg_attachment );
		}
		break;
	case 'color':
	default:
		if ( $axiom_blocks_bg_color ) {
			$axiom_blocks_bg_parts[] = 'background-color: ' . esc_attr( $axiom_blocks_bg_color );
		}
		break;
}

// Border (only emit declarations when actually applied).
if ( 'none' !== $axiom_blocks_border_style && $axiom_blocks_border_width > 0 ) {
	$axiom_blocks_bg_parts[] = 'border-style: ' . esc_attr( $axiom_blocks_border_style );
	$axiom_blocks_bg_parts[] = 'border-width: ' . (int) $axiom_blocks_border_width . 'px';
	$axiom_blocks_bg_parts[] = 'border-color: ' . esc_attr( $axiom_blocks_border_color );
}
if ( $axiom_blocks_border_radius > 0 ) {
	$axiom_blocks_bg_parts[] = 'border-radius: ' . (int) $axiom_blocks_border_radius . 'px';
}

// Desktop min-height stays inline (back-compat); Tablet/Mobile overrides are
// emitted as scoped media-query CSS below.
$axiom_blocks_bg_parts[] = '--axiom-blocks-section-min-h: ' . esc_attr( $axiom_blocks_min_height );
$axiom_blocks_bg_parts[] = 'min-height: var(--axiom-blocks-section-min-h, 400px)';

$axiom_blocks_bg_parts[] = '--axiom-blocks-section-justify: ' . esc_attr( $axiom_blocks_v_map[ $axiom_blocks_v_align ] ?? 'center' );
$axiom_blocks_bg_parts[] = '--axiom-blocks-section-align: ' . esc_attr( $axiom_blocks_h_map[ $axiom_blocks_h_align ] ?? 'center' );
$axiom_blocks_bg_parts[] = '--axiom-blocks-section-overlay-bg: ' . esc_attr( $axiom_blocks_overlay_bg );
$axiom_blocks_bg_parts[] = '--axiom-blocks-section-overlay-opacity: ' . esc_attr( (string) $axiom_blocks_overlay_op );
$axiom_blocks_bg_parts[] = '--axiom-blocks-section-overlay-blend: ' . esc_attr( $axiom_blocks_overlay_blend );

$axiom_blocks_is_parallax = $axiom_blocks_enable_parallax && 'image' === $axiom_blocks_bg_type && ! empty( $axiom_blocks_bg_image['url'] );

// When parallax is on, suppress the wrapper bg-image and surface bg-* as CSS
// vars so the ::before layer can paint and be transformed by parallax.js.
if ( $axiom_blocks_is_parallax ) {
	$axiom_blocks_bg_parts[] = 'background-image: none';
	$axiom_blocks_bg_parts[] = "--ab-bg-image: url('" . esc_url( $axiom_blocks_bg_image['url'] ) . "')";
	$axiom_blocks_bg_parts[] = '--ab-bg-size: ' . esc_attr( $axiom_blocks_bg_size );
	$axiom_blocks_bg_parts[] = '--ab-bg-position: ' . esc_attr( $axiom_blocks_bg_position );
	$axiom_blocks_bg_parts[] = '--ab-bg-repeat: ' . esc_attr( $axiom_blocks_bg_repeat );
}

$axiom_blocks_wrapper_style = Spacing::merge( implode( '; ', $axiom_blocks_bg_parts ), $attributes );

$axiom_blocks_wrapper_classes = array(
	'axiom-blocks-section',
	'axiom-blocks-section--' . $axiom_blocks_bg_type,
	'is-h-' . $axiom_blocks_h_align,
	'is-v-' . $axiom_blocks_v_align,
);
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

$axiom_blocks_parallax_data = $axiom_blocks_is_parallax
	? number_format( $axiom_blocks_parallax_speed / 100, 2, '.', '' )
	: '';
?>
<div <?php echo '' !== $axiom_blocks_id_attr ? 'id="' . esc_attr( $axiom_blocks_id_attr ) . '" ' : ''; ?> class="<?php echo esc_attr( $axiom_blocks_class_attr ); ?>" <?php echo '' !== $axiom_blocks_style_attr ? ' style="' . esc_attr( $axiom_blocks_style_attr ) . '"' : ''; ?> <?php echo '' !== $axiom_blocks_parallax_data ? ' data-parallax-speed="' . esc_attr( $axiom_blocks_parallax_data ) . '"' : ''; ?>>
	<?php echo wp_kses_post( $content ); ?>
</div>
