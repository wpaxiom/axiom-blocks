<?php
/**
 * Info Box — frontend render. Wraps the inner blocks in a styled box.
 *
 * @package AxiomBlocks
 * @var array    $attributes
 * @var string   $content
 * @var WP_Block $block
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use AxiomBlocks\Blocks\Background;
use AxiomBlocks\Blocks\Spacing;

$axiom_blocks_a = $attributes ?? array();

// No inner content → render nothing rather than an empty box.
if ( '' === trim( (string) $content ) ) {
	return;
}

$axiom_blocks_direction = 'row' === ( $axiom_blocks_a['direction'] ?? 'column' ) ? 'row' : 'column';

$axiom_blocks_align = (string) ( $axiom_blocks_a['contentAlign'] ?? 'center' );
if ( ! in_array( $axiom_blocks_align, array( 'left', 'center', 'right' ), true ) ) {
	$axiom_blocks_align = 'center';
}

$axiom_blocks_shadow = (string) ( $axiom_blocks_a['boxShadow'] ?? 'none' );
if ( ! in_array( $axiom_blocks_shadow, array( 'none', 'sm', 'md', 'lg' ), true ) ) {
	$axiom_blocks_shadow = 'none';
}

/* ── Wrapper CSS custom properties + spacing ──────────────────────────────── */
$axiom_blocks_var_map     = array(
	'--ab-ibox-gap'      => 'gap',
	'--ab-ibox-bc'       => 'borderColor',
	'--ab-ibox-radius'   => 'borderRadius',
	'--ab-ibox-shadow'   => 'boxShadowCustom',
	'--ab-ibox-shadow-h' => 'boxShadowCustomHover',
);
$axiom_blocks_style_parts = array();
foreach ( $axiom_blocks_var_map as $axiom_blocks_css_var => $axiom_blocks_attr_key ) {
	if ( ! empty( $axiom_blocks_a[ $axiom_blocks_attr_key ] ) ) {
		$axiom_blocks_style_parts[] = $axiom_blocks_css_var . ': ' . $axiom_blocks_a[ $axiom_blocks_attr_key ];
	}
}

/* Card background — flat color (legacy `bgColor`/`bgColorHover`, bgType empty)
   is the fallback; gradient/image (bgType set) win. Mirrors getInfoBoxVars(). */
$axiom_blocks_bg = Background::value( $axiom_blocks_a, 'card', 'bgColor' );
if ( '' !== $axiom_blocks_bg ) {
	$axiom_blocks_style_parts[] = '--ab-ibox-bg: ' . $axiom_blocks_bg;
}
$axiom_blocks_style_parts = array_merge(
	$axiom_blocks_style_parts,
	Background::layer_vars( $axiom_blocks_a, 'card', 'ab-ibox' )
);
$axiom_blocks_bg_hover = Background::value( $axiom_blocks_a, 'cardHover', 'bgColorHover' );
if ( '' !== $axiom_blocks_bg_hover ) {
	$axiom_blocks_style_parts[] = '--ab-ibox-bg-h: ' . $axiom_blocks_bg_hover;
}
$axiom_blocks_style_parts = array_merge(
	$axiom_blocks_style_parts,
	Background::layer_vars( $axiom_blocks_a, 'cardHover', 'ab-ibox-h' )
);

/* Border — per-side widths fall back to the legacy single `borderWidth`; style +
   color are single-value. */
$axiom_blocks_bw_map      = array(
	'top'    => 'borderTopWidth',
	'right'  => 'borderRightWidth',
	'bottom' => 'borderBottomWidth',
	'left'   => 'borderLeftWidth',
);
$axiom_blocks_bw_fallback = $axiom_blocks_a['borderWidth'] ?? '';
$axiom_blocks_any_bw      = false;
foreach ( $axiom_blocks_bw_map as $axiom_blocks_side => $axiom_blocks_attr_key ) {
	$axiom_blocks_val = $axiom_blocks_a[ $axiom_blocks_attr_key ] ?? '';
	if ( '' === $axiom_blocks_val ) {
		$axiom_blocks_val = $axiom_blocks_bw_fallback;
	}
	if ( '' !== $axiom_blocks_val ) {
		$axiom_blocks_any_bw        = true;
		$axiom_blocks_style_parts[] = '--ab-ibox-bw-' . $axiom_blocks_side . ': ' . $axiom_blocks_val;
	}
}
$axiom_blocks_border_style = $axiom_blocks_a['borderStyle'] ?? '';
if ( $axiom_blocks_any_bw ) {
	$axiom_blocks_style_parts[] = '--ab-ibox-bs: ' . ( '' !== $axiom_blocks_border_style ? $axiom_blocks_border_style : 'solid' );
} elseif ( '' !== $axiom_blocks_border_style ) {
	$axiom_blocks_style_parts[] = '--ab-ibox-bs: ' . $axiom_blocks_border_style;
}

