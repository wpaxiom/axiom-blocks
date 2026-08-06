<?php
/**
 * Pricing Table — frontend render (wrapper only; cards come from inner blocks).
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
use AxiomBlocks\Blocks\Spacing;
use AxiomBlocks\Blocks\Typography;

$axiom_blocks_a = $attributes ?? array();

$axiom_blocks_columns         = max( 1, min( 4, (int) ( $axiom_blocks_a['columns'] ?? 3 ) ) );
$axiom_blocks_gap             = (int) ( $axiom_blocks_a['gap'] ?? 24 );
$axiom_blocks_accent          = $axiom_blocks_a['accentColor'] ?? '#7C3AED';
$axiom_blocks_feat_icon_style = $axiom_blocks_a['featureIconStyle'] ?? 'check';

$axiom_blocks_heading_show  = ! empty( $axiom_blocks_a['headingShow'] );
$axiom_blocks_heading_text  = (string) ( $axiom_blocks_a['headingText'] ?? '' );
$axiom_blocks_heading_align = $axiom_blocks_a['headingAlign'] ?? 'center';

$axiom_blocks_classes = array(
	'axiom-blocks-pricing-table',
	'is-feat-' . sanitize_html_class( $axiom_blocks_feat_icon_style ),
);

$axiom_blocks_style_parts = array(
	'--ab-pt-columns: ' . $axiom_blocks_columns,
	'--ab-pt-gap: ' . $axiom_blocks_gap . 'px',
	'--ab-pt-accent: ' . $axiom_blocks_accent,
);

/* Card defaults (§25.4) — every plan card reads these through
   `var(--plan-card-x, var(--ab-pt-card-x, <shipped default>))`, so an unset row
   emits nothing and style.scss's shipped default paints.
   Mirrors getPricingTableVars() in index.js. */
