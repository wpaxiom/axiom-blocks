<?php
/**
 * Tabs Block — server-side render.
 *
 * @package AxiomBlocks
 * @var array    $attributes Block attributes.
 * @var string   $content    Rendered inner blocks (panels).
 * @var WP_Block $block      Block instance.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use AxiomBlocks\Blocks\AllowedHtml;
use AxiomBlocks\Blocks\Background;
use AxiomBlocks\Blocks\Spacing;
use AxiomBlocks\Blocks\Typography;
use AxiomBlocks\Blocks\UIIcons;

/* Retired `tabStyle` presets → Styles-row attributes.
 *
 * The presets were deleted 2026-08-05. The editor bakes a saved preset into the
 * rows once, on load; this is the read-only twin for content nobody has reopened
 * yet, so the front end is right immediately. Applied to `$attributes` before
 * anything reads it, so every var below picks the baked values up for free.
 *
 * Mirrors TAB_STYLE_BAKE / bakeTabStyle() in index.js — keep the two in step.
 * Values transcribed from the v1.0.5 stylesheet; hex (8-digit for alpha) because
 * safecss strips `rgba()`. `underline` + vertical is absent on purpose: the old
 * vertical rules came last at equal specificity and beat the preset, so that
 * combination already rendered as plain vertical. */
