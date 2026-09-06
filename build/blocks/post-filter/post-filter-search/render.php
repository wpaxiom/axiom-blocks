<?php
/**
 * Search field - frontend render.
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
use AxiomBlocks\Blocks\PostFilterResolver;
use AxiomBlocks\Blocks\Spacing;

$axiom_blocks_a = $attributes ?? array();

// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only public search state; the value is sanitized on the grid's render.
$axiom_blocks_reset = class_exists( '\AxiomBlocks\Blocks\PostFilterResolver' ) && PostFilterResolver::is_reset( wp_unslash( $_GET ) );

// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only public search state; the value is sanitized on the grid's render.
$axiom_blocks_value = ( ! $axiom_blocks_reset && isset( $_GET['ab_f_s'] ) ) ? sanitize_text_field( wp_unslash( $_GET['ab_f_s'] ) ) : '';
if ( strlen( $axiom_blocks_value ) > 100 ) {
	$axiom_blocks_value = substr( $axiom_blocks_value, 0, 100 );
}

$axiom_blocks_label       = (string) ( $axiom_blocks_a['label'] ?? '' );
$axiom_blocks_placeholder = (string) ( $axiom_blocks_a['placeholder'] ?? '' );
$axiom_blocks_button      = (string) ( $axiom_blocks_a['buttonText'] ?? '' );
if ( '' === $axiom_blocks_button ) {
	$axiom_blocks_button = __( 'Search', 'axiom-blocks' );
}

/* ── Wrapper styles (spacing) ──────────────────────────────────────────── */
$axiom_blocks_wrapper_style = Spacing::inline_style( $axiom_blocks_a );

/* ── Input styles ──────────────────────────────────────────────────────── */
$axiom_blocks_input_parts = array();
foreach ( array(
	'--ab-pff-input-color'          => 'inputColor',
	'--ab-pff-input-color-h'        => 'inputColorHover',
	'--ab-pff-input-ph'             => 'inputPlaceholderColor',
	'--ab-pff-input-bg'             => 'inputBg',
	'--ab-pff-input-bg-h'           => 'inputBgHover',
	'--ab-pff-input-bw-t'           => 'inputBorderTopWidth',
	'--ab-pff-input-bw-r'           => 'inputBorderRightWidth',
	'--ab-pff-input-bw-b'           => 'inputBorderBottomWidth',
	'--ab-pff-input-bw-l'           => 'inputBorderLeftWidth',
	'--ab-pff-input-bs'             => 'inputBorderStyle',
	'--ab-pff-input-bc'             => 'inputBorderColor',
	'--ab-pff-input-bc-h'           => 'inputBorderColorHover',
	'--ab-pff-input-radius-tl'      => 'inputRadiusTopLeft',
	'--ab-pff-input-radius-tr'      => 'inputRadiusTopRight',
	'--ab-pff-input-radius-br'      => 'inputRadiusBottomRight',
	'--ab-pff-input-radius-bl'      => 'inputRadiusBottomLeft',
	'--ab-pff-input-shadow'         => 'inputShadow',
	'--ab-pff-input-pt'             => 'inputPaddingTop',
	'--ab-pff-input-pr'             => 'inputPaddingRight',
	'--ab-pff-input-pb'             => 'inputPaddingBottom',
	'--ab-pff-input-pl'             => 'inputPaddingLeft',
	'--ab-pff-input-font-family'    => 'fontFamily',
	'--ab-pff-input-font-weight'    => 'fontWeight',
	'--ab-pff-input-font-size'      => 'fontSize',
	'--ab-pff-input-line-height'    => 'lineHeight',
	'--ab-pff-input-letter-spacing' => 'letterSpacing',
	'--ab-pff-input-text-transform' => 'textTransform',
	'--ab-pff-input-text-decoration'=> 'textDecoration',
	'--ab-pff-input-text-align'     => 'textAlign',
) as $axiom_blocks_css_var => $axiom_blocks_attr_key ) {
	if ( ! empty( $axiom_blocks_a[ $axiom_blocks_attr_key ] ) ) {
		$axiom_blocks_input_parts[] = $axiom_blocks_css_var . ': ' . $axiom_blocks_a[ $axiom_blocks_attr_key ];
	}
}

/* ── Button styles ─────────────────────────────────────────────────────── */
$axiom_blocks_btn_parts = array();
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
	'--ab-pff-btn-font-family'    => 'btnFontFamily',
	'--ab-pff-btn-font-weight'    => 'btnFontWeight',
	'--ab-pff-btn-font-size'      => 'btnFontSize',
	'--ab-pff-btn-line-height'    => 'btnLineHeight',
	'--ab-pff-btn-letter-spacing' => 'btnLetterSpacing',
	'--ab-pff-btn-text-transform' => 'btnTextTransform',
	'--ab-pff-btn-text-decoration'=> 'btnTextDecoration',
	'--ab-pff-btn-text-align'     => 'btnTextAlign',
) as $axiom_blocks_css_var => $axiom_blocks_attr_key ) {
	if ( ! empty( $axiom_blocks_a[ $axiom_blocks_attr_key ] ) ) {
		$axiom_blocks_btn_parts[] = $axiom_blocks_css_var . ': ' . $axiom_blocks_a[ $axiom_blocks_attr_key ];
	}
}

/* ── Assemble style attribute ──────────────────────────────────────────── */
$axiom_blocks_all_parts = array_filter( array_merge(
	'' !== $axiom_blocks_wrapper_style ? array( $axiom_blocks_wrapper_style ) : array(),
	PostFilterFields::style_parts( $axiom_blocks_a ),
	$axiom_blocks_input_parts,
	$axiom_blocks_btn_parts,
) );
$axiom_blocks_style_attr = '';
if ( ! empty( $axiom_blocks_all_parts ) ) {
	$axiom_blocks_style_attr = safecss_filter_attr( implode( '; ', $axiom_blocks_all_parts ) );
}

$axiom_blocks_class_attr = trim( 'ab-pff ab-pff--search ' . PostFilterFields::classes( $axiom_blocks_a ) );
?>
<div class="<?php echo esc_attr( $axiom_blocks_class_attr ); ?>"<?php echo '' !== $axiom_blocks_style_attr ? ' style="' . esc_attr( $axiom_blocks_style_attr ) . '"' : ''; ?>>
	<?php if ( PostFilterFields::shows_label( $axiom_blocks_a ) ) : ?>
		<span class="ab-pff__label"><?php echo esc_html( $axiom_blocks_label ); ?></span>
	<?php endif; ?>
	<input
		type="text"
		class="ab-pff__control"
		name="ab_f_s"
		value="<?php echo esc_attr( $axiom_blocks_value ); ?>"
		placeholder="<?php echo esc_attr( $axiom_blocks_placeholder ); ?>"
		autocomplete="off"
	/>
	<button type="submit" class="ab-pff__btn">
		<?php echo esc_html( $axiom_blocks_button ); ?>
	</button>
</div>
