<?php
/**
 * Post Read More — frontend render.
 *
 * A link to the full post. Ships unstyled (plain link) so an author who never
 * opens the Styles tab gets something reasonable; every button look is built
 * from the Styles rows rather than a preset.
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
use AxiomBlocks\Blocks\Typography;

$axiom_blocks_a       = $attributes ?? array();
$axiom_blocks_post_id = (int) ( $block->context['postId'] ?? 0 );
if ( ! $axiom_blocks_post_id ) {
	$axiom_blocks_post_id = (int) get_the_ID();
}
if ( ! $axiom_blocks_post_id ) {
	return;
}

$axiom_blocks_label = (string) ( $axiom_blocks_a['label'] ?? '' );
if ( '' === trim( $axiom_blocks_label ) ) {
	$axiom_blocks_label = __( 'Read more', 'axiom-blocks' );
}

/* ── Styles ───────────────────────────────────────────────────────────────── */
$axiom_blocks_style_parts = array();
foreach ( array(
	'--ab-pc-btn-color'    => 'btnColor',
	'--ab-pc-btn-color-h'  => 'btnColorHover',
	'--ab-pc-btn-bg'       => 'btnBg',
	'--ab-pc-btn-bg-h'     => 'btnBgHover',
	'--ab-pc-btn-bc'       => 'btnBorderColor',
	'--ab-pc-btn-bc-h'     => 'btnBorderColorHover',
	'--ab-pc-btn-shadow'   => 'btnShadow',
	'--ab-pc-btn-shadow-h' => 'btnShadowHover',
	'--ab-pc-btn-icon-gap' => 'iconGap',
) as $axiom_blocks_css_var => $axiom_blocks_attr_key ) {
	if ( ! empty( $axiom_blocks_a[ $axiom_blocks_attr_key ] ) ) {
		$axiom_blocks_style_parts[] = $axiom_blocks_css_var . ': ' . $axiom_blocks_a[ $axiom_blocks_attr_key ];
	}
}

$axiom_blocks_any_bw = false;
foreach ( array(
	'top'    => 'btnBorderTopWidth',
	'right'  => 'btnBorderRightWidth',
	'bottom' => 'btnBorderBottomWidth',
	'left'   => 'btnBorderLeftWidth',
) as $axiom_blocks_side => $axiom_blocks_attr_key ) {
	if ( ! empty( $axiom_blocks_a[ $axiom_blocks_attr_key ] ) ) {
		$axiom_blocks_any_bw        = true;
		$axiom_blocks_style_parts[] = '--ab-pc-btn-bw-' . $axiom_blocks_side . ': ' . $axiom_blocks_a[ $axiom_blocks_attr_key ];
	}
}
$axiom_blocks_border_style = (string) ( $axiom_blocks_a['btnBorderStyle'] ?? '' );
if ( $axiom_blocks_any_bw ) {
	$axiom_blocks_style_parts[] = '--ab-pc-btn-bs: ' . ( '' !== $axiom_blocks_border_style ? $axiom_blocks_border_style : 'solid' );
} elseif ( '' !== $axiom_blocks_border_style ) {
	$axiom_blocks_style_parts[] = '--ab-pc-btn-bs: ' . $axiom_blocks_border_style;
}

foreach ( array(
	'tl' => 'btnRadiusTopLeft',
	'tr' => 'btnRadiusTopRight',
	'br' => 'btnRadiusBottomRight',
	'bl' => 'btnRadiusBottomLeft',
) as $axiom_blocks_corner => $axiom_blocks_attr_key ) {
	if ( ! empty( $axiom_blocks_a[ $axiom_blocks_attr_key ] ) ) {
		$axiom_blocks_style_parts[] = '--ab-pc-btn-radius-' . $axiom_blocks_corner . ': ' . $axiom_blocks_a[ $axiom_blocks_attr_key ];
	}
}

