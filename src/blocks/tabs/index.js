import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InnerBlocks,
	MediaUpload,
	MediaUploadCheck,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { PanelBody, Dropdown, Button } from '@wordpress/components';
import { useEffect } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';
import { ABSelectControl, ABToggleControl } from '../../components/ABControls';
import { useSpacingStyle } from '../../components/SpacingPanel';
import { ABInspectorGroups } from '../../components/ABInspectorGroups';
import { getBackgroundVars } from '../../components/BackgroundControl';
import { useTypographyStyle } from '../../components/TypographyPanel';
import {
	useDeviceType,
	resolveResponsive,
	resolveResponsiveAttrs,
} from '../../components/responsive';
import { ABResponsive } from '../../components/ABResponsive';
import {
	responsiveAlignValue,
	ALIGN_FLEX_MAP,
} from '../../components/responsiveProps';
import { BlockIcon } from '../../blockIcons';
import { UIIcon, UI_ICON_SLUGS } from '../../uiIcons';
import {
	DisabledBlockMessage,
	isBlockEnabled,
} from '../../components/DisabledBlockMessage';

const ICON_STROKE = {
	fill: 'none',
	stroke: 'currentColor',
	strokeWidth: 1.6,
	strokeLinecap: 'round',
	strokeLinejoin: 'round',
};
const IconChevronUp = () => (
	<svg viewBox="0 0 16 16" { ...ICON_STROKE }>
		<path d="M4 10l4-4 4 4" />
	</svg>
);
const IconChevronDown = () => (
	<svg viewBox="0 0 16 16" { ...ICON_STROKE }>
		<path d="M4 6l4 4 4-4" />
	</svg>
);
const IconTrash = () => (
	<svg viewBox="0 0 24 24" { ...ICON_STROKE }>
		<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
		<path d="M3 6h18" />
		<path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
	</svg>
);
const IconPlus = () => (
	<svg viewBox="0 0 16 16" { ...ICON_STROKE }>
		<path d="M8 3.5v9M3.5 8h9" />
	</svg>
);

const generateTabId = () =>
	`tab-${ Math.random().toString( 36 ).slice( 2, 10 ) }`;

const EMPTY_ICON = { iconSlug: '', iconUrl: '', iconId: 0, iconAlt: '' };

/* `--axiom-blocks-tab-rule` in style.scss, as hex so the swatch can show it. */
const BAR_RULE_DEFAULT = '#80808033';

const BAR_BW = [
	'barBorderTopWidth',
	'barBorderRightWidth',
	'barBorderBottomWidth',
	'barBorderLeftWidth',
];
const BAR_RADIUS = [
	'barRadiusTopLeft',
	'barRadiusTopRight',
	'barRadiusBottomRight',
	'barRadiusBottomLeft',
];
const TAB_BW = [
	'tabBorderTopWidth',
	'tabBorderRightWidth',
	'tabBorderBottomWidth',
	'tabBorderLeftWidth',
];
const TAB_BW_H = [
	'tabBorderTopWidthHover',
	'tabBorderRightWidthHover',
	'tabBorderBottomWidthHover',
	'tabBorderLeftWidthHover',
];
const TAB_BW_A = [
	'tabBorderTopWidthActive',
	'tabBorderRightWidthActive',
	'tabBorderBottomWidthActive',
	'tabBorderLeftWidthActive',
];
const TAB_RADIUS = [
	'tabRadiusTopLeft',
	'tabRadiusTopRight',
	'tabRadiusBottomRight',
	'tabRadiusBottomLeft',
];
const PANEL_BW = [
	'panelBorderTopWidth',
	'panelBorderRightWidth',
	'panelBorderBottomWidth',
	'panelBorderLeftWidth',
];
const PANEL_RADIUS = [
	'panelRadiusTopLeft',
	'panelRadiusTopRight',
	'panelRadiusBottomRight',
	'panelRadiusBottomLeft',
];

/* ── Retired `tabStyle` presets → Styles-row attributes ──────────────────────
 *
 * The presets were deleted 2026-08-05, which reverted saved blocks that used a
 * non-default one. Rather than restore a preset layer, each retired look is
 * translated ONCE into the rows that now own it: `bakeTabStyle()` runs on load
 * in the editor (and as a read-only fallback in render.php for posts nobody has
 * reopened), so the design survives AND becomes editable.
 *
 * Values are transcribed from the v1.0.5 stylesheet (`.release/build/style-index.css`).
 * Colors are hex — 8-digit for alpha — because safecss strips `rgba()` inline.
 * Vertical is a separate map: the old vertical rules came LAST at equal
 * specificity, so they beat the preset rules — which is why `underline` +
 * vertical rendered as plain vertical and bakes to nothing.
 *
 * Four things the rows still cannot express, all sub-pixel or single-property,
 * accepted rather than modelled: boxed's `top: 1px` tab nudge, underline's
 * `margin-bottom: -2px` (the base already pulls -1px), boxed's active-only
 * font-weight 600, and the second hairline layer of pills' active shadow. */
const BAKE_PILLS_TRACK = '#7c3aed0f';
const BAKE_PILLS_HOVER_BG = '#7c3aed14';
const BAKE_ACCENT = '#7c3aed';
const BAKE_INACTIVE = '#0000008c';
const BAKE_BOXED_RULE = '#e5e7eb';

const box = ( t, r, b, l ) => [ t, r, b, l ];

