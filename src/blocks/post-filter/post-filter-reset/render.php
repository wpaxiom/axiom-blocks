<?php
/**
 * Reset field - frontend render.
 *
 * A submit button that clears the filter. Resolves to the unfiltered grid: the
 * resolver ignores every other filter token when the reset flag is present, so
 * both the JS-off submit and the JS upgrade land back on the base query.
 *
 * @package AxiomBlocks
 * @var array    $attributes
 * @var string   $content
 * @var WP_Block $block
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use AxiomBlocks\Blocks\PostFilterFields;
use AxiomBlocks\Blocks\Spacing;

$axiom_blocks_a     = $attributes ?? array();
$axiom_blocks_label = (string) ( $axiom_blocks_a['label'] ?? '' );
if ( '' === $axiom_blocks_label ) {
	$axiom_blocks_label = __( 'Reset', 'axiom-blocks' );
}

/* ── Styles ────────────────────────────────────────────────────────────── */
$axiom_blocks_style_parts = array();
foreach ( array(
	'--ab-pff-btn-color'          => 'btnColor',
	'--ab-pff-btn-color-h'        => 'btnColorHover',
	'--ab-pff-btn-bg'             => 'btnBg',
	'--ab-pff-btn-bg-h'           => 'btnBgHover',
	'--ab-pff-btn-bw-t'           => 'btnBorderTopWidth',
	'--ab-pff-btn-bw-r'           => 'btnBorderRightWidth',
	'--ab-pff-btn-bw-b'           => 'btnBorderBottomWidth',
	'--ab-pff-btn-bw-l'           => 'btnBorderLeftWidth',
	'--ab-pff-btn-bs'             => 'btnBorderStyle',
	'--ab-pff-btn-bc'             => 'btnBorderColor',
	'--ab-pff-btn-bc-h'           => 'btnBorderColorHover',
	'--ab-pff-btn-radius-tl'      => 'btnRadiusTopLeft',
	'--ab-pff-btn-radius-tr'      => 'btnRadiusTopRight',
	'--ab-pff-btn-radius-br'      => 'btnRadiusBottomRight',
	'--ab-pff-btn-radius-bl'      => 'btnRadiusBottomLeft',
	'--ab-pff-btn-shadow'         => 'btnShadow',
	'--ab-pff-btn-pt'             => 'btnPaddingTop',
	'--ab-pff-btn-pr'             => 'btnPaddingRight',
	'--ab-pff-btn-pb'             => 'btnPaddingBottom',
	'--ab-pff-btn-pl'             => 'btnPaddingLeft',
	'--ab-pff-btn-font-family'    => 'fontFamily',
	'--ab-pff-btn-font-weight'    => 'fontWeight',
	'--ab-pff-btn-font-size'      => 'fontSize',
	'--ab-pff-btn-line-height'    => 'lineHeight',
	'--ab-pff-btn-letter-spacing' => 'letterSpacing',
	'--ab-pff-btn-text-transform' => 'textTransform',
	'--ab-pff-btn-text-decoration'=> 'textDecoration',
	'--ab-pff-btn-text-align'     => 'textAlign',
) as $axiom_blocks_css_var => $axiom_blocks_attr_key ) {
	if ( ! empty( $axiom_blocks_a[ $axiom_blocks_attr_key ] ) ) {
		$axiom_blocks_style_parts[] = $axiom_blocks_css_var . ': ' . $axiom_blocks_a[ $axiom_blocks_attr_key ];
	}
}

$axiom_blocks_style_parts  = array_merge( $axiom_blocks_style_parts, PostFilterFields::style_parts( $axiom_blocks_a ) );
$axiom_blocks_wrapper_style = Spacing::merge( implode( '; ', $axiom_blocks_style_parts ), $axiom_blocks_a );
$axiom_blocks_style_attr    = safecss_filter_attr( $axiom_blocks_wrapper_style );
$axiom_blocks_class_attr    = trim( 'ab-pff ab-pff--reset ' . PostFilterFields::classes( $axiom_blocks_a ) );
?>
<div class="<?php echo esc_attr( $axiom_blocks_class_attr ); ?>"<?php echo '' !== $axiom_blocks_style_attr ? ' style="' . esc_attr( $axiom_blocks_style_attr ) . '"' : ''; ?>>
	<button type="submit" name="ab_f_reset" value="1" class="ab-pff__btn ab-pff__btn--ghost">
		<?php echo esc_html( $axiom_blocks_label ); ?>
	</button>
</div>
