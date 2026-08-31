<?php
/**
 * Post Title — frontend render.
 *
 * `postId` arrives as render context from Post Card, or from core/post-template
 * when this block sits inside a core Query Loop. Falls back to the current post
 * so the block degrades rather than disappears outside a loop.
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

$axiom_blocks_title = get_the_title( $axiom_blocks_post_id );
if ( '' === trim( wp_strip_all_tags( $axiom_blocks_title ) ) ) {
	return;
}

/* Crop by word count — 0 means the full title. */
$axiom_blocks_crop = max( 0, (int) ( $axiom_blocks_a['cropWords'] ?? 0 ) );
if ( $axiom_blocks_crop > 0 ) {
	$axiom_blocks_title = wp_trim_words( $axiom_blocks_title, $axiom_blocks_crop, '…' );
}

$axiom_blocks_tag = (string) ( $axiom_blocks_a['tagName'] ?? 'h3' );
if ( ! in_array( $axiom_blocks_tag, array( 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p' ), true ) ) {
	$axiom_blocks_tag = 'h3';
}

/* ── Styles ───────────────────────────────────────────────────────────────── */
$axiom_blocks_style_parts = array();
foreach ( array(
	'--ab-pc-title-color'   => 'titleColor',
	'--ab-pc-title-color-h' => 'titleColorHover',
) as $axiom_blocks_css_var => $axiom_blocks_attr_key ) {
	if ( ! empty( $axiom_blocks_a[ $axiom_blocks_attr_key ] ) ) {
		$axiom_blocks_style_parts[] = $axiom_blocks_css_var . ': ' . $axiom_blocks_a[ $axiom_blocks_attr_key ];
	}
}

$axiom_blocks_typo = Typography::inline_style( $axiom_blocks_a, '' );
if ( '' !== $axiom_blocks_typo ) {
	$axiom_blocks_style_parts[] = rtrim( $axiom_blocks_typo, ';' );
}

$axiom_blocks_wrapper_style = Spacing::merge( implode( '; ', $axiom_blocks_style_parts ), $axiom_blocks_a );
$axiom_blocks_style_attr    = safecss_filter_attr( $axiom_blocks_wrapper_style );

$axiom_blocks_classes = array( 'ab-pc__title' );
if ( ! empty( $axiom_blocks_a['className'] ) ) {
	$axiom_blocks_classes[] = $axiom_blocks_a['className'];
}
$axiom_blocks_class_attr = trim( implode( ' ', array_filter( $axiom_blocks_classes ) ) );

/* ── Inner markup ─────────────────────────────────────────────────────────── */
$axiom_blocks_inner = esc_html( $axiom_blocks_title );

if ( ! empty( $axiom_blocks_a['isLink'] ) ) {
	$axiom_blocks_target = '_blank' === ( $axiom_blocks_a['linkTarget'] ?? '' ) ? '_blank' : '';
	$axiom_blocks_rel    = (string) ( $axiom_blocks_a['rel'] ?? '' );
	if ( '_blank' === $axiom_blocks_target && '' === $axiom_blocks_rel ) {
		$axiom_blocks_rel = 'noopener noreferrer';
	}

	$axiom_blocks_inner = sprintf(
		'<a class="ab-pc__title-link" href="%1$s"%2$s%3$s>%4$s</a>',
		esc_url( get_permalink( $axiom_blocks_post_id ) ),
		'' !== $axiom_blocks_target ? ' target="' . esc_attr( $axiom_blocks_target ) . '"' : '',
		'' !== $axiom_blocks_rel ? ' rel="' . esc_attr( $axiom_blocks_rel ) . '"' : '',
		esc_html( $axiom_blocks_title )
	);
}

printf(
	'<%1$s class="%2$s"%3$s>%4$s</%1$s>',
	esc_html( $axiom_blocks_tag ),
	esc_attr( $axiom_blocks_class_attr ),
	'' !== $axiom_blocks_style_attr ? ' style="' . esc_attr( $axiom_blocks_style_attr ) . '"' : '',
	$axiom_blocks_inner // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Built above from esc_html/esc_url/esc_attr parts.
);