$axiom_blocks_tab_style = (string) ( $attributes['tabStyle'] ?? '' );
if ( '' !== $axiom_blocks_tab_style ) {
	$axiom_blocks_bake_vertical = 'vertical' === ( $attributes['tabOrientation'] ?? 'horizontal' );
	$axiom_blocks_bake_all      = array(
		'pills'     => array(
			'horizontal' => array(
				'backgroundColor'      => '#7c3aed0f',
				'barBorderTopWidth'    => '0',
				'barBorderRightWidth'  => '0',
				'barBorderBottomWidth' => '0',
				'barBorderLeftWidth'   => '0',
				'barRadiusTopLeft'     => '999px',
				'barRadiusTopRight'    => '999px',
				'barRadiusBottomRight' => '999px',
				'barRadiusBottomLeft'  => '999px',
				'barPaddingTop'        => '0.375rem',
				'barPaddingRight'      => '0.375rem',
				'barPaddingBottom'     => '0.375rem',
				'barPaddingLeft'       => '0.375rem',
				'barFitContent'        => true,
				'tabGap'               => '0.375rem',
				'tabBorderTopWidth'    => '0',
				'tabBorderRightWidth'  => '0',
				'tabBorderBottomWidth' => '0',
				'tabBorderLeftWidth'   => '0',
				'tabRadiusTopLeft'     => '999px',
				'tabRadiusTopRight'    => '999px',
				'tabRadiusBottomRight' => '999px',
				'tabRadiusBottomLeft'  => '999px',
				'tabPaddingTop'        => '0.5rem',
				'tabPaddingRight'      => '1.1rem',
				'tabPaddingBottom'     => '0.5rem',
				'tabPaddingLeft'       => '1.1rem',
				'inactiveColor'        => '#0000008c',
				'labelFontWeight'      => '500',
				'tabBgHover'           => '#7c3aed14',
				'tabColorHover'        => '#7c3aed',
				'tabShadowActive'      => '0 1px 2px #00000014',
			),
			'vertical'   => array(
				'backgroundColor'      => '#7c3aed0f',
				'barBorderTopWidth'    => '0',
				'barBorderRightWidth'  => '0',
				'barBorderBottomWidth' => '0',
				'barBorderLeftWidth'   => '0',
				'barRadiusTopLeft'     => '12px',
				'barRadiusTopRight'    => '12px',
				'barRadiusBottomRight' => '12px',
				'barRadiusBottomLeft'  => '12px',
				'barPaddingTop'        => '0.5rem',
				'barPaddingRight'      => '0.5rem',
				'barPaddingBottom'     => '0.5rem',
				'barPaddingLeft'       => '0.5rem',
				'tabGap'               => '0.25rem',
				'tabBorderTopWidth'    => '0',
				'tabBorderRightWidth'  => '0',
				'tabBorderBottomWidth' => '0',
				'tabBorderLeftWidth'   => '0',
				'tabRadiusTopLeft'     => '8px',
				'tabRadiusTopRight'    => '8px',
				'tabRadiusBottomRight' => '8px',
				'tabRadiusBottomLeft'  => '8px',
				'tabPaddingTop'        => '0.5rem',
				'tabPaddingRight'      => '0.875rem',
				'tabPaddingBottom'     => '0.5rem',
				'tabPaddingLeft'       => '0.875rem',
				'inactiveColor'        => '#0000008c',
				'labelFontWeight'      => '500',
				'tabBgHover'           => '#7c3aed14',
				'tabColorHover'        => '#7c3aed',
				'tabShadowActive'      => '0 1px 2px #00000014',
			),
		),
		'underline' => array(
			'horizontal' => array(
				'barBorderBottomWidth' => '2px',
				'tabBorderBottomWidth' => '3px',
			),
			'vertical'   => array(),
		),
		'boxed'     => array(
			'horizontal' => array(
				'backgroundColor'        => '#f3f4f6',
				'barBorderTopWidth'      => '0',
				'barBorderRightWidth'    => '0',
				'barBorderBottomWidth'   => '1px',
				'barBorderLeftWidth'     => '0',
				'barBorderColor'         => '#e5e7eb',
				'barRadiusTopLeft'       => '8px',
				'barRadiusTopRight'      => '8px',
				'barRadiusBottomRight'   => '0',
				'barRadiusBottomLeft'    => '0',
				'barPaddingTop'          => '0.375rem',
				'barPaddingRight'        => '0.375rem',
				'barPaddingBottom'       => '0',
				'barPaddingLeft'         => '0.375rem',
				'tabGap'                 => '0.25rem',
				'tabBorderTopWidth'      => '1px',
				'tabBorderRightWidth'    => '1px',
				'tabBorderBottomWidth'   => '0',
				'tabBorderLeftWidth'     => '1px',
				'tabBorderColor'         => '#00000000',
				'tabRadiusTopLeft'       => '6px',
				'tabRadiusTopRight'      => '6px',
				'tabRadiusBottomRight'   => '0',
				'tabRadiusBottomLeft'    => '0',
				'tabPaddingTop'          => '0.625rem',
				'tabPaddingRight'        => '1.1rem',
				'tabPaddingBottom'       => '0.625rem',
				'tabPaddingLeft'         => '1.1rem',
				'inactiveColor'          => '#0000008c',
				'labelFontWeight'        => '500',
				'tabBgHover'             => '#ffffff8c',
				'tabColorHover'          => '#7c3aed',
				'tabBorderColorActive'   => '#e5e7eb',
				'panelBorderTopWidth'    => '0',
				'panelBorderRightWidth'  => '1px',
				'panelBorderBottomWidth' => '1px',
				'panelBorderLeftWidth'   => '1px',
				'panelBorderColor'       => '#e5e7eb',
				'panelRadiusTopLeft'     => '0',
				'panelRadiusTopRight'    => '0',
				'panelRadiusBottomRight' => '8px',
				'panelRadiusBottomLeft'  => '8px',
				'panelPaddingTop'        => '1.25rem',
				'panelPaddingRight'      => '1.25rem',
				'panelPaddingBottom'     => '1.25rem',
				'panelPaddingLeft'       => '1.25rem',
			),
			'vertical'   => array(
				'backgroundColor'        => '#f3f4f6',
				'barBorderTopWidth'      => '0',
				'barBorderRightWidth'    => '1px',
				'barBorderBottomWidth'   => '0',
				'barBorderLeftWidth'     => '0',
				'barBorderColor'         => '#e5e7eb',
				'barRadiusTopLeft'       => '8px',
				'barRadiusTopRight'      => '0',
				'barRadiusBottomRight'   => '0',
				'barRadiusBottomLeft'    => '8px',
				'barPaddingTop'          => '0.5rem',
				'barPaddingRight'        => '0',
				'barPaddingBottom'       => '0.5rem',
				'barPaddingLeft'         => '0.5rem',
				'tabGap'                 => '0.25rem',
				'tabBorderTopWidth'      => '1px',
				'tabBorderRightWidth'    => '0',
				'tabBorderBottomWidth'   => '1px',
				'tabBorderLeftWidth'     => '1px',
				'tabBorderColor'         => '#00000000',
				'tabRadiusTopLeft'       => '6px',
				'tabRadiusTopRight'      => '0',
				'tabRadiusBottomRight'   => '0',
				'tabRadiusBottomLeft'    => '6px',
				'tabPaddingTop'          => '0.625rem',
				'tabPaddingRight'        => '0.875rem',
				'tabPaddingBottom'       => '0.625rem',
				'tabPaddingLeft'         => '0.875rem',
				'inactiveColor'          => '#0000008c',
				'labelFontWeight'        => '500',
				'tabBgHover'             => '#ffffff8c',
				'tabColorHover'          => '#7c3aed',
				'tabBorderColorActive'   => '#e5e7eb',
				'panelBorderTopWidth'    => '1px',
				'panelBorderRightWidth'  => '1px',
				'panelBorderBottomWidth' => '1px',
				'panelBorderLeftWidth'   => '1px',
				'panelBorderColor'       => '#e5e7eb',
				'panelRadiusTopLeft'     => '0',
				'panelRadiusTopRight'    => '8px',
				'panelRadiusBottomRight' => '8px',
				'panelRadiusBottomLeft'  => '0',
				'panelPaddingTop'        => '1.25rem',
				'panelPaddingRight'      => '1.25rem',
				'panelPaddingBottom'     => '1.25rem',
				'panelPaddingLeft'       => '1.25rem',
			),
		),
	);

	$axiom_blocks_bake = $axiom_blocks_bake_all[ $axiom_blocks_tab_style ][ $axiom_blocks_bake_vertical ? 'vertical' : 'horizontal' ] ?? array();

	// An author value beats the preset it was saved with, so only fill blanks.
	// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound -- $attributes is the WordPress-provided render template variable.
	foreach ( $axiom_blocks_bake as $axiom_blocks_bake_key => $axiom_blocks_bake_value ) {
		if ( ! isset( $attributes[ $axiom_blocks_bake_key ] ) || '' === (string) $attributes[ $axiom_blocks_bake_key ] ) {
			$attributes[ $axiom_blocks_bake_key ] = $axiom_blocks_bake_value;
		}
	}

	/* Derived — the preset repurposed an author color instead of leaving it where
	   the new rows expect it, so these are computed and always written. Pills
	   painted the active tab's BACKGROUND with `activeColor` and forced white
	   text; boxed used `contentBackgroundColor` and kept `activeColor` as text. */
	if ( $axiom_blocks_bake ) {
		if ( 'pills' === $axiom_blocks_tab_style ) {
			$axiom_blocks_attr_active  = (string) ( $attributes['activeColor'] ?? '' );
			$attributes['tabBgActive'] = '' !== $axiom_blocks_attr_active ? $axiom_blocks_attr_active : '#7c3aed';
			$attributes['activeColor'] = '#ffffff';
		} elseif ( 'boxed' === $axiom_blocks_tab_style ) {
			$axiom_blocks_attr_panel_bg           = (string) ( $attributes['contentBackgroundColor'] ?? '' );
			$attributes['tabBgActive']            = '' !== $axiom_blocks_attr_panel_bg ? $axiom_blocks_attr_panel_bg : '#ffffff';
			$attributes['activeColor']            = (string) ( $attributes['activeColor'] ?? '' ) !== '' ? $attributes['activeColor'] : '#7c3aed';
			$attributes['contentBackgroundColor'] = '' !== $axiom_blocks_attr_panel_bg ? $axiom_blocks_attr_panel_bg : '#ffffff';
		}
	}
	// phpcs:enable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound
}

