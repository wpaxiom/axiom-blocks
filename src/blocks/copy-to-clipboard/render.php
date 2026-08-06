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

$axiom_blocks_is_outline = 'outline' === $axiom_blocks_button_style;

// Baseline first; typography panel values (when set) override. Background /
// color / border / radius / shadow are var-driven on the wrapper (below) and
// consumed by style.scss, so the button inline style carries only typography +
// layout. The transient "copied" success state is applied by assets/copy.js.
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

// Design-layer vars — consumed by style.scss on the __button (loaded in editor
// AND frontend). Mirrors getCtcVars() in index.js. The outline preset's 2px
// border is reproduced as a fallback when no per-side width is set, so old
// saved buttons render unchanged.
$axiom_blocks_btn_classes = array(
	'axiom-blocks-copy-to-clipboard__button',
	$axiom_blocks_is_outline ? 'is-outline' : 'is-filled',
);
$axiom_blocks_btn_class_attr = implode( ' ', $axiom_blocks_btn_classes );

$axiom_blocks_any_bw = ! empty( $attributes['borderTopWidth'] )
	|| ! empty( $attributes['borderRightWidth'] )
	|| ! empty( $attributes['borderBottomWidth'] )
	|| ! empty( $attributes['borderLeftWidth'] );
$axiom_blocks_bw_fallback = ( $axiom_blocks_is_outline && ! $axiom_blocks_any_bw ) ? '2px' : '';

$axiom_blocks_var_parts = array();
if ( '' !== $axiom_blocks_button_color ) {
	$axiom_blocks_var_parts[] = '--ab-ctc-bg: ' . $axiom_blocks_button_color;
}
$axiom_blocks_color_var = $axiom_blocks_is_outline ? $axiom_blocks_button_color : $axiom_blocks_button_text_color;
if ( '' !== $axiom_blocks_color_var ) {
	$axiom_blocks_var_parts[] = '--ab-ctc-color: ' . $axiom_blocks_color_var;
}
$axiom_blocks_bc = ! empty( $attributes['borderColor'] )
	? $attributes['borderColor']
	: ( $axiom_blocks_is_outline ? $axiom_blocks_button_color : '' );
if ( '' !== $axiom_blocks_bc ) {
	$axiom_blocks_var_parts[] = '--ab-ctc-bc: ' . $axiom_blocks_bc;
}
$axiom_blocks_border_style = $attributes['borderStyle'] ?? '';
if ( $axiom_blocks_any_bw || $axiom_blocks_is_outline ) {
	$axiom_blocks_var_parts[] = '--ab-ctc-bs: ' . ( '' !== $axiom_blocks_border_style ? $axiom_blocks_border_style : 'solid' );
} elseif ( '' !== $axiom_blocks_border_style ) {
	$axiom_blocks_var_parts[] = '--ab-ctc-bs: ' . $axiom_blocks_border_style;
}
$axiom_blocks_bw_map = array(
	'top'    => 'borderTopWidth',
	'right'  => 'borderRightWidth',
	'bottom' => 'borderBottomWidth',
	'left'   => 'borderLeftWidth',
);
foreach ( $axiom_blocks_bw_map as $axiom_blocks_side => $axiom_blocks_attr_key ) {
	$axiom_blocks_val = $attributes[ $axiom_blocks_attr_key ] ?? '';
	if ( '' === $axiom_blocks_val ) {
		$axiom_blocks_val = $axiom_blocks_bw_fallback;
	}
	if ( '' !== $axiom_blocks_val ) {
		$axiom_blocks_var_parts[] = '--ab-ctc-bw-' . $axiom_blocks_side . ': ' . $axiom_blocks_val;
	}
}
$axiom_blocks_radius_map = array(
	'tl' => 'radiusTopLeft',
	'tr' => 'radiusTopRight',
	'br' => 'radiusBottomRight',
	'bl' => 'radiusBottomLeft',
);
foreach ( $axiom_blocks_radius_map as $axiom_blocks_corner => $axiom_blocks_attr_key ) {
	if ( ! empty( $attributes[ $axiom_blocks_attr_key ] ) ) {
		$axiom_blocks_var_parts[] = '--ab-ctc-radius-' . $axiom_blocks_corner . ': ' . $attributes[ $axiom_blocks_attr_key ];
	}
}
if ( '' !== $axiom_blocks_axiom_blocks_border_radius ) {
	$axiom_blocks_var_parts[] = '--ab-ctc-radius: ' . $axiom_blocks_axiom_blocks_border_radius;
}
if ( ! empty( $attributes['buttonShadow'] ) ) {
	$axiom_blocks_var_parts[] = '--ab-ctc-shadow: ' . $attributes['buttonShadow'];
}

$axiom_blocks_class_attr = trim( implode( ' ', array_filter( $axiom_blocks_classes ) ) );

$axiom_blocks_style_parts = array_filter(
	array(
		rtrim( trim( $axiom_blocks_block_supports['style'] ?? '' ), ';' ),
		rtrim( trim( $axiom_blocks_spacing_style ), ';' ),
	)
);
$axiom_blocks_style_parts = array_merge( $axiom_blocks_style_parts, $axiom_blocks_var_parts );
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
				class="<?php echo esc_attr( $axiom_blocks_btn_class_attr ); ?>"
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
			class="<?php echo esc_attr( $axiom_blocks_btn_class_attr ); ?>"
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