const TAB_STYLE_BAKE = {
	pills: {
		horizontal: {
			backgroundColor: BAKE_PILLS_TRACK,
			barBorder: box( '0', '0', '0', '0' ),
			barRadius: box( '999px', '999px', '999px', '999px' ),
			barPadding: box( '0.375rem', '0.375rem', '0.375rem', '0.375rem' ),
			barFitContent: true,
			tabGap: '0.375rem',
			tabBorder: box( '0', '0', '0', '0' ),
			tabRadius: box( '999px', '999px', '999px', '999px' ),
			tabPadding: box( '0.5rem', '1.1rem', '0.5rem', '1.1rem' ),
			inactiveColor: BAKE_INACTIVE,
			labelFontWeight: '500',
			tabBgHover: BAKE_PILLS_HOVER_BG,
			tabColorHover: BAKE_ACCENT,
			activeBgFrom: 'activeColor',
			activeBgFallback: BAKE_ACCENT,
			activeColor: '#ffffff',
			tabShadowActive: '0 1px 2px #00000014',
		},
		vertical: {
			backgroundColor: BAKE_PILLS_TRACK,
			barBorder: box( '0', '0', '0', '0' ),
			barRadius: box( '12px', '12px', '12px', '12px' ),
			barPadding: box( '0.5rem', '0.5rem', '0.5rem', '0.5rem' ),
			tabGap: '0.25rem',
			tabBorder: box( '0', '0', '0', '0' ),
			tabRadius: box( '8px', '8px', '8px', '8px' ),
			tabPadding: box( '0.5rem', '0.875rem', '0.5rem', '0.875rem' ),
			inactiveColor: BAKE_INACTIVE,
			labelFontWeight: '500',
			tabBgHover: BAKE_PILLS_HOVER_BG,
			tabColorHover: BAKE_ACCENT,
			activeBgFrom: 'activeColor',
			activeBgFallback: BAKE_ACCENT,
			activeColor: '#ffffff',
			tabShadowActive: '0 1px 2px #00000014',
		},
	},
	underline: {
		horizontal: {
			barBorder: box( '', '', '2px', '' ),
			tabBorder: box( '', '', '3px', '' ),
		},
		vertical: {},
	},
	boxed: {
		horizontal: {
			backgroundColor: '#f3f4f6',
			barBorder: box( '0', '0', '1px', '0' ),
			barBorderColor: BAKE_BOXED_RULE,
			barRadius: box( '8px', '8px', '0', '0' ),
			barPadding: box( '0.375rem', '0.375rem', '0', '0.375rem' ),
			tabGap: '0.25rem',
			tabBorder: box( '1px', '1px', '0', '1px' ),
			tabBorderColor: '#00000000',
			tabRadius: box( '6px', '6px', '0', '0' ),
			tabPadding: box( '0.625rem', '1.1rem', '0.625rem', '1.1rem' ),
			inactiveColor: BAKE_INACTIVE,
			labelFontWeight: '500',
			tabBgHover: '#ffffff8c',
			tabColorHover: BAKE_ACCENT,
			activeBgFrom: 'contentBackgroundColor',
			activeBgFallback: '#ffffff',
			activeColorFrom: 'activeColor',
			activeColorFallback: BAKE_ACCENT,
			tabBorderColorActive: BAKE_BOXED_RULE,
			panelBgFallback: '#ffffff',
			panelBorder: box( '0', '1px', '1px', '1px' ),
			panelBorderColor: BAKE_BOXED_RULE,
			panelRadius: box( '0', '0', '8px', '8px' ),
			panelPadding: box( '1.25rem', '1.25rem', '1.25rem', '1.25rem' ),
		},
		vertical: {
			backgroundColor: '#f3f4f6',
			barBorder: box( '0', '1px', '0', '0' ),
			barBorderColor: BAKE_BOXED_RULE,
			barRadius: box( '8px', '0', '0', '8px' ),
			barPadding: box( '0.5rem', '0', '0.5rem', '0.5rem' ),
			tabGap: '0.25rem',
			tabBorder: box( '1px', '0', '1px', '1px' ),
			tabBorderColor: '#00000000',
			tabRadius: box( '6px', '0', '0', '6px' ),
			tabPadding: box( '0.625rem', '0.875rem', '0.625rem', '0.875rem' ),
			inactiveColor: BAKE_INACTIVE,
			labelFontWeight: '500',
			tabBgHover: '#ffffff8c',
			tabColorHover: BAKE_ACCENT,
			activeBgFrom: 'contentBackgroundColor',
			activeBgFallback: '#ffffff',
			activeColorFrom: 'activeColor',
			activeColorFallback: BAKE_ACCENT,
			tabBorderColorActive: BAKE_BOXED_RULE,
			panelBgFallback: '#ffffff',
			panelBorder: box( '1px', '1px', '1px', '1px' ),
			panelBorderColor: BAKE_BOXED_RULE,
			panelRadius: box( '0', '8px', '8px', '0' ),
			panelPadding: box( '1.25rem', '1.25rem', '1.25rem', '1.25rem' ),
		},
	},
};

/**
 * Translate a retired `tabStyle` preset into the Styles-row attributes that now
 * own that look.
 *
 * Anything the author had already set wins and is skipped — under the old CSS
 * their inline var beat the preset's class rule, so that is what they saw. The
 * exception is the handful of values the preset *derived from* an author color
 * (pills painted the active tab's background with `activeColor` and forced the
 * text white); those are computed from the author value and always written.
 *
 * @param {Object} attributes Current block attributes.
 * @return {Object} Attribute patch (empty when there is nothing to bake).
 */
