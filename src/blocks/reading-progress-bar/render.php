<?php
/**
 * Reading Progress Bar Block - Server-side Render
 *
 * @package AxiomBlocks
 * @var array $attributes Block attributes.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use AxiomBlocks\Blocks\Background;
use AxiomBlocks\Blocks\Responsive;
use AxiomBlocks\Frontend\ResponsiveStyles;

$axiom_blocks_position = $attributes['position'] ?? 'top';
$axiom_blocks_height   = $attributes['height'] ?? '4px';
$axiom_blocks_background_color = $attributes['backgroundColor'] ?? '#e5e7eb';
$axiom_blocks_show_track       = isset( $attributes['showTrack'] ) ? (bool) $attributes['showTrack'] : true;
$axiom_blocks_z_index          = isset( $attributes['zIndex'] ) ? (int) $attributes['zIndex'] : 9999;

// Fill: a flat `color` resolves to itself, so shipped bars are unchanged; a
// gradient comes from the additive `bar` background attrs.
$axiom_blocks_fill = Background::value( $attributes, 'bar', 'color' );

$axiom_blocks_position = in_array( $axiom_blocks_position, array( 'top', 'bottom' ), true ) ? $axiom_blocks_position : 'top';

$axiom_blocks_height_map   = array( 'height' => 'height' );
$axiom_blocks_responsive_class = '';
if ( Responsive::has_overrides( $attributes, $axiom_blocks_height_map ) ) {
	$axiom_blocks_responsive_class = Responsive::instance_class( $attributes, $axiom_blocks_height_map );
	ResponsiveStyles::add( Responsive::css( $axiom_blocks_responsive_class, $attributes, $axiom_blocks_height_map ) );
}

// Wrapper attributes — assemble id/class/style from block supports + our own values.
$axiom_blocks_block_supports = WP_Block_Supports::get_instance()->apply_block_supports();

$axiom_blocks_classes = array(
	'axiom-blocks-reading-progress-bar',
	'axiom-blocks-reading-progress-bar--' . $axiom_blocks_position,
);
if ( '' !== $axiom_blocks_responsive_class ) {
	$axiom_blocks_classes[] = $axiom_blocks_responsive_class;
}
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
		'background: ' . ( $axiom_blocks_show_track ? $axiom_blocks_background_color : 'transparent' ),
		'z-index: ' . $axiom_blocks_z_index,
	)
);

$axiom_blocks_style_parts = array_filter(
	array(
		rtrim( trim( $axiom_blocks_block_supports['style'] ?? '' ), ';' ),
		$axiom_blocks_wrapper_decls,
	)
);
$axiom_blocks_style_attr = safecss_filter_attr( implode( '; ', $axiom_blocks_style_parts ) );

$axiom_blocks_id_attr = $axiom_blocks_block_supports['id'] ?? '';

$axiom_blocks_fill_style = safecss_filter_attr(
	implode(
		'; ',
		array(
			'background: ' . $axiom_blocks_fill,
			'height: 100%',
			'width: 0%',
		)
	)
);
?>

<div
	<?php echo '' !== $axiom_blocks_id_attr ? 'id="' . esc_attr( $axiom_blocks_id_attr ) . '" ' : ''; ?>
	class="<?php echo esc_attr( $axiom_blocks_class_attr ); ?>"
	style="<?php echo esc_attr( $axiom_blocks_style_attr ); ?>"
	role="progressbar"
	aria-label="<?php echo esc_attr__( 'Reading progress', 'axiom-blocks' ); ?>"
	aria-valuemin="0"
	aria-valuemax="100"
	aria-valuenow="0"
>
	<div class="axiom-blocks-reading-progress-bar__fill" style="<?php echo esc_attr( $axiom_blocks_fill_style ); ?>"></div>
</div>
