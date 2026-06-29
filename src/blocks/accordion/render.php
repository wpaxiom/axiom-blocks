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
	'--ab-acc-header-bg'           => 'headerBg',
	'--ab-acc-header-color'        => 'headerColor',
	'--ab-acc-active-header-bg'    => 'activeHeaderBg',
	'--ab-acc-active-header-color' => 'activeHeaderColor',
	'--ab-acc-header-pt'           => 'headerPaddingTop',
	'--ab-acc-header-pr'           => 'headerPaddingRight',
	'--ab-acc-header-pb'           => 'headerPaddingBottom',
	'--ab-acc-header-pl'           => 'headerPaddingLeft',
	'--ab-acc-body-bg'             => 'bodyBg',
	'--ab-acc-body-color'          => 'bodyColor',
	'--ab-acc-body-pt'             => 'bodyPaddingTop',
	'--ab-acc-body-pr'             => 'bodyPaddingRight',
	'--ab-acc-body-pb'             => 'bodyPaddingBottom',
	'--ab-acc-body-pl'             => 'bodyPaddingLeft',
	'--ab-acc-border-color'        => 'borderColor',
	'--ab-acc-border-width'        => 'borderWidth',
	'--ab-acc-radius'              => 'borderRadius',
	'--ab-acc-gap'                 => 'itemGap',
	'--ab-acc-cont-bc'             => 'containerBorderColor',
	'--ab-acc-cont-bw'             => 'containerBorderWidth',
	'--ab-acc-cont-radius'         => 'containerBorderRadius',
	'--ab-acc-icon-color'          => 'iconColor',
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
	wp_print_inline_script_tag(
		(string) wp_json_encode(
			array(
				'@context'   => 'https://schema.org',
				'@type'      => 'FAQPage',
				'mainEntity' => $axiom_blocks_faq_entries,
			)
		),
		array( 'type' => 'application/ld+json' )
	);
}

