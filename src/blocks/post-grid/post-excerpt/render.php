<?php
/**
 * Post Excerpt — frontend render.
 *
 * `postId` arrives as render context from Post Card, or from core/post-template
 * inside a core Query Loop. Falls back to the current post.
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

$axiom_blocks_post = get_post( $axiom_blocks_post_id );
if ( ! $axiom_blocks_post || post_password_required( $axiom_blocks_post ) ) {
	return;
}

/* Prefer the authored excerpt; fall back to the content, as core does. */
$axiom_blocks_raw = has_excerpt( $axiom_blocks_post_id )
	? get_the_excerpt( $axiom_blocks_post_id )
	: wp_strip_all_tags( strip_shortcodes( $axiom_blocks_post->post_content ) );

$axiom_blocks_raw = trim( (string) $axiom_blocks_raw );
if ( '' === $axiom_blocks_raw ) {
	return;
}

$axiom_blocks_len       = max( 1, (int) ( $axiom_blocks_a['excerptLength'] ?? 20 ) );
$axiom_blocks_indicator = (string) ( $axiom_blocks_a['indicator'] ?? '…' );
$axiom_blocks_text      = wp_trim_words( $axiom_blocks_raw, $axiom_blocks_len, $axiom_blocks_indicator );

/* ── Styles ───────────────────────────────────────────────────────────────── */
$axiom_blocks_style_parts = array();
if ( ! empty( $axiom_blocks_a['excerptColor'] ) ) {
	$axiom_blocks_style_parts[] = '--ab-pc-excerpt-color: ' . $axiom_blocks_a['excerptColor'];
}

$axiom_blocks_clamp = max( 0, (int) ( $axiom_blocks_a['clampLines'] ?? 0 ) );
if ( $axiom_blocks_clamp > 0 ) {
	$axiom_blocks_style_parts[] = '--ab-pc-excerpt-clamp: ' . $axiom_blocks_clamp;
}

$axiom_blocks_typo = Typography::inline_style( $axiom_blocks_a, '' );
if ( '' !== $axiom_blocks_typo ) {
	$axiom_blocks_style_parts[] = rtrim( $axiom_blocks_typo, ';' );
}

$axiom_blocks_wrapper_style = Spacing::merge( implode( '; ', $axiom_blocks_style_parts ), $axiom_blocks_a );
$axiom_blocks_style_attr    = safecss_filter_attr( $axiom_blocks_wrapper_style );

$axiom_blocks_classes = array( 'ab-pc__excerpt' );
if ( $axiom_blocks_clamp > 0 ) {
	$axiom_blocks_classes[] = 'is-clamped';
}
if ( ! empty( $axiom_blocks_a['className'] ) ) {
	$axiom_blocks_classes[] = $axiom_blocks_a['className'];
}
$axiom_blocks_class_attr = trim( implode( ' ', array_filter( $axiom_blocks_classes ) ) );
?>
<p
	class="<?php echo esc_attr( $axiom_blocks_class_attr ); ?>"
	<?php echo '' !== $axiom_blocks_style_attr ? ' style="' . esc_attr( $axiom_blocks_style_attr ) . '"' : ''; ?>
><?php echo esc_html( $axiom_blocks_text ); ?></p>