export function bakeTabStyle( attributes ) {
	const preset = TAB_STYLE_BAKE[ attributes.tabStyle ];
	if ( ! preset ) {
		return {};
	}
	const map =
		preset[
			attributes.tabOrientation === 'vertical' ? 'vertical' : 'horizontal'
		];
	const out = {};
	// An author value beats the preset it was saved with, so only fill blanks.
	const spread = ( keys, values ) => {
		if ( ! values ) return;
		keys.forEach( ( key, i ) => {
			if ( values[ i ] !== '' && ! attributes[ key ] ) {
				out[ key ] = values[ i ];
			}
		} );
	};

	spread( BAR_BW, map.barBorder );
	spread( BAR_RADIUS, map.barRadius );
	spread(
		[
			'barPaddingTop',
			'barPaddingRight',
			'barPaddingBottom',
			'barPaddingLeft',
		],
		map.barPadding
	);
	spread( TAB_BW, map.tabBorder );
	spread( TAB_RADIUS, map.tabRadius );
	spread(
		[
			'tabPaddingTop',
			'tabPaddingRight',
			'tabPaddingBottom',
			'tabPaddingLeft',
		],
		map.tabPadding
	);
	spread( PANEL_BW, map.panelBorder );
	spread( PANEL_RADIUS, map.panelRadius );
	spread(
		[
			'panelPaddingTop',
			'panelPaddingRight',
			'panelPaddingBottom',
			'panelPaddingLeft',
		],
		map.panelPadding
	);

	[
		'backgroundColor',
		'barBorderColor',
		'tabBorderColor',
		'tabBorderColorActive',
		'panelBorderColor',
		'tabGap',
		'inactiveColor',
		'labelFontWeight',
		'tabBgHover',
		'tabColorHover',
		'tabShadowActive',
		'barFitContent',
	].forEach( ( key ) => {
		if ( map[ key ] !== undefined && ! attributes[ key ] ) {
			out[ key ] = map[ key ];
		}
	} );

	/* Derived — always written, because the preset repurposed an author color
	 * rather than leaving it where the new rows expect it. Pills painted the
	 * active tab's BACKGROUND with `activeColor` and forced white text; boxed
	 * used `contentBackgroundColor` for that background and kept `activeColor`
	 * as the text. Read before writing or the carry-over is lost. */
	if ( map.activeBgFrom ) {
		out.tabBgActive =
			attributes[ map.activeBgFrom ] || map.activeBgFallback;
	}
	if ( map.activeColor ) {
		out.activeColor = map.activeColor;
	} else if ( map.activeColorFrom ) {
		out.activeColor =
			attributes[ map.activeColorFrom ] || map.activeColorFallback;
	}
	if ( map.panelBgFallback && ! attributes.contentBackgroundColor ) {
		out.contentBackgroundColor = map.panelBgFallback;
	}

	return out;
}

/* Anatomy-as-declaration — three parts: Tab bar, Tab and Panel.
 *
 * `tabStyle` (default/pills/underline/boxed) was REMOVED 2026-08-05 (user: "i
 * dont want any preset here"). Everything the presets painted now comes from
 * these rows, which is why **Tab bar is a full part** rather than the single
 * color row it was: a pills-style track needs background + radius + padding on
 * the bar itself, and without those rows that look would not be buildable.
 *
 * The shipped attribute names don't match the elements they paint:
 * `backgroundColor` is `--axiom-blocks-tab-bg`, which paints
 * `.axiom-blocks-tabs__list` — the strip BEHIND the tabs — while a tab's own
 * background had no attribute at all. So `backgroundColor` is the Tab bar's
 * `colorKey`, and the tab button gets NEW `tabBg` + hover/active twins.
 *
 * Only Tab is stateful. The bar is one element behind ALL the tabs, so it has no
 * per-tab hover/active variant; the panel has no state either.
 *
 * Three gaps, three homes — they are different measurements, so each sits on the
 * part it spaces:
 *
 *   Tab ▸ Gap       → `tabGap`      — tab ↔ tab
 *   Tab ▸ Icon gap  → `tabIconGap`  — icon ↔ label inside one tab
 *   Panel ▸ Gap     → `contentGap`  — tab bar ↔ panel (shipped attribute)
 *
 * Built per-render because the Panel Gap row advertises the shipped spacing,
 * which differs per orientation (0 horizontal / 24px vertical). Display-only —
 * nothing is written, so an untouched block keeps the shipped gap. */
/* Shipped border widths, advertised (never written) so a row whose stylesheet
 * paints a rule stops reading "None" — the bar's 1px rule and the tab's 2px
 * underline both sit on the edge the orientation puts them on. In `BAR_BW` /
 * `TAB_BW` order: top, right, bottom, left. */
const edgeWidth = ( orientation, w ) =>
	orientation === 'vertical' ? [ '0', w, '0', '0' ] : [ '0', '0', w, '0' ];

