<?php
/**
 * Advanced Heading — frontend render.
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
use AxiomBlocks\Blocks\Typography;

$axiom_blocks_a = $attributes ?? array();

$axiom_blocks_allowed_tags = array( 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div' );

$axiom_blocks_tag = strtolower( (string) ( $axiom_blocks_a['tagName'] ?? 'h2' ) );
if ( ! in_array( $axiom_blocks_tag, $axiom_blocks_allowed_tags, true ) ) {
	$axiom_blocks_tag = 'h2';
}

$axiom_blocks_sub_enabled = ! empty( $axiom_blocks_a['subEnabled'] );
$axiom_blocks_sub_text    = (string) ( $axiom_blocks_a['subText'] ?? '' );
$axiom_blocks_sub_tag     = strtolower( (string) ( $axiom_blocks_a['subTag'] ?? 'p' ) );
if ( ! in_array( $axiom_blocks_sub_tag, $axiom_blocks_allowed_tags, true ) ) {
	$axiom_blocks_sub_tag = 'p';
}
$axiom_blocks_sub_above = 'above' === ( $axiom_blocks_a['subPosition'] ?? 'below' );

$axiom_blocks_heading_text = (string) ( $axiom_blocks_a['headingText'] ?? '' );

$axiom_blocks_accent_enabled = ! empty( $axiom_blocks_a['accentEnabled'] );
$axiom_blocks_accent_above   = 'above' === ( $axiom_blocks_a['accentPosition'] ?? 'below' );
$axiom_blocks_accent_align   = sanitize_html_class( (string) ( $axiom_blocks_a['accentAlign'] ?? 'left' ) );

/* ── Wrapper CSS custom properties (highlight, link, accent) + spacing ─────── */
$axiom_blocks_var_map     = array(
	'--ab-ah-hl-color'     => 'highlightColor',
	'--ab-ah-hl-bg'        => 'highlightBg',
	'--ab-ah-hl-radius'    => 'highlightRadius',
	'--ab-ah-link'         => 'linkColor',
	'--ab-ah-link-h'       => 'linkHoverColor',
	'--ab-ah-accent-color' => 'accentColor',
	'--ab-ah-accent-w'     => 'accentWidth',
	'--ab-ah-accent-h'     => 'accentThickness',
	'--ab-ah-sub-gap'      => 'headingSubGap',
	'--ab-ah-maxw'         => 'headingMaxWidth',
);
$axiom_blocks_style_parts = array();
foreach ( $axiom_blocks_var_map as $axiom_blocks_css_var => $axiom_blocks_attr_key ) {
	if ( ! empty( $axiom_blocks_a[ $axiom_blocks_attr_key ] ) ) {
		$axiom_blocks_style_parts[] = $axiom_blocks_css_var . ': ' . $axiom_blocks_a[ $axiom_blocks_attr_key ];
	}
}
$axiom_blocks_wrapper_style = implode( '; ', $axiom_blocks_style_parts );
$axiom_blocks_wrapper_style = Spacing::merge( $axiom_blocks_wrapper_style, $axiom_blocks_a );

/* ── Per-element styles (color + typography) ─────────────────────────────── */
$axiom_blocks_heading_style = ! empty( $axiom_blocks_a['headingColor'] )
	? 'color: ' . $axiom_blocks_a['headingColor']
	: '';
$axiom_blocks_heading_style = Typography::merge( $axiom_blocks_heading_style, $axiom_blocks_a, 'heading' );

$axiom_blocks_sub_style = ! empty( $axiom_blocks_a['subColor'] )
	? 'color: ' . $axiom_blocks_a['subColor']
	: '';
$axiom_blocks_sub_style = Typography::merge( $axiom_blocks_sub_style, $axiom_blocks_a, 'sub' );

/* ── Wrapper attributes (class / style / id / align) ──────────────────────── */
$axiom_blocks_classes        = array( 'ab-ah' );
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
$axiom_blocks_style_attr         = safecss_filter_attr( implode( ';', $axiom_blocks_merged_style_parts ) );

$axiom_blocks_id_attr            = $axiom_blocks_block_supports['id'] ?? '';
$axiom_blocks_heading_style_attr = safecss_filter_attr( $axiom_blocks_heading_style );
$axiom_blocks_sub_style_attr     = safecss_filter_attr( $axiom_blocks_sub_style );

$axiom_blocks_accent_class = 'ab-ah__accent is-accent-' . ( '' !== $axiom_blocks_accent_align ? $axiom_blocks_accent_align : 'left' );

if ( '' === trim( wp_strip_all_tags( $axiom_blocks_heading_text ) ) && ! $axiom_blocks_sub_enabled ) {
	return;
}
?>
<div
	<?php echo '' !== $axiom_blocks_id_attr ? 'id="' . esc_attr( $axiom_blocks_id_attr ) . '" ' : ''; ?>
	class="<?php echo esc_attr( $axiom_blocks_class_attr ); ?>"
	<?php echo '' !== $axiom_blocks_style_attr ? ' style="' . esc_attr( $axiom_blocks_style_attr ) . '"' : ''; ?>
>
	<?php if ( $axiom_blocks_sub_enabled && '' !== $axiom_blocks_sub_text && $axiom_blocks_sub_above ) : ?>
		<<?php echo esc_attr( $axiom_blocks_sub_tag ); ?> class="ab-ah__sub ab-ah__sub--above"<?php echo '' !== $axiom_blocks_sub_style_attr ? ' style="' . esc_attr( $axiom_blocks_sub_style_attr ) . '"' : ''; ?>><?php echo wp_kses_post( $axiom_blocks_sub_text ); ?></<?php echo esc_attr( $axiom_blocks_sub_tag ); ?>>
	<?php endif; ?>

	<?php if ( $axiom_blocks_accent_enabled && $axiom_blocks_accent_above ) : ?>
		<span class="<?php echo esc_attr( $axiom_blocks_accent_class ); ?>" aria-hidden="true"></span>
	<?php endif; ?>

	<<?php echo esc_attr( $axiom_blocks_tag ); ?> class="ab-ah__heading"<?php echo '' !== $axiom_blocks_heading_style_attr ? ' style="' . esc_attr( $axiom_blocks_heading_style_attr ) . '"' : ''; ?>><?php echo wp_kses_post( $axiom_blocks_heading_text ); ?></<?php echo esc_attr( $axiom_blocks_tag ); ?>>

	<?php if ( $axiom_blocks_accent_enabled && ! $axiom_blocks_accent_above ) : ?>
		<span class="<?php echo esc_attr( $axiom_blocks_accent_class ); ?>" aria-hidden="true"></span>
	<?php endif; ?>

	<?php if ( $axiom_blocks_sub_enabled && '' !== $axiom_blocks_sub_text && ! $axiom_blocks_sub_above ) : ?>
		<<?php echo esc_attr( $axiom_blocks_sub_tag ); ?> class="ab-ah__sub ab-ah__sub--below"<?php echo '' !== $axiom_blocks_sub_style_attr ? ' style="' . esc_attr( $axiom_blocks_sub_style_attr ) . '"' : ''; ?>><?php echo wp_kses_post( $axiom_blocks_sub_text ); ?></<?php echo esc_attr( $axiom_blocks_sub_tag ); ?>>
	<?php endif; ?>
</div>
