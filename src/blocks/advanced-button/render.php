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

$axiom_blocks_style_preset  = (string) ( $axiom_blocks_a['stylePreset'] ?? 'fill' );
$axiom_blocks_size_preset   = (string) ( $axiom_blocks_a['sizePreset'] ?? 'md' );
$axiom_blocks_align         = (string) ( $axiom_blocks_a['buttonAlign'] ?? '' );

$axiom_blocks_hover_effect = (string) ( $axiom_blocks_a['hoverEffect'] ?? 'none' );
$axiom_blocks_shadow       = (string) ( $axiom_blocks_a['shadow'] ?? 'none' );
$axiom_blocks_hover_shadow = (string) ( $axiom_blocks_a['hoverShadow'] ?? '' );

$axiom_blocks_icon_svg = '' !== $axiom_blocks_icon ? Icons::get( $axiom_blocks_icon ) : '';

/* Shadow resolution — matches LEGACY_SHADOWS in index.js. Shorthand values
   (sm / md / lg) must be expanded to real CSS; raw shadow strings pass through. */
$axiom_blocks_legacy_shadows = array(
	'none' => '',
	''     => '',
	'sm'   => '0 1px 3px rgba(16,24,40,0.18)',
	'md'   => '0 4px 10px rgba(16,24,40,0.2)',
	'lg'   => '0 10px 24px rgba(16,24,40,0.24)',
);
$axiom_blocks_resolve_shadow = function ( $v ) use ( $axiom_blocks_legacy_shadows ) {
	if ( '' === $v || 'none' === $v ) {
		return '';
	}
	return isset( $axiom_blocks_legacy_shadows[ $v ] ) ? $axiom_blocks_legacy_shadows[ $v ] : $v;
};

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
/* Shadow: resolve shorthand (sm/md/lg) → real CSS, emit as vars consumed by style.scss. */
$axiom_blocks_resolved_shadow = $axiom_blocks_resolve_shadow( $axiom_blocks_shadow );
$axiom_blocks_resolved_h_shadow = $axiom_blocks_resolve_shadow( $axiom_blocks_hover_shadow );

$axiom_blocks_style_parts = array();

$axiom_blocks_var_map = array(
	'--ab-advbtn-color'   => 'textColor',
	'--ab-advbtn-bc'      => 'borderColor',
	'--ab-advbtn-h-color' => 'hoverTextColor',
	'--ab-advbtn-h-bc'    => 'hoverBorderColor',
	'--ab-advbtn-h-bw-top'    => 'hoverBorderTopWidth',
	'--ab-advbtn-h-bw-right'  => 'hoverBorderRightWidth',
	'--ab-advbtn-h-bw-bottom' => 'hoverBorderBottomWidth',
	'--ab-advbtn-h-bw-left'   => 'hoverBorderLeftWidth',
	'--ab-advbtn-icon'    => 'iconSize',
	'--ab-advbtn-icon-color'   => 'iconColor',
	'--ab-advbtn-icon-h-color' => 'iconColorHover',
);
foreach ( $axiom_blocks_var_map as $axiom_blocks_css_var => $axiom_blocks_attr_key ) {
	if ( ! empty( $axiom_blocks_a[ $axiom_blocks_attr_key ] ) ) {
		$axiom_blocks_style_parts[] = $axiom_blocks_css_var . ': ' . $axiom_blocks_a[ $axiom_blocks_attr_key ];
	}
}

/* Shadow vars — consumed by style.scss box-shadow: var(--ab-advbtn-shadow). */
if ( '' !== $axiom_blocks_resolved_shadow ) {
	$axiom_blocks_style_parts[] = '--ab-advbtn-shadow: ' . $axiom_blocks_resolved_shadow;
}
if ( '' !== $axiom_blocks_resolved_h_shadow ) {
	$axiom_blocks_style_parts[] = '--ab-advbtn-h-shadow: ' . $axiom_blocks_resolved_h_shadow;
}

/* Individual border widths (non-hover) — fall back to legacy borderWidth for
   each side, matching editor's getButtonVars(). This prevents style.scss's
   var(--ab-advbtn-bw-*, 0) from overriding the legacy inline border-width. */
