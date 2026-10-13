<?php
/**
 * CSS Grid frontend wrapper.
 *
 * @package AxiomBlocks
 * @var array  $attributes
 * @var string $content
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use AxiomBlocks\Blocks\Spacing;

$axiom_blocks_a = $attributes ?? array();

$axiom_blocks_safe_track_list = static function ( $value ): string {
	$value = preg_replace( '/\s+/', ' ', trim( (string) $value ) );
	if ( '' === $value ) {
		return '';
	}
	if ( preg_match( '/^repeat\(\d{1,2},\s*minmax\(0,\s*1fr\)\)$/i', $value )
		|| preg_match( '/^repeat\((?:auto-fit|auto-fill),\s*minmax\((?:\d+(?:\.\d+)?|\.\d+)(?:px|rem|em|%|vw|vh),\s*1fr\)\)$/i', $value ) ) {
		return $value;
	}
	$tokens = explode( ' ', $value );
	if ( count( $tokens ) > 12 ) {
		return '';
	}
	foreach ( $tokens as $token ) {
		if ( ! preg_match( '/^(?:0|(?:\d+(?:\.\d+)?|\.\d+)(?:fr|px|rem|em|%|vw|vh)|auto|min-content|max-content)$/i', $token ) ) {
			return '';
		}
	}
	return $value;
};

$axiom_blocks_safe_token = static function ( $value, string $fallback = 'auto' ): string {
	$value = trim( (string) $value );
	return preg_match( '/^(?:0|(?:\d+(?:\.\d+)?|\.\d+)(?:fr|px|rem|em|%|vw|vh)|auto|min-content|max-content)$/i', $value ) ? $value : $fallback;
};

$axiom_blocks_safe_length = static function ( $value, string $fallback = '240px' ): string {
	$value = trim( (string) $value );
	return preg_match( '/^(?:\d+(?:\.\d+)?|\.\d+)(?:px|rem|em|%|vw|vh)$/i', $value ) ? $value : $fallback;
};

$axiom_blocks_mode = in_array( $axiom_blocks_a['layoutMode'] ?? '', array( 'equal', 'auto-fit', 'custom' ), true ) ? $axiom_blocks_a['layoutMode'] : 'equal';
if ( 'custom' === $axiom_blocks_mode ) {
	$axiom_blocks_columns = $axiom_blocks_safe_track_list( $axiom_blocks_a['columnTemplate'] ?? '' );
} elseif ( 'auto-fit' === $axiom_blocks_mode ) {
	$axiom_blocks_columns = 'repeat(auto-fit, minmax(' . $axiom_blocks_safe_length( $axiom_blocks_a['minColumnWidth'] ?? '240px' ) . ', 1fr))';
} else {
	$axiom_blocks_count   = max( 1, min( 12, (int) ( $axiom_blocks_a['columns'] ?? 3 ) ) );
	$axiom_blocks_columns = 'repeat(' . $axiom_blocks_count . ', minmax(0, 1fr))';
}
if ( '' === $axiom_blocks_columns ) {
	$axiom_blocks_columns = 'repeat(3, minmax(0, 1fr))';
}

$axiom_blocks_flow = in_array( $axiom_blocks_a['autoFlow'] ?? '', array( 'row', 'column' ), true ) ? $axiom_blocks_a['autoFlow'] : 'row';

$axiom_blocks_rows          = $axiom_blocks_safe_track_list( $axiom_blocks_a['rowTemplate'] ?? '' );
$axiom_blocks_vars          = array(
	'--ab-cg-cols'      => $axiom_blocks_columns,
	'--ab-cg-rows'      => '' !== $axiom_blocks_rows ? $axiom_blocks_rows : 'none',
	'--ab-cg-auto-cols' => $axiom_blocks_safe_token( $axiom_blocks_a['autoColumns'] ?? 'auto' ),
	'--ab-cg-auto-rows' => $axiom_blocks_safe_token( $axiom_blocks_a['autoRows'] ?? 'auto' ),
	'--ab-cg-flow'      => $axiom_blocks_flow,
);
$axiom_blocks_items_align   = array( 'stretch', 'start', 'center', 'end' );
$axiom_blocks_content_align = array( 'normal', 'start', 'center', 'end', 'space-between', 'space-around', 'space-evenly' );
foreach ( array(
	'--ab-cg-ji' => array( 'justifyItems', $axiom_blocks_items_align ),
	'--ab-cg-ai' => array( 'alignItems', $axiom_blocks_items_align ),
	'--ab-cg-jc' => array( 'justifyContent', $axiom_blocks_content_align ),
	'--ab-cg-ac' => array( 'alignContent', $axiom_blocks_content_align ),
) as $axiom_blocks_var => list( $axiom_blocks_key, $axiom_blocks_allowed ) ) {
	if ( in_array( $axiom_blocks_a[ $axiom_blocks_key ] ?? '', $axiom_blocks_allowed, true ) ) {
		$axiom_blocks_vars[ $axiom_blocks_var ] = $axiom_blocks_a[ $axiom_blocks_key ];
	}
}
foreach ( array(
	'--ab-cg-cg'     => 'columnGap',
	'--ab-cg-rg'     => 'rowGap',
	'--ab-cg-bg'     => 'backgroundColor',
	'--ab-cg-bs'     => 'borderStyle',
	'--ab-cg-bc'     => 'borderColor',
	'--ab-cg-bw-t'   => 'borderTopWidth',
	'--ab-cg-bw-r'   => 'borderRightWidth',
	'--ab-cg-bw-b'   => 'borderBottomWidth',
	'--ab-cg-bw-l'   => 'borderLeftWidth',
	'--ab-cg-r-tl'   => 'radiusTopLeft',
	'--ab-cg-r-tr'   => 'radiusTopRight',
	'--ab-cg-r-br'   => 'radiusBottomRight',
	'--ab-cg-r-bl'   => 'radiusBottomLeft',
	'--ab-cg-shadow' => 'gridShadow',
) as $axiom_blocks_var => $axiom_blocks_key ) {
	if ( '' !== (string) ( $axiom_blocks_a[ $axiom_blocks_key ] ?? '' ) ) {
		$axiom_blocks_vars[ $axiom_blocks_var ] = $axiom_blocks_a[ $axiom_blocks_key ];
	}
}

$axiom_blocks_style = implode( '; ', array_map( static fn( $key, $value ) => $key . ': ' . $value, array_keys( $axiom_blocks_vars ), $axiom_blocks_vars ) );
$axiom_blocks_style = safecss_filter_attr( Spacing::merge( $axiom_blocks_style, $axiom_blocks_a ) );
// A device with exactly one column stacks every item full width, so a span set
// for a wider device cannot open implicit columns. Tablet/Mobile inherit the
// next larger device, matching the responsive registry.
$axiom_blocks_track_count = static function ( string $template ): int {
	if ( preg_match( '/^repeat\((\d+),/i', $template, $axiom_blocks_m ) ) {
		return (int) $axiom_blocks_m[1];
	}
	if ( 0 === stripos( $template, 'repeat(' ) || '' === $template ) {
		return 0;
	}
	return count( explode( ' ', $template ) );
};
$axiom_blocks_tablet_cols = $axiom_blocks_safe_track_list( $axiom_blocks_a['columnTemplateTablet'] ?? '' );
$axiom_blocks_tablet_cols = '' !== $axiom_blocks_tablet_cols ? $axiom_blocks_tablet_cols : $axiom_blocks_columns;
$axiom_blocks_mobile_cols = $axiom_blocks_safe_track_list( $axiom_blocks_a['columnTemplateMobile'] ?? '' );
$axiom_blocks_mobile_cols = '' !== $axiom_blocks_mobile_cols ? $axiom_blocks_mobile_cols : $axiom_blocks_tablet_cols;
$axiom_blocks_stack       = '';
foreach ( array(
	'desktop' => $axiom_blocks_columns,
	'tablet'  => $axiom_blocks_tablet_cols,
	'mobile'  => $axiom_blocks_mobile_cols,
) as $axiom_blocks_device => $axiom_blocks_template ) {
	if ( 1 === $axiom_blocks_track_count( $axiom_blocks_template ) ) {
		$axiom_blocks_stack .= 'is-stacked-' . $axiom_blocks_device . ' ';
	}
}

$axiom_blocks_supports = WP_Block_Supports::get_instance()->apply_block_supports();
$axiom_blocks_classes  = trim( 'ab-css-grid ' . ( ! empty( $axiom_blocks_a['dense'] ) ? 'is-dense ' : '' ) . $axiom_blocks_stack . ( $axiom_blocks_a['className'] ?? '' ) . ' ' . ( $axiom_blocks_supports['class'] ?? '' ) );
$axiom_blocks_style    = safecss_filter_attr( implode( ';', array_filter( array( $axiom_blocks_supports['style'] ?? '', $axiom_blocks_style ) ) ) );

return sprintf(
	'<div %1$sclass="%2$s"%3$s>%4$s</div>',
	! empty( $axiom_blocks_supports['id'] ) ? 'id="' . esc_attr( $axiom_blocks_supports['id'] ) . '" ' : '',
	esc_attr( $axiom_blocks_classes ),
	'' !== $axiom_blocks_style ? ' style="' . esc_attr( $axiom_blocks_style ) . '"' : '',
	$content
);