$axiom_blocks_tab_orientation = $attributes['tabOrientation'] ?? 'horizontal';
$axiom_blocks_tab_alignment   = $attributes['tabAlignment'] ?? 'left';
$axiom_blocks_full_width      = ! empty( $attributes['fullWidthTabs'] );
$axiom_blocks_active_tab      = $attributes['activeTab'] ?? '';
$axiom_blocks_active_color    = $attributes['activeColor'] ?? '';
$axiom_blocks_inactive_color  = $attributes['inactiveColor'] ?? '';
$axiom_blocks_bar_bg          = $attributes['backgroundColor'] ?? '';
$axiom_blocks_content_bg      = $attributes['contentBackgroundColor'] ?? '';
$axiom_blocks_content_gap     = isset( $attributes['contentGap'] ) ? (float) $attributes['contentGap'] : 0;

$axiom_blocks_panels = $block->parsed_block['innerBlocks'] ?? array();

$axiom_blocks_panel_ids              = array_map( fn( $axiom_blocks_p ) => $axiom_blocks_p['attrs']['tabId'] ?? '', $axiom_blocks_panels );
$axiom_blocks_resolved_from_fallback = false;
if ( ! in_array( $axiom_blocks_active_tab, $axiom_blocks_panel_ids, true ) && ! empty( $axiom_blocks_panel_ids ) ) {
	$axiom_blocks_active_tab             = $axiom_blocks_panel_ids[0];
	$axiom_blocks_resolved_from_fallback = true;
}

