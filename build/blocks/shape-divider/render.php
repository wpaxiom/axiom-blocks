<?php
/**
 * Shape Divider Block - Server-side Render
 *
 * @package AxiomBlocks
 * @var array $attributes Block attributes.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use AxiomBlocks\Blocks\AllowedHtml;
use AxiomBlocks\Blocks\Spacing;

$axiom_blocks_shape            = $attributes['shape'] ?? 'wave';
$axiom_blocks_height           = $attributes['height'] ?? '80px';
$axiom_blocks_color            = $attributes['color'] ?? '#ffffff';
$axiom_blocks_background_color = $attributes['backgroundColor'] ?? 'transparent';
$axiom_blocks_flip_horizontal  = ! empty( $attributes['flipHorizontal'] );
$axiom_blocks_flip_vertical    = ! empty( $attributes['flipVertical'] );

$axiom_blocks_shape_paths = array(
	'wave'     => 'M0,60 C200,120 400,0 600,60 C800,120 1000,0 1200,60 L1200,120 L0,120 Z',
	'curve'    => 'M0,120 C300,0 900,0 1200,120 L1200,120 L0,120 Z',
	'triangle' => 'M0,120 L600,0 L1200,120 Z',
	'tilt'     => 'M0,120 L1200,0 L1200,120 Z',
	'slant'    => 'M0,120 L0,0 L1200,120 Z',
);

if ( ! isset( $axiom_blocks_shape_paths[ $axiom_blocks_shape ] ) ) {
	$axiom_blocks_shape = 'wave';
}

$axiom_blocks_shape_path = $axiom_blocks_shape_paths[ $axiom_blocks_shape ];

/* ── Gradient fill ─────────────────────────────────────────────────────────────
   The shape is an SVG `<path fill>`, which no CSS gradient can paint, so the
   Fill background's gradient attrs become an SVG paint server instead. Mirrors
   src/blocks/shape-divider/gradient.js — keep the two in step. Flat colors keep
   the shipped `fill="#rrggbb"` and emit no <defs> at all. */
$axiom_blocks_gradient_defs = '';
$axiom_blocks_fill          = $axiom_blocks_color;

if ( 'gradient' === ( $attributes['shapeBgType'] ?? '' ) ) {
	$axiom_blocks_raw_stops = $attributes['shapeBgGradStops'] ?? array();
	$axiom_blocks_stops     = array();

	if ( is_array( $axiom_blocks_raw_stops ) ) {
		foreach ( array_values( $axiom_blocks_raw_stops ) as $axiom_blocks_i => $axiom_blocks_stop ) {
			if ( empty( $axiom_blocks_stop['color'] ) ) {
				continue;
			}
			$axiom_blocks_stop_color   = trim( (string) $axiom_blocks_stop['color'] );
			$axiom_blocks_stop_opacity = null;

			// `stop-color` takes no alpha channel in older renderers.
			if ( preg_match( '/^#([0-9a-f]{6})([0-9a-f]{2})$/i', $axiom_blocks_stop_color, $axiom_blocks_hex ) ) {
				$axiom_blocks_stop_color   = '#' . $axiom_blocks_hex[1];
				$axiom_blocks_stop_opacity = (string) ( round( ( hexdec( $axiom_blocks_hex[2] ) / 255 ) * 1000 ) / 1000 );
			}

			$axiom_blocks_position = isset( $axiom_blocks_stop['position'] )
				? (float) $axiom_blocks_stop['position']
				: ( $axiom_blocks_i ? 100 : 0 );

			$axiom_blocks_stops[] = array(
				'color'    => $axiom_blocks_stop_color,
				'opacity'  => $axiom_blocks_stop_opacity,
				'position' => max( 0, min( 100, $axiom_blocks_position ) ),
			);
		}
	}

	// SVG stop offsets must ascend, unlike a CSS stop list.
	usort(
		$axiom_blocks_stops,
		static function ( $a, $b ) {
			return $a['position'] <=> $b['position'];
		}
	);

	if ( count( $axiom_blocks_stops ) >= 2 ) {
		$axiom_blocks_grad_id     = wp_unique_id( 'ab-sd-grad-' );
		$axiom_blocks_stop_markup = '';
		foreach ( $axiom_blocks_stops as $axiom_blocks_stop ) {
			$axiom_blocks_stop_markup .= sprintf(
				'<stop offset="%s%%" stop-color="%s"%s></stop>',
				esc_attr( (string) $axiom_blocks_stop['position'] ),
				esc_attr( $axiom_blocks_stop['color'] ),
				null !== $axiom_blocks_stop['opacity']
					? ' stop-opacity="' . esc_attr( $axiom_blocks_stop['opacity'] ) . '"'
					: ''
			);
		}

		if ( 'radial' === ( $attributes['shapeBgGradType'] ?? 'linear' ) ) {
			$axiom_blocks_gradient_defs = sprintf(
				'<defs><radialGradient id="%s" cx="0.5" cy="0.5" r="0.5">%s</radialGradient></defs>',
				esc_attr( $axiom_blocks_grad_id ),
				$axiom_blocks_stop_markup
			);
		} else {
			// CSS angles run clockwise from "to top"; SVG wants a vector in the
			// 0–1 object bounding box, y pointing down.
			$axiom_blocks_rad = ( (float) ( $attributes['shapeBgGradAngle'] ?? 90 ) ) * M_PI / 180;
			$axiom_blocks_dx  = sin( $axiom_blocks_rad ) / 2;
			$axiom_blocks_dy  = cos( $axiom_blocks_rad ) / 2;

			$axiom_blocks_gradient_defs = sprintf(
				'<defs><linearGradient id="%s" x1="%s" y1="%s" x2="%s" y2="%s">%s</linearGradient></defs>',
				esc_attr( $axiom_blocks_grad_id ),
				esc_attr( (string) ( round( ( 0.5 - $axiom_blocks_dx ) * 10000 ) / 10000 ) ),
				esc_attr( (string) ( round( ( 0.5 + $axiom_blocks_dy ) * 10000 ) / 10000 ) ),
				esc_attr( (string) ( round( ( 0.5 + $axiom_blocks_dx ) * 10000 ) / 10000 ) ),
				esc_attr( (string) ( round( ( 0.5 - $axiom_blocks_dy ) * 10000 ) / 10000 ) ),
				$axiom_blocks_stop_markup
			);
		}

		$axiom_blocks_fill = 'url(#' . $axiom_blocks_grad_id . ')';
	}
}

