<?php
/**
 * Post Image — frontend render.
 *
 * Falls back to an author-chosen image when the post has no featured image,
 * which is the ragged-grid problem no rival except Essential Blocks solves.
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

$axiom_blocks_a       = $attributes ?? array();
$axiom_blocks_post_id = (int) ( $block->context['postId'] ?? 0 );
if ( ! $axiom_blocks_post_id ) {
	$axiom_blocks_post_id = (int) get_the_ID();
}
if ( ! $axiom_blocks_post_id ) {
	return;
}

$axiom_blocks_size = (string) ( $axiom_blocks_a['imageSize'] ?? 'large' );
if ( '' === $axiom_blocks_size ) {
	$axiom_blocks_size = 'large';
}

$axiom_blocks_thumb_id = (int) get_post_thumbnail_id( $axiom_blocks_post_id );
$axiom_blocks_fallback = (int) ( $axiom_blocks_a['fallbackId'] ?? 0 );

/* No featured image → the fallback, then hide-if-empty, then nothing. */
if ( ! $axiom_blocks_thumb_id && ! $axiom_blocks_fallback ) {
	return;
}
if ( ! $axiom_blocks_thumb_id && ! empty( $axiom_blocks_a['hideIfEmpty'] ) ) {
	return;
}

$axiom_blocks_img_html = $axiom_blocks_thumb_id
	? wp_get_attachment_image( $axiom_blocks_thumb_id, $axiom_blocks_size, false, array( 'class' => 'ab-pc__img' ) )
	: wp_get_attachment_image( $axiom_blocks_fallback, $axiom_blocks_size, false, array( 'class' => 'ab-pc__img is-fallback' ) );

if ( '' === $axiom_blocks_img_html ) {
	return;
}

/* ── Styles ───────────────────────────────────────────────────────────────── */
$axiom_blocks_style_parts = array();

foreach ( array(
	'--ab-pc-img-overlay'   => 'overlayColor',
	'--ab-pc-img-overlay-h' => 'overlayColorHover',
	'--ab-pc-img-shadow'    => 'imgShadow',
	'--ab-pc-img-shadow-h'  => 'imgShadowHover',
	'--ab-pc-img-h'         => 'height',
	'--ab-pc-img-bc'        => 'imgBorderColor',
) as $axiom_blocks_css_var => $axiom_blocks_attr_key ) {
	if ( ! empty( $axiom_blocks_a[ $axiom_blocks_attr_key ] ) ) {
		$axiom_blocks_style_parts[] = $axiom_blocks_css_var . ': ' . $axiom_blocks_a[ $axiom_blocks_attr_key ];
	}
}

$axiom_blocks_ratio = (string) ( $axiom_blocks_a['aspectRatio'] ?? '16/9' );
if ( '' !== $axiom_blocks_ratio && 'auto' !== $axiom_blocks_ratio ) {
	$axiom_blocks_style_parts[] = '--ab-pc-img-ratio: ' . $axiom_blocks_ratio;
}

$axiom_blocks_scale         = 'contain' === ( $axiom_blocks_a['scaleMode'] ?? 'cover' ) ? 'contain' : 'cover';
$axiom_blocks_style_parts[] = '--ab-pc-img-fit: ' . $axiom_blocks_scale;

/* Border — per-side widths; the style var only appears when a width does. */
$axiom_blocks_any_bw = false;
foreach ( array(
	'top'    => 'imgBorderTopWidth',
	'right'  => 'imgBorderRightWidth',
	'bottom' => 'imgBorderBottomWidth',
	'left'   => 'imgBorderLeftWidth',
) as $axiom_blocks_side => $axiom_blocks_attr_key ) {
	if ( ! empty( $axiom_blocks_a[ $axiom_blocks_attr_key ] ) ) {
		$axiom_blocks_any_bw        = true;
		$axiom_blocks_style_parts[] = '--ab-pc-img-bw-' . $axiom_blocks_side . ': ' . $axiom_blocks_a[ $axiom_blocks_attr_key ];
	}
}
$axiom_blocks_border_style = (string) ( $axiom_blocks_a['imgBorderStyle'] ?? '' );
if ( $axiom_blocks_any_bw ) {
	$axiom_blocks_style_parts[] = '--ab-pc-img-bs: ' . ( '' !== $axiom_blocks_border_style ? $axiom_blocks_border_style : 'solid' );
} elseif ( '' !== $axiom_blocks_border_style ) {
	$axiom_blocks_style_parts[] = '--ab-pc-img-bs: ' . $axiom_blocks_border_style;
}

/* Radius — per corner. */
foreach ( array(
	'tl' => 'imgRadiusTopLeft',
	'tr' => 'imgRadiusTopRight',
	'br' => 'imgRadiusBottomRight',
	'bl' => 'imgRadiusBottomLeft',
) as $axiom_blocks_corner => $axiom_blocks_attr_key ) {
	if ( ! empty( $axiom_blocks_a[ $axiom_blocks_attr_key ] ) ) {
		$axiom_blocks_style_parts[] = '--ab-pc-img-radius-' . $axiom_blocks_corner . ': ' . $axiom_blocks_a[ $axiom_blocks_attr_key ];
	}
}

$axiom_blocks_wrapper_style = Spacing::merge( implode( '; ', $axiom_blocks_style_parts ), $axiom_blocks_a );
$axiom_blocks_style_attr    = safecss_filter_attr( $axiom_blocks_wrapper_style );

$axiom_blocks_classes = array( 'ab-pc__media' );
if ( ! empty( $axiom_blocks_a['overlayColor'] ) || ! empty( $axiom_blocks_a['overlayColorHover'] ) ) {
	$axiom_blocks_classes[] = 'has-overlay';
}
if ( ! empty( $axiom_blocks_a['className'] ) ) {
	$axiom_blocks_classes[] = $axiom_blocks_a['className'];
}
$axiom_blocks_class_attr = trim( implode( ' ', array_filter( $axiom_blocks_classes ) ) );

/* ── Markup ───────────────────────────────────────────────────────────────── */
$axiom_blocks_inner = $axiom_blocks_img_html;

if ( ! empty( $axiom_blocks_a['isLink'] ) ) {
	$axiom_blocks_target = '_blank' === ( $axiom_blocks_a['linkTarget'] ?? '' ) ? '_blank' : '';
	$axiom_blocks_inner  = sprintf(
		'<a class="ab-pc__media-link" href="%1$s"%2$s aria-hidden="true" tabindex="-1">%3$s</a>',
		esc_url( get_permalink( $axiom_blocks_post_id ) ),
		'' !== $axiom_blocks_target ? ' target="' . esc_attr( $axiom_blocks_target ) . '" rel="noopener noreferrer"' : '',
		$axiom_blocks_img_html
	);
}
?>
<figure
	class="<?php echo esc_attr( $axiom_blocks_class_attr ); ?>"
	<?php echo '' !== $axiom_blocks_style_attr ? ' style="' . esc_attr( $axiom_blocks_style_attr ) . '"' : ''; ?>
><?php echo $axiom_blocks_inner; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- wp_get_attachment_image output plus esc_url/esc_attr parts built above. ?></figure>