const designFor = ( { tabOrientation } ) => ( {
	block: 'tabs',
	targets: [
		{
			noun: __( 'Tab bar', 'axiom-blocks' ),
			background: {
				full: true,
				prefix: 'bar',
				colorKey: 'backgroundColor',
				image: false,
			},
			border: {
				widthKeys: BAR_BW,
				styleKey: 'barBorderStyle',
				colorKey: 'barBorderColor',
				max: 6,
				widthDefault: edgeWidth( tabOrientation, '1px' ),
				colorDefault: BAR_RULE_DEFAULT,
			},
			radius: { keys: BAR_RADIUS, max: 999 },
			padding: { type: 'barPadding', responsive: true },
		},
		{
			noun: __( 'Tab', 'axiom-blocks' ),
			states: [ 'hover', 'active' ],
			colors: [
				{
					label: __( 'Text', 'axiom-blocks' ),
					bind: 'inactiveColor',
					stateBind: {
						hover: 'tabColorHover',
						active: 'activeColor',
					},
				},
			],
			background: {
				bind: 'tabBg',
				label: __( 'Background', 'axiom-blocks' ),
				stateBind: { hover: 'tabBgHover', active: 'tabBgActive' },
				insertAfter: 0,
			},
			typography: 'label',
			border: {
				widthKeys: TAB_BW,
				styleKey: 'tabBorderStyle',
				colorKey: 'tabBorderColor',
				max: 6,
				// The shipped 2px edge is transparent until a tab goes active,
				// when it becomes the underline — so the width is advertised but
				// the color is left unset (there is no resting color to show).
				widthDefault: edgeWidth( tabOrientation, '2px' ),
				// Opt-in stateful: without these keys the Hover/Active tabs would
				// silently edit the Normal attrs (the pricing-table regression).
				stateWidthKeys: { hover: TAB_BW_H, active: TAB_BW_A },
				stateStyleKey: {
					hover: 'tabBorderStyleHover',
					active: 'tabBorderStyleActive',
				},
				stateBind: {
					hover: 'tabBorderColorHover',
					active: 'tabBorderColorActive',
				},
			},
			// 999 rather than a box-like cap: a fully-round pill tab is a shipped
			// look, so the row has to be able to reach it.
			radius: { keys: TAB_RADIUS, max: 999 },
			shadow: { bind: 'tabShadow' },
			padding: { type: 'tabPadding', responsive: true },
			ranges: [
				{
					bind: 'tabGap',
					label: __( 'Gap', 'axiom-blocks' ),
					min: 0,
					max: 48,
					default: 0,
					responsive: true,
					units: [ 'px', 'rem' ],
					unitRange: { px: [ 0, 48 ], rem: [ 0, 3 ] },
				},
				{
					bind: 'tabIconGap',
					label: __( 'Icon gap', 'axiom-blocks' ),
					min: 0,
					max: 32,
					default: 8,
					responsive: true,
					units: [ 'px', 'rem' ],
					unitRange: { px: [ 0, 32 ], rem: [ 0, 2 ] },
				},
			],
		},
		{
			noun: __( 'Panel', 'axiom-blocks' ),
			background: {
				full: true,
				prefix: 'panel',
				colorKey: 'contentBackgroundColor',
			},
			border: {
				widthKeys: PANEL_BW,
				styleKey: 'panelBorderStyle',
				colorKey: 'panelBorderColor',
				max: 6,
			},
			radius: { keys: PANEL_RADIUS, max: 24 },
			shadow: { bind: 'panelShadow' },
			padding: { type: 'panelPadding', responsive: true },
			ranges: [
				{
					bind: 'contentGap',
					label: __( 'Gap', 'axiom-blocks' ),
					min: 0,
					max: 80,
					default: tabOrientation === 'vertical' ? 24 : 0,
					responsive: true,
					numeric: true,
				},
			],
		},
	],
} );

/* Wrapper CSS vars for the two design-layer boxes. Mirrors the var map in
 * render.php — keep the two in step. An unset attribute emits nothing, so
 * style.scss falls back to the `*-def` value the active preset supplies. */
