<?php
/**
 * Icon — frontend render.
 *
 * @package AxiomBlocks
 * @var array    $attributes
 * @var string   $content
 * @var WP_Block $block
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use AxiomBlocks\Blocks\AllowedHtml;
use AxiomBlocks\Blocks\Icons;
use AxiomBlocks\Blocks\Spacing;

$axiom_blocks_a = $attributes ?? array();

$axiom_blocks_label = (string) ( $axiom_blocks_a['iconLabel'] ?? '' );

$axiom_blocks_svg = Icons::get( (string) ( $axiom_blocks_a['iconSlug'] ?? '' ) );

if ( '' === trim( $axiom_blocks_svg ) ) {
	return;
}

$axiom_blocks_align = sanitize_html_class( (string) ( $axiom_blocks_a['iconAlign'] ?? 'center' ) );
if ( ! in_array( $axiom_blocks_align, array( 'left', 'center', 'right' ), true ) ) {
	$axiom_blocks_align = 'center';
}

$axiom_blocks_shape = sanitize_html_class( (string) ( $axiom_blocks_a['shape'] ?? 'none' ) );
if ( ! in_array( $axiom_blocks_shape, array( 'none', 'circle', 'square', 'rounded' ), true ) ) {
	$axiom_blocks_shape = 'none';
}

$axiom_blocks_rotation = (int) ( $axiom_blocks_a['rotation'] ?? 0 );

/* ── Wrapper CSS custom properties + spacing ──────────────────────────────── */
$axiom_blocks_var_map     = array(
	'--ab-icon-size'    => 'iconSize',
	'--ab-icon-color'   => 'iconColor',
	'--ab-icon-color-h' => 'iconHoverColor',
	'--ab-icon-bg'      => 'bgColor',
	'--ab-icon-bg-h'    => 'bgHoverColor',
	'--ab-icon-pad'     => 'shapePadding',
	'--ab-icon-radius'  => 'shapeRadius',
	'--ab-icon-bc'      => 'borderColor',
	'--ab-icon-bw'      => 'borderWidth',
);
$axiom_blocks_style_parts = array();
foreach ( $axiom_blocks_var_map as $axiom_blocks_css_var => $axiom_blocks_attr_key ) {
	if ( ! empty( $axiom_blocks_a[ $axiom_blocks_attr_key ] ) ) {
		$axiom_blocks_style_parts[] = $axiom_blocks_css_var . ': ' . $axiom_blocks_a[ $axiom_blocks_attr_key ];
	}
}
if ( ! empty( $axiom_blocks_a['borderWidth'] ) ) {
	$axiom_blocks_style_parts[] = '--ab-icon-bs: ' . ( $axiom_blocks_a['borderStyle'] ?? 'solid' );
}
if ( 0 !== $axiom_blocks_rotation ) {
	$axiom_blocks_style_parts[] = '--ab-icon-rotate: ' . $axiom_blocks_rotation . 'deg';
}
$axiom_blocks_wrapper_style = implode( '; ', $axiom_blocks_style_parts );
$axiom_blocks_wrapper_style = Spacing::merge( $axiom_blocks_wrapper_style, $axiom_blocks_a );

/* ── Wrapper attributes (class / style / id) ──────────────────────────────── */
$axiom_blocks_classes        = array( 'ab-icon', 'ab-icon--align-' . $axiom_blocks_align );
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

/* ── Link + accessibility ─────────────────────────────────────────────────── */
$axiom_blocks_url       = (string) ( $axiom_blocks_a['url'] ?? '' );
$axiom_blocks_is_link   = '' !== $axiom_blocks_url;
$axiom_blocks_has_label = '' !== $axiom_blocks_label;

$axiom_blocks_rel_parts = array();
if ( ! empty( $axiom_blocks_a['opensInNewTab'] ) ) {
	$axiom_blocks_rel_parts[] = 'noopener';
	$axiom_blocks_rel_parts[] = 'noreferrer';
}
if ( ! empty( $axiom_blocks_a['relNoFollow'] ) ) {
	$axiom_blocks_rel_parts[] = 'nofollow';
}
if ( ! empty( $axiom_blocks_a['relSponsored'] ) ) {
	$axiom_blocks_rel_parts[] = 'sponsored';
}
$axiom_blocks_rel = implode( ' ', $axiom_blocks_rel_parts );

$axiom_blocks_box_class = 'ab-icon__box ab-icon--' . $axiom_blocks_shape;
?>
<div
	<?php echo '' !== $axiom_blocks_id_attr ? 'id="' . esc_attr( $axiom_blocks_id_attr ) . '" ' : ''; ?>
	class="<?php echo esc_attr( $axiom_blocks_class_attr ); ?>"
	<?php echo '' !== $axiom_blocks_style_attr ? ' style="' . esc_attr( $axiom_blocks_style_attr ) . '"' : ''; ?>
>
	<?php if ( $axiom_blocks_is_link ) : ?>
		<a
			href="<?php echo esc_url( $axiom_blocks_url ); ?>"
			class="<?php echo esc_attr( $axiom_blocks_box_class ); ?>"
			<?php echo ! empty( $axiom_blocks_a['opensInNewTab'] ) ? ' target="_blank"' : ''; ?>
			<?php echo '' !== $axiom_blocks_rel ? ' rel="' . esc_attr( $axiom_blocks_rel ) . '"' : ''; ?>
			<?php echo $axiom_blocks_has_label ? ' aria-label="' . esc_attr( $axiom_blocks_label ) . '"' : ''; ?>
		>
			<span class="ab-icon__glyph" aria-hidden="true"><?php echo wp_kses( $axiom_blocks_svg, AllowedHtml::svg() ); ?></span>
		</a>
	<?php elseif ( $axiom_blocks_has_label ) : ?>
		<span class="<?php echo esc_attr( $axiom_blocks_box_class ); ?>" role="img" aria-label="<?php echo esc_attr( $axiom_blocks_label ); ?>">
			<span class="ab-icon__glyph" aria-hidden="true"><?php echo wp_kses( $axiom_blocks_svg, AllowedHtml::svg() ); ?></span>
		</span>
	<?php else : ?>
		<span class="<?php echo esc_attr( $axiom_blocks_box_class ); ?>">
			<span class="ab-icon__glyph" aria-hidden="true"><?php echo wp_kses( $axiom_blocks_svg, AllowedHtml::svg() ); ?></span>
		</span>
	<?php endif; ?>
</div>
