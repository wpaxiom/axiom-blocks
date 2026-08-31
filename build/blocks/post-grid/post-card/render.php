<?php
/**
 * Post Card — frontend render. The card box around one post's inner blocks.
 *
 * `postId` / `postType` arrive as render context from the parent Post Grid and
 * flow on to every descendant that declares them in `usesContext`, which is why
 * core's own per-item blocks work inside this card unchanged.
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

$axiom_blocks_a = $attributes ?? array();

if ( '' === trim( (string) $content ) ) {
	return;
}

$axiom_blocks_role = 'featured' === ( $axiom_blocks_a['cardRole'] ?? 'default' ) ? 'featured' : 'default';

$axiom_blocks_post_id = (int) ( $block->context['postId'] ?? 0 );

$axiom_blocks_classes = array( 'ab-pc' );
if ( 'featured' === $axiom_blocks_role ) {
	$axiom_blocks_classes[] = 'ab-pc--featured';
}
if ( $axiom_blocks_post_id ) {
	$axiom_blocks_classes[] = 'ab-pc--id-' . $axiom_blocks_post_id;
}
if ( ! empty( $axiom_blocks_a['className'] ) ) {
	$axiom_blocks_classes[] = $axiom_blocks_a['className'];
}
$axiom_blocks_class_attr = trim( implode( ' ', array_filter( $axiom_blocks_classes ) ) );

$axiom_blocks_style_attr = safecss_filter_attr( Spacing::merge( '', $axiom_blocks_a ) );
?>
<div
	class="<?php echo esc_attr( $axiom_blocks_class_attr ); ?>"
	<?php echo '' !== $axiom_blocks_style_attr ? ' style="' . esc_attr( $axiom_blocks_style_attr ) . '"' : ''; ?>
>
	<?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Inner block HTML, already escaped by each block's own render/save. ?>
</div>