$axiom_blocks_bw_fallback = $axiom_blocks_a['borderWidth'] ?? '';
$axiom_blocks_bw_sides   = array( 'top', 'right', 'bottom', 'left' );
foreach ( $axiom_blocks_bw_sides as $axiom_blocks_side ) {
	$axiom_blocks_val = $axiom_blocks_a[ 'border' . ucfirst( $axiom_blocks_side ) . 'Width' ] ?? $axiom_blocks_bw_fallback;
	if ( '' !== $axiom_blocks_val ) {
		$axiom_blocks_style_parts[] = '--ab-advbtn-bw-' . $axiom_blocks_side . ': ' . $axiom_blocks_val;
	}
}

/* Border style var — always emit when border is configured. */
if ( ! empty( $axiom_blocks_a['borderStyle'] ) || ! empty( $axiom_blocks_a['borderWidth'] ) ) {
	$axiom_blocks_style_parts[] = '--ab-advbtn-bs: ' . ( $axiom_blocks_a['borderStyle'] ?? 'solid' );
}

/* Individual border radii — fall back to legacy borderRadius, matching editor. */
$axiom_blocks_radius_fallback = $axiom_blocks_a['borderRadius'] ?? '';
$axiom_blocks_radius_map     = array(
	'tl' => 'radiusTopLeft',
	'tr' => 'radiusTopRight',
	'br' => 'radiusBottomRight',
	'bl' => 'radiusBottomLeft',
);
foreach ( $axiom_blocks_radius_map as $axiom_blocks_key_suffix => $axiom_blocks_attr_key ) {
	$axiom_blocks_val = $axiom_blocks_a[ $axiom_blocks_attr_key ] ?? $axiom_blocks_radius_fallback;
	if ( '' !== $axiom_blocks_val ) {
		$axiom_blocks_style_parts[] = '--ab-advbtn-radius-' . $axiom_blocks_key_suffix . ': ' . $axiom_blocks_val;
	}
}

/* Hover border style — emit only when at least one hover border width is set. */
$axiom_blocks_has_h_bw = false;
foreach ( array( 'Top', 'Right', 'Bottom', 'Left' ) as $axiom_blocks_side ) {
	if ( ! empty( $axiom_blocks_a[ 'hoverBorder' . $axiom_blocks_side . 'Width' ] ) ) {
		$axiom_blocks_has_h_bw = true;
		break;
	}
}
if ( $axiom_blocks_has_h_bw ) {
	$axiom_blocks_style_parts[] = '--ab-advbtn-h-bs: ' . ( $axiom_blocks_a['hoverBorderStyle'] ?? 'solid' );
}

