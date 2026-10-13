<?php
/**
 * Grid Item frontend wrapper.
 *
 * @package AxiomBlocks
 * @var array  $attributes
 * @var string $content
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use AxiomBlocks\Blocks\Spacing;

$axiom_blocks_a         = $attributes ?? array();
$axiom_blocks_col_start = max( 0, (int) ( $axiom_blocks_a['columnStart'] ?? 0 ) );
$axiom_blocks_col_span  = max( 1, min( 24, (int) ( $axiom_blocks_a['columnSpan'] ?? 1 ) ) );
$axiom_blocks_row_start = max( 0, (int) ( $axiom_blocks_a['rowStart'] ?? 0 ) );
$axiom_blocks_row_span  = max( 1, min( 24, (int) ( $axiom_blocks_a['rowSpan'] ?? 1 ) ) );

$axiom_blocks_vars       = array(
	'--ab-gi-col'   => ( $axiom_blocks_col_start ? $axiom_blocks_col_start . ' / ' : '' ) . 'span ' . $axiom_blocks_col_span,
	'--ab-gi-row'   => ( $axiom_blocks_row_start ? $axiom_blocks_row_start . ' / ' : '' ) . 'span ' . $axiom_blocks_row_span,
	'--ab-gi-order' => (int) ( $axiom_blocks_a['itemOrder'] ?? 0 ),
);
$axiom_blocks_self_align = array( 'auto', 'stretch', 'start', 'center', 'end' );
foreach ( array(
	'--ab-gi-js' => 'justifySelf',
	'--ab-gi-as' => 'alignSelf',
) as $axiom_blocks_var => $axiom_blocks_key ) {
	if ( in_array( $axiom_blocks_a[ $axiom_blocks_key ] ?? '', $axiom_blocks_self_align, true ) ) {
		$axiom_blocks_vars[ $axiom_blocks_var ] = $axiom_blocks_a[ $axiom_blocks_key ];
	}
}
foreach ( array(
	'--ab-gi-minh'   => 'minHeight',
	'--ab-gi-bg'     => 'backgroundColor',
	'--ab-gi-bs'     => 'borderStyle',
	'--ab-gi-bc'     => 'borderColor',
	'--ab-gi-bw-t'   => 'borderTopWidth',
	'--ab-gi-bw-r'   => 'borderRightWidth',
	'--ab-gi-bw-b'   => 'borderBottomWidth',
	'--ab-gi-bw-l'   => 'borderLeftWidth',
	'--ab-gi-r-tl'   => 'radiusTopLeft',
	'--ab-gi-r-tr'   => 'radiusTopRight',
	'--ab-gi-r-br'   => 'radiusBottomRight',
	'--ab-gi-r-bl'   => 'radiusBottomLeft',
	'--ab-gi-shadow' => 'itemShadow',
) as $axiom_blocks_var => $axiom_blocks_key ) {
	if ( '' !== (string) ( $axiom_blocks_a[ $axiom_blocks_key ] ?? '' ) ) {
		$axiom_blocks_vars[ $axiom_blocks_var ] = $axiom_blocks_a[ $axiom_blocks_key ];
	}
}

$axiom_blocks_style    = implode( '; ', array_map( static fn( $key, $value ) => $key . ': ' . $value, array_keys( $axiom_blocks_vars ), $axiom_blocks_vars ) );
$axiom_blocks_style    = safecss_filter_attr( Spacing::merge( $axiom_blocks_style, $axiom_blocks_a ) );
$axiom_blocks_supports = WP_Block_Supports::get_instance()->apply_block_supports();
$axiom_blocks_classes  = trim( 'ab-grid-item ' . ( $axiom_blocks_a['className'] ?? '' ) . ' ' . ( $axiom_blocks_supports['class'] ?? '' ) );
$axiom_blocks_style    = safecss_filter_attr( implode( ';', array_filter( array( $axiom_blocks_supports['style'] ?? '', $axiom_blocks_style ) ) ) );

return sprintf(
	'<div %1$sclass="%2$s"%3$s>%4$s</div>',
	! empty( $axiom_blocks_supports['id'] ) ? 'id="' . esc_attr( $axiom_blocks_supports['id'] ) . '" ' : '',
	esc_attr( $axiom_blocks_classes ),
	'' !== $axiom_blocks_style ? ' style="' . esc_attr( $axiom_blocks_style ) . '"' : '',
	$content
);