$axiom_blocks_card_var_map = array(
	'--ab-pt-heading-color'   => 'headingColor',
	'--ab-pt-card-bg'         => 'cardBg',
	'--ab-pt-card-bc'         => 'cardBorderColor',
	'--ab-pt-card-bw-top'     => 'cardBorderTopWidth',
	'--ab-pt-card-bw-right'   => 'cardBorderRightWidth',
	'--ab-pt-card-bw-bottom'  => 'cardBorderBottomWidth',
	'--ab-pt-card-bw-left'    => 'cardBorderLeftWidth',
	'--ab-pt-card-radius-tl'  => 'cardRadiusTopLeft',
	'--ab-pt-card-radius-tr'  => 'cardRadiusTopRight',
	'--ab-pt-card-radius-br'  => 'cardRadiusBottomRight',
	'--ab-pt-card-radius-bl'  => 'cardRadiusBottomLeft',
	'--ab-pt-card-shadow'     => 'cardShadow',
	'--ab-pt-card-minh'       => 'cardMinHeight',
	'--ab-pt-cardf-bg'        => 'cardBgFeatured',
	'--ab-pt-cardf-shadow'    => 'cardShadowFeatured',
	'--ab-pt-cta-color'       => 'ctaColor',
	'--ab-pt-cta-bg'          => 'ctaBg',
	'--ab-pt-cta-color-h'     => 'ctaColorHover',
	'--ab-pt-cta-bg-h'        => 'ctaBgHover',
	'--ab-pt-name-color'      => 'nameColor',
	'--ab-pt-price-color'     => 'priceColor',
	'--ab-pt-period-color'    => 'periodColor',
	'--ab-pt-card-pt'         => 'cardPaddingTop',
	'--ab-pt-card-pr'         => 'cardPaddingRight',
	'--ab-pt-card-pb'         => 'cardPaddingBottom',
	'--ab-pt-card-pl'         => 'cardPaddingLeft',
	'--ab-pt-card-gap'        => 'cardGap',
	'--ab-pt-cta-pt'          => 'ctaPaddingTop',
	'--ab-pt-cta-pr'          => 'ctaPaddingRight',
	'--ab-pt-cta-pb'          => 'ctaPaddingBottom',
	'--ab-pt-cta-pl'          => 'ctaPaddingLeft',
	'--ab-pt-cta-radius-tl'   => 'ctaRadiusTopLeft',
	'--ab-pt-cta-radius-tr'   => 'ctaRadiusTopRight',
	'--ab-pt-cta-radius-br'   => 'ctaRadiusBottomRight',
	'--ab-pt-cta-radius-bl'   => 'ctaRadiusBottomLeft',
	'--ab-pt-cta-bw-top'      => 'ctaBorderTopWidth',
	'--ab-pt-cta-bw-right'    => 'ctaBorderRightWidth',
	'--ab-pt-cta-bw-bottom'   => 'ctaBorderBottomWidth',
	'--ab-pt-cta-bw-left'     => 'ctaBorderLeftWidth',
	'--ab-pt-cta-bc'          => 'ctaBorderColor',
	'--ab-pt-feat-gap'        => 'featureGap',
	'--ab-pt-feat-icon-size'  => 'featIconSize',
	'--ab-pt-feat-ex-op'      => 'featExcludedOpacity',
	'--ab-pt-currency-color'  => 'currencyColor',
	'--ab-pt-price-gap'       => 'priceGap',
	'--ab-pt-heading-gap'     => 'headingGap',
	'--ab-pt-feat-icon-gap'   => 'featIconGap',
	'--ab-pt-cta-shadow'      => 'ctaShadow',
	'--ab-pt-cta-shadow-h'    => 'ctaShadowHover',
	'--ab-pt-badge-pt'        => 'badgePaddingTop',
	'--ab-pt-badge-pr'        => 'badgePaddingRight',
	'--ab-pt-badge-pb'        => 'badgePaddingBottom',
	'--ab-pt-badge-pl'        => 'badgePaddingLeft',
	'--ab-pt-badge-radius-tl' => 'badgeRadiusTopLeft',
	'--ab-pt-badge-radius-tr' => 'badgeRadiusTopRight',
	'--ab-pt-badge-radius-br' => 'badgeRadiusBottomRight',
	'--ab-pt-badge-radius-bl' => 'badgeRadiusBottomLeft',
	'--ab-pt-badge-bw-top'    => 'badgeBorderTopWidth',
	'--ab-pt-badge-bw-right'  => 'badgeBorderRightWidth',
	'--ab-pt-badge-bw-bottom' => 'badgeBorderBottomWidth',
	'--ab-pt-badge-bw-left'   => 'badgeBorderLeftWidth',
	'--ab-pt-badge-bc'        => 'badgeBorderColor',
	'--ab-pt-desc-color'      => 'descColor',
	'--ab-pt-feat-color'      => 'featureColor',
	'--ab-pt-feat-icon'       => 'featIconColor',
	'--ab-pt-feat-icon-ex'    => 'featIconExcludedColor',
	'--ab-pt-badge-bg'        => 'badgeBg',
	'--ab-pt-badge-color'     => 'badgeColor',
	'--ab-pt-cardf-bw-top'    => 'cardBorderTopWidthFeatured',
	'--ab-pt-cardf-bw-right'  => 'cardBorderRightWidthFeatured',
	'--ab-pt-cardf-bw-bottom' => 'cardBorderBottomWidthFeatured',
	'--ab-pt-cardf-bw-left'   => 'cardBorderLeftWidthFeatured',
	'--ab-pt-cardf-bc'        => 'cardBorderColorFeatured',
);

/* Plan-component typography — set on the table, applied to that component in
   every plan. A plan's own shipped typography is still written inline by
   pricing-plan/render.php, so individually-styled content keeps winning.
   Mirrors TYPO_SHORT / TYPO_PROPS in index.js. */
