<?php
/**
 * Sort field - frontend render.
 *
 * Emits a single "Sort by" select whose values are whitelisted `orderby|order`
 * pairs. The resolver splits that pair and validates both halves against a
 * fixed whitelist, so no ordering outside the allowed set is ever accepted.
 *
 * @package AxiomBlocks
 * @var array    $attributes
 * @var string   $content
 * @var WP_Block $block
 */

use AxiomBlocks\Blocks\PostFilterResolver;
use AxiomBlocks\Blocks\PostFilterFields;
use AxiomBlocks\Blocks\Spacing;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$axiom_blocks_a = $attributes ?? array();

// Read the active sort from the URL and normalize it through the same
// whitelisted parser the resolver uses, so the dropdown's selected option
// matches what the grid actually applied on a JS-off / bookmarked reload.
$axiom_blocks_value = '';
// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only public reset flag; no action taken.
$axiom_blocks_reset = class_exists( '\AxiomBlocks\Blocks\PostFilterResolver' ) && PostFilterResolver::is_reset( wp_unslash( $_GET ) );

// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only public sort state; both halves are whitelisted by the resolver.
$axiom_blocks_raw = ( ! $axiom_blocks_reset && isset( $_GET['ab_f_sort'] ) ) ? sanitize_text_field( wp_unslash( $_GET['ab_f_sort'] ) ) : '';
if ( '' !== $axiom_blocks_raw && class_exists( '\AxiomBlocks\Blocks\PostFilterResolver' ) ) {
	$axiom_blocks_parsed = PostFilterResolver::parse_sort( $axiom_blocks_raw );
	if ( null !== $axiom_blocks_parsed ) {
		$axiom_blocks_value = $axiom_blocks_parsed['orderby'] . '|' . strtolower( $axiom_blocks_parsed['order'] );
	}
}

$axiom_blocks_label   = (string) ( $axiom_blocks_a['label'] ?? '' );
$axiom_blocks_default = (string) ( $axiom_blocks_a['defaultLabel'] ?? '' );
if ( '' === $axiom_blocks_default ) {
	$axiom_blocks_default = __( 'Sort by', 'axiom-blocks' );
}

$axiom_blocks_sorts = array(
	array( 'label' => __( 'Newest first', 'axiom-blocks' ), 'value' => 'date|desc' ),
	array( 'label' => __( 'Oldest first', 'axiom-blocks' ), 'value' => 'date|asc' ),
	array( 'label' => __( 'Title A-Z', 'axiom-blocks' ), 'value' => 'title|asc' ),
	array( 'label' => __( 'Title Z-A', 'axiom-blocks' ), 'value' => 'title|desc' ),
	array( 'label' => __( 'Last modified', 'axiom-blocks' ), 'value' => 'modified|desc' ),
	array( 'label' => __( 'Most comments', 'axiom-blocks' ), 'value' => 'comment_count|desc' ),
);

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
$axiom_blocks_class_attr    = trim( 'ab-pff ab-pff--sort ' . PostFilterFields::classes( $axiom_blocks_a ) );
?>
<div class="<?php echo esc_attr( $axiom_blocks_class_attr ); ?>"<?php echo '' !== $axiom_blocks_style_attr ? ' style="' . esc_attr( $axiom_blocks_style_attr ) . '"' : ''; ?>>
	<?php if ( PostFilterFields::shows_label( $axiom_blocks_a ) ) : ?>
		<span class="ab-pff__label"><?php echo esc_html( $axiom_blocks_label ); ?></span>
	<?php endif; ?>
	<select name="ab_f_sort" class="ab-pff__control">
		<option value="" <?php selected( '', $axiom_blocks_value ); ?>>
			<?php echo esc_html( $axiom_blocks_default ); ?>
		</option>
		<?php foreach ( $axiom_blocks_sorts as $axiom_blocks_sort ) : ?>
			<option value="<?php echo esc_attr( $axiom_blocks_sort['value'] ); ?>" <?php selected( $axiom_blocks_sort['value'], $axiom_blocks_value ); ?>>
				<?php echo esc_html( $axiom_blocks_sort['label'] ); ?>
			</option>
		<?php endforeach; ?>
	</select>
</div>
