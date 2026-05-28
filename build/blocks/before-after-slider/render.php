<?php
/**
 * Before/After Slider — server-side render.
 *
 * @package AxiomBlocks
 * @var array $attributes Block attributes.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use AxiomBlocks\Blocks\Spacing;

$axiom_blocks_before = $attributes['beforeImage'] ?? null;
$axiom_blocks_after  = $attributes['afterImage'] ?? null;

// Nothing to show without both images.
if ( empty( $axiom_blocks_before['url'] ) || empty( $axiom_blocks_after['url'] ) ) {
	return '';
}

$axiom_blocks_show_labels  = ! empty( $attributes['showLabels'] );
$axiom_blocks_before_label = $attributes['beforeLabel'] ?? 'Before';
$axiom_blocks_after_label  = $attributes['afterLabel'] ?? 'After';
$axiom_blocks_initial_pos  = max( 0, min( 100, (int) ( $attributes['initialPosition'] ?? 50 ) ) );
$axiom_blocks_aspect_ratio = (string) ( $attributes['aspectRatio'] ?? 'auto' );
$axiom_blocks_handle_color = (string) ( $attributes['handleColor'] ?? '#ffffff' );
$axiom_blocks_line_color   = (string) ( $attributes['lineColor'] ?? '#ffffff' );

// Constrain aspect ratio to "<digits>/<digits>" or "auto".
if ( 'auto' !== $axiom_blocks_aspect_ratio && ! preg_match( '/^\d{1,3}\/\d{1,3}$/', $axiom_blocks_aspect_ratio ) ) {
	$axiom_blocks_aspect_ratio = 'auto';
}

$axiom_blocks_frame_classes = array( 'axiom-blocks-bas__frame' );
$axiom_blocks_frame_styles  = array(
	'--slider-pos: ' . $axiom_blocks_initial_pos . '%',
	'--handle-color: ' . $axiom_blocks_handle_color,
	'--line-color: ' . $axiom_blocks_line_color,
);
if ( 'auto' !== $axiom_blocks_aspect_ratio ) {
	$axiom_blocks_frame_classes[] = 'is-aspect-fixed';
	$axiom_blocks_frame_styles[]  = 'aspect-ratio: ' . str_replace( '/', ' / ', $axiom_blocks_aspect_ratio );
} else {
	$axiom_blocks_frame_classes[] = 'is-aspect-auto';
}
$axiom_blocks_frame_class_attr = trim( implode( ' ', array_filter( $axiom_blocks_frame_classes ) ) );
$axiom_blocks_frame_style_attr = safecss_filter_attr( implode( '; ', $axiom_blocks_frame_styles ) );

// Wrapper attributes — assemble id/class/style from block supports + our own values.
$axiom_blocks_spacing_style  = Spacing::inline_style( $attributes );
$axiom_blocks_block_supports = WP_Block_Supports::get_instance()->apply_block_supports();

$axiom_blocks_classes = array( 'axiom-blocks-bas' );
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
	<div
		class="<?php echo esc_attr( $axiom_blocks_frame_class_attr ); ?>"
		style="<?php echo esc_attr( $axiom_blocks_frame_style_attr ); ?>"
		role="slider"
		aria-valuemin="0"
		aria-valuemax="100"
		aria-valuenow="<?php echo esc_attr( (string) $axiom_blocks_initial_pos ); ?>"
		aria-label="<?php esc_attr_e( 'Before / after image comparison', 'axiom-blocks' ); ?>"
		tabindex="0"
	>
		<img
			src="<?php echo esc_url( $axiom_blocks_after['url'] ); ?>"
			alt="<?php echo esc_attr( $axiom_blocks_after['alt'] ?? '' ); ?>"
			class="axiom-blocks-bas__img axiom-blocks-bas__img--after"
			draggable="false"
		/>
		<img
			src="<?php echo esc_url( $axiom_blocks_before['url'] ); ?>"
			alt="<?php echo esc_attr( $axiom_blocks_before['alt'] ?? '' ); ?>"
			class="axiom-blocks-bas__img axiom-blocks-bas__img--before"
			draggable="false"
		/>
		<?php if ( $axiom_blocks_show_labels ) : ?>
			<span class="axiom-blocks-bas__label axiom-blocks-bas__label--before"><?php echo esc_html( $axiom_blocks_before_label ); ?></span>
			<span class="axiom-blocks-bas__label axiom-blocks-bas__label--after"><?php echo esc_html( $axiom_blocks_after_label ); ?></span>
		<?php endif; ?>
		<div class="axiom-blocks-bas__line" aria-hidden="true"></div>
		<div class="axiom-blocks-bas__handle" aria-hidden="true">
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
				<path d="M9 6 L3 12 L9 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				<path d="M15 6 L21 12 L15 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
		</div>
	</div>
</div>
