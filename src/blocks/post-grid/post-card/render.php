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

use AxiomBlocks\Blocks\Background;
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

/* Card box — mirrors cardVars() in index.js. Every var is emitted only when the
   author set it, so an untouched card renders exactly as it did before these
   controls existed. */
$axiom_blocks_style_parts = array();

$axiom_blocks_card_bg = Background::value( $axiom_blocks_a, 'card', 'cardBg' );
if ( '' !== $axiom_blocks_card_bg ) {
	$axiom_blocks_style_parts[] = '--ab-pc-bg: ' . $axiom_blocks_card_bg;
}
$axiom_blocks_card_bg_hover = Background::value( $axiom_blocks_a, 'cardHover', 'cardBgHover' );
if ( '' !== $axiom_blocks_card_bg_hover ) {
	$axiom_blocks_style_parts[] = '--ab-pc-bg-hover: ' . $axiom_blocks_card_bg_hover;
}

foreach ( array(
	'--ab-pc-bw-t'      => 'cardBorderTopWidth',
	'--ab-pc-bw-r'      => 'cardBorderRightWidth',
	'--ab-pc-bw-b'      => 'cardBorderBottomWidth',
	'--ab-pc-bw-l'      => 'cardBorderLeftWidth',
	'--ab-pc-bs'        => 'cardBorderStyle',
	'--ab-pc-bc'        => 'cardBorderColor',
	'--ab-pc-bc-h'      => 'cardBorderColorHover',
	'--ab-pc-radius-tl' => 'cardRadiusTopLeft',
	'--ab-pc-radius-tr' => 'cardRadiusTopRight',
	'--ab-pc-radius-br' => 'cardRadiusBottomRight',
	'--ab-pc-radius-bl' => 'cardRadiusBottomLeft',
	'--ab-pc-shadow'    => 'cardShadow',
	'--ab-pc-shadow-h'  => 'cardShadowHover',
	'--ab-pc-min-h'     => 'cardMinHeight',
	'--ab-pc-gap'       => 'cardGap',
) as $axiom_blocks_css_var => $axiom_blocks_attr_key ) {
	if ( ! empty( $axiom_blocks_a[ $axiom_blocks_attr_key ] ) ) {
		$axiom_blocks_style_parts[] = $axiom_blocks_css_var . ': ' . $axiom_blocks_a[ $axiom_blocks_attr_key ];
	}
}

$axiom_blocks_style_attr = safecss_filter_attr(
	Spacing::merge( implode( '; ', $axiom_blocks_style_parts ), $axiom_blocks_a )
);
?>
<div
	class="<?php echo esc_attr( $axiom_blocks_class_attr ); ?>"
	<?php echo '' !== $axiom_blocks_style_attr ? ' style="' . esc_attr( $axiom_blocks_style_attr ) . '"' : ''; ?>
>
	<?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Inner block HTML, already escaped by each block's own render/save. ?>
</div>
