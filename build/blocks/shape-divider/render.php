<?php
/**
 * Shape Divider Block - Server-side Render
 *
 * @package AxiomBlocks
 * @var array $attributes Block attributes.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use AxiomBlocks\Blocks\AllowedHtml;
use AxiomBlocks\Blocks\Spacing;

$axiom_blocks_shape            = $attributes['shape'] ?? 'wave';
$axiom_blocks_height           = $attributes['height'] ?? '80px';
$axiom_blocks_color            = $attributes['color'] ?? '#ffffff';
$axiom_blocks_background_color = $attributes['backgroundColor'] ?? 'transparent';
$axiom_blocks_flip_horizontal  = ! empty( $attributes['flipHorizontal'] );
$axiom_blocks_flip_vertical    = ! empty( $attributes['flipVertical'] );

$axiom_blocks_shape_paths = array(
	'wave'     => 'M0,60 C200,120 400,0 600,60 C800,120 1000,0 1200,60 L1200,120 L0,120 Z',
	'curve'    => 'M0,120 C300,0 900,0 1200,120 L1200,120 L0,120 Z',
	'triangle' => 'M0,120 L600,0 L1200,120 Z',
	'tilt'     => 'M0,120 L1200,0 L1200,120 Z',
	'slant'    => 'M0,120 L0,0 L1200,120 Z',
);

if ( ! isset( $axiom_blocks_shape_paths[ $axiom_blocks_shape ] ) ) {
	$axiom_blocks_shape = 'wave';
}

$axiom_blocks_shape_path = $axiom_blocks_shape_paths[ $axiom_blocks_shape ];

$axiom_blocks_path_transform = '';
if ( $axiom_blocks_flip_horizontal || $axiom_blocks_flip_vertical ) {
	$axiom_blocks_sx = $axiom_blocks_flip_horizontal ? -1 : 1;
	$axiom_blocks_sy = $axiom_blocks_flip_vertical   ? -1 : 1;
	$axiom_blocks_tx = $axiom_blocks_flip_horizontal ? 1200 : 0;
	$axiom_blocks_ty = $axiom_blocks_flip_vertical   ? 120 : 0;
	$axiom_blocks_path_transform = sprintf(
		' transform="matrix(%d 0 0 %d %d %d)"',
		$axiom_blocks_sx,
		$axiom_blocks_sy,
		$axiom_blocks_tx,
		$axiom_blocks_ty
	);
}

// Wrapper attributes — assemble id/class/style from block supports + our own values.
$axiom_blocks_spacing_style  = Spacing::inline_style( $attributes );
$axiom_blocks_block_supports = WP_Block_Supports::get_instance()->apply_block_supports();

$axiom_blocks_classes = array(
	'axiom-blocks-shape-divider',
	'axiom-blocks-shape-divider--' . sanitize_html_class( $axiom_blocks_shape ),
);
if ( ! empty( $attributes['className'] ) ) {
	$axiom_blocks_classes[] = $attributes['className'];
}
if ( ! empty( $axiom_blocks_block_supports['class'] ) ) {
	$axiom_blocks_classes[] = $axiom_blocks_block_supports['class'];
}
$axiom_blocks_class_attr = trim( implode( ' ', array_filter( $axiom_blocks_classes ) ) );

$axiom_blocks_wrapper_decls = implode(
	'; ',
	array(
		'height: ' . $axiom_blocks_height,
		'background-color: ' . $axiom_blocks_background_color,
	)
);

$axiom_blocks_style_parts = array_filter(
	array(
		rtrim( trim( $axiom_blocks_block_supports['style'] ?? '' ), ';' ),
		$axiom_blocks_wrapper_decls,
		rtrim( trim( $axiom_blocks_spacing_style ), ';' ),
	)
);
$axiom_blocks_style_attr  = safecss_filter_attr( implode( '; ', $axiom_blocks_style_parts ) );

$axiom_blocks_id_attr = $axiom_blocks_block_supports['id'] ?? '';

$axiom_blocks_svg_markup = sprintf(
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" class="axiom-blocks-shape-divider__svg" aria-hidden="true"><path d="%s" fill="%s"%s></path></svg>',
	esc_attr( $axiom_blocks_shape_path ),
	esc_attr( $axiom_blocks_color ),
	$axiom_blocks_path_transform
);
?>
<div <?php echo '' !== $axiom_blocks_id_attr ? 'id="' . esc_attr( $axiom_blocks_id_attr ) . '" ' : ''; ?>class="<?php echo esc_attr( $axiom_blocks_class_attr ); ?>" aria-hidden="true"<?php echo '' !== $axiom_blocks_style_attr ? ' style="' . esc_attr( $axiom_blocks_style_attr ) . '"' : ''; ?>>
	<?php echo wp_kses( $axiom_blocks_svg_markup, AllowedHtml::svg() ); ?>
</div>
