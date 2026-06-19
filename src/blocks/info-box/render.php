<?php
/**
 * Info Box — frontend render. Wraps the inner blocks in a styled box.
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

// No inner content → render nothing rather than an empty box.
if ( '' === trim( (string) $content ) ) {
	return;
}

$axiom_blocks_direction = 'row' === ( $axiom_blocks_a['direction'] ?? 'column' ) ? 'row' : 'column';

$axiom_blocks_align = (string) ( $axiom_blocks_a['contentAlign'] ?? 'center' );
if ( ! in_array( $axiom_blocks_align, array( 'left', 'center', 'right' ), true ) ) {
	$axiom_blocks_align = 'center';
}

$axiom_blocks_shadow = (string) ( $axiom_blocks_a['boxShadow'] ?? 'none' );
if ( ! in_array( $axiom_blocks_shadow, array( 'none', 'sm', 'md', 'lg' ), true ) ) {
	$axiom_blocks_shadow = 'none';
}

/* ── Wrapper CSS custom properties + spacing ──────────────────────────────── */
$axiom_blocks_var_map     = array(
	'--ab-ibox-gap'    => 'gap',
	'--ab-ibox-bg'     => 'bgColor',
	'--ab-ibox-bc'     => 'borderColor',
	'--ab-ibox-bw'     => 'borderWidth',
	'--ab-ibox-radius' => 'borderRadius',
);
$axiom_blocks_style_parts = array();
foreach ( $axiom_blocks_var_map as $axiom_blocks_css_var => $axiom_blocks_attr_key ) {
	if ( ! empty( $axiom_blocks_a[ $axiom_blocks_attr_key ] ) ) {
		$axiom_blocks_style_parts[] = $axiom_blocks_css_var . ': ' . $axiom_blocks_a[ $axiom_blocks_attr_key ];
	}
}
$axiom_blocks_wrapper_style = implode( '; ', $axiom_blocks_style_parts );
$axiom_blocks_wrapper_style = Spacing::merge( $axiom_blocks_wrapper_style, $axiom_blocks_a );

/* ── Wrapper attributes ───────────────────────────────────────────────────── */
$axiom_blocks_classes = array(
	'ab-ibox',
	'ab-ibox--' . $axiom_blocks_direction,
	'ab-ibox--align-' . $axiom_blocks_align,
	'has-shadow-' . $axiom_blocks_shadow,
);

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
		rtrim( trim( $axiom_blocks_wrapper_style ), ';' ),
	)
);
$axiom_blocks_style_attr = safecss_filter_attr( implode( ';', $axiom_blocks_merged_style_parts ) );
$axiom_blocks_id_attr    = $axiom_blocks_block_supports['id'] ?? '';
?>
<div
	<?php echo '' !== $axiom_blocks_id_attr ? 'id="' . esc_attr( $axiom_blocks_id_attr ) . '" ' : ''; ?>
	class="<?php echo esc_attr( $axiom_blocks_class_attr ); ?>"
	<?php echo '' !== $axiom_blocks_style_attr ? ' style="' . esc_attr( $axiom_blocks_style_attr ) . '"' : ''; ?>
>
	<?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Inner block HTML, already escaped by each block's own render/save. ?>
</div>