$axiom_blocks_classes = array(
	'axiom-blocks-tabs',
	'axiom-blocks-tab--' . sanitize_html_class( $axiom_blocks_tab_orientation ),
);
if ( 'vertical' !== $axiom_blocks_tab_orientation ) {
	$axiom_blocks_classes[] = 'axiom-blocks-tab--align-' . sanitize_html_class( $axiom_blocks_tab_alignment );
}
if ( $axiom_blocks_full_width ) {
	$axiom_blocks_classes[] = 'is-full-width';
}
if ( ! empty( $attributes['barFitContent'] ) ) {
	$axiom_blocks_classes[] = 'is-bar-fit';
}

$axiom_blocks_justify = 'vertical' === $axiom_blocks_tab_orientation
	? ''
	: ( array(
		'left'   => 'flex-start',
		'center' => 'center',
		'right'  => 'flex-end',
	)[ $axiom_blocks_tab_alignment ] ?? 'flex-start' );

$axiom_blocks_style_vars = array();
if ( $axiom_blocks_active_color ) {
	$axiom_blocks_style_vars[] = '--axiom-blocks-tab-active: ' . $axiom_blocks_active_color;
}
if ( $axiom_blocks_inactive_color ) {
	$axiom_blocks_style_vars[] = '--axiom-blocks-tab-inactive: ' . $axiom_blocks_inactive_color;
}
if ( $axiom_blocks_bar_bg ) {
	$axiom_blocks_style_vars[] = '--axiom-blocks-tab-bg: ' . $axiom_blocks_bar_bg;
}
if ( $axiom_blocks_content_bg ) {
	$axiom_blocks_style_vars[] = '--axiom-blocks-tab-content-bg: ' . $axiom_blocks_content_bg;
}
if ( $axiom_blocks_content_gap > 0 ) {
	$axiom_blocks_style_vars[] = '--axiom-blocks-tabs-content-gap: ' . $axiom_blocks_content_gap . 'px';
}

/* Design-layer boxes (2026-08-05). Every var is optional: an unset attribute
   emits nothing, so style.scss falls back to the `*-def` value carrying the
   shipped look. Mirrors getTabsVars() in index.js — keep the two in step. */
