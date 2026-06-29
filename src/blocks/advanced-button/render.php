<?php
/**
 * Advanced Button — frontend render.
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
use AxiomBlocks\Blocks\Responsive;
use AxiomBlocks\Frontend\ResponsiveStyles;

$axiom_blocks_a = $attributes ?? array();

$axiom_blocks_text             = (string) ( $axiom_blocks_a['text'] ?? '' );
$axiom_blocks_sub_caption      = (string) ( $axiom_blocks_a['subCaption'] ?? '' );
$axiom_blocks_show_sub_caption = ! empty( $axiom_blocks_a['showSubCaption'] );
$axiom_blocks_url              = (string) ( $axiom_blocks_a['url'] ?? '' );
$axiom_blocks_new_tab          = ! empty( $axiom_blocks_a['opensInNewTab'] );
$axiom_blocks_no_follow        = ! empty( $axiom_blocks_a['relNoFollow'] );
$axiom_blocks_sponsored        = ! empty( $axiom_blocks_a['relSponsored'] );
$axiom_blocks_is_download      = ! empty( $axiom_blocks_a['isDownload'] );
$axiom_blocks_is_submit        = 'submit' === ( $axiom_blocks_a['htmlType'] ?? 'link' );

$axiom_blocks_icon          = (string) ( $axiom_blocks_a['icon'] ?? '' );
$axiom_blocks_icon_position = 'left' === ( $axiom_blocks_a['iconPosition'] ?? 'right' ) ? 'left' : 'right';
$axiom_blocks_icon_gap      = (string) ( $axiom_blocks_a['iconGap'] ?? '' );
$axiom_blocks_icon_only     = ! empty( $axiom_blocks_a['iconOnly'] );

$axiom_blocks_style_preset = (string) ( $axiom_blocks_a['stylePreset'] ?? 'fill' );
$axiom_blocks_size_preset  = (string) ( $axiom_blocks_a['sizePreset'] ?? 'md' );

$axiom_blocks_hover_effect = (string) ( $axiom_blocks_a['hoverEffect'] ?? 'none' );
$axiom_blocks_shadow       = (string) ( $axiom_blocks_a['shadow'] ?? 'none' );
$axiom_blocks_hover_shadow = (string) ( $axiom_blocks_a['hoverShadow'] ?? '' );

$axiom_blocks_icon_svg = '' !== $axiom_blocks_icon ? Icons::get( $axiom_blocks_icon ) : '';

$axiom_blocks_classes = array(
	'ab-adv-btn',
	'ab-adv-btn--' . sanitize_html_class( $axiom_blocks_style_preset ),
	'ab-adv-btn--' . sanitize_html_class( $axiom_blocks_size_preset ),
);
if ( $axiom_blocks_icon_only && '' !== $axiom_blocks_icon_svg ) {
	$axiom_blocks_classes[] = 'is-icon-only';
}
if ( 'none' !== $axiom_blocks_hover_effect && '' !== $axiom_blocks_hover_effect ) {
	$axiom_blocks_classes[] = 'ab-advfx-' . sanitize_html_class( $axiom_blocks_hover_effect );
}
if ( 'none' !== $axiom_blocks_shadow && '' !== $axiom_blocks_shadow ) {
	$axiom_blocks_classes[] = 'ab-advsh-' . sanitize_html_class( $axiom_blocks_shadow );
}
if ( '' !== $axiom_blocks_hover_shadow ) {
	$axiom_blocks_classes[] = 'ab-advsh-h-' . sanitize_html_class( $axiom_blocks_hover_shadow );
}

$axiom_blocks_style_parts = array();

$axiom_blocks_var_map = array(
	'--ab-advbtn-color'   => 'textColor',
	'--ab-advbtn-bg'      => 'bgColor',
	'--ab-advbtn-bc'      => 'borderColor',
	'--ab-advbtn-h-color' => 'hoverTextColor',
	'--ab-advbtn-h-bg'    => 'hoverBgColor',
	'--ab-advbtn-h-bc'    => 'hoverBorderColor',
	'--ab-advbtn-icon'    => 'iconSize',
);
foreach ( $axiom_blocks_var_map as $axiom_blocks_css_var => $axiom_blocks_attr_key ) {
	if ( ! empty( $axiom_blocks_a[ $axiom_blocks_attr_key ] ) ) {
		$axiom_blocks_style_parts[] = $axiom_blocks_css_var . ': ' . $axiom_blocks_a[ $axiom_blocks_attr_key ];
	}
}

if ( ! empty( $axiom_blocks_a['borderWidth'] ) ) {
	$axiom_blocks_style_parts[] = 'border-width: ' . $axiom_blocks_a['borderWidth'];
	$axiom_blocks_style_parts[] = 'border-style: ' . ( $axiom_blocks_a['borderStyle'] ?? 'solid' );
}
if ( ! empty( $axiom_blocks_a['borderRadius'] ) ) {
	$axiom_blocks_style_parts[] = 'border-radius: ' . $axiom_blocks_a['borderRadius'];
}
if ( '' !== $axiom_blocks_icon_gap ) {
	$axiom_blocks_style_parts[] = 'gap: ' . $axiom_blocks_icon_gap;
}

$axiom_blocks_inline_style = implode( '; ', $axiom_blocks_style_parts );
$axiom_blocks_inline_style = Spacing::merge( $axiom_blocks_inline_style, $axiom_blocks_a );
$axiom_blocks_inline_style = Typography::merge( $axiom_blocks_inline_style, $axiom_blocks_a );

$axiom_blocks_block_supports = WP_Block_Supports::get_instance()->apply_block_supports();

/* Button element: its own preset/hover/shadow classes + inline styles. Responsive
   spacing lives on the button (not the wrapper), so wire it here. */
