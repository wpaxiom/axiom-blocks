<?php
/**
 * Button Group - frontend render (wrapper only; buttons come from inner blocks).
 *
 * This file RETURNS its markup; it does not echo. Registry::register_button_group()
 * passes a render_callback that returns `require` of this file, which is the core
 * render_callback model (wp-includes/blocks/query.php et al). $content is the already
 * escaped output of the inner blocks and is passed through untouched, because a wrapper
 * does not own what its children render: filtering it deletes anything outside the post
 * allowlist, including forms, embeds and canvas.
 *
 * Consequence: block.json must NOT declare a `render` file. That path requires this file
 * inside an output buffer, which would discard the return value and emit nothing.
 *
 * @package AxiomBlocks
 * @var array    $attributes
 * @var string   $content
 * @var WP_Block $block
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$axiom_blocks_a = $attributes ?? array();

$axiom_blocks_orientation = 'vertical' === ( $axiom_blocks_a['orientation'] ?? 'horizontal' ) ? 'vertical' : 'horizontal';
$axiom_blocks_justify     = (string) ( $axiom_blocks_a['justify'] ?? 'left' );
$axiom_blocks_gap         = (int) ( $axiom_blocks_a['gap'] ?? 12 );
$axiom_blocks_stack       = ! isset( $axiom_blocks_a['stackOnMobile'] ) || ! empty( $axiom_blocks_a['stackOnMobile'] );

$axiom_blocks_classes = array(
	'axiom-blocks-button-group',
	'is-justify-' . sanitize_html_class( $axiom_blocks_justify ),
);
if ( 'vertical' === $axiom_blocks_orientation ) {
	$axiom_blocks_classes[] = 'is-vertical';
}
if ( $axiom_blocks_stack ) {
	$axiom_blocks_classes[] = 'is-stack-mobile';
}

$axiom_blocks_inline_style = '--ab-btng-gap: ' . $axiom_blocks_gap . 'px';

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
		rtrim( trim( $axiom_blocks_inline_style ), ';' ),
	)
);
$axiom_blocks_style_attr         = safecss_filter_attr( implode( ';', $axiom_blocks_merged_style_parts ) );

$axiom_blocks_id_attr = $axiom_blocks_block_supports['id'] ?? '';
return sprintf(
	"<div %1\$sclass=\"%2\$s\"%3\$s>\n\t%4\$s</div>",
	'' !== $axiom_blocks_id_attr ? 'id="' . esc_attr( $axiom_blocks_id_attr ) . '" ' : '',
	esc_attr( $axiom_blocks_class_attr ),
	'' !== $axiom_blocks_style_attr ? ' style="' . esc_attr( $axiom_blocks_style_attr ) . '"' : '',
	$content
);
