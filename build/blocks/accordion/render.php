<?php
/**
 * Accordion — frontend render.
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
use AxiomBlocks\Blocks\Background;

$axiom_blocks_a     = $attributes ?? array();
$axiom_blocks_items = $block->parsed_block['innerBlocks'] ?? array();

if ( empty( $axiom_blocks_items ) ) {
	return;
}

$axiom_blocks_show_icon    = ! isset( $axiom_blocks_a['showIcon'] ) || ! empty( $axiom_blocks_a['showIcon'] );
$axiom_blocks_icon_pos     = 'left' === ( $axiom_blocks_a['iconPosition'] ?? 'right' ) ? 'left' : 'right';
$axiom_blocks_rotate       = ! isset( $axiom_blocks_a['rotateIcon'] ) || ! empty( $axiom_blocks_a['rotateIcon'] );
$axiom_blocks_close_others = ! isset( $axiom_blocks_a['closeOthers'] ) || ! empty( $axiom_blocks_a['closeOthers'] );
$axiom_blocks_first_open   = ! isset( $axiom_blocks_a['firstItemOpen'] ) || ! empty( $axiom_blocks_a['firstItemOpen'] );
$axiom_blocks_faq          = ! empty( $axiom_blocks_a['faqSchema'] );
$axiom_blocks_duration     = max( 0, (int) ( $axiom_blocks_a['transitionDuration'] ?? 300 ) );
$axiom_blocks_expand_all   = ! empty( $axiom_blocks_a['showExpandAll'] );
$axiom_blocks_deeplink     = ! empty( $axiom_blocks_a['deepLink'] );
$axiom_blocks_collapse_mob = ! empty( $axiom_blocks_a['collapseOnMobile'] );
$axiom_blocks_icon_slug    = (string) ( $axiom_blocks_a['iconSlug'] ?? 'chevron-down' );
$axiom_blocks_icon_svg     = $axiom_blocks_show_icon ? Icons::get( $axiom_blocks_icon_slug ) : '';

$axiom_blocks_heading_tag = (string) ( $axiom_blocks_a['headingLevel'] ?? 'h3' );
if ( ! in_array( $axiom_blocks_heading_tag, array( 'h2', 'h3', 'h4', 'h5', 'h6' ), true ) ) {
	$axiom_blocks_heading_tag = 'h3';
}

/* ── Wrapper CSS custom properties + spacing ──────────────────────────────── */
$axiom_blocks_var_map     = array(
	'--ab-acc-header-color'        => 'headerColor',
	'--ab-acc-header-color-hover'  => 'headerColorHover',
	'--ab-acc-active-header-color' => 'activeHeaderColor',
	'--ab-acc-header-pt'           => 'headerPaddingTop',
	'--ab-acc-header-pr'           => 'headerPaddingRight',
	'--ab-acc-header-pb'           => 'headerPaddingBottom',
	'--ab-acc-header-pl'           => 'headerPaddingLeft',
	'--ab-acc-body-color'          => 'bodyColor',
	'--ab-acc-body-pt'             => 'bodyPaddingTop',
	'--ab-acc-body-pr'             => 'bodyPaddingRight',
	'--ab-acc-body-pb'             => 'bodyPaddingBottom',
	'--ab-acc-body-pl'             => 'bodyPaddingLeft',
	'--ab-acc-body-bs'             => 'bodyBorderStyle',
	'--ab-acc-body-bc'             => 'bodyBorderColor',
	'--ab-acc-body-bw-top'         => 'bodyBorderTopWidth',
	'--ab-acc-body-bw-right'       => 'bodyBorderRightWidth',
	'--ab-acc-body-bw-bottom'      => 'bodyBorderBottomWidth',
	'--ab-acc-body-bw-left'        => 'bodyBorderLeftWidth',
	'--ab-acc-body-radius-tl'      => 'bodyRadiusTopLeft',
	'--ab-acc-body-radius-tr'      => 'bodyRadiusTopRight',
	'--ab-acc-body-radius-br'      => 'bodyRadiusBottomRight',
	'--ab-acc-body-radius-bl'      => 'bodyRadiusBottomLeft',
	'--ab-acc-border-color'        => 'borderColor',
	'--ab-acc-border-width'        => 'borderWidth',
	'--ab-acc-radius'              => 'borderRadius',
	'--ab-acc-bs'                  => 'borderStyle',
	'--ab-acc-bw-top'              => 'borderTopWidth',
	'--ab-acc-bw-right'            => 'borderRightWidth',
	'--ab-acc-bw-bottom'           => 'borderBottomWidth',
	'--ab-acc-bw-left'             => 'borderLeftWidth',
	'--ab-acc-radius-tl'           => 'radiusTopLeft',
	'--ab-acc-radius-tr'           => 'radiusTopRight',
	'--ab-acc-radius-br'           => 'radiusBottomRight',
	'--ab-acc-radius-bl'           => 'radiusBottomLeft',
	'--ab-acc-gap'                 => 'itemGap',
	'--ab-acc-cont-bc'             => 'containerBorderColor',
	'--ab-acc-cont-bw'             => 'containerBorderWidth',
	'--ab-acc-cont-radius'         => 'containerBorderRadius',
	'--ab-acc-cont-bs'             => 'containerBorderStyle',
	'--ab-acc-cont-bw-top'         => 'containerBorderTopWidth',
	'--ab-acc-cont-bw-right'       => 'containerBorderRightWidth',
	'--ab-acc-cont-bw-bottom'      => 'containerBorderBottomWidth',
	'--ab-acc-cont-bw-left'        => 'containerBorderLeftWidth',
	'--ab-acc-cont-radius-tl'      => 'containerRadiusTopLeft',
	'--ab-acc-cont-radius-tr'      => 'containerRadiusTopRight',
	'--ab-acc-cont-radius-br'      => 'containerRadiusBottomRight',
	'--ab-acc-cont-radius-bl'      => 'containerRadiusBottomLeft',
	'--ab-acc-cont-shadow'         => 'containerShadow',
	'--ab-acc-cont-maxw'           => 'containerMaxWidth',
	'--ab-acc-item-shadow'         => 'itemShadow',
	'--ab-acc-item-shadow-hover'   => 'itemShadowHover',
	'--ab-acc-body-maxw'           => 'bodyMaxWidth',
	'--ab-acc-icon-color'          => 'iconColor',
	'--ab-acc-icon-color-active'   => 'iconColorActive',
	'--ab-acc-icon-size'           => 'iconSize',
	'--ab-acc-title-ff'            => 'headerFontFamily',
	'--ab-acc-title-fw'            => 'headerFontWeight',
	'--ab-acc-title-fs'            => 'headerFontSize',
	'--ab-acc-title-lh'            => 'headerLineHeight',
	'--ab-acc-title-ls'            => 'headerLetterSpacing',
	'--ab-acc-title-tt'            => 'headerTextTransform',
	'--ab-acc-title-td'            => 'headerTextDecoration',
	'--ab-acc-title-ta'            => 'headerTextAlign',
);
$axiom_blocks_style_parts = array();
foreach ( $axiom_blocks_var_map as $axiom_blocks_css_var => $axiom_blocks_attr_key ) {
	if ( ! empty( $axiom_blocks_a[ $axiom_blocks_attr_key ] ) ) {
		$axiom_blocks_style_parts[] = $axiom_blocks_css_var . ': ' . $axiom_blocks_a[ $axiom_blocks_attr_key ];
	}
}