$axiom_blocks_sp_map = Responsive::spacing_map();
if ( Responsive::has_overrides( $axiom_blocks_a, $axiom_blocks_sp_map ) ) {
	$axiom_blocks_rsp_class  = Responsive::instance_class( $axiom_blocks_a, $axiom_blocks_sp_map );
	$axiom_blocks_classes[]  = $axiom_blocks_rsp_class;
	ResponsiveStyles::add( Responsive::css( $axiom_blocks_rsp_class, $axiom_blocks_a, $axiom_blocks_sp_map ) );
}
$axiom_blocks_class_attr = trim( implode( ' ', array_filter( $axiom_blocks_classes ) ) );
$axiom_blocks_style_attr = safecss_filter_attr( rtrim( trim( $axiom_blocks_inline_style ), ';' ) );

/* Block-level wrapper carries native align + anchor + user className so the block
   sits in the content column like core blocks; the button stays its natural size. */
$axiom_blocks_wrap_classes = array( 'ab-adv-btn-wrap' );
if ( ! empty( $axiom_blocks_block_supports['class'] ) ) {
	$axiom_blocks_wrap_classes[] = $axiom_blocks_block_supports['class'];
}
if ( ! empty( $axiom_blocks_a['className'] ) ) {
	$axiom_blocks_wrap_classes[] = $axiom_blocks_a['className'];
}
$axiom_blocks_wrap_class_attr = trim( implode( ' ', array_filter( $axiom_blocks_wrap_classes ) ) );
$axiom_blocks_wrap_style_attr = safecss_filter_attr( rtrim( trim( $axiom_blocks_block_supports['style'] ?? '' ), ';' ) );
$axiom_blocks_id_attr         = $axiom_blocks_block_supports['id'] ?? '';

$axiom_blocks_rel_parts = array();
if ( $axiom_blocks_new_tab ) {
	$axiom_blocks_rel_parts[] = 'noopener';
	$axiom_blocks_rel_parts[] = 'noreferrer';
}
if ( $axiom_blocks_no_follow ) {
	$axiom_blocks_rel_parts[] = 'nofollow';
}
if ( $axiom_blocks_sponsored ) {
	$axiom_blocks_rel_parts[] = 'sponsored';
}
$axiom_blocks_rel = implode( ' ', $axiom_blocks_rel_parts );

$axiom_blocks_aria_label = $axiom_blocks_icon_only ? wp_strip_all_tags( $axiom_blocks_text ) : '';
$axiom_blocks_href       = '' !== $axiom_blocks_url ? $axiom_blocks_url : '#';
?>
<div class="<?php echo esc_attr( $axiom_blocks_wrap_class_attr ); ?>"<?php echo '' !== $axiom_blocks_id_attr ? ' id="' . esc_attr( $axiom_blocks_id_attr ) . '"' : ''; ?><?php echo '' !== $axiom_blocks_wrap_style_attr ? ' style="' . esc_attr( $axiom_blocks_wrap_style_attr ) . '"' : ''; ?>>
<?php if ( $axiom_blocks_is_submit ) : ?>
<button type="submit" class="<?php echo esc_attr( $axiom_blocks_class_attr ); ?>"<?php echo '' !== $axiom_blocks_style_attr ? ' style="' . esc_attr( $axiom_blocks_style_attr ) . '"' : ''; ?><?php echo '' !== $axiom_blocks_aria_label ? ' aria-label="' . esc_attr( $axiom_blocks_aria_label ) . '"' : ''; ?>>
<?php else : ?>
<a href="<?php echo esc_url( $axiom_blocks_href ); ?>"<?php echo $axiom_blocks_new_tab ? ' target="_blank"' : ''; ?><?php echo '' !== $axiom_blocks_rel ? ' rel="' . esc_attr( $axiom_blocks_rel ) . '"' : ''; ?><?php echo $axiom_blocks_is_download ? ' download' : ''; ?> class="<?php echo esc_attr( $axiom_blocks_class_attr ); ?>"<?php echo '' !== $axiom_blocks_style_attr ? ' style="' . esc_attr( $axiom_blocks_style_attr ) . '"' : ''; ?><?php echo '' !== $axiom_blocks_aria_label ? ' aria-label="' . esc_attr( $axiom_blocks_aria_label ) . '"' : ''; ?>>
<?php endif; ?>
	<?php if ( '' !== $axiom_blocks_icon_svg && 'left' === $axiom_blocks_icon_position ) : ?>
		<span class="ab-adv-btn__icon"><?php echo wp_kses( $axiom_blocks_icon_svg, AllowedHtml::svg() ); ?></span>
	<?php endif; ?>
	<span class="ab-adv-btn__content">
		<span class="ab-adv-btn__text"><?php echo wp_kses_post( $axiom_blocks_text ); ?></span>
		<?php if ( $axiom_blocks_show_sub_caption && '' !== $axiom_blocks_sub_caption ) : ?>
			<span class="ab-adv-btn__sub"><?php echo wp_kses_post( $axiom_blocks_sub_caption ); ?></span>
		<?php endif; ?>
	</span>
	<?php if ( '' !== $axiom_blocks_icon_svg && 'right' === $axiom_blocks_icon_position ) : ?>
		<span class="ab-adv-btn__icon"><?php echo wp_kses( $axiom_blocks_icon_svg, AllowedHtml::svg() ); ?></span>
	<?php endif; ?>
<?php if ( $axiom_blocks_is_submit ) : ?>
</button>
<?php else : ?>
</a>
<?php endif; ?>
</div>