$axiom_blocks_typo_groups = array(
	'name'     => 'name',
	'price'    => 'price',
	'currency' => 'currency',
	'period'   => 'period',
	'badge'    => 'badge',
	'desc'     => 'desc',
	'feat'  => 'feature',
	'cta'   => 'cta',
);
$axiom_blocks_typo_props  = array(
	'ff' => 'FontFamily',
	'fw' => 'FontWeight',
	'fs' => 'FontSize',
	'lh' => 'LineHeight',
	'ls' => 'LetterSpacing',
	'tt' => 'TextTransform',
	'td' => 'TextDecoration',
	'ta' => 'TextAlign',
);
foreach ( $axiom_blocks_typo_groups as $axiom_blocks_short => $axiom_blocks_prefix ) {
	foreach ( $axiom_blocks_typo_props as $axiom_blocks_css => $axiom_blocks_suffix ) {
		$axiom_blocks_card_var_map[ '--ab-pt-' . $axiom_blocks_short . '-' . $axiom_blocks_css ] = $axiom_blocks_prefix . $axiom_blocks_suffix;
	}
}
foreach ( $axiom_blocks_card_var_map as $axiom_blocks_css_var => $axiom_blocks_attr_key ) {
	if ( isset( $axiom_blocks_a[ $axiom_blocks_attr_key ] ) && '' !== (string) $axiom_blocks_a[ $axiom_blocks_attr_key ] ) {
		$axiom_blocks_style_parts[] = $axiom_blocks_css_var . ': ' . $axiom_blocks_a[ $axiom_blocks_attr_key ];
	}
}

// Border style only means anything once a width is set; default it to solid so
// a width-only edit paints, matching the editor preview.
$axiom_blocks_any_card_bw = false;
foreach ( array( 'cardBorderTopWidth', 'cardBorderRightWidth', 'cardBorderBottomWidth', 'cardBorderLeftWidth' ) as $axiom_blocks_bw_key ) {
	if ( ! empty( $axiom_blocks_a[ $axiom_blocks_bw_key ] ) ) {
		$axiom_blocks_any_card_bw = true;
		break;
	}
}
// Same treatment for the button's border, and the two "a chosen color must not
// be dimmed" overrides + the strikethrough toggle. Mirrors getPricingTableVars().
$axiom_blocks_any_cta_bw = false;
foreach ( array( 'ctaBorderTopWidth', 'ctaBorderRightWidth', 'ctaBorderBottomWidth', 'ctaBorderLeftWidth' ) as $axiom_blocks_cta_bw_key ) {
	if ( ! empty( $axiom_blocks_a[ $axiom_blocks_cta_bw_key ] ) ) {
		$axiom_blocks_any_cta_bw = true;
		break;
	}
}
$axiom_blocks_any_card_bw_f = false;
foreach ( array( 'cardBorderTopWidthFeatured', 'cardBorderRightWidthFeatured', 'cardBorderBottomWidthFeatured', 'cardBorderLeftWidthFeatured' ) as $axiom_blocks_bwf_key ) {
	if ( ! empty( $axiom_blocks_a[ $axiom_blocks_bwf_key ] ) ) {
		$axiom_blocks_any_card_bw_f = true;
		break;
	}
}
$axiom_blocks_card_border_style_f = (string) ( $axiom_blocks_a['cardBorderStyleFeatured'] ?? '' );
if ( $axiom_blocks_any_card_bw_f ) {
	$axiom_blocks_style_parts[] = '--ab-pt-cardf-bs: ' . ( '' !== $axiom_blocks_card_border_style_f ? $axiom_blocks_card_border_style_f : 'solid' );
} elseif ( '' !== $axiom_blocks_card_border_style_f ) {
	$axiom_blocks_style_parts[] = '--ab-pt-cardf-bs: ' . $axiom_blocks_card_border_style_f;
}

$axiom_blocks_any_badge_bw = false;
foreach ( array( 'badgeBorderTopWidth', 'badgeBorderRightWidth', 'badgeBorderBottomWidth', 'badgeBorderLeftWidth' ) as $axiom_blocks_badge_bw_key ) {
	if ( ! empty( $axiom_blocks_a[ $axiom_blocks_badge_bw_key ] ) ) {
		$axiom_blocks_any_badge_bw = true;
		break;
	}
}
$axiom_blocks_badge_border_style = (string) ( $axiom_blocks_a['badgeBorderStyle'] ?? '' );
if ( $axiom_blocks_any_badge_bw ) {
	$axiom_blocks_style_parts[] = '--ab-pt-badge-bs: ' . ( '' !== $axiom_blocks_badge_border_style ? $axiom_blocks_badge_border_style : 'solid' );
} elseif ( '' !== $axiom_blocks_badge_border_style ) {
	$axiom_blocks_style_parts[] = '--ab-pt-badge-bs: ' . $axiom_blocks_badge_border_style;
}