export function getTabsVars( attributes, device = 'Desktop' ) {
	const pad = ( key ) =>
		resolveResponsive( attributes, key, device ) || undefined;
	const anyBarBw = BAR_BW.some( ( k ) => attributes[ k ] );
	const anyTabBw = TAB_BW.some( ( k ) => attributes[ k ] );
	const anyTabBwH = TAB_BW_H.some( ( k ) => attributes[ k ] );
	const anyTabBwA = TAB_BW_A.some( ( k ) => attributes[ k ] );
	const anyPanelBw = PANEL_BW.some( ( k ) => attributes[ k ] );
	const borderStyle = ( anyWidth, key ) => {
		const v = attributes[ key ];
		if ( anyWidth ) {
			return v || 'solid';
		}
		return v || undefined;
	};

	return {
		...getBackgroundVars( attributes, {
			prefix: 'panel',
			varPrefix: '--ab-tabs-panel',
			colorKey: 'contentBackgroundColor',
		} ),
		...getBackgroundVars( attributes, {
			prefix: 'bar',
			varPrefix: '--ab-tabs-bar',
			colorKey: 'backgroundColor',
		} ),
		'--ab-tabs-bar-bc': attributes.barBorderColor || undefined,
		'--ab-tabs-bar-bs': borderStyle( anyBarBw, 'barBorderStyle' ),
		'--ab-tabs-bar-bw-top': attributes.barBorderTopWidth || undefined,
		'--ab-tabs-bar-bw-right': attributes.barBorderRightWidth || undefined,
		'--ab-tabs-bar-bw-bottom': attributes.barBorderBottomWidth || undefined,
		'--ab-tabs-bar-bw-left': attributes.barBorderLeftWidth || undefined,
		'--ab-tabs-bar-radius-tl': attributes.barRadiusTopLeft || undefined,
		'--ab-tabs-bar-radius-tr': attributes.barRadiusTopRight || undefined,
		'--ab-tabs-bar-radius-br': attributes.barRadiusBottomRight || undefined,
		'--ab-tabs-bar-radius-bl': attributes.barRadiusBottomLeft || undefined,
		'--ab-tabs-bar-pt': pad( 'barPaddingTop' ),
		'--ab-tabs-bar-pr': pad( 'barPaddingRight' ),
		'--ab-tabs-bar-pb': pad( 'barPaddingBottom' ),
		'--ab-tabs-bar-pl': pad( 'barPaddingLeft' ),
		'--ab-tabs-gap':
			resolveResponsive( attributes, 'tabGap', device ) || undefined,
		'--ab-tabs-tab-icon-gap':
			resolveResponsive( attributes, 'tabIconGap', device ) || undefined,
		'--ab-tabs-tab-bg': attributes.tabBg || undefined,
		'--ab-tabs-tab-bg-h': attributes.tabBgHover || undefined,
		'--ab-tabs-tab-bg-a': attributes.tabBgActive || undefined,
		'--ab-tabs-tab-color-h': attributes.tabColorHover || undefined,
		'--ab-tabs-tab-bc': attributes.tabBorderColor || undefined,
		'--ab-tabs-tab-bs': borderStyle( anyTabBw, 'tabBorderStyle' ),
		'--ab-tabs-tab-bw-top': attributes.tabBorderTopWidth || undefined,
		'--ab-tabs-tab-bw-right': attributes.tabBorderRightWidth || undefined,
		'--ab-tabs-tab-bw-bottom': attributes.tabBorderBottomWidth || undefined,
		'--ab-tabs-tab-bw-left': attributes.tabBorderLeftWidth || undefined,
		'--ab-tabs-tab-radius-tl': attributes.tabRadiusTopLeft || undefined,
		'--ab-tabs-tab-radius-tr': attributes.tabRadiusTopRight || undefined,
		'--ab-tabs-tab-radius-br': attributes.tabRadiusBottomRight || undefined,
		'--ab-tabs-tab-radius-bl': attributes.tabRadiusBottomLeft || undefined,
		'--ab-tabs-tab-pt': pad( 'tabPaddingTop' ),
		'--ab-tabs-tab-pr': pad( 'tabPaddingRight' ),
		'--ab-tabs-tab-pb': pad( 'tabPaddingBottom' ),
		'--ab-tabs-tab-pl': pad( 'tabPaddingLeft' ),
		'--ab-tabs-tab-shadow': attributes.tabShadow || undefined,
		'--ab-tabs-tab-shadow-h': attributes.tabShadowHover || undefined,
		'--ab-tabs-tab-shadow-a': attributes.tabShadowActive || undefined,
		// The shipped 0.75 dim would tint a chosen inactive color, so a set color
		// clears it and renders true. Unset stays byte-identical.
		'--ab-tabs-tab-op': attributes.inactiveColor ? '1' : undefined,
		'--ab-tabs-tab-bc-h': attributes.tabBorderColorHover || undefined,
		'--ab-tabs-tab-bs-h': borderStyle( anyTabBwH, 'tabBorderStyleHover' ),
		'--ab-tabs-tab-bw-top-h':
			attributes.tabBorderTopWidthHover || undefined,
		'--ab-tabs-tab-bw-right-h':
			attributes.tabBorderRightWidthHover || undefined,
		'--ab-tabs-tab-bw-bottom-h':
			attributes.tabBorderBottomWidthHover || undefined,
		'--ab-tabs-tab-bw-left-h':
			attributes.tabBorderLeftWidthHover || undefined,
		'--ab-tabs-tab-bc-a': attributes.tabBorderColorActive || undefined,
		'--ab-tabs-tab-bs-a': borderStyle( anyTabBwA, 'tabBorderStyleActive' ),
		'--ab-tabs-tab-bw-top-a':
			attributes.tabBorderTopWidthActive || undefined,
		'--ab-tabs-tab-bw-right-a':
			attributes.tabBorderRightWidthActive || undefined,
		'--ab-tabs-tab-bw-bottom-a':
			attributes.tabBorderBottomWidthActive || undefined,
		'--ab-tabs-tab-bw-left-a':
			attributes.tabBorderLeftWidthActive || undefined,
		'--ab-tabs-panel-bc': attributes.panelBorderColor || undefined,
		'--ab-tabs-panel-bs': borderStyle( anyPanelBw, 'panelBorderStyle' ),
		'--ab-tabs-panel-bw-top': attributes.panelBorderTopWidth || undefined,
		'--ab-tabs-panel-bw-right':
			attributes.panelBorderRightWidth || undefined,
		'--ab-tabs-panel-bw-bottom':
			attributes.panelBorderBottomWidth || undefined,
		'--ab-tabs-panel-bw-left': attributes.panelBorderLeftWidth || undefined,
		'--ab-tabs-panel-radius-tl': attributes.panelRadiusTopLeft || undefined,
		'--ab-tabs-panel-radius-tr':
			attributes.panelRadiusTopRight || undefined,
		'--ab-tabs-panel-radius-br':
			attributes.panelRadiusBottomRight || undefined,
		'--ab-tabs-panel-radius-bl':
			attributes.panelRadiusBottomLeft || undefined,
		'--ab-tabs-panel-shadow': attributes.panelShadow || undefined,
		'--ab-tabs-panel-pt': pad( 'panelPaddingTop' ),
		'--ab-tabs-panel-pr': pad( 'panelPaddingRight' ),
		'--ab-tabs-panel-pb': pad( 'panelPaddingBottom' ),
		'--ab-tabs-panel-pl': pad( 'panelPaddingLeft' ),
	};
}

/**
 * Inline preview rendered inside the tab label (editor + picker trigger).
 * Library icons inherit currentColor; uploads render as <img>.
 * @param root0
 * @param root0.slug
 * @param root0.url
 * @param root0.alt
 * @param root0.size
 */
function TabIconPreview( { slug, url, alt, size = 16 } ) {
	if ( slug ) return <UIIcon slug={ slug } size={ size } />;
	if ( url )
		return (
			<img
				src={ url }
				alt={ alt || '' }
				className="axiom-blocks-tabs__icon-img"
			/>
		);
	return null;
}

