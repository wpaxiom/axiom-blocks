<?php
/**
 * Free Shipping Progress — frontend render.
 *
 * @package AxiomBlocks
 * @var array    $attributes Block attributes.
 * @var string   $content    Inner content (none).
 * @var WP_Block $block      Block instance.
 */

declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/helper.php';

use AxiomBlocks\Blocks\AllowedHtml;
use AxiomBlocks\Blocks\FreeShippingProgress\Helper;
use AxiomBlocks\Blocks\Spacing;

// Match the REST endpoint: make sure the WC cart is available for the first
// server-rendered snapshot, including non-cart pages.
if ( function_exists( 'wc_load_cart' ) && ( ! function_exists( 'WC' ) || ! WC()->cart ) ) {
	wc_load_cart();
}

$axiom_blocks_attrs    = $attributes ?? array();
$axiom_blocks_snapshot = Helper::snapshot( $axiom_blocks_attrs );

if ( ! Helper::should_render( $axiom_blocks_attrs, $axiom_blocks_snapshot ) ) {
	return '';
}

$axiom_blocks_bar_color                  = $axiom_blocks_attrs['barColor'] ?? '#7C3AED';
$axiom_blocks_bar_bg                     = $axiom_blocks_attrs['barBackground'] ?? '#f3f4f6';
$axiom_blocks_qualified_color            = $axiom_blocks_attrs['qualifiedColor'] ?? '#10b981';
$axiom_blocks_bar_height                 = (int) ( $axiom_blocks_attrs['barHeight'] ?? 8 );
$axiom_blocks_axiom_blocks_border_radius = (int) ( $axiom_blocks_attrs['borderRadius'] ?? 999 );
$axiom_blocks_text_align                 = $axiom_blocks_attrs['textAlign'] ?? 'center';

$axiom_blocks_classes = array(
	'axiom-blocks-fsp',
	'is-align-' . sanitize_html_class( $axiom_blocks_text_align ),
);
if ( $axiom_blocks_snapshot['qualified'] ) {
	$axiom_blocks_classes[] = 'is-qualified';
}

$axiom_blocks_style_parts  = array(
	'--ab-fsp-bar-color: ' . $axiom_blocks_bar_color,
	'--ab-fsp-bar-bg: ' . $axiom_blocks_bar_bg,
	'--ab-fsp-qualified-color: ' . $axiom_blocks_qualified_color,
	'--ab-fsp-bar-height: ' . $axiom_blocks_bar_height . 'px',
	'--ab-fsp-radius: ' . $axiom_blocks_axiom_blocks_border_radius . 'px',
);
$axiom_blocks_inline_style = Spacing::merge( implode( '; ', $axiom_blocks_style_parts ), $axiom_blocks_attrs );

$axiom_blocks_block_supports = WP_Block_Supports::get_instance()->apply_block_supports();

if ( ! empty( $axiom_blocks_attrs['className'] ) ) {
	$axiom_blocks_classes[] = $axiom_blocks_attrs['className'];
}
if ( ! empty( $axiom_blocks_block_supports['class'] ) ) {
	$axiom_blocks_classes[] = $axiom_blocks_block_supports['class'];
}
$axiom_blocks_class_attr = trim( implode( ' ', array_filter( $axiom_blocks_classes ) ) );

$axiom_blocks_merged_style_parts = array_filter(
	array(
		rtrim( trim( $axiom_blocks_block_supports['style'] ?? '' ), ';' ),
		rtrim( trim( $axiom_blocks_inline_style ), ';' ),
	)
);
$axiom_blocks_style_attr         = safecss_filter_attr( implode( ';', $axiom_blocks_merged_style_parts ) );

$axiom_blocks_id_attr = $axiom_blocks_block_supports['id'] ?? '';

$axiom_blocks_data_threshold_mode    = (string) ( $axiom_blocks_attrs['thresholdMode'] ?? 'auto' );
$axiom_blocks_data_custom_threshold  = (string) ( $axiom_blocks_attrs['customThreshold'] ?? 0 );
$axiom_blocks_data_message_before    = (string) ( $axiom_blocks_attrs['messageBefore'] ?? '' );
$axiom_blocks_data_message_qualified = (string) ( $axiom_blocks_attrs['messageQualified'] ?? '' );
$axiom_blocks_data_hide_empty        = ! empty( $axiom_blocks_attrs['hideWhenEmpty'] ) ? '1' : '0';
$axiom_blocks_data_hide_qualified    = ! empty( $axiom_blocks_attrs['hideWhenQualified'] ) ? '1' : '0';

$axiom_blocks_fill_width = number_format( $axiom_blocks_snapshot['percent'], 2, '.', '' );
?>
<div
	<?php echo '' !== $axiom_blocks_id_attr ? 'id="' . esc_attr( $axiom_blocks_id_attr ) . '" ' : ''; ?>
	class="<?php echo esc_attr( $axiom_blocks_class_attr ); ?>"
	<?php echo '' !== $axiom_blocks_style_attr ? ' style="' . esc_attr( $axiom_blocks_style_attr ) . '"' : ''; ?>
	data-ab-fsp="1"
	data-threshold-mode="<?php echo esc_attr( $axiom_blocks_data_threshold_mode ); ?>"
	data-custom-threshold="<?php echo esc_attr( $axiom_blocks_data_custom_threshold ); ?>"
	data-message-before="<?php echo esc_attr( $axiom_blocks_data_message_before ); ?>"
	data-message-qualified="<?php echo esc_attr( $axiom_blocks_data_message_qualified ); ?>"
	data-hide-empty="<?php echo esc_attr( $axiom_blocks_data_hide_empty ); ?>"
	data-hide-qualified="<?php echo esc_attr( $axiom_blocks_data_hide_qualified ); ?>"
>
	<p class="axiom-blocks-fsp__msg" data-ab-fsp-msg><?php echo wp_kses( $axiom_blocks_snapshot['message_html'], AllowedHtml::wc_message() ); ?></p>
	<div class="axiom-blocks-fsp__track">
		<div
			class="axiom-blocks-fsp__fill"
			data-ab-fsp-fill
			style="width: <?php echo esc_attr( $axiom_blocks_fill_width ); ?>%"
		></div>
	</div>
</div>