foreach ( array(
	'pt' => 'btnPaddingTop',
	'pr' => 'btnPaddingRight',
	'pb' => 'btnPaddingBottom',
	'pl' => 'btnPaddingLeft',
) as $axiom_blocks_edge => $axiom_blocks_attr_key ) {
	if ( ! empty( $axiom_blocks_a[ $axiom_blocks_attr_key ] ) ) {
		$axiom_blocks_style_parts[] = '--ab-pc-btn-' . $axiom_blocks_edge . ': ' . $axiom_blocks_a[ $axiom_blocks_attr_key ];
	}
}

$axiom_blocks_typo = Typography::inline_style( $axiom_blocks_a, '' );
if ( '' !== $axiom_blocks_typo ) {
	$axiom_blocks_style_parts[] = rtrim( $axiom_blocks_typo, ';' );
}

$axiom_blocks_align = (string) ( $axiom_blocks_a['btnAlign'] ?? '' );
if ( in_array( $axiom_blocks_align, array( 'left', 'center', 'right' ), true ) ) {
	$axiom_blocks_map           = array(
		'left'   => 'flex-start',
		'center' => 'center',
		'right'  => 'flex-end',
	);
	$axiom_blocks_style_parts[] = '--ab-pc-btn-justify: ' . $axiom_blocks_map[ $axiom_blocks_align ];
}

$axiom_blocks_wrapper_style = Spacing::merge( implode( '; ', $axiom_blocks_style_parts ), $axiom_blocks_a );
$axiom_blocks_style_attr    = safecss_filter_attr( $axiom_blocks_wrapper_style );

$axiom_blocks_classes = array( 'ab-pc__more' );
if ( ! empty( $axiom_blocks_a['fullWidth'] ) ) {
	$axiom_blocks_classes[] = 'is-full';
}
if ( ! empty( $axiom_blocks_a['className'] ) ) {
	$axiom_blocks_classes[] = $axiom_blocks_a['className'];
}
$axiom_blocks_class_attr = trim( implode( ' ', array_filter( $axiom_blocks_classes ) ) );

/* ── Markup ───────────────────────────────────────────────────────────────── */
$axiom_blocks_icon = '';
if ( ! empty( $axiom_blocks_a['showIcon'] ) ) {
	$axiom_blocks_icon = '<span class="ab-pc__more-icon" aria-hidden="true">'
		. wp_kses( Icons::get( 'arrow-right' ), AllowedHtml::svg() )
		. '</span>';
}
$axiom_blocks_left  = 'left' === ( $axiom_blocks_a['iconPosition'] ?? 'right' ) ? $axiom_blocks_icon : '';
$axiom_blocks_right = 'left' === ( $axiom_blocks_a['iconPosition'] ?? 'right' ) ? '' : $axiom_blocks_icon;

$axiom_blocks_target = '_blank' === ( $axiom_blocks_a['linkTarget'] ?? '' ) ? '_blank' : '';

// Built here, not inline, so the attribute carries no stray newlines, and so
// screen readers get "Read more: <post title>" rather than a page full of
// identical "Read more" links.
$axiom_blocks_aria = sprintf(
	/* translators: 1: link label, for example "Read more". 2: post title. */
	__( '%1$s: %2$s', 'axiom-blocks' ),
	$axiom_blocks_label,
	wp_strip_all_tags( get_the_title( $axiom_blocks_post_id ) )
);
?>
<div
	class="<?php echo esc_attr( $axiom_blocks_class_attr ); ?>"
	<?php echo '' !== $axiom_blocks_style_attr ? ' style="' . esc_attr( $axiom_blocks_style_attr ) . '"' : ''; ?>
>
	<a
		class="ab-pc__more-link"
		href="<?php echo esc_url( get_permalink( $axiom_blocks_post_id ) ); ?>"
		<?php echo '' !== $axiom_blocks_target ? ' target="_blank" rel="noopener noreferrer"' : ''; ?>
		aria-label="<?php echo esc_attr( $axiom_blocks_aria ); ?>"
	>
		<?php echo $axiom_blocks_left; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- wp_kses'd SVG built above. ?>
		<span class="ab-pc__more-text"><?php echo esc_html( $axiom_blocks_label ); ?></span>
		<?php echo $axiom_blocks_right; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- wp_kses'd SVG built above. ?>
	</a>
</div>
