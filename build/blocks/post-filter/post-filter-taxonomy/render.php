<?php
/**
 * Taxonomy field - frontend render.
 *
 * Renders a <select> of terms for the taxonomy the bar exposes. The selected
 * term id is read from the URL and validated as a positive integer; the grid's
 * render and the resolver both re-validate it against a fixed whitelist, so
 * nothing here can inject anything beyond a term id.
 *
 * @package AxiomBlocks
 * @var array    $attributes
 * @var string   $content
 * @var WP_Block $block
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use AxiomBlocks\Blocks\PostFilterResolver;
use AxiomBlocks\Blocks\PostFilterFields;
use AxiomBlocks\Blocks\Spacing;

$axiom_blocks_a        = $attributes ?? array();
$axiom_blocks_taxonomy = (string) ( $block->context['axiom-blocks/postFilterTaxonomy'] ?? ( $axiom_blocks_a['taxonomy'] ?? '' ) );

if ( '' === $axiom_blocks_taxonomy || ! taxonomy_exists( $axiom_blocks_taxonomy ) ) {
	return;
}

$axiom_blocks_terms = get_terms(
	array(
		'taxonomy'   => $axiom_blocks_taxonomy,
		'hide_empty' => false,
		'orderby'    => 'name',
		'number'     => 200,
	)
);

if ( is_wp_error( $axiom_blocks_terms ) || empty( $axiom_blocks_terms ) ) {
	return;
}

$axiom_blocks_field = 'ab_f_tax_' . $axiom_blocks_taxonomy;

// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only public reset flag; no action taken.
$axiom_blocks_reset = class_exists( '\AxiomBlocks\Blocks\PostFilterResolver' ) && PostFilterResolver::is_reset( wp_unslash( $_GET ) );

// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only public filter state; value is absint'd for the option match.
$axiom_blocks_selected = ( ! $axiom_blocks_reset && isset( $_GET[ $axiom_blocks_field ] ) ) ? absint( wp_unslash( $_GET[ $axiom_blocks_field ] ) ) : 0;

$axiom_blocks_label      = (string) ( $axiom_blocks_a['label'] ?? '' );
$axiom_blocks_show_all   = (bool) ( $axiom_blocks_a['showAll'] ?? true );
$axiom_blocks_all_label  = (string) ( $axiom_blocks_a['allLabel'] ?? '' );
if ( '' === $axiom_blocks_all_label ) {
	$axiom_blocks_all_label = __( 'All', 'axiom-blocks' );
}

/* ── Styles ────────────────────────────────────────────────────────────── */
$axiom_blocks_style_parts = array();
foreach ( array(
	'--ab-pff-sel-color'          => 'selectColor',
	'--ab-pff-sel-color-h'        => 'selectColorHover',
	'--ab-pff-sel-bg'             => 'selectBg',
	'--ab-pff-sel-bg-h'           => 'selectBgHover',
	'--ab-pff-sel-bw-t'           => 'selectBorderTopWidth',
	'--ab-pff-sel-bw-r'           => 'selectBorderRightWidth',
	'--ab-pff-sel-bw-b'           => 'selectBorderBottomWidth',
	'--ab-pff-sel-bw-l'           => 'selectBorderLeftWidth',
	'--ab-pff-sel-bs'             => 'selectBorderStyle',
	'--ab-pff-sel-bc'             => 'selectBorderColor',
	'--ab-pff-sel-bc-h'           => 'selectBorderColorHover',
	'--ab-pff-sel-radius-tl'      => 'selectRadiusTopLeft',
	'--ab-pff-sel-radius-tr'      => 'selectRadiusTopRight',
	'--ab-pff-sel-radius-br'      => 'selectRadiusBottomRight',
	'--ab-pff-sel-radius-bl'      => 'selectRadiusBottomLeft',
	'--ab-pff-sel-shadow'         => 'selectShadow',
	'--ab-pff-sel-pt'             => 'selectPaddingTop',
	'--ab-pff-sel-pr'             => 'selectPaddingRight',
	'--ab-pff-sel-pb'             => 'selectPaddingBottom',
	'--ab-pff-sel-pl'             => 'selectPaddingLeft',
	'--ab-pff-sel-font-family'    => 'fontFamily',
	'--ab-pff-sel-font-weight'    => 'fontWeight',
	'--ab-pff-sel-font-size'      => 'fontSize',
	'--ab-pff-sel-line-height'    => 'lineHeight',
	'--ab-pff-sel-letter-spacing' => 'letterSpacing',
	'--ab-pff-sel-text-transform' => 'textTransform',
	'--ab-pff-sel-text-decoration'=> 'textDecoration',
	'--ab-pff-sel-text-align'     => 'textAlign',
) as $axiom_blocks_css_var => $axiom_blocks_attr_key ) {
	if ( ! empty( $axiom_blocks_a[ $axiom_blocks_attr_key ] ) ) {
		$axiom_blocks_style_parts[] = $axiom_blocks_css_var . ': ' . $axiom_blocks_a[ $axiom_blocks_attr_key ];
	}
}

$axiom_blocks_style_parts  = array_merge( $axiom_blocks_style_parts, PostFilterFields::style_parts( $axiom_blocks_a ) );
$axiom_blocks_wrapper_style = Spacing::merge( implode( '; ', $axiom_blocks_style_parts ), $axiom_blocks_a );
$axiom_blocks_style_attr    = safecss_filter_attr( $axiom_blocks_wrapper_style );
$axiom_blocks_class_attr    = trim( 'ab-pff ab-pff--taxonomy ' . PostFilterFields::classes( $axiom_blocks_a ) );
?>
<div class="<?php echo esc_attr( $axiom_blocks_class_attr ); ?>"<?php echo '' !== $axiom_blocks_style_attr ? ' style="' . esc_attr( $axiom_blocks_style_attr ) . '"' : ''; ?>>
	<?php if ( PostFilterFields::shows_label( $axiom_blocks_a ) ) : ?>
		<span class="ab-pff__label"><?php echo esc_html( $axiom_blocks_label ); ?></span>
	<?php endif; ?>
	<select name="<?php echo esc_attr( $axiom_blocks_field ); ?>" class="ab-pff__control">
		<?php if ( $axiom_blocks_show_all ) : ?>
			<option value="" <?php selected( 0, $axiom_blocks_selected ); ?>>
				<?php echo esc_html( $axiom_blocks_all_label ); ?>
			</option>
		<?php endif; ?>
		<?php foreach ( $axiom_blocks_terms as $axiom_blocks_term ) : ?>
			<option value="<?php echo esc_attr( $axiom_blocks_term->term_id ); ?>" <?php selected( $axiom_blocks_term->term_id, $axiom_blocks_selected ); ?>>
				<?php echo esc_html( $axiom_blocks_term->name ); ?>
			</option>
		<?php endforeach; ?>
	</select>
</div>
