<?php
/**
 * No Results — frontend render.
 *
 * Renders only when the parent grid found nothing. The parent passes that
 * verdict down as `axiom-blocks/pgHasResults` context, so this block never has
 * to re-run the query.
 *
 * Nobody else lets an author write this message: Essential Blocks ships a
 * `notFoundColor` and no text field.
 *
 * @package AxiomBlocks
 * @var array    $attributes
 * @var string   $content
 * @var WP_Block $block
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use AxiomBlocks\Blocks\Spacing;

$axiom_blocks_a = $attributes ?? array();

// Context is only false when the parent ran a query and got nothing back.
if ( false !== ( $block->context['axiom-blocks/pgHasResults'] ?? false ) ) {
	return;
}

if ( '' === trim( (string) $content ) ) {
	return;
}

$axiom_blocks_style_parts = array();
foreach ( array(
	'--ab-pg-nr-bg'     => 'boxBg',
	'--ab-pg-nr-shadow' => 'boxShadow',
	'--ab-pg-nr-bc'     => 'boxBorderColor',
) as $axiom_blocks_css_var => $axiom_blocks_attr_key ) {
	if ( ! empty( $axiom_blocks_a[ $axiom_blocks_attr_key ] ) ) {
		$axiom_blocks_style_parts[] = $axiom_blocks_css_var . ': ' . $axiom_blocks_a[ $axiom_blocks_attr_key ];
	}
}

$axiom_blocks_any_bw = false;
foreach ( array(
	'top'    => 'boxBorderTopWidth',
	'right'  => 'boxBorderRightWidth',
	'bottom' => 'boxBorderBottomWidth',
	'left'   => 'boxBorderLeftWidth',
) as $axiom_blocks_side => $axiom_blocks_attr_key ) {
	if ( ! empty( $axiom_blocks_a[ $axiom_blocks_attr_key ] ) ) {
		$axiom_blocks_any_bw        = true;
		$axiom_blocks_style_parts[] = '--ab-pg-nr-bw-' . $axiom_blocks_side . ': ' . $axiom_blocks_a[ $axiom_blocks_attr_key ];
	}
}
$axiom_blocks_bs = (string) ( $axiom_blocks_a['boxBorderStyle'] ?? '' );
if ( $axiom_blocks_any_bw ) {
	$axiom_blocks_style_parts[] = '--ab-pg-nr-bs: ' . ( '' !== $axiom_blocks_bs ? $axiom_blocks_bs : 'solid' );
} elseif ( '' !== $axiom_blocks_bs ) {
	$axiom_blocks_style_parts[] = '--ab-pg-nr-bs: ' . $axiom_blocks_bs;
}

foreach ( array(
	'tl' => 'boxRadiusTopLeft',
	'tr' => 'boxRadiusTopRight',
	'br' => 'boxRadiusBottomRight',
	'bl' => 'boxRadiusBottomLeft',
) as $axiom_blocks_corner => $axiom_blocks_attr_key ) {
	if ( ! empty( $axiom_blocks_a[ $axiom_blocks_attr_key ] ) ) {
		$axiom_blocks_style_parts[] = '--ab-pg-nr-radius-' . $axiom_blocks_corner . ': ' . $axiom_blocks_a[ $axiom_blocks_attr_key ];
	}
}

foreach ( array(
	'pt' => 'boxPaddingTop',
	'pr' => 'boxPaddingRight',
	'pb' => 'boxPaddingBottom',
	'pl' => 'boxPaddingLeft',
) as $axiom_blocks_edge => $axiom_blocks_attr_key ) {
	if ( ! empty( $axiom_blocks_a[ $axiom_blocks_attr_key ] ) ) {
		$axiom_blocks_style_parts[] = '--ab-pg-nr-' . $axiom_blocks_edge . ': ' . $axiom_blocks_a[ $axiom_blocks_attr_key ];
	}
}

$axiom_blocks_wrapper_style = Spacing::merge( implode( '; ', $axiom_blocks_style_parts ), $axiom_blocks_a );
$axiom_blocks_style_attr    = safecss_filter_attr( $axiom_blocks_wrapper_style );
?>
<div
	class="ab-pg__no-results"
	<?php echo '' !== $axiom_blocks_style_attr ? ' style="' . esc_attr( $axiom_blocks_style_attr ) . '"' : ''; ?>
>
	<?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Inner block HTML, already escaped by each block's own render/save. ?>
</div>
