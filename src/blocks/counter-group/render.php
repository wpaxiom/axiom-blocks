<?php
/**
 * Counter (group) — frontend render (wrapper only; stats come from inner blocks).
 *
 * @package AxiomBlocks
 * @var array    $attributes
 * @var string   $content
 * @var WP_Block $block
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use AxiomBlocks\Blocks\AllowedHtml;
use AxiomBlocks\Blocks\Spacing;

$axiom_blocks_a = $attributes ?? array();

if ( '' === trim( (string) $content ) ) {
	return;
}

$axiom_blocks_icon_pos     = 'left' === ( $axiom_blocks_a['iconPosition'] ?? 'top' ) ? 'left' : 'top';
$axiom_blocks_label_pos_raw = (string) ( $axiom_blocks_a['labelPosition'] ?? 'below' );
$axiom_blocks_label_pos     = in_array( $axiom_blocks_label_pos_raw, array( 'above', 'left', 'right' ), true ) ? $axiom_blocks_label_pos_raw : 'below';
$axiom_blocks_shadow_raw    = (string) ( $axiom_blocks_a['cardShadow'] ?? '' );
$axiom_blocks_shadow        = in_array( $axiom_blocks_shadow_raw, array( 'sm', 'md', 'lg' ), true ) ? $axiom_blocks_shadow_raw : '';
$axiom_blocks_stack     = ! isset( $axiom_blocks_a['stackOnMobile'] ) || ! empty( $axiom_blocks_a['stackOnMobile'] );
$axiom_blocks_divider   = ! empty( $axiom_blocks_a['showDivider'] );

$axiom_blocks_duration  = (int) ( $axiom_blocks_a['duration'] ?? 2000 );
$axiom_blocks_easing    = (string) ( $axiom_blocks_a['easing'] ?? 'ease-out' );
$axiom_blocks_separator = ! isset( $axiom_blocks_a['thousandsSeparator'] ) || ! empty( $axiom_blocks_a['thousandsSeparator'] );

$axiom_blocks_thousands_char = isset( $axiom_blocks_a['thousandsSeparatorChar'] ) && '' !== (string) $axiom_blocks_a['thousandsSeparatorChar']
	? (string) $axiom_blocks_a['thousandsSeparatorChar']
	: ',';
$axiom_blocks_decimal_char   = isset( $axiom_blocks_a['decimalSeparatorChar'] ) && '' !== (string) $axiom_blocks_a['decimalSeparatorChar']
	? (string) $axiom_blocks_a['decimalSeparatorChar']
	: '.';
$axiom_blocks_group_sep      = $axiom_blocks_separator ? $axiom_blocks_thousands_char : '';

/* ── Wrapper CSS custom properties + spacing ──────────────────────────────── */
$axiom_blocks_var_map     = array(
	'--ab-counter-cols'        => 'columns',
	'--ab-counter-gap'         => 'gap',
	'--ab-counter-divider'     => 'dividerColor',
	'--ab-counter-num-color'   => 'numberColor',
	'--ab-counter-num-ff'      => 'numberFontFamily',
	'--ab-counter-num-fw'      => 'numberFontWeight',
	'--ab-counter-num-fs'      => 'numberFontSize',
	'--ab-counter-num-lh'      => 'numberLineHeight',
	'--ab-counter-num-ls'      => 'numberLetterSpacing',
	'--ab-counter-num-tt'      => 'numberTextTransform',
	'--ab-counter-num-td'      => 'numberTextDecoration',
	'--ab-counter-num-ta'      => 'numberTextAlign',
	'--ab-counter-label-color' => 'labelColor',
	'--ab-counter-label-ff'    => 'labelFontFamily',
	'--ab-counter-label-fw'    => 'labelFontWeight',
	'--ab-counter-label-fs'    => 'labelFontSize',
	'--ab-counter-label-lh'    => 'labelLineHeight',
	'--ab-counter-label-ls'    => 'labelLetterSpacing',
	'--ab-counter-label-tt'    => 'labelTextTransform',
	'--ab-counter-label-td'    => 'labelTextDecoration',
	'--ab-counter-label-ta'    => 'labelTextAlign',
	'--ab-counter-icon-color'  => 'iconColor',
	'--ab-counter-icon-size'   => 'iconSize',
	'--ab-counter-num-hover'   => 'numberHoverColor',
	'--ab-counter-label-hover' => 'labelHoverColor',
	'--ab-counter-icon-hover'  => 'iconHoverColor',
	'--ab-counter-card-bg'        => 'cardBackground',
	'--ab-counter-card-bd-color'  => 'cardBorderColor',
	'--ab-counter-card-bd-width'  => 'cardBorderWidth',
	'--ab-counter-card-radius'    => 'cardBorderRadius',
	'--ab-counter-card-pt'        => 'cardPaddingTop',
	'--ab-counter-card-pr'        => 'cardPaddingRight',
	'--ab-counter-card-pb'        => 'cardPaddingBottom',
	'--ab-counter-card-pl'        => 'cardPaddingLeft',
);
$axiom_blocks_style_parts = array();
foreach ( $axiom_blocks_var_map as $axiom_blocks_css_var => $axiom_blocks_attr_key ) {
	if ( isset( $axiom_blocks_a[ $axiom_blocks_attr_key ] ) && '' !== (string) $axiom_blocks_a[ $axiom_blocks_attr_key ] ) {
		$axiom_blocks_style_parts[] = $axiom_blocks_css_var . ': ' . $axiom_blocks_a[ $axiom_blocks_attr_key ];
	}
}
$axiom_blocks_wrapper_style = implode( '; ', $axiom_blocks_style_parts );
$axiom_blocks_wrapper_style = Spacing::merge( $axiom_blocks_wrapper_style, $axiom_blocks_a );

/* ── Wrapper attributes ───────────────────────────────────────────────────── */
$axiom_blocks_classes = array(
	'ab-counter-group',
	'ab-counter-group--icon-' . $axiom_blocks_icon_pos,
	'ab-counter-group--label-' . $axiom_blocks_label_pos,
);
if ( $axiom_blocks_stack ) {
	$axiom_blocks_classes[] = 'is-stack-mobile';
}
if ( $axiom_blocks_divider ) {
	$axiom_blocks_classes[] = 'has-divider';
}
if ( '' !== $axiom_blocks_shadow ) {
	$axiom_blocks_classes[] = 'ab-counter-group--shadow-' . $axiom_blocks_shadow;
}

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
	data-duration="<?php echo esc_attr( (string) $axiom_blocks_duration ); ?>"
	data-easing="<?php echo esc_attr( $axiom_blocks_easing ); ?>"
	data-thousands-sep="<?php echo esc_attr( $axiom_blocks_group_sep ); ?>"
	data-decimal-sep="<?php echo esc_attr( $axiom_blocks_decimal_char ); ?>"
>
	<?php echo wp_kses( $content, AllowedHtml::post_with_svg() ); ?>
</div>