$axiom_blocks_var_map = array(
	'--ab-tabs-gap'             => 'tabGap',
	'--ab-tabs-tab-icon-gap'    => 'tabIconGap',
	'--ab-tabs-bar-bc'          => 'barBorderColor',
	'--ab-tabs-bar-bw-top'      => 'barBorderTopWidth',
	'--ab-tabs-bar-bw-right'    => 'barBorderRightWidth',
	'--ab-tabs-bar-bw-bottom'   => 'barBorderBottomWidth',
	'--ab-tabs-bar-bw-left'     => 'barBorderLeftWidth',
	'--ab-tabs-bar-radius-tl'   => 'barRadiusTopLeft',
	'--ab-tabs-bar-radius-tr'   => 'barRadiusTopRight',
	'--ab-tabs-bar-radius-br'   => 'barRadiusBottomRight',
	'--ab-tabs-bar-radius-bl'   => 'barRadiusBottomLeft',
	'--ab-tabs-bar-pt'          => 'barPaddingTop',
	'--ab-tabs-bar-pr'          => 'barPaddingRight',
	'--ab-tabs-bar-pb'          => 'barPaddingBottom',
	'--ab-tabs-bar-pl'          => 'barPaddingLeft',
	'--ab-tabs-tab-bg'          => 'tabBg',
	'--ab-tabs-tab-bg-h'        => 'tabBgHover',
	'--ab-tabs-tab-bg-a'        => 'tabBgActive',
	'--ab-tabs-tab-color-h'     => 'tabColorHover',
	'--ab-tabs-tab-bc'          => 'tabBorderColor',
	'--ab-tabs-tab-bw-top'      => 'tabBorderTopWidth',
	'--ab-tabs-tab-bw-right'    => 'tabBorderRightWidth',
	'--ab-tabs-tab-bw-bottom'   => 'tabBorderBottomWidth',
	'--ab-tabs-tab-bw-left'     => 'tabBorderLeftWidth',
	'--ab-tabs-tab-radius-tl'   => 'tabRadiusTopLeft',
	'--ab-tabs-tab-radius-tr'   => 'tabRadiusTopRight',
	'--ab-tabs-tab-radius-br'   => 'tabRadiusBottomRight',
	'--ab-tabs-tab-radius-bl'   => 'tabRadiusBottomLeft',
	'--ab-tabs-tab-pt'          => 'tabPaddingTop',
	'--ab-tabs-tab-pr'          => 'tabPaddingRight',
	'--ab-tabs-tab-pb'          => 'tabPaddingBottom',
	'--ab-tabs-tab-pl'          => 'tabPaddingLeft',
	'--ab-tabs-tab-shadow'      => 'tabShadow',
	'--ab-tabs-tab-shadow-h'    => 'tabShadowHover',
	'--ab-tabs-tab-shadow-a'    => 'tabShadowActive',
	'--ab-tabs-tab-bc-h'        => 'tabBorderColorHover',
	'--ab-tabs-tab-bw-top-h'    => 'tabBorderTopWidthHover',
	'--ab-tabs-tab-bw-right-h'  => 'tabBorderRightWidthHover',
	'--ab-tabs-tab-bw-bottom-h' => 'tabBorderBottomWidthHover',
	'--ab-tabs-tab-bw-left-h'   => 'tabBorderLeftWidthHover',
	'--ab-tabs-tab-bc-a'        => 'tabBorderColorActive',
	'--ab-tabs-tab-bw-top-a'    => 'tabBorderTopWidthActive',
	'--ab-tabs-tab-bw-right-a'  => 'tabBorderRightWidthActive',
	'--ab-tabs-tab-bw-bottom-a' => 'tabBorderBottomWidthActive',
	'--ab-tabs-tab-bw-left-a'   => 'tabBorderLeftWidthActive',
	'--ab-tabs-panel-bc'        => 'panelBorderColor',
	'--ab-tabs-panel-bw-top'    => 'panelBorderTopWidth',
	'--ab-tabs-panel-bw-right'  => 'panelBorderRightWidth',
	'--ab-tabs-panel-bw-bottom' => 'panelBorderBottomWidth',
	'--ab-tabs-panel-bw-left'   => 'panelBorderLeftWidth',
	'--ab-tabs-panel-radius-tl' => 'panelRadiusTopLeft',
	'--ab-tabs-panel-radius-tr' => 'panelRadiusTopRight',
	'--ab-tabs-panel-radius-br' => 'panelRadiusBottomRight',
	'--ab-tabs-panel-radius-bl' => 'panelRadiusBottomLeft',
	'--ab-tabs-panel-shadow'    => 'panelShadow',
	'--ab-tabs-panel-pt'        => 'panelPaddingTop',
	'--ab-tabs-panel-pr'        => 'panelPaddingRight',
	'--ab-tabs-panel-pb'        => 'panelPaddingBottom',
	'--ab-tabs-panel-pl'        => 'panelPaddingLeft',
);
foreach ( $axiom_blocks_var_map as $axiom_blocks_css_var => $axiom_blocks_attr_key ) {
	if ( isset( $attributes[ $axiom_blocks_attr_key ] ) && '' !== (string) $attributes[ $axiom_blocks_attr_key ] ) {
		$axiom_blocks_style_vars[] = $axiom_blocks_css_var . ': ' . $attributes[ $axiom_blocks_attr_key ];
	}
}