$axiom_blocks_bg_type = $axiom_blocks_a['bgType'] ?? '';
if ( '' !== $axiom_blocks_bg_type ) {
	if ( 'color' === $axiom_blocks_bg_type && ! empty( $axiom_blocks_a['bgColor'] ) ) {
		$axiom_blocks_style_parts[] = '--ab-advbtn-bg: ' . $axiom_blocks_a['bgColor'];
	} elseif ( 'gradient' === $axiom_blocks_bg_type ) {
		$axiom_blocks_stops = $axiom_blocks_a['bgGradStops'] ?? array();
		if ( count( $axiom_blocks_stops ) >= 2 ) {
			$axiom_blocks_stop_strs = array();
			foreach ( $axiom_blocks_stops as $axiom_blocks_stop ) {
				if ( ! empty( $axiom_blocks_stop['color'] ) ) {
					$axiom_blocks_stop_strs[] = $axiom_blocks_stop['color'] . ' ' . ( $axiom_blocks_stop['position'] ?? 0 ) . '%';
				}
			}
			if ( count( $axiom_blocks_stop_strs ) >= 2 ) {
				$axiom_blocks_grad_type  = $axiom_blocks_a['bgGradType'] ?? 'linear';
				$axiom_blocks_grad_angle = $axiom_blocks_a['bgGradAngle'] ?? 90;
				if ( 'radial' === $axiom_blocks_grad_type ) {
					$axiom_blocks_style_parts[] = '--ab-advbtn-bg: radial-gradient(circle, ' . implode( ', ', $axiom_blocks_stop_strs ) . ')';
				} else {
					$axiom_blocks_style_parts[] = '--ab-advbtn-bg: linear-gradient(' . $axiom_blocks_grad_angle . 'deg, ' . implode( ', ', $axiom_blocks_stop_strs ) . ')';
				}
			}
		}
	} elseif ( 'image' === $axiom_blocks_bg_type ) {
		$axiom_blocks_bg_image = $axiom_blocks_a['bgImage'] ?? null;
		if ( ! empty( $axiom_blocks_bg_image['url'] ) ) {
			$axiom_blocks_img_position = $axiom_blocks_a['bgImagePosition'] ?? 'center center';
			$axiom_blocks_img_size     = $axiom_blocks_a['bgImageSize'] ?? 'cover';
			$axiom_blocks_img_repeat   = $axiom_blocks_a['bgImageRepeat'] ?? 'no-repeat';
			$axiom_blocks_img_layer    = "url('" . esc_url( $axiom_blocks_bg_image['url'] ) . "') {$axiom_blocks_img_position} / {$axiom_blocks_img_size} {$axiom_blocks_img_repeat}";
			$axiom_blocks_img_overlay  = $axiom_blocks_a['bgOverlay'] ?? '';
			if ( '' !== $axiom_blocks_img_overlay ) {
				$axiom_blocks_style_parts[] = '--ab-advbtn-bg: linear-gradient(' . $axiom_blocks_img_overlay . ', ' . $axiom_blocks_img_overlay . '), ' . $axiom_blocks_img_layer;
			} else {
				$axiom_blocks_style_parts[] = '--ab-advbtn-bg: ' . $axiom_blocks_img_layer;
			}
		}
	}
} elseif ( ! empty( $axiom_blocks_a['bgColor'] ) ) {
	$axiom_blocks_style_parts[] = '--ab-advbtn-bg: ' . $axiom_blocks_a['bgColor'];
}

/* Hover background */
$axiom_blocks_h_bg_type = $axiom_blocks_a['hoverBgType'] ?? '';
if ( '' !== $axiom_blocks_h_bg_type ) {
	if ( 'color' === $axiom_blocks_h_bg_type && ! empty( $axiom_blocks_a['hoverBgColor'] ) ) {
		$axiom_blocks_style_parts[] = '--ab-advbtn-h-bg: ' . $axiom_blocks_a['hoverBgColor'];
	} elseif ( 'gradient' === $axiom_blocks_h_bg_type ) {
		$axiom_blocks_h_stops = $axiom_blocks_a['hoverBgGradStops'] ?? array();
		if ( count( $axiom_blocks_h_stops ) >= 2 ) {
			$axiom_blocks_h_stop_strs = array();
			foreach ( $axiom_blocks_h_stops as $axiom_blocks_stop ) {
				if ( ! empty( $axiom_blocks_stop['color'] ) ) {
					$axiom_blocks_h_stop_strs[] = $axiom_blocks_stop['color'] . ' ' . ( $axiom_blocks_stop['position'] ?? 0 ) . '%';
				}
			}
			if ( count( $axiom_blocks_h_stop_strs ) >= 2 ) {
				$axiom_blocks_h_grad_type  = $axiom_blocks_a['hoverBgGradType'] ?? 'linear';
				$axiom_blocks_h_grad_angle = $axiom_blocks_a['hoverBgGradAngle'] ?? 90;
				if ( 'radial' === $axiom_blocks_h_grad_type ) {
					$axiom_blocks_style_parts[] = '--ab-advbtn-h-bg: radial-gradient(circle, ' . implode( ', ', $axiom_blocks_h_stop_strs ) . ')';
				} else {
					$axiom_blocks_style_parts[] = '--ab-advbtn-h-bg: linear-gradient(' . $axiom_blocks_h_grad_angle . 'deg, ' . implode( ', ', $axiom_blocks_h_stop_strs ) . ')';
				}
			}
		}
	} elseif ( 'image' === $axiom_blocks_h_bg_type ) {
		$axiom_blocks_h_bg_image = $axiom_blocks_a['hoverBgImage'] ?? null;
		if ( ! empty( $axiom_blocks_h_bg_image['url'] ) ) {
			$axiom_blocks_h_img_position = $axiom_blocks_a['hoverBgImagePosition'] ?? 'center center';
			$axiom_blocks_h_img_size     = $axiom_blocks_a['hoverBgImageSize'] ?? 'cover';
			$axiom_blocks_h_img_repeat   = $axiom_blocks_a['hoverBgImageRepeat'] ?? 'no-repeat';
			$axiom_blocks_h_img_layer    = "url('" . esc_url( $axiom_blocks_h_bg_image['url'] ) . "') {$axiom_blocks_h_img_position} / {$axiom_blocks_h_img_size} {$axiom_blocks_h_img_repeat}";
			$axiom_blocks_h_img_overlay  = $axiom_blocks_a['hoverBgOverlay'] ?? '';
			if ( '' !== $axiom_blocks_h_img_overlay ) {
				$axiom_blocks_style_parts[] = '--ab-advbtn-h-bg: linear-gradient(' . $axiom_blocks_h_img_overlay . ', ' . $axiom_blocks_h_img_overlay . '), ' . $axiom_blocks_h_img_layer;
			} else {
				$axiom_blocks_style_parts[] = '--ab-advbtn-h-bg: ' . $axiom_blocks_h_img_layer;
			}
		}
	}
} elseif ( ! empty( $axiom_blocks_a['hoverBgColor'] ) ) {
	$axiom_blocks_style_parts[] = '--ab-advbtn-h-bg: ' . $axiom_blocks_a['hoverBgColor'];
}

