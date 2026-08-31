<?php
/**
 * Post Terms — frontend render.
 *
 * Renders the post's terms as chips. Whether they sit above or below the title
 * is block order inside the card, not a setting: that is the composable model
 * paying off over the rivals' "terms above title" boolean.
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
use AxiomBlocks\Blocks\Typography;

$axiom_blocks_a       = $attributes ?? array();
$axiom_blocks_post_id = (int) ( $block->context['postId'] ?? 0 );
if ( ! $axiom_blocks_post_id ) {
	$axiom_blocks_post_id = (int) get_the_ID();
}
if ( ! $axiom_blocks_post_id ) {
	return;
}

$axiom_blocks_taxonomy = (string) ( $axiom_blocks_a['taxonomy'] ?? 'category' );
if ( ! taxonomy_exists( $axiom_blocks_taxonomy ) ) {
	return;
}

$axiom_blocks_terms = get_the_terms( $axiom_blocks_post_id, $axiom_blocks_taxonomy );
if ( is_wp_error( $axiom_blocks_terms ) || empty( $axiom_blocks_terms ) ) {
	return;
}

$axiom_blocks_limit = max( 0, (int) ( $axiom_blocks_a['limit'] ?? 0 ) );
if ( $axiom_blocks_limit > 0 ) {
	$axiom_blocks_terms = array_slice( $axiom_blocks_terms, 0, $axiom_blocks_limit );
}

/* ── Styles ───────────────────────────────────────────────────────────────── */
$axiom_blocks_style_parts = array();

foreach ( array(
	'--ab-pc-term-color'   => 'termColor',
	'--ab-pc-term-color-h' => 'termColorHover',
	'--ab-pc-term-bg'      => 'termBg',
	'--ab-pc-term-bg-h'    => 'termBgHover',
	'--ab-pc-term-bc'      => 'chipBorderColor',
	'--ab-pc-term-gap'     => 'chipGap',
) as $axiom_blocks_css_var => $axiom_blocks_attr_key ) {
	if ( ! empty( $axiom_blocks_a[ $axiom_blocks_attr_key ] ) ) {
		$axiom_blocks_style_parts[] = $axiom_blocks_css_var . ': ' . $axiom_blocks_a[ $axiom_blocks_attr_key ];
	}
}

$axiom_blocks_any_bw = false;
foreach ( array(
	'top'    => 'chipBorderTopWidth',
	'right'  => 'chipBorderRightWidth',
	'bottom' => 'chipBorderBottomWidth',
	'left'   => 'chipBorderLeftWidth',
) as $axiom_blocks_side => $axiom_blocks_attr_key ) {
	if ( ! empty( $axiom_blocks_a[ $axiom_blocks_attr_key ] ) ) {
		$axiom_blocks_any_bw        = true;
		$axiom_blocks_style_parts[] = '--ab-pc-term-bw-' . $axiom_blocks_side . ': ' . $axiom_blocks_a[ $axiom_blocks_attr_key ];
	}
}
$axiom_blocks_border_style = (string) ( $axiom_blocks_a['chipBorderStyle'] ?? '' );
if ( $axiom_blocks_any_bw ) {
	$axiom_blocks_style_parts[] = '--ab-pc-term-bs: ' . ( '' !== $axiom_blocks_border_style ? $axiom_blocks_border_style : 'solid' );
} elseif ( '' !== $axiom_blocks_border_style ) {
	$axiom_blocks_style_parts[] = '--ab-pc-term-bs: ' . $axiom_blocks_border_style;
}

foreach ( array(
	'tl' => 'chipRadiusTopLeft',
	'tr' => 'chipRadiusTopRight',
	'br' => 'chipRadiusBottomRight',
	'bl' => 'chipRadiusBottomLeft',
) as $axiom_blocks_corner => $axiom_blocks_attr_key ) {
	if ( ! empty( $axiom_blocks_a[ $axiom_blocks_attr_key ] ) ) {
		$axiom_blocks_style_parts[] = '--ab-pc-term-radius-' . $axiom_blocks_corner . ': ' . $axiom_blocks_a[ $axiom_blocks_attr_key ];
	}
}

foreach ( array(
	'pt' => 'chipPaddingTop',
	'pr' => 'chipPaddingRight',
	'pb' => 'chipPaddingBottom',
	'pl' => 'chipPaddingLeft',
) as $axiom_blocks_edge => $axiom_blocks_attr_key ) {
	if ( ! empty( $axiom_blocks_a[ $axiom_blocks_attr_key ] ) ) {
		$axiom_blocks_style_parts[] = '--ab-pc-term-' . $axiom_blocks_edge . ': ' . $axiom_blocks_a[ $axiom_blocks_attr_key ];
	}
}

$axiom_blocks_typo = Typography::inline_style( $axiom_blocks_a, '' );
if ( '' !== $axiom_blocks_typo ) {
	$axiom_blocks_style_parts[] = rtrim( $axiom_blocks_typo, ';' );
}

$axiom_blocks_wrapper_style = Spacing::merge( implode( '; ', $axiom_blocks_style_parts ), $axiom_blocks_a );
$axiom_blocks_style_attr    = safecss_filter_attr( $axiom_blocks_wrapper_style );

$axiom_blocks_classes = array( 'ab-pc__terms' );
if ( ! empty( $axiom_blocks_a['className'] ) ) {
	$axiom_blocks_classes[] = $axiom_blocks_a['className'];
}
$axiom_blocks_class_attr = trim( implode( ' ', array_filter( $axiom_blocks_classes ) ) );

$axiom_blocks_separator = (string) ( $axiom_blocks_a['separator'] ?? '' );
$axiom_blocks_is_link   = ! empty( $axiom_blocks_a['isLink'] );
$axiom_blocks_last      = count( $axiom_blocks_terms ) - 1;
?>
<div
	class="<?php echo esc_attr( $axiom_blocks_class_attr ); ?>"
	<?php echo '' !== $axiom_blocks_style_attr ? ' style="' . esc_attr( $axiom_blocks_style_attr ) . '"' : ''; ?>
>
	<?php foreach ( $axiom_blocks_terms as $axiom_blocks_i => $axiom_blocks_term ) : ?>
		<?php if ( $axiom_blocks_is_link ) : ?>
			<a
				class="ab-pc__term"
				href="<?php echo esc_url( (string) get_term_link( $axiom_blocks_term ) ); ?>"
			><?php echo esc_html( $axiom_blocks_term->name ); ?></a>
		<?php else : ?>
			<span class="ab-pc__term"><?php echo esc_html( $axiom_blocks_term->name ); ?></span>
		<?php endif; ?>
		<?php if ( '' !== $axiom_blocks_separator && $axiom_blocks_i < $axiom_blocks_last ) : ?>
			<span class="ab-pc__term-sep" aria-hidden="true"><?php echo esc_html( $axiom_blocks_separator ); ?></span>
		<?php endif; ?>
	<?php endforeach; ?>
</div>