// A border style only means anything once a width is set; default it to solid so
// a width-only edit paints, matching the editor preview.
foreach ( array(
	array( '--ab-tabs-bar-bs', 'barBorderStyle', array( 'barBorderTopWidth', 'barBorderRightWidth', 'barBorderBottomWidth', 'barBorderLeftWidth' ) ),
	array( '--ab-tabs-tab-bs', 'tabBorderStyle', array( 'tabBorderTopWidth', 'tabBorderRightWidth', 'tabBorderBottomWidth', 'tabBorderLeftWidth' ) ),
	array( '--ab-tabs-tab-bs-h', 'tabBorderStyleHover', array( 'tabBorderTopWidthHover', 'tabBorderRightWidthHover', 'tabBorderBottomWidthHover', 'tabBorderLeftWidthHover' ) ),
	array( '--ab-tabs-tab-bs-a', 'tabBorderStyleActive', array( 'tabBorderTopWidthActive', 'tabBorderRightWidthActive', 'tabBorderBottomWidthActive', 'tabBorderLeftWidthActive' ) ),
	array( '--ab-tabs-panel-bs', 'panelBorderStyle', array( 'panelBorderTopWidth', 'panelBorderRightWidth', 'panelBorderBottomWidth', 'panelBorderLeftWidth' ) ),
) as $axiom_blocks_bs_row ) {
	list( $axiom_blocks_bs_var, $axiom_blocks_bs_attr, $axiom_blocks_width_keys ) = $axiom_blocks_bs_row;
	$axiom_blocks_any_width = false;
	foreach ( $axiom_blocks_width_keys as $axiom_blocks_width_key ) {
		if ( ! empty( $attributes[ $axiom_blocks_width_key ] ) ) {
			$axiom_blocks_any_width = true;
			break;
		}
	}
	$axiom_blocks_border_style = (string) ( $attributes[ $axiom_blocks_bs_attr ] ?? '' );
	if ( $axiom_blocks_any_width ) {
		$axiom_blocks_style_vars[] = $axiom_blocks_bs_var . ': ' . ( '' !== $axiom_blocks_border_style ? $axiom_blocks_border_style : 'solid' );
	} elseif ( '' !== $axiom_blocks_border_style ) {
		$axiom_blocks_style_vars[] = $axiom_blocks_bs_var . ': ' . $axiom_blocks_border_style;
	}
}

// The shipped 0.75 dim would tint a chosen inactive color. Mirrors getTabsVars().
if ( ! empty( $attributes['inactiveColor'] ) ) {
	$axiom_blocks_style_vars[] = '--ab-tabs-tab-op: 1';
}

// Panel background — a flat color resolves to the shipped `contentBackgroundColor`,
// so old tabs are unchanged; gradient / image / overlay are additive.
$axiom_blocks_panel_bg = Background::value( $attributes, 'panel', 'contentBackgroundColor' );
if ( '' !== $axiom_blocks_panel_bg ) {
	$axiom_blocks_style_vars[] = '--ab-tabs-panel-bg: ' . $axiom_blocks_panel_bg;
}

// Tab bar background — flat color resolves to the shipped `backgroundColor`, so
// old tabs are unchanged; the gradient is additive (no image on a bar).
$axiom_blocks_bar_bg = Background::value( $attributes, 'bar', 'backgroundColor' );
if ( '' !== $axiom_blocks_bar_bg ) {
	$axiom_blocks_style_vars[] = '--ab-tabs-bar-bg: ' . $axiom_blocks_bar_bg;
}
$axiom_blocks_style_vars = array_merge(
	$axiom_blocks_style_vars,
	Background::layer_vars( $attributes, 'panel', 'ab-tabs-panel' )
);

$axiom_blocks_spacing_style  = Spacing::inline_style( $attributes );
$axiom_blocks_block_supports = WP_Block_Supports::get_instance()->apply_block_supports();

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
		implode( '; ', $axiom_blocks_style_vars ),
		rtrim( trim( $axiom_blocks_spacing_style ), ';' ),
	)
);
$axiom_blocks_style_attr  = safecss_filter_attr( implode( '; ', $axiom_blocks_style_parts ) );

$axiom_blocks_id_attr = $axiom_blocks_block_supports['id'] ?? '';