$axiom_blocks_sub_typo_map = array(
	'--ab-advbtn-sub-ff' => 'subCaptionFontFamily',
	'--ab-advbtn-sub-fw' => 'subCaptionFontWeight',
	'--ab-advbtn-sub-fs' => 'subCaptionFontSize',
	'--ab-advbtn-sub-lh' => 'subCaptionLineHeight',
	'--ab-advbtn-sub-ls' => 'subCaptionLetterSpacing',
	'--ab-advbtn-sub-tt' => 'subCaptionTextTransform',
	'--ab-advbtn-sub-td' => 'subCaptionTextDecoration',
	'--ab-advbtn-sub-ta' => 'subCaptionTextAlign',
);
foreach ( $axiom_blocks_sub_typo_map as $axiom_blocks_css_var => $axiom_blocks_attr_key ) {
	if ( ! empty( $axiom_blocks_a[ $axiom_blocks_attr_key ] ) ) {
		$axiom_blocks_style_parts[] = $axiom_blocks_css_var . ': ' . $axiom_blocks_a[ $axiom_blocks_attr_key ];
	}
}

/* Sub-caption color (normal + hover). An explicit color drops the muted 0.75
   opacity so the chosen color renders exactly. */
if ( ! empty( $axiom_blocks_a['subCaptionColor'] ) ) {
	$axiom_blocks_style_parts[] = '--ab-advbtn-sub-color: ' . $axiom_blocks_a['subCaptionColor'];
}
if ( ! empty( $axiom_blocks_a['subCaptionColorHover'] ) ) {
	$axiom_blocks_style_parts[] = '--ab-advbtn-sub-h-color: ' . $axiom_blocks_a['subCaptionColorHover'];
}
if ( ! empty( $axiom_blocks_a['subCaptionColor'] ) || ! empty( $axiom_blocks_a['subCaptionColorHover'] ) ) {
	$axiom_blocks_style_parts[] = '--ab-advbtn-sub-op: 1';
}

/* Text alignment — controls align-items on the content wrapper (so text + subcaption
   align left/center/right within the button) and text-align on the children. */
$axiom_blocks_text_align = $axiom_blocks_a['textAlign'] ?? '';
if ( '' !== $axiom_blocks_text_align ) {
	$axiom_blocks_align_map = array(
		'left'   => 'flex-start',
		'center' => 'center',
		'right'  => 'flex-end',
	);
	$axiom_blocks_style_parts[] = '--ab-advbtn-align: ' . ( $axiom_blocks_align_map[ $axiom_blocks_text_align ] ?? 'center' );
	$axiom_blocks_style_parts[] = '--ab-advbtn-ta: ' . $axiom_blocks_text_align;
}