$axiom_blocks_cta_border_style = (string) ( $axiom_blocks_a['ctaBorderStyle'] ?? '' );
if ( $axiom_blocks_any_cta_bw ) {
	$axiom_blocks_style_parts[] = '--ab-pt-cta-bs: ' . ( '' !== $axiom_blocks_cta_border_style ? $axiom_blocks_cta_border_style : 'solid' );
} elseif ( '' !== $axiom_blocks_cta_border_style ) {
	$axiom_blocks_style_parts[] = '--ab-pt-cta-bs: ' . $axiom_blocks_cta_border_style;
}
if ( ! empty( $axiom_blocks_a['descColor'] ) ) {
	$axiom_blocks_style_parts[] = '--ab-pt-desc-op: 1';
}
if ( ! empty( $axiom_blocks_a['periodColor'] ) ) {
	$axiom_blocks_style_parts[] = '--ab-pt-period-op: 1';
}
if ( ! empty( $axiom_blocks_a['ctaBgHover'] ) ) {
	$axiom_blocks_style_parts[] = '--ab-pt-cta-hover-op: 1';
}
if ( isset( $axiom_blocks_a['featStrikeExcluded'] ) && ! $axiom_blocks_a['featStrikeExcluded'] ) {
	$axiom_blocks_style_parts[] = '--ab-pt-feat-ex-td: none';
}

$axiom_blocks_card_border_style = (string) ( $axiom_blocks_a['cardBorderStyle'] ?? '' );
if ( $axiom_blocks_any_card_bw ) {
	$axiom_blocks_style_parts[] = '--ab-pt-card-bs: ' . ( '' !== $axiom_blocks_card_border_style ? $axiom_blocks_card_border_style : 'solid' );
} elseif ( '' !== $axiom_blocks_card_border_style ) {
	$axiom_blocks_style_parts[] = '--ab-pt-card-bs: ' . $axiom_blocks_card_border_style;
}

$axiom_blocks_inline_style = implode( '; ', $axiom_blocks_style_parts );
$axiom_blocks_inline_style = Spacing::merge( $axiom_blocks_inline_style, $axiom_blocks_a );

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
		rtrim( trim( $axiom_blocks_inline_style ), ';' ),
	)
);
$axiom_blocks_style_attr         = safecss_filter_attr( implode( ';', $axiom_blocks_merged_style_parts ) );

$axiom_blocks_id_attr = $axiom_blocks_block_supports['id'] ?? '';

$axiom_blocks_heading_style = safecss_filter_attr( Typography::inline_style( $axiom_blocks_a, 'heading' ) );
// Legacy fallback: if no `headingTextAlign` is set, use the older `headingAlign`.
if ( false === stripos( $axiom_blocks_heading_style, 'text-align' ) ) {
	$axiom_blocks_sep            = ( '' !== $axiom_blocks_heading_style ) ? '; ' : '';
	$axiom_blocks_heading_style .= $axiom_blocks_sep . 'text-align: ' . sanitize_html_class( $axiom_blocks_heading_align );
}
?>
<div <?php echo '' !== $axiom_blocks_id_attr ? 'id="' . esc_attr( $axiom_blocks_id_attr ) . '" ' : ''; ?> class="<?php echo esc_attr( $axiom_blocks_class_attr ); ?>" <?php echo '' !== $axiom_blocks_style_attr ? ' style="' . esc_attr( $axiom_blocks_style_attr ) . '"' : ''; ?>>
	<?php if ( $axiom_blocks_heading_show && '' !== $axiom_blocks_heading_text ) : ?>
		<div class="axiom-blocks-pricing-table__heading" style="<?php echo esc_attr( $axiom_blocks_heading_style ); ?>">
			<?php echo esc_html( $axiom_blocks_heading_text ); ?>
		</div>
	<?php endif; ?>

	<div class="axiom-blocks-pricing-table__grid">
		<?php echo wp_kses( $content, AllowedHtml::post_with_svg() ); ?>
	</div>
</div>