$axiom_blocks_label_typo = safecss_filter_attr( Typography::inline_style( $attributes, 'label' ) );
?>
<div <?php echo '' !== $axiom_blocks_id_attr ? 'id="' . esc_attr( $axiom_blocks_id_attr ) . '" ' : ''; ?>class="<?php echo esc_attr( $axiom_blocks_class_attr ); ?>"<?php echo '' !== $axiom_blocks_style_attr ? ' style="' . esc_attr( $axiom_blocks_style_attr ) . '"' : ''; ?> data-active-tab="<?php echo esc_attr( $axiom_blocks_active_tab ); ?>">
	<div
		class="axiom-blocks-tabs__list"
		role="tablist"
		<?php echo '' !== $axiom_blocks_justify ? 'style="justify-content: ' . esc_attr( $axiom_blocks_justify ) . '"' : ''; ?>
	>
		<?php
		foreach ( $axiom_blocks_panels as $axiom_blocks_panel ) :
			$axiom_blocks_tab_id    = $axiom_blocks_panel['attrs']['tabId'] ?? '';
			$axiom_blocks_label     = $axiom_blocks_panel['attrs']['label'] ?? __( 'Tab', 'axiom-blocks' );
			$axiom_blocks_icon_slug = $axiom_blocks_panel['attrs']['iconSlug'] ?? '';
			$axiom_blocks_icon_url  = $axiom_blocks_panel['attrs']['iconUrl'] ?? '';
			$axiom_blocks_icon_alt  = $axiom_blocks_panel['attrs']['iconAlt'] ?? '';
			$axiom_blocks_is_active = $axiom_blocks_tab_id === $axiom_blocks_active_tab;

			$axiom_blocks_icon_markup = '';
			if ( '' !== $axiom_blocks_icon_slug && UIIcons::has( $axiom_blocks_icon_slug ) ) {
				$axiom_blocks_icon_markup = UIIcons::svg( $axiom_blocks_icon_slug );
			} elseif ( '' !== $axiom_blocks_icon_url ) {
				$axiom_blocks_icon_markup = sprintf(
					'<img src="%s" alt="%s" class="axiom-blocks-tabs__icon-img" />',
					esc_url( $axiom_blocks_icon_url ),
					esc_attr( $axiom_blocks_icon_alt )
				);
			}
			?>
			<button
				type="button"
				class="axiom-blocks-tabs__tab <?php echo esc_attr( $axiom_blocks_is_active ? 'is-active' : '' ); ?>"
				role="tab"
				aria-selected="<?php echo esc_attr( $axiom_blocks_is_active ? 'true' : 'false' ); ?>"
				aria-controls="axiom-blocks-panel-<?php echo esc_attr( $axiom_blocks_tab_id ); ?>"
				id="axiom-blocks-tab-<?php echo esc_attr( $axiom_blocks_tab_id ); ?>"
				data-tab="<?php echo esc_attr( $axiom_blocks_tab_id ); ?>"
			>
				<?php if ( '' !== $axiom_blocks_icon_markup ) : ?>
					<span class="axiom-blocks-tabs__icon"><?php echo wp_kses( $axiom_blocks_icon_markup, AllowedHtml::post_with_svg() ); ?></span>
				<?php endif; ?>
				<span class="axiom-blocks-tabs__label"<?php echo '' !== $axiom_blocks_label_typo ? ' style="' . esc_attr( $axiom_blocks_label_typo ) . '"' : ''; ?>><?php echo esc_html( $axiom_blocks_label ); ?></span>
			</button>
		<?php endforeach; ?>
	</div>
	<div class="axiom-blocks-tabs__content">
		<?php
		if ( $axiom_blocks_resolved_from_fallback && ! empty( $axiom_blocks_panels ) ) {
			foreach ( $axiom_blocks_panels as $axiom_blocks_panel ) {
				$axiom_blocks_panel_block = new WP_Block(
					$axiom_blocks_panel,
					array( 'axiom-blocks/activeTab' => $axiom_blocks_active_tab )
				);
				echo wp_kses_post( $axiom_blocks_panel_block->render() );
			}
		} else {
			echo wp_kses_post( $content );
		}
		?>
	</div>
</div>
