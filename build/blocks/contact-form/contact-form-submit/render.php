<?php
/**
 * Contact Form submit button - frontend render.
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
use AxiomBlocks\Forms\ContactFormRender;

$axiom_blocks_a       = $attributes ?? array();
$axiom_blocks_label   = trim( (string) ( $axiom_blocks_a['label'] ?? '' ) );
$axiom_blocks_label   = '' !== $axiom_blocks_label ? $axiom_blocks_label : __( 'Send message', 'axiom-blocks' );
$axiom_blocks_sending = trim( (string) ( $axiom_blocks_a['sendingLabel'] ?? '' ) );
$axiom_blocks_icon    = (string) ( $axiom_blocks_a['icon'] ?? '' );
$axiom_blocks_before  = 'before' === ( $axiom_blocks_a['iconPosition'] ?? 'after' );
$axiom_blocks_width   = (string) ( $axiom_blocks_a['buttonWidth'] ?? 'auto' );

$axiom_blocks_decl   = array_merge( ContactFormRender::placement_vars( $axiom_blocks_a ), ContactFormRender::vars( 'submit', $axiom_blocks_a ) );
$axiom_blocks_decl[] = '--ab-cfb-w: ' . ( ContactFormRender::BUTTON_WIDTH_MAP[ $axiom_blocks_width ] ?? 'auto' );
$axiom_blocks_align  = (string) ( $axiom_blocks_a['btnAlign'] ?? '' );
if ( isset( ContactFormRender::ALIGN_MAP[ $axiom_blocks_align ] ) ) {
	$axiom_blocks_decl[] = '--ab-cfb-align: ' . ContactFormRender::ALIGN_MAP[ $axiom_blocks_align ];
}
$axiom_blocks_style = safecss_filter_attr( Spacing::merge( implode( '; ', $axiom_blocks_decl ), $axiom_blocks_a ) );

$axiom_blocks_icon_html = '' !== $axiom_blocks_icon ? ContactFormRender::icon( $axiom_blocks_icon, 'ab-cf-button__icon' ) : '';

$axiom_blocks_classes = array( 'ab-cf-submit' );
if ( empty( $axiom_blocks_a['showSpinner'] ) && isset( $axiom_blocks_a['showSpinner'] ) ) {
	$axiom_blocks_classes[] = 'no-spinner';
}
if ( ! empty( $axiom_blocks_a['className'] ) ) {
	$axiom_blocks_classes[] = $axiom_blocks_a['className'];
}
?>
<div class="<?php echo esc_attr( implode( ' ', $axiom_blocks_classes ) ); ?>" style="<?php echo esc_attr( $axiom_blocks_style ); ?>">
	<button type="submit" class="ab-cf-button"<?php echo '' !== $axiom_blocks_sending ? ' data-ab-cf-sending="' . esc_attr( $axiom_blocks_sending ) . '"' : ''; ?>>
		<?php
		if ( $axiom_blocks_before ) {
			echo $axiom_blocks_icon_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- kses'd SVG.
		}
		?>
		<span class="ab-cf-button__label"><?php echo esc_html( $axiom_blocks_label ); ?></span>
		<?php
		if ( ! $axiom_blocks_before ) {
			echo $axiom_blocks_icon_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- kses'd SVG.
		}
		?>
		<span class="ab-cf-spinner" aria-hidden="true"></span>
	</button>
</div>
