<?php
/**
 * Icon List — frontend render.
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

$axiom_blocks_a     = $attributes ?? array();
$axiom_blocks_items = isset( $axiom_blocks_a['items'] ) && is_array( $axiom_blocks_a['items'] )
	? $axiom_blocks_a['items']
	: array();

if ( empty( $axiom_blocks_items ) ) {
	return;
}

$axiom_blocks_layout   = 'horizontal' === ( $axiom_blocks_a['layout'] ?? 'vertical' ) ? 'horizontal' : 'vertical';
$axiom_blocks_icon_pos = 'right' === ( $axiom_blocks_a['iconPosition'] ?? 'left' ) ? 'right' : 'left';

$axiom_blocks_align = sanitize_html_class( (string) ( $axiom_blocks_a['itemsAlign'] ?? 'left' ) );
if ( ! in_array( $axiom_blocks_align, array( 'left', 'center', 'right' ), true ) ) {
	$axiom_blocks_align = 'left';
}

/* ── Wrapper CSS custom properties + spacing + typography ─────────────────── */
$axiom_blocks_var_map     = array(
	'--ab-il-icon-size'  => 'iconSize',
	'--ab-il-icon-color' => 'iconColor',
	'--ab-il-gap'        => 'gap',
	'--ab-il-row-gap'    => 'rowGap',
	'--ab-il-divider'    => 'dividerColor',
	'--ab-il-link'       => 'linkColor',
	'--ab-il-link-h'     => 'linkHoverColor',
);
$axiom_blocks_style_parts = array();
foreach ( $axiom_blocks_var_map as $axiom_blocks_css_var => $axiom_blocks_attr_key ) {
	if ( ! empty( $axiom_blocks_a[ $axiom_blocks_attr_key ] ) ) {
		$axiom_blocks_style_parts[] = $axiom_blocks_css_var . ': ' . $axiom_blocks_a[ $axiom_blocks_attr_key ];
	}
}
if ( ! empty( $axiom_blocks_a['textColor'] ) ) {
	$axiom_blocks_style_parts[] = 'color: ' . $axiom_blocks_a['textColor'];
}
$axiom_blocks_wrapper_style = implode( '; ', $axiom_blocks_style_parts );
$axiom_blocks_wrapper_style = Spacing::merge( $axiom_blocks_wrapper_style, $axiom_blocks_a );
$axiom_blocks_wrapper_style = Typography::merge( $axiom_blocks_wrapper_style, $axiom_blocks_a );

/* ── Wrapper attributes ───────────────────────────────────────────────────── */
$axiom_blocks_classes = array(
	'ab-icon-list',
	'ab-icon-list--' . $axiom_blocks_layout,
	'ab-icon-list--icon-' . $axiom_blocks_icon_pos,
	'ab-icon-list--align-' . $axiom_blocks_align,
);
if ( ! empty( $axiom_blocks_a['showDivider'] ) ) {
	$axiom_blocks_classes[] = 'has-divider';
}

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
?>
<ul
	<?php echo '' !== $axiom_blocks_id_attr ? 'id="' . esc_attr( $axiom_blocks_id_attr ) . '" ' : ''; ?>
	class="<?php echo esc_attr( $axiom_blocks_class_attr ); ?>"
	<?php echo '' !== $axiom_blocks_style_attr ? ' style="' . esc_attr( $axiom_blocks_style_attr ) . '"' : ''; ?>
>
	<?php
	foreach ( $axiom_blocks_items as $axiom_blocks_item ) :
		$axiom_blocks_icon_slug = (string) ( $axiom_blocks_item['icon'] ?? '' );
		$axiom_blocks_text      = (string) ( $axiom_blocks_item['text'] ?? '' );
		$axiom_blocks_url       = (string) ( $axiom_blocks_item['url'] ?? '' );
		$axiom_blocks_icon_svg  = Icons::get( $axiom_blocks_icon_slug );

		if ( '' === trim( wp_strip_all_tags( $axiom_blocks_text ) ) && '' === $axiom_blocks_icon_svg ) {
			continue;
		}
		?>
		<li class="ab-icon-list__item">
			<?php if ( '' !== $axiom_blocks_url ) : ?>
				<a class="ab-icon-list__link" href="<?php echo esc_url( $axiom_blocks_url ); ?>">
					<span class="ab-icon-list__icon"><?php echo wp_kses( $axiom_blocks_icon_svg, AllowedHtml::svg() ); ?></span>
					<span class="ab-icon-list__text"><?php echo wp_kses_post( $axiom_blocks_text ); ?></span>
				</a>
			<?php else : ?>
				<span class="ab-icon-list__icon"><?php echo wp_kses( $axiom_blocks_icon_svg, AllowedHtml::svg() ); ?></span>
				<span class="ab-icon-list__text"><?php echo wp_kses_post( $axiom_blocks_text ); ?></span>
			<?php endif; ?>
		</li>
	<?php endforeach; ?>
</ul>
