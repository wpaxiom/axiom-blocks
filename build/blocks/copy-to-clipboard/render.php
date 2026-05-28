<?php
/**
 * Copy to Clipboard Block - Server-side Render
 *
 * @package AxiomBlocks
 * @var array  $attributes Block attributes.
 * @var string $content    Block content.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use AxiomBlocks\Blocks\AllowedHtml;
use AxiomBlocks\Blocks\Spacing;
use AxiomBlocks\Blocks\Typography;

$axiom_blocks_text_to_copy               = $attributes['textToCopy'] ?? '';
$axiom_blocks_button_text                = $attributes['buttonText'] ?? __( 'Copy', 'axiom-blocks' );
$axiom_blocks_success_text               = $attributes['successText'] ?? __( 'Copied!', 'axiom-blocks' );
$axiom_blocks_show_icon                  = $attributes['showIcon'] ?? true;
$axiom_blocks_icon_position              = $attributes['iconPosition'] ?? 'left';
$axiom_blocks_button_style               = $attributes['buttonStyle'] ?? 'filled';
$axiom_blocks_button_color               = $attributes['buttonColor'] ?? '#007cba';
$axiom_blocks_button_text_color          = $attributes['buttonTextColor'] ?? '#ffffff';
$axiom_blocks_axiom_blocks_border_radius = $attributes['borderRadius'] ?? '4px';
$axiom_blocks_font_size                  = $attributes['fontSize'] ?? '14px';
$axiom_blocks_copied_bg_color            = $attributes['copiedBgColor'] ?? '#00a32a';
$axiom_blocks_display_mode               = $attributes['displayMode'] ?? 'button';
$axiom_blocks_placeholder                = $attributes['placeholder'] ?? __( 'Enter text to copy...', 'axiom-blocks' );
$axiom_blocks_alignment                  = $attributes['alignment'] ?? 'left';

$axiom_blocks_btn_bg     = 'filled' === $axiom_blocks_button_style ? $axiom_blocks_button_color : 'transparent';
$axiom_blocks_btn_color  = 'filled' === $axiom_blocks_button_style ? $axiom_blocks_button_text_color : $axiom_blocks_button_color;
$axiom_blocks_btn_border = 'outline' === $axiom_blocks_button_style ? '2px solid ' . $axiom_blocks_button_color : 'none';

// Baseline first; typography panel values (when set) override.
$axiom_blocks_typo_style    = Typography::inline_style( $attributes );
$axiom_blocks_baseline_decl = array(
	'font-family: inherit',
	'font-weight: 500',
	'font-size: ' . $axiom_blocks_font_size,
);
$axiom_blocks_baseline      = implode( '; ', $axiom_blocks_baseline_decl );
if ( '' !== $axiom_blocks_typo_style ) {
	$axiom_blocks_baseline .= '; ' . $axiom_blocks_typo_style;
}

$axiom_blocks_button_inline_style = safecss_filter_attr(
	$axiom_blocks_baseline . '; ' . implode(
		'; ',
		array(
			'background-color: ' . $axiom_blocks_btn_bg,
			'color: ' . $axiom_blocks_btn_color,
			'border: ' . $axiom_blocks_btn_border,
			'border-radius: ' . $axiom_blocks_axiom_blocks_border_radius,
			'padding: 10px 20px',
			'cursor: pointer',
			'display: inline-flex',
			'align-items: center',
			'gap: 8px',
		)
	)
);

$axiom_blocks_copy_icon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
</svg>';

$axiom_blocks_input_style = safecss_filter_attr(
	'border-radius: ' . $axiom_blocks_axiom_blocks_border_radius . '; font-size: ' . $axiom_blocks_font_size
);

// Wrapper attributes — assemble id/class/style from block supports + our own values.
$axiom_blocks_spacing_style  = Spacing::inline_style( $attributes );
$axiom_blocks_block_supports = WP_Block_Supports::get_instance()->apply_block_supports();

$axiom_blocks_classes = array(
	'axiom-blocks-copy-to-clipboard',
	'axiom-blocks-copy-to-clipboard--align-' . sanitize_html_class( $axiom_blocks_alignment ),
);
if ( ! empty( $attributes['className'] ) ) {
	$axiom_blocks_classes[] = $attributes['className'];
}
if ( ! empty( $axiom_blocks_block_supports['class'] ) ) {
	$axiom_blocks_classes[] = $axiom_blocks_block_supports['class'];
}
$axiom_blocks_class_attr = trim( implode( ' ', array_filter( $axiom_blocks_classes ) ) );

$axiom_blocks_style_parts = array_filter(
	array(
		rtrim( trim( $axiom_blocks_block_supports['style'] ?? '' ), ';' ),
		rtrim( trim( $axiom_blocks_spacing_style ), ';' ),
	)
);
$axiom_blocks_style_attr  = safecss_filter_attr( implode( ';', $axiom_blocks_style_parts ) );

$axiom_blocks_id_attr = $axiom_blocks_block_supports['id'] ?? '';
?>
<div <?php echo '' !== $axiom_blocks_id_attr ? 'id="' . esc_attr( $axiom_blocks_id_attr ) . '" ' : ''; ?> class="<?php echo esc_attr( $axiom_blocks_class_attr ); ?>" <?php echo '' !== $axiom_blocks_style_attr ? ' style="' . esc_attr( $axiom_blocks_style_attr ) . '"' : ''; ?>>
	<?php if ( 'input' === $axiom_blocks_display_mode ) : ?>
		<?php $axiom_blocks_input_id = wp_unique_id( 'axiom-blocks-ctc-input-' ); ?>
		<div class="axiom-blocks-copy-to-clipboard__input-row">
			<label for="<?php echo esc_attr( $axiom_blocks_input_id ); ?>" class="screen-reader-text">
				<?php esc_html_e( 'Text to copy', 'axiom-blocks' ); ?>
			</label>
			<input
				type="text"
				id="<?php echo esc_attr( $axiom_blocks_input_id ); ?>"
				value="<?php echo esc_attr( $axiom_blocks_text_to_copy ); ?>"
				placeholder="<?php echo esc_attr( $axiom_blocks_placeholder ); ?>"
				readonly
				class="axiom-blocks-copy-to-clipboard__input"
				style="<?php echo esc_attr( $axiom_blocks_input_style ); ?>"
			/>
			<button
				class="axiom-blocks-copy-to-clipboard__button"
				data-text="<?php echo esc_attr( $axiom_blocks_text_to_copy ); ?>"
				data-success="<?php echo esc_attr( $axiom_blocks_success_text ); ?>"
				data-original="<?php echo esc_attr( $axiom_blocks_button_text ); ?>"
				data-copied-bg="<?php echo esc_attr( $axiom_blocks_copied_bg_color ); ?>"
				style="<?php echo esc_attr( $axiom_blocks_button_inline_style ); ?>"
				type="button"
			>
				<?php if ( $axiom_blocks_show_icon && 'left' === $axiom_blocks_icon_position ) : ?>
					<?php echo wp_kses( $axiom_blocks_copy_icon, AllowedHtml::svg() ); ?>
				<?php endif; ?>
				<span class="axiom-blocks-copy-to-clipboard__text"><?php echo esc_html( $axiom_blocks_button_text ); ?></span>
				<?php if ( $axiom_blocks_show_icon && 'right' === $axiom_blocks_icon_position ) : ?>
					<?php echo wp_kses( $axiom_blocks_copy_icon, AllowedHtml::svg() ); ?>
				<?php endif; ?>
			</button>
		</div>
	<?php else : ?>
		<button
			class="axiom-blocks-copy-to-clipboard__button"
			data-text="<?php echo esc_attr( $axiom_blocks_text_to_copy ); ?>"
			data-success="<?php echo esc_attr( $axiom_blocks_success_text ); ?>"
			data-original="<?php echo esc_attr( $axiom_blocks_button_text ); ?>"
			data-copied-bg="<?php echo esc_attr( $axiom_blocks_copied_bg_color ); ?>"
			style="<?php echo esc_attr( $axiom_blocks_button_inline_style ); ?>"
			type="button"
		>
			<?php if ( $axiom_blocks_show_icon && 'left' === $axiom_blocks_icon_position ) : ?>
				<?php echo wp_kses( $axiom_blocks_copy_icon, AllowedHtml::svg() ); ?>
			<?php endif; ?>
			<span class="axiom-blocks-copy-to-clipboard__text"><?php echo esc_html( $axiom_blocks_button_text ); ?></span>
			<?php if ( $axiom_blocks_show_icon && 'right' === $axiom_blocks_icon_position ) : ?>
				<?php echo wp_kses( $axiom_blocks_copy_icon, AllowedHtml::svg() ); ?>
			<?php endif; ?>
		</button>
	<?php endif; ?>
</div>