/* Item background — full BackgroundControl (color / gradient / image); legacy
   itemBg / itemBgHover stay the color attr. */
$axiom_blocks_item_bg = Background::value( $axiom_blocks_a, 'item', 'itemBg' );
if ( '' !== $axiom_blocks_item_bg ) {
	$axiom_blocks_style_parts[] = '--ab-acc-item-bg: ' . $axiom_blocks_item_bg;
}
$axiom_blocks_item_bg_hover = Background::value( $axiom_blocks_a, 'itemHover', 'itemBgHover' );
if ( '' !== $axiom_blocks_item_bg_hover ) {
	$axiom_blocks_style_parts[] = '--ab-acc-item-bg-hover: ' . $axiom_blocks_item_bg_hover;
}

/* Header background — full (color / gradient / image), Normal + Hover + Active. */
$axiom_blocks_header_bg = Background::value( $axiom_blocks_a, 'header', 'headerBg' );
if ( '' !== $axiom_blocks_header_bg ) {
	$axiom_blocks_style_parts[] = '--ab-acc-header-bg: ' . $axiom_blocks_header_bg;
}
$axiom_blocks_header_bg_hover = Background::value( $axiom_blocks_a, 'headerHover', 'headerBgHover' );
if ( '' !== $axiom_blocks_header_bg_hover ) {
	$axiom_blocks_style_parts[] = '--ab-acc-header-bg-hover: ' . $axiom_blocks_header_bg_hover;
}
$axiom_blocks_header_bg_active = Background::value( $axiom_blocks_a, 'headerActive', 'activeHeaderBg' );
if ( '' !== $axiom_blocks_header_bg_active ) {
	$axiom_blocks_style_parts[] = '--ab-acc-active-header-bg: ' . $axiom_blocks_header_bg_active;
}

/* Body background — full (color / gradient / image). */
$axiom_blocks_body_bg = Background::value( $axiom_blocks_a, 'body', 'bodyBg' );
if ( '' !== $axiom_blocks_body_bg ) {
	$axiom_blocks_style_parts[] = '--ab-acc-body-bg: ' . $axiom_blocks_body_bg;
}

$axiom_blocks_wrapper_style = implode( '; ', $axiom_blocks_style_parts );
$axiom_blocks_wrapper_style = Spacing::merge( $axiom_blocks_wrapper_style, $axiom_blocks_a );