function IconPicker( { iconSlug, iconUrl, iconAlt, onChange } ) {
	const hasIcon = !! ( iconSlug || iconUrl );
	const svgSupported = !! window.axiomBlocksSettings?.svgUploadSupported;

	return (
		<Dropdown
			className="ab-icon-picker-dropdown"
			contentClassName="ab-icon-picker-popover"
			popoverProps={ { placement: 'bottom-start' } }
			renderToggle={ ( { isOpen, onToggle } ) => (
				<button
					type="button"
					className={ `ab-tab-icon-trigger${
						hasIcon ? ' has-icon' : ''
					}${ isOpen ? ' is-open' : '' }` }
					onClick={ onToggle }
					aria-expanded={ isOpen }
					aria-label={ __( 'Choose icon', 'axiom-blocks' ) }
				>
					{ hasIcon ? (
						<TabIconPreview
							slug={ iconSlug }
							url={ iconUrl }
							alt={ iconAlt }
							size={ 16 }
						/>
					) : (
						<IconPlus />
					) }
				</button>
			) }
			renderContent={ ( { onClose } ) => (
				<div className="ab-icon-picker">
					<div className="ab-icon-picker__header">
						{ __( 'Icon library', 'axiom-blocks' ) }
					</div>
					<div className="ab-icon-picker__grid" role="listbox">
						{ UI_ICON_SLUGS.map( ( slug ) => {
							const isSelected = slug === iconSlug;
							return (
								<button
									key={ slug }
									type="button"
									role="option"
									aria-selected={ isSelected }
									className={ `ab-icon-picker__item${
										isSelected ? ' is-selected' : ''
									}` }
									title={ slug }
									onClick={ () => {
										onChange( {
											...EMPTY_ICON,
											iconSlug: slug,
										} );
										onClose();
									} }
								>
									<UIIcon slug={ slug } size={ 18 } />
								</button>
							);
						} ) }
					</div>
					<div className="ab-icon-picker__footer">
						<div className="ab-icon-picker__upload">
							<MediaUploadCheck>
								<MediaUpload
									onSelect={ ( media ) => {
										onChange( {
											...EMPTY_ICON,
											iconUrl: media.url,
											iconId: media.id,
											iconAlt:
												media.alt || media.title || '',
										} );
										onClose();
									} }
									allowedTypes={ [ 'image' ] }
									value={ 0 }
									render={ ( { open } ) => (
										<Button
											variant="secondary"
											onClick={ open }
										>
											{ __(
												'Upload custom icon',
												'axiom-blocks'
											) }
										</Button>
									) }
								/>
							</MediaUploadCheck>
							{ hasIcon && (
								<Button
									variant="link"
									isDestructive
									onClick={ () => {
										onChange( EMPTY_ICON );
										onClose();
									} }
								>
									{ __( 'Remove', 'axiom-blocks' ) }
								</Button>
							) }
						</div>
						{ svgSupported ? (
							<p className="ab-icon-picker__note">
								{ __(
									'PNG, JPG, GIF, WebP & SVG supported.',
									'axiom-blocks'
								) }
							</p>
						) : (
							<p className="ab-icon-picker__note is-warning">
								{ __(
									'PNG, JPG, GIF & WebP supported. To upload SVG, install a plugin like Safe SVG.',
									'axiom-blocks'
								) }
							</p>
						) }
					</div>
				</div>
			) }
		/>
	);
}

