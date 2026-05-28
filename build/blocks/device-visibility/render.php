<?php
/**
 * Render template for Device Visibility block
 *
 * @package AxiomBlocks
 * @since 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$axiom_blocks_show_on_desktop = $attributes['showOnDesktop'] ?? true;
$axiom_blocks_show_on_tablet  = $attributes['showOnTablet'] ?? true;
$axiom_blocks_show_on_mobile  = $attributes['showOnMobile'] ?? true;

$axiom_blocks_classes = array( 'wp-block-axiom-blocks-device-visibility' );

if ( ! $axiom_blocks_show_on_desktop ) {
	$axiom_blocks_classes[] = 'is-hidden-desktop';
}
if ( ! $axiom_blocks_show_on_tablet ) {
	$axiom_blocks_classes[] = 'is-hidden-tablet';
}
if ( ! $axiom_blocks_show_on_mobile ) {
	$axiom_blocks_classes[] = 'is-hidden-mobile';
}

// Spacing styles.
$axiom_blocks_spacing_style = \AxiomBlocks\Blocks\Spacing::inline_style( $attributes );

// If all devices are hidden, still render but hidden (for editor consistency).
if ( ! $axiom_blocks_show_on_desktop && ! $axiom_blocks_show_on_tablet && ! $axiom_blocks_show_on_mobile ) {
	$axiom_blocks_spacing_style = 'display: none;' . ( '' !== $axiom_blocks_spacing_style ? ' ' . $axiom_blocks_spacing_style : '' );
}

$axiom_blocks_block_supports = WP_Block_Supports::get_instance()->apply_block_supports();

if ( ! empty( $attributes['className'] ) ) {
	$axiom_blocks_classes[] = $attributes['className'];
}
if ( ! empty( $axiom_blocks_block_supports['class'] ) ) {
	$axiom_blocks_classes[] = $axiom_blocks_block_supports['class'];
}
$axiom_blocks_class_attr = trim( implode( ' ', array_filter( $axiom_blocks_classes ) ) );

$axiom_blocks_style_parts = array_filter(
	array(
		rtrim( trim( $axiom_blocks_block_supports['style'] ?? '' ), ';' ),
		rtrim( trim( $axiom_blocks_spacing_style ), ';' ),
	)
);
$axiom_blocks_style_attr  = safecss_filter_attr( implode( ';', $axiom_blocks_style_parts ) );

$axiom_blocks_id_attr = $axiom_blocks_block_supports['id'] ?? '';

?>

<div <?php echo '' !== $axiom_blocks_id_attr ? 'id="' . esc_attr( $axiom_blocks_id_attr ) . '" ' : ''; ?> class="<?php echo esc_attr( $axiom_blocks_class_attr ); ?>" <?php echo '' !== $axiom_blocks_style_attr ? ' style="' . esc_attr( $axiom_blocks_style_attr ) . '"' : ''; ?>>
	<?php echo wp_kses_post( $content ); ?>
</div>