if ( '' !== $axiom_blocks_icon_gap ) {
	$axiom_blocks_style_parts[] = 'gap: ' . $axiom_blocks_icon_gap;
}

/* Min-width var — consumed by style.scss min-width rule. */
if ( ! empty( $axiom_blocks_a['buttonMinWidth'] ) ) {
	$axiom_blocks_style_parts[] = '--ab-advbtn-minw: ' . $axiom_blocks_a['buttonMinWidth'];
}

/* Full-width alignment stretches the button itself (native align only stretches
   the wrapper). Left/center/right position the natural-size button via the
   wrapper's text-align, wired below. */
if ( 'full' === $axiom_blocks_align ) {
	$axiom_blocks_style_parts[] = 'width: 100%';
}

$axiom_blocks_inline_style = implode( '; ', $axiom_blocks_style_parts );
/* Button padding — the button's own INTERNAL padding. Block Spacing (padding +
   margin) lives on the wrapper (below), not here. Overrides the size preset. */
foreach ( array( 'Top', 'Right', 'Bottom', 'Left' ) as $axiom_blocks_side ) {
	$axiom_blocks_key = 'buttonPadding' . $axiom_blocks_side;
	if ( ! empty( $axiom_blocks_a[ $axiom_blocks_key ] ) ) {
		$axiom_blocks_inline_style = ( '' === $axiom_blocks_inline_style )
			? 'padding-' . strtolower( $axiom_blocks_side ) . ': ' . $axiom_blocks_a[ $axiom_blocks_key ]
			: $axiom_blocks_inline_style . '; padding-' . strtolower( $axiom_blocks_side ) . ': ' . $axiom_blocks_a[ $axiom_blocks_key ];
	}
}
$axiom_blocks_text_typo    = safecss_filter_attr( rtrim( trim( Typography::inline_style( $axiom_blocks_a ) ), ';' ) );

$axiom_blocks_block_supports = WP_Block_Supports::get_instance()->apply_block_supports();

/* Button padding (the part's own padding) — Tablet/Mobile via media queries on the
   button. Desktop stays inline below. Emitted after global spacing so it wins when
   both are set, matching the Desktop precedence. */
$axiom_blocks_btn_pad_map = array(
	'padding-top'    => 'buttonPaddingTop',
	'padding-right'  => 'buttonPaddingRight',
	'padding-bottom' => 'buttonPaddingBottom',
	'padding-left'   => 'buttonPaddingLeft',
);
if ( Responsive::has_overrides( $axiom_blocks_a, $axiom_blocks_btn_pad_map ) ) {
	$axiom_blocks_bp_class  = Responsive::instance_class( $axiom_blocks_a, $axiom_blocks_btn_pad_map );
	$axiom_blocks_classes[] = $axiom_blocks_bp_class;
	ResponsiveStyles::add( Responsive::css( $axiom_blocks_bp_class, $axiom_blocks_a, $axiom_blocks_btn_pad_map ) );
}

/* Icon size + gap — Tablet/Mobile via media queries on the button. Icon size sets
   the `--ab-advbtn-icon` var the SVG width/height read; gap sets the flex gap.
   Desktop stays inline. */