function TabsEdit( { attributes, setAttributes, clientId } ) {
	if ( ! isBlockEnabled( 'tabs' ) ) {
		return <DisabledBlockMessage blockName="Tabs" />;
	}
	const {
		activeTab,
		tabOrientation,
		tabAlignment,
		fullWidthTabs,
		activeColor,
		inactiveColor,
		backgroundColor,
		contentBackgroundColor,
	} = attributes;

	const panels = useSelect(
		( select ) => select( blockEditorStore ).getBlocks( clientId ),
		[ clientId ]
	);

	const {
		insertBlock,
		removeBlock,
		moveBlocksToPosition,
		updateBlockAttributes,
	} = useDispatch( blockEditorStore );

	useEffect( () => {
		if ( ! panels.length ) return;
		const ids = panels.map( ( p ) => p.attributes.tabId ).filter( Boolean );
		if ( ! ids.length ) return;
		if ( ! ids.includes( activeTab ) ) {
			setAttributes( { activeTab: ids[ 0 ] } );
		}
	}, [ panels, activeTab, setAttributes ] );

	/* One-shot bake of a retired `tabStyle` preset into the Styles rows, then the
	 * legacy attribute is cleared so this never runs twice. Anything the author
	 * had already set wins — the preset only fills what it used to paint.
	 * render.php applies the same map read-only, so the front end is already
	 * correct before the post is ever reopened. */
	useEffect( () => {
		if ( ! attributes.tabStyle ) return;
		setAttributes( { ...bakeTabStyle( attributes ), tabStyle: '' } );
	}, [ attributes, setAttributes ] );

	const device = useDeviceType();
	const resolved = resolveResponsiveAttrs(
		attributes,
		[ 'tabAlignment' ],
		device
	);
	const blockProps = useBlockProps( {
		className: [
			'axiom-blocks-tabs',
			`axiom-blocks-tab--${ tabOrientation || 'horizontal' }`,
			tabOrientation !== 'vertical'
				? `axiom-blocks-tab--align-${ resolved.tabAlignment }`
				: '',
			fullWidthTabs ? 'is-full-width' : '',
			attributes.barFitContent ? 'is-bar-fit' : '',
		]
			.filter( Boolean )
			.join( ' ' ),
		style: {
			'--axiom-blocks-tab-active': activeColor || undefined,
			'--axiom-blocks-tab-inactive': inactiveColor || undefined,
			'--axiom-blocks-tab-bg': backgroundColor || undefined,
			'--axiom-blocks-tab-content-bg':
				contentBackgroundColor || undefined,
			'--axiom-blocks-tabs-content-gap': resolveResponsive(
				attributes,
				'contentGap',
				device
			)
				? `${ resolveResponsive( attributes, 'contentGap', device ) }px`
				: undefined,
			...getTabsVars( attributes, device ),
			...useSpacingStyle( attributes ),
		},
	} );

	const addTab = () => {
		const tabId = generateTabId();
		const label = `${ __( 'Tab', 'axiom-blocks' ) } ${ panels.length + 1 }`;
		insertBlock(
			createBlock( 'axiom-blocks/tab-panel', { tabId, label } ),
			panels.length,
			clientId,
			false
		);
		// Only promote the new tab to active when there's nothing valid set yet.
		// Otherwise the saved `activeTab` would silently follow whichever tab
		// was added or clicked last, which surfaces on the frontend as "the
		// last tab is always the default-open one".
		const validIds = panels
			.map( ( p ) => p.attributes.tabId )
			.filter( Boolean );
		if ( ! validIds.includes( activeTab ) ) {
			setAttributes( { activeTab: tabId } );
		}
	};

	const removeTab = ( panelClientId, tabId ) => {
		if ( panels.length <= 1 ) return;
		const index = panels.findIndex( ( p ) => p.clientId === panelClientId );
		removeBlock( panelClientId, false );
		if ( activeTab === tabId ) {
			const remaining = panels.filter(
				( p ) => p.clientId !== panelClientId
			);
			if ( remaining.length ) {
				const nextIndex = Math.min( index, remaining.length - 1 );
				setAttributes( {
					activeTab: remaining[ nextIndex ].attributes.tabId,
				} );
			}
		}
	};

	const movePanel = ( panelClientId, direction ) => {
		const index = panels.findIndex( ( p ) => p.clientId === panelClientId );
		const target = index + direction;
		if ( target < 0 || target >= panels.length ) return;
		moveBlocksToPosition( [ panelClientId ], clientId, clientId, target );
	};

	const renameTab = ( panelClientId, newLabel ) => {
		updateBlockAttributes( panelClientId, { label: newLabel } );
	};

	const setIconForPanel = ( panelClientId, iconAttrs ) => {
		updateBlockAttributes( panelClientId, iconAttrs );
	};

	const isVertical = tabOrientation === 'vertical';
	const justifyContent = isVertical
		? undefined
		: responsiveAlignValue(
				attributes,
				'tabAlignment',
				device,
				ALIGN_FLEX_MAP
		  ) ??
		  ( { left: 'flex-start', center: 'center', right: 'flex-end' }[
				tabAlignment
		  ] ||
				'flex-start' );

	const labelTypoStyle = useTypographyStyle( attributes, 'label' );

	const leading = (
		<>
			<PanelBody
				title={ __( 'Tabs', 'axiom-blocks' ) }
				initialOpen={ true }
			>
				<div className="ab-tab-repeater">
					{ panels.map( ( panel, i ) => {
						const isActive = panel.attributes.tabId === activeTab;
						const canDelete = panels.length > 1;
						const {
							iconSlug = '',
							iconUrl = '',
							iconAlt = '',
						} = panel.attributes;
						return (
							<div className="ab-tab-row" key={ panel.clientId }>
								<div
									className={ `ab-tab-item${
										isActive ? ' is-active' : ''
									}` }
								>
									<span className="ab-tab-item__num">
										{ i + 1 }
									</span>
									<IconPicker
										iconSlug={ iconSlug }
										iconUrl={ iconUrl }
										iconAlt={ iconAlt }
										onChange={ ( attrs ) =>
											setIconForPanel(
												panel.clientId,
												attrs
											)
										}
									/>
									<input
										type="text"
										className="ab-tab-item__input"
										value={ panel.attributes.label || '' }
										onChange={ ( e ) =>
											renameTab(
												panel.clientId,
												e.target.value
											)
										}
										placeholder={ __(
											'Tab label',
											'axiom-blocks'
										) }
									/>
									<div className="ab-tab-item__actions">
										<button
											type="button"
											className={ `ab-tab-btn ab-tab-btn--star${
												isActive ? ' is-active' : ''
											}` }
											onClick={ () => {
												if ( ! isActive )
													setAttributes( {
														activeTab:
															panel.attributes
																.tabId,
													} );
											} }
											aria-pressed={ isActive }
											aria-label={
												isActive
													? __(
															'Default-open tab',
															'axiom-blocks'
													  )
													: __(
															'Make this the default-open tab',
															'axiom-blocks'
													  )
											}
											title={
												isActive
													? __(
															'This tab opens by default on the frontend.',
															'axiom-blocks'
													  )
													: __(
															'Make this the default-open tab.',
															'axiom-blocks'
													  )
											}
										>
											<svg
												viewBox="0 0 16 16"
												width="14"
												height="14"
												aria-hidden="true"
											>
												<path
													d="M8 1.5l1.93 4.12 4.57.55-3.36 3.07.93 4.46L8 11.45l-4.07 2.25.93-4.46L1.5 6.17l4.57-.55L8 1.5z"
													fill={
														isActive
															? 'currentColor'
															: 'none'
													}
													stroke="currentColor"
													strokeWidth="1.5"
													strokeLinejoin="round"
												/>
											</svg>
										</button>
										<button
											type="button"
											className="ab-tab-btn"
											onClick={ () =>
												movePanel( panel.clientId, -1 )
											}
											disabled={ i === 0 }
											aria-label={ __(
												'Move up',
												'axiom-blocks'
											) }
										>
											<IconChevronUp />
										</button>
										<button
											type="button"
											className="ab-tab-btn"
											onClick={ () =>
												movePanel( panel.clientId, 1 )
											}
											disabled={ i === panels.length - 1 }
											aria-label={ __(
												'Move down',
												'axiom-blocks'
											) }
										>
											<IconChevronDown />
										</button>
										<button
											type="button"
											className="ab-tab-btn ab-tab-btn--danger"
											onClick={ () =>
												removeTab(
													panel.clientId,
													panel.attributes.tabId
												)
											}
											disabled={ ! canDelete }
											aria-label={ __(
												'Remove tab',
												'axiom-blocks'
											) }
										>
											<IconTrash />
										</button>
									</div>
								</div>
							</div>
						);
					} ) }
					<button
						type="button"
						className="ab-btn ab-btn--secondary ab-tab-add"
						onClick={ addTab }
					>
						<IconPlus />
						<span>{ __( 'Add tab', 'axiom-blocks' ) }</span>
					</button>
				</div>

				<ABSelectControl
					label={ __( 'Orientation', 'axiom-blocks' ) }
					value={ tabOrientation || 'horizontal' }
					options={ [
						{
							label: __( 'Horizontal', 'axiom-blocks' ),
							value: 'horizontal',
						},
						{
							label: __( 'Vertical', 'axiom-blocks' ),
							value: 'vertical',
						},
					] }
					onChange={ ( v ) => setAttributes( { tabOrientation: v } ) }
				/>
				{ ! isVertical && (
					<ABResponsive
						attributes={ attributes }
						setAttributes={ setAttributes }
						attrKey="tabAlignment"
					>
						{ ( { value, setValue, inherited } ) => (
							<ABSelectControl
								label={ __( 'Alignment', 'axiom-blocks' ) }
								value={
									value !== '' && value != null
										? value
										: inherited ?? 'left'
								}
								options={ [
									{
										label: __( 'Left', 'axiom-blocks' ),
										value: 'left',
									},
									{
										label: __( 'Center', 'axiom-blocks' ),
										value: 'center',
									},
									{
										label: __( 'Right', 'axiom-blocks' ),
										value: 'right',
									},
								] }
								onChange={ setValue }
							/>
						) }
					</ABResponsive>
				) }
				<ABToggleControl
					label={ __( 'Full-width tabs', 'axiom-blocks' ) }
					checked={ fullWidthTabs }
					onChange={ ( v ) => setAttributes( { fullWidthTabs: v } ) }
				/>
				<ABToggleControl
					label={ __( 'Tab bar fits content', 'axiom-blocks' ) }
					help={ __(
						'Shrink the bar to the width of its tabs instead of filling the row.',
						'axiom-blocks'
					) }
					checked={ !! attributes.barFitContent }
					onChange={ ( v ) => setAttributes( { barFitContent: v } ) }
				/>
			</PanelBody>
		</>
	);

	return (
		<>
			<ABInspectorGroups
				attributes={ attributes }
				setAttributes={ setAttributes }
				design={ designFor( attributes ) }
				leading={ leading }
			/>

			<div { ...blockProps }>
				<div
					className="axiom-blocks-tabs__list"
					role="tablist"
					style={ { justifyContent } }
				>
					{ panels.map( ( panel ) => {
						const { tabId, label, iconSlug, iconUrl, iconAlt } =
							panel.attributes;
						const isActive = tabId && tabId === activeTab;
						const hasIcon = !! ( iconSlug || iconUrl );
						return (
							<button
								key={ panel.clientId }
								type="button"
								className={ `axiom-blocks-tabs__tab ${
									isActive ? 'is-active' : ''
								}` }
								role="tab"
								aria-selected={ isActive ? 'true' : 'false' }
								onClick={ () =>
									setAttributes( { activeTab: tabId } )
								}
							>
								{ hasIcon && (
									<span className="axiom-blocks-tabs__icon">
										<TabIconPreview
											slug={ iconSlug }
											url={ iconUrl }
											alt={ iconAlt }
											size={ 18 }
										/>
									</span>
								) }
								<span
									className="axiom-blocks-tabs__label"
									style={ labelTypoStyle }
								>
									{ label ||
										__( '(untitled)', 'axiom-blocks' ) }
								</span>
							</button>
						);
					} ) }
				</div>

				<div className="axiom-blocks-tabs__content">
					<InnerBlocks
						allowedBlocks={ [ 'axiom-blocks/tab-panel' ] }
						template={ [
							[
								'axiom-blocks/tab-panel',
								{
									tabId: 'tab-1',
									label: __( 'Tab 1', 'axiom-blocks' ),
								},
							],
						] }
						templateLock={ false }
						renderAppender={ false }
					/>
				</div>
			</div>
		</>
	);
}

export const Tabs = {
	name: 'axiom-blocks/tabs',
	settings: {
		title: __( 'Tabs', 'axiom-blocks' ),
		description: __(
			'Horizontal tabs with any block content inside each panel.',
			'axiom-blocks'
		),
		icon: <BlockIcon slug="tabs" />,
		edit: TabsEdit,
		save: () => <InnerBlocks.Content />,
	},
};
