<?php
/**
 * Notice / Alert — frontend render.
 *
 * @package AxiomBlocks
 * @var array    $attributes
 * @var string   $content
 * @var WP_Block $block
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use AxiomBlocks\Blocks\Icons;
use AxiomBlocks\Blocks\AllowedHtml;
use AxiomBlocks\Blocks\Spacing;
use AxiomBlocks\Blocks\Typography;

$axiom_blocks_a       = $attributes ?? array();
$axiom_blocks_title   = (string) ( $axiom_blocks_a['title'] ?? '' );
$axiom_blocks_message = (string) ( $axiom_blocks_a['message'] ?? '' );

if ( '' === trim( $axiom_blocks_title ) && '' === trim( $axiom_blocks_message ) ) {
	return;
}

$axiom_blocks_type_icons = array(
	'info'    => 'info',
	'success' => 'check-circle',
	'warning' => 'alert-triangle',
	'error'   => 'circle-x',
);

$axiom_blocks_type = sanitize_html_class( (string) ( $axiom_blocks_a['noticeType'] ?? 'info' ) );
if ( ! isset( $axiom_blocks_type_icons[ $axiom_blocks_type ] ) ) {
	$axiom_blocks_type = 'info';
}

$axiom_blocks_show_icon   = ! isset( $axiom_blocks_a['showIcon'] ) || ! empty( $axiom_blocks_a['showIcon'] );
$axiom_blocks_dismissible = ! empty( $axiom_blocks_a['dismissible'] );

$axiom_blocks_icon_slug = (string) ( $axiom_blocks_a['iconSlug'] ?? '' );
if ( '' === $axiom_blocks_icon_slug ) {
	$axiom_blocks_icon_slug = $axiom_blocks_type_icons[ $axiom_blocks_type ];
}
$axiom_blocks_icon_svg = $axiom_blocks_show_icon ? Icons::get( $axiom_blocks_icon_slug ) : '';

/* ── Wrapper CSS custom properties + spacing ──────────────────────────────── */
$axiom_blocks_var_map     = array(
	'--ab-notice-bg'        => 'bgColor',
	'--ab-notice-color'     => 'textColor',
	'--ab-notice-accent'    => 'accentColor',
	'--ab-notice-radius'    => 'borderRadius',
	'--ab-notice-icon'      => 'iconColor',
	'--ab-notice-icon-size' => 'iconSize',
);
$axiom_blocks_style_parts = array();
foreach ( $axiom_blocks_var_map as $axiom_blocks_css_var => $axiom_blocks_attr_key ) {
	if ( ! empty( $axiom_blocks_a[ $axiom_blocks_attr_key ] ) ) {
		$axiom_blocks_style_parts[] = $axiom_blocks_css_var . ': ' . $axiom_blocks_a[ $axiom_blocks_attr_key ];
	}
}
$axiom_blocks_wrapper_style = implode( '; ', $axiom_blocks_style_parts );
$axiom_blocks_wrapper_style = Spacing::merge( $axiom_blocks_wrapper_style, $axiom_blocks_a );

/* ── Wrapper attributes ───────────────────────────────────────────────────── */
$axiom_blocks_classes = array(
	'ab-notice',
	'ab-notice--' . $axiom_blocks_type,
	$axiom_blocks_show_icon ? 'has-icon' : 'no-icon',
);

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
$axiom_blocks_style_attr = safecss_filter_attr( implode( ';', $axiom_blocks_merged_style_parts ) );
$axiom_blocks_id_attr    = $axiom_blocks_block_supports['id'] ?? '';

$axiom_blocks_title_typo   = safecss_filter_attr( Typography::inline_style( $axiom_blocks_a, 'title' ) );
$axiom_blocks_content_typo = safecss_filter_attr( Typography::inline_style( $axiom_blocks_a, 'content' ) );
?>
<div
	<?php echo '' !== $axiom_blocks_id_attr ? 'id="' . esc_attr( $axiom_blocks_id_attr ) . '" ' : ''; ?>
	class="<?php echo esc_attr( $axiom_blocks_class_attr ); ?>"
	<?php echo '' !== $axiom_blocks_style_attr ? ' style="' . esc_attr( $axiom_blocks_style_attr ) . '"' : ''; ?>
	<?php echo $axiom_blocks_dismissible ? ' data-dismissible="1"' : ''; ?>
>
	<?php if ( '' !== $axiom_blocks_icon_svg ) : ?>
		<span class="ab-notice__icon" aria-hidden="true"><?php echo wp_kses( $axiom_blocks_icon_svg, AllowedHtml::svg() ); ?></span>
	<?php endif; ?>
	<div class="ab-notice__content">
		<?php if ( '' !== trim( $axiom_blocks_title ) ) : ?>
			<div class="ab-notice__title"<?php echo '' !== $axiom_blocks_title_typo ? ' style="' . esc_attr( $axiom_blocks_title_typo ) . '"' : ''; ?>><?php echo wp_kses_post( $axiom_blocks_title ); ?></div>
		<?php endif; ?>
		<?php if ( '' !== trim( $axiom_blocks_message ) ) : ?>
			<div class="ab-notice__message"<?php echo '' !== $axiom_blocks_content_typo ? ' style="' . esc_attr( $axiom_blocks_content_typo ) . '"' : ''; ?>><?php echo wp_kses_post( $axiom_blocks_message ); ?></div>
		<?php endif; ?>
	</div>
	<?php if ( $axiom_blocks_dismissible ) : ?>
		<button type="button" class="ab-notice__dismiss" aria-label="<?php echo esc_attr__( 'Dismiss this notice', 'axiom-blocks' ); ?>"><?php echo wp_kses( Icons::get( 'x' ), AllowedHtml::svg() ); ?></button>
	<?php endif; ?>
</div>