$axiom_blocks_icon_map = array(
	'--ab-advbtn-icon' => 'iconSize',
	'gap'              => 'iconGap',
);
if ( Responsive::has_overrides( $axiom_blocks_a, $axiom_blocks_icon_map ) ) {
	$axiom_blocks_icon_class = Responsive::instance_class( $axiom_blocks_a, $axiom_blocks_icon_map );
	$axiom_blocks_classes[]  = $axiom_blocks_icon_class;
	ResponsiveStyles::add( Responsive::css( $axiom_blocks_icon_class, $axiom_blocks_a, $axiom_blocks_icon_map ) );
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
/* Responsive alignment — Tablet/Mobile overrides via media queries (Desktop stays
   inline below). `full` maps the button to width:100%; left/center/right reset it
   to auto and set the wrapper's text-align, so switching off full per device works. */
$axiom_blocks_align_specs = array(
	array(
		'prop'     => 'text-align',
		'key'      => 'buttonAlign',
		'selector' => '',
		'map'      => array(
			'left'   => 'left',
			'center' => 'center',
			'right'  => 'right',
		),
	),
	array(
		'prop'     => 'width',
		'key'      => 'buttonAlign',
		'selector' => '.ab-adv-btn',
		'map'      => array(
			'full'   => '100%',
			'left'   => 'auto',
			'center' => 'auto',
			'right'  => 'auto',
		),
	),
);
if ( Responsive::props_has_overrides( $axiom_blocks_a, $axiom_blocks_align_specs ) ) {
	$axiom_blocks_align_class    = Responsive::props_instance_class( $axiom_blocks_a, $axiom_blocks_align_specs );
	$axiom_blocks_wrap_classes[] = $axiom_blocks_align_class;
	ResponsiveStyles::add( Responsive::props_css( $axiom_blocks_align_class, $axiom_blocks_a, $axiom_blocks_align_specs ) );
}

/* Block Spacing (padding + margin) lives on the WRAPPER — space AROUND the button.
   Responsive Tablet/Mobile via a media-query class on the wrapper. */
$axiom_blocks_sp_map = Responsive::spacing_map();
if ( Responsive::has_overrides( $axiom_blocks_a, $axiom_blocks_sp_map ) ) {
	$axiom_blocks_rsp_class      = Responsive::instance_class( $axiom_blocks_a, $axiom_blocks_sp_map );
	$axiom_blocks_wrap_classes[] = $axiom_blocks_rsp_class;
	ResponsiveStyles::add( Responsive::css( $axiom_blocks_rsp_class, $axiom_blocks_a, $axiom_blocks_sp_map ) );
}

$axiom_blocks_wrap_class_attr = trim( implode( ' ', array_filter( $axiom_blocks_wrap_classes ) ) );
$axiom_blocks_wrap_style = (string) ( $axiom_blocks_block_supports['style'] ?? '' );
$axiom_blocks_wrap_style = Spacing::merge( $axiom_blocks_wrap_style, $axiom_blocks_a );
/* Left/center/right position the inline button within the block wrapper (Desktop). */
if ( in_array( $axiom_blocks_align, array( 'left', 'center', 'right' ), true ) ) {
	$axiom_blocks_wrap_style = rtrim( trim( $axiom_blocks_wrap_style ), ';' );
	$axiom_blocks_wrap_style .= ( '' !== $axiom_blocks_wrap_style ? '; ' : '' ) . 'text-align: ' . $axiom_blocks_align;
}
$axiom_blocks_wrap_style_attr = safecss_filter_attr( rtrim( trim( $axiom_blocks_wrap_style ), ';' ) );
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

/* Content wrapper alignment — applied directly so it doesn't rely on CSS var
   inheritance from the button element. */
$axiom_blocks_content_style_parts = array();
if ( '' !== $axiom_blocks_text_align ) {
	$axiom_blocks_align_map = array(
		'left'   => 'flex-start',
		'center' => 'center',
		'right'  => 'flex-end',
	);
	$axiom_blocks_content_style_parts[] = '--ab-advbtn-align: ' . ( $axiom_blocks_align_map[ $axiom_blocks_text_align ] ?? 'center' );
	$axiom_blocks_content_style_parts[] = '--ab-advbtn-ta: ' . $axiom_blocks_text_align;
}
$axiom_blocks_content_style_attr = safecss_filter_attr( implode( '; ', $axiom_blocks_content_style_parts ) );
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
	<span class="ab-adv-btn__content"<?php echo '' !== $axiom_blocks_content_style_attr ? ' style="' . esc_attr( $axiom_blocks_content_style_attr ) . '"' : ''; ?>>
		<span class="ab-adv-btn__text"<?php echo '' !== $axiom_blocks_text_typo ? ' style="' . esc_attr( $axiom_blocks_text_typo ) . '"' : ''; ?>><?php echo wp_kses_post( $axiom_blocks_text ); ?></span>
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