/* Radius — per-corner falls back to the legacy single `borderRadius`. */
$axiom_blocks_radius_map      = array(
	'tl' => 'radiusTopLeft',
	'tr' => 'radiusTopRight',
	'br' => 'radiusBottomRight',
	'bl' => 'radiusBottomLeft',
);
$axiom_blocks_radius_fallback = $axiom_blocks_a['borderRadius'] ?? '';
foreach ( $axiom_blocks_radius_map as $axiom_blocks_corner => $axiom_blocks_attr_key ) {
	$axiom_blocks_val = $axiom_blocks_a[ $axiom_blocks_attr_key ] ?? '';
	if ( '' === $axiom_blocks_val ) {
		$axiom_blocks_val = $axiom_blocks_radius_fallback;
	}
	if ( '' !== $axiom_blocks_val ) {
		$axiom_blocks_style_parts[] = '--ab-ibox-radius-' . $axiom_blocks_corner . ': ' . $axiom_blocks_val;
	}
}

/* Size (L5) — width + min-height as vars; max-width inline-only (mirrors
   content-slider / free-shipping): unset ⇒ no output so the card fills the
   content column, and ResponsiveProps adds the per-device media rules. */
foreach ( array( 'cardWidth' => '--ab-ibox-w', 'cardMinHeight' => '--ab-ibox-mh' ) as $axiom_blocks_size_key => $axiom_blocks_size_var ) {
	if ( ! empty( $axiom_blocks_a[ $axiom_blocks_size_key ] ) ) {
		$axiom_blocks_style_parts[] = $axiom_blocks_size_var . ': ' . $axiom_blocks_a[ $axiom_blocks_size_key ];
	}
}
if ( ! empty( $axiom_blocks_a['cardMaxWidth'] ) ) {
	$axiom_blocks_style_parts[] = 'max-width: ' . $axiom_blocks_a['cardMaxWidth'];
}

/* Hover lift — stored negative (upward); 0/unset ⇒ no transform. */
$axiom_blocks_lift = (int) ( $axiom_blocks_a['hoverLift'] ?? 0 );
if ( $axiom_blocks_lift > 0 ) {
	$axiom_blocks_style_parts[] = '--ab-ibox-lift: -' . $axiom_blocks_lift . 'px';
}

$axiom_blocks_wrapper_style = implode( '; ', $axiom_blocks_style_parts );
$axiom_blocks_wrapper_style = Spacing::merge( $axiom_blocks_wrapper_style, $axiom_blocks_a );

/* ── Wrapper attributes ───────────────────────────────────────────────────── */
$axiom_blocks_classes = array(
	'ab-ibox',
	'ab-ibox--' . $axiom_blocks_direction,
	'ab-ibox--align-' . $axiom_blocks_align,
	'has-shadow-' . $axiom_blocks_shadow,
);

$axiom_blocks_block_supports = WP_Block_Supports::get_instance()->apply_block_supports();
if ( ! empty( $axiom_blocks_a['className'] ) ) {
	$axiom_blocks_classes[] = $axiom_blocks_a['className'];
}
if ( ! empty( $axiom_blocks_block_supports['class'] ) ) {
	$axiom_blocks_classes[] = $axiom_blocks_block_supports['class'];
}
$axiom_blocks_class_attr = trim( implode( ' ', array_filter( $axiom_blocks_classes ) ) );

$axiom_blocks_merged_style_parts = array_filter(
	array(
		rtrim( trim( $axiom_blocks_block_supports['style'] ?? '' ), ';' ),
		rtrim( trim( $axiom_blocks_wrapper_style ), ';' ),
	)
);
$axiom_blocks_style_attr = safecss_filter_attr( implode( ';', $axiom_blocks_merged_style_parts ) );
$axiom_blocks_id_attr    = $axiom_blocks_block_supports['id'] ?? '';
?>
<div
	<?php echo '' !== $axiom_blocks_id_attr ? 'id="' . esc_attr( $axiom_blocks_id_attr ) . '" ' : ''; ?>
	class="<?php echo esc_attr( $axiom_blocks_class_attr ); ?>"
	<?php echo '' !== $axiom_blocks_style_attr ? ' style="' . esc_attr( $axiom_blocks_style_attr ) . '"' : ''; ?>
>
	<?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Inner block HTML, already escaped by each block's own render/save. ?>
</div>
