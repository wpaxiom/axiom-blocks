<?php
/**
 * Counter Item — frontend render (single animated statistic).
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

$axiom_blocks_a = $attributes ?? array();

$axiom_blocks_start    = (float) ( $axiom_blocks_a['startValue'] ?? 0 );
$axiom_blocks_end      = (float) ( $axiom_blocks_a['endValue'] ?? 0 );
$axiom_blocks_decimals = max( 0, (int) ( $axiom_blocks_a['decimals'] ?? 0 ) );
$axiom_blocks_prefix   = (string) ( $axiom_blocks_a['prefix'] ?? '' );
$axiom_blocks_suffix   = (string) ( $axiom_blocks_a['suffix'] ?? '' );
$axiom_blocks_label    = (string) ( $axiom_blocks_a['label'] ?? '' );
$axiom_blocks_slug     = (string) ( $axiom_blocks_a['iconSlug'] ?? '' );

$axiom_blocks_separator = isset( $block->context['axiom-blocks/counterSeparator'] )
	? ! empty( $block->context['axiom-blocks/counterSeparator'] )
	: true;

$axiom_blocks_thousands_char = isset( $block->context['axiom-blocks/counterThousandsSep'] ) && '' !== $block->context['axiom-blocks/counterThousandsSep']
	? (string) $block->context['axiom-blocks/counterThousandsSep']
	: ',';
$axiom_blocks_decimal_char   = isset( $block->context['axiom-blocks/counterDecimalSep'] ) && '' !== $block->context['axiom-blocks/counterDecimalSep']
	? (string) $block->context['axiom-blocks/counterDecimalSep']
	: '.';

$axiom_blocks_thousands   = $axiom_blocks_separator ? $axiom_blocks_thousands_char : '';
$axiom_blocks_display_num = number_format( $axiom_blocks_end, $axiom_blocks_decimals, $axiom_blocks_decimal_char, $axiom_blocks_thousands );
$axiom_blocks_display     = $axiom_blocks_prefix . $axiom_blocks_display_num . $axiom_blocks_suffix;

$axiom_blocks_icon_svg = '' !== $axiom_blocks_slug ? Icons::get( $axiom_blocks_slug ) : '';

$axiom_blocks_classes = array( 'ab-counter' );
if ( ! empty( $axiom_blocks_a['className'] ) ) {
	$axiom_blocks_classes[] = $axiom_blocks_a['className'];
}
$axiom_blocks_class_attr = trim( implode( ' ', array_filter( $axiom_blocks_classes ) ) );
?>
<div class="<?php echo esc_attr( $axiom_blocks_class_attr ); ?>">
	<?php if ( '' !== $axiom_blocks_icon_svg ) : ?>
		<span class="ab-counter__icon" aria-hidden="true"><?php echo wp_kses( $axiom_blocks_icon_svg, AllowedHtml::svg() ); ?></span>
	<?php endif; ?>
	<span
		class="ab-counter__number"
		data-start="<?php echo esc_attr( (string) $axiom_blocks_start ); ?>"
		data-end="<?php echo esc_attr( (string) $axiom_blocks_end ); ?>"
		data-decimals="<?php echo esc_attr( (string) $axiom_blocks_decimals ); ?>"
		data-prefix="<?php echo esc_attr( $axiom_blocks_prefix ); ?>"
		data-suffix="<?php echo esc_attr( $axiom_blocks_suffix ); ?>"
	><?php echo esc_html( $axiom_blocks_display ); ?></span>
	<?php if ( '' !== trim( wp_strip_all_tags( $axiom_blocks_label ) ) ) : ?>
		<div class="ab-counter__label"><?php echo wp_kses_post( $axiom_blocks_label ); ?></div>
	<?php endif; ?>
</div>