/* ── Wrapper attributes ───────────────────────────────────────────────────── */
$axiom_blocks_classes = array(
	'ab-accordion',
	$axiom_blocks_show_icon ? 'has-icon' : 'no-icon',
	'ab-accordion--icon-' . $axiom_blocks_icon_pos,
);
if ( $axiom_blocks_rotate ) {
	$axiom_blocks_classes[] = 'ab-accordion--rotate';
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
<div
	<?php echo '' !== $axiom_blocks_id_attr ? 'id="' . esc_attr( $axiom_blocks_id_attr ) . '" ' : ''; ?>
	class="<?php echo esc_attr( $axiom_blocks_class_attr ); ?>"
	<?php echo '' !== $axiom_blocks_style_attr ? ' style="' . esc_attr( $axiom_blocks_style_attr ) . '"' : ''; ?>
	<?php echo $axiom_blocks_close_others ? ' data-close-others="1"' : ''; ?>
	data-duration="<?php echo esc_attr( (string) $axiom_blocks_duration ); ?>"
	<?php echo $axiom_blocks_deeplink ? ' data-deeplink="1"' : ''; ?>
	<?php echo $axiom_blocks_collapse_mob ? ' data-collapse-mobile="1"' : ''; ?>
>
	<?php if ( $axiom_blocks_expand_all ) : ?>
		<button type="button" class="ab-accordion__toggle-all" aria-expanded="false" data-expand="<?php echo esc_attr__( 'Expand all', 'axiom-blocks' ); ?>" data-collapse="<?php echo esc_attr__( 'Collapse all', 'axiom-blocks' ); ?>"><?php echo esc_html__( 'Expand all', 'axiom-blocks' ); ?></button>
	<?php endif; ?>
	<?php
	$axiom_blocks_faq_entries = array();
	foreach ( $axiom_blocks_items as $axiom_blocks_index => $axiom_blocks_item ) :
		$axiom_blocks_title = (string) ( $axiom_blocks_item['attrs']['title'] ?? '' );
		$axiom_blocks_body  = '';
		foreach ( ( $axiom_blocks_item['innerBlocks'] ?? array() ) as $axiom_blocks_inner ) {
			$axiom_blocks_body .= ( new WP_Block( $axiom_blocks_inner ) )->render();
		}
		$axiom_blocks_open = ( 0 === $axiom_blocks_index && $axiom_blocks_first_open );

		$axiom_blocks_item_id = (string) ( $axiom_blocks_item['attrs']['anchor'] ?? '' );

		if ( $axiom_blocks_faq && '' !== trim( wp_strip_all_tags( $axiom_blocks_title ) ) ) {
			$axiom_blocks_faq_entries[] = array(
				'@type'          => 'Question',
				'name'           => wp_strip_all_tags( $axiom_blocks_title ),
				'acceptedAnswer' => array(
					'@type' => 'Answer',
					'text'  => trim( $axiom_blocks_body ),
				),
			);
		}
		?>
		<details class="ab-accordion__item"<?php echo '' !== $axiom_blocks_item_id ? ' id="' . esc_attr( $axiom_blocks_item_id ) . '"' : ''; ?><?php echo $axiom_blocks_open ? ' open' : ''; ?>>
			<summary class="ab-accordion__header">
				<?php if ( '' !== $axiom_blocks_icon_svg && 'left' === $axiom_blocks_icon_pos ) : ?>
					<span class="ab-accordion__icon"><?php echo wp_kses( $axiom_blocks_icon_svg, AllowedHtml::svg() ); ?></span>
				<?php endif; ?>
				<<?php echo esc_attr( $axiom_blocks_heading_tag ); ?> class="ab-accordion__title"><?php echo wp_kses_post( $axiom_blocks_title ); ?></<?php echo esc_attr( $axiom_blocks_heading_tag ); ?>>
				<?php if ( '' !== $axiom_blocks_icon_svg && 'left' !== $axiom_blocks_icon_pos ) : ?>
					<span class="ab-accordion__icon"><?php echo wp_kses( $axiom_blocks_icon_svg, AllowedHtml::svg() ); ?></span>
				<?php endif; ?>
			</summary>
			<div class="ab-accordion__body">
				<div class="ab-accordion__body-inner"><?php echo wp_kses_post( $axiom_blocks_body ); ?></div>
			</div>
		</details>
	<?php endforeach; ?>
</div>
<?php
if ( $axiom_blocks_faq && ! empty( $axiom_blocks_faq_entries ) ) {
	$axiom_blocks_faq_schema = array(
		'@context'   => 'https://schema.org',
		'@type'      => 'FAQPage',
		'mainEntity' => $axiom_blocks_faq_entries,
	);
	// Print at page level, not inside the block's content, so the schema
	// survives when this accordion is nested inside a wrapper block (whose kses
	// would otherwise strip the <script> from $content).
	add_action(
		'wp_footer',
		static function () use ( $axiom_blocks_faq_schema ) {
			wp_print_inline_script_tag(
				(string) wp_json_encode( $axiom_blocks_faq_schema ),
				array( 'type' => 'application/ld+json' )
			);
		}
	);
}

