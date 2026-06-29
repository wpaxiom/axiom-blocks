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

use AxiomBlocks\Blocks\Responsive;
use AxiomBlocks\Frontend\ResponsiveStyles;

$axiom_blocks_position = $attributes['position'] ?? 'top';
$axiom_blocks_height   = $attributes['height'] ?? '4px';
$axiom_blocks_color            = $attributes['color'] ?? '#7C3AED';
$axiom_blocks_background_color = $attributes['backgroundColor'] ?? '#e5e7eb';
$axiom_blocks_show_track       = isset( $attributes['showTrack'] ) ? (bool) $attributes['showTrack'] : true;
$axiom_blocks_z_index          = isset( $attributes['zIndex'] ) ? (int) $attributes['zIndex'] : 9999;

$axiom_blocks_position = in_array( $axiom_blocks_position, array( 'top', 'bottom' ), true ) ? $axiom_blocks_position : 'top';

$axiom_blocks_height_map   = array( 'height' => 'height' );
$axiom_blocks_responsive_class = '';
if ( Responsive::has_overrides( $attributes, $axiom_blocks_height_map ) ) {
	$axiom_blocks_responsive_class = Responsive::instance_class( $attributes, $axiom_blocks_height_map );
	ResponsiveStyles::add( Responsive::css( $axiom_blocks_responsive_class, $attributes, $axiom_blocks_height_map ) );
}

$axiom_blocks_wrapper_style = implode(
	'; ',
	array(
		'height: ' . $axiom_blocks_height,
		'background: ' . ( $axiom_blocks_show_track ? $axiom_blocks_background_color : 'transparent' ),
		'z-index: ' . $axiom_blocks_z_index,
	)
);

$axiom_blocks_fill_style = implode(
	'; ',
	array(
		'background: ' . $axiom_blocks_color,
		'height: 100%',
		'width: 0%',
	)
);
?>

<div
	class="axiom-blocks-reading-progress-bar axiom-blocks-reading-progress-bar--<?php echo esc_attr( $axiom_blocks_position ); ?><?php echo $axiom_blocks_responsive_class ? ' ' . esc_attr( $axiom_blocks_responsive_class ) : ''; ?>"
	style="<?php echo esc_attr( $axiom_blocks_wrapper_style ); ?>"
	role="progressbar"
	aria-label="<?php echo esc_attr__( 'Reading progress', 'axiom-blocks' ); ?>"
	aria-valuemin="0"
	aria-valuemax="100"
	aria-valuenow="0"
>
	<div class="axiom-blocks-reading-progress-bar__fill" style="<?php echo esc_attr( $axiom_blocks_fill_style ); ?>"></div>
</div>