$axiom_blocks_path_transform = '';
if ( $axiom_blocks_flip_horizontal || $axiom_blocks_flip_vertical ) {
	$axiom_blocks_sx = $axiom_blocks_flip_horizontal ? -1 : 1;
	$axiom_blocks_sy = $axiom_blocks_flip_vertical   ? -1 : 1;
	$axiom_blocks_tx = $axiom_blocks_flip_horizontal ? 1200 : 0;
	$axiom_blocks_ty = $axiom_blocks_flip_vertical   ? 120 : 0;
	$axiom_blocks_path_transform = sprintf(
		' transform="matrix(%d 0 0 %d %d %d)"',
		$axiom_blocks_sx,
		$axiom_blocks_sy,
		$axiom_blocks_tx,
		$axiom_blocks_ty
	);
}

// Wrapper attributes — assemble id/class/style from block supports + our own values.
$axiom_blocks_spacing_style  = Spacing::inline_style( $attributes );
$axiom_blocks_block_supports = WP_Block_Supports::get_instance()->apply_block_supports();

$axiom_blocks_classes = array(
	'axiom-blocks-shape-divider',
	'axiom-blocks-shape-divider--' . sanitize_html_class( $axiom_blocks_shape ),
);
if ( ! empty( $attributes['className'] ) ) {
	$axiom_blocks_classes[] = $attributes['className'];
}
if ( ! empty( $axiom_blocks_block_supports['class'] ) ) {
	$axiom_blocks_classes[] = $axiom_blocks_block_supports['class'];
}
$axiom_blocks_class_attr = trim( implode( ' ', array_filter( $axiom_blocks_classes ) ) );

$axiom_blocks_wrapper_decls = implode(
	'; ',
	array(
		'height: ' . $axiom_blocks_height,
		'background-color: ' . $axiom_blocks_background_color,
	)
);

$axiom_blocks_style_parts = array_filter(
	array(
		rtrim( trim( $axiom_blocks_block_supports['style'] ?? '' ), ';' ),
		$axiom_blocks_wrapper_decls,
		rtrim( trim( $axiom_blocks_spacing_style ), ';' ),
	)
);
$axiom_blocks_style_attr  = safecss_filter_attr( implode( '; ', $axiom_blocks_style_parts ) );

$axiom_blocks_id_attr = $axiom_blocks_block_supports['id'] ?? '';

$axiom_blocks_svg_markup = sprintf(
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" class="axiom-blocks-shape-divider__svg" aria-hidden="true">%s<path d="%s" fill="%s"%s></path></svg>',
	$axiom_blocks_gradient_defs,
	esc_attr( $axiom_blocks_shape_path ),
	esc_attr( $axiom_blocks_fill ),
	$axiom_blocks_path_transform
);
?>
<div <?php echo '' !== $axiom_blocks_id_attr ? 'id="' . esc_attr( $axiom_blocks_id_attr ) . '" ' : ''; ?>class="<?php echo esc_attr( $axiom_blocks_class_attr ); ?>" aria-hidden="true"<?php echo '' !== $axiom_blocks_style_attr ? ' style="' . esc_attr( $axiom_blocks_style_attr ) . '"' : ''; ?>>
	<?php echo wp_kses( $axiom_blocks_svg_markup, AllowedHtml::svg() ); ?>
</div>
