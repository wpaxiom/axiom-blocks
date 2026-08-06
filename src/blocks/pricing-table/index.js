import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	InnerBlocks,
} from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import {
	ABTextControl,
	ABSelectControl,
	ABToggleControl,
	ABRangeControl,
} from '../../components/ABControls';
import { useSpacingStyle } from '../../components/SpacingPanel';
import { useTypographyStyle } from '../../components/TypographyPanel';
import { ABInspectorGroups } from '../../components/ABInspectorGroups';
import { resolveTypographyAttrs } from '../../components/typographyTargets';
import {
	useDeviceType,
	resolveResponsiveAttrs,
} from '../../components/responsive';
import { ABResponsive } from '../../components/ABResponsive';
import {
	responsiveGridColumns,
	responsiveVarValue,
} from '../../components/responsiveProps';
import { BlockIcon } from '../../blockIcons';
import {
	DisabledBlockMessage,
	isBlockEnabled,
} from '../../components/DisabledBlockMessage';

const CARD_BW = [
	'cardBorderTopWidth',
	'cardBorderRightWidth',
	'cardBorderBottomWidth',
	'cardBorderLeftWidth',
];
const CARD_RADIUS = [
	'cardRadiusTopLeft',
	'cardRadiusTopRight',
	'cardRadiusBottomRight',
	'cardRadiusBottomLeft',
];
const CARD_BW_F = [
	'cardBorderTopWidthFeatured',
	'cardBorderRightWidthFeatured',
	'cardBorderBottomWidthFeatured',
	'cardBorderLeftWidthFeatured',
];
const CTA_BW = [
	'ctaBorderTopWidth',
	'ctaBorderRightWidth',
	'ctaBorderBottomWidth',
	'ctaBorderLeftWidth',
];
const CTA_RADIUS = [
	'ctaRadiusTopLeft',
	'ctaRadiusTopRight',
	'ctaRadiusBottomRight',
	'ctaRadiusBottomLeft',
];
const BADGE_BW = [
	'badgeBorderTopWidth',
	'badgeBorderRightWidth',
	'badgeBorderBottomWidth',
	'badgeBorderLeftWidth',
];
const BADGE_RADIUS = [
	'badgeRadiusTopLeft',
	'badgeRadiusTopRight',
	'badgeRadiusBottomRight',
	'badgeRadiusBottomLeft',
];

/* What style.scss actually paints on a card, and on the highlighted one.
 * Mirrors the `.ab-pt-plan` / `.is-highlight` fallbacks verbatim — the Styles
 * rows advertise these while their attributes are empty, so a card that visibly
 * has a 1px border and a lifted shadow stops reporting "None". */
const CARD_LOOK = {
	bw: '1px',
	bc: '#e5e7eb',
	bg: '#ffffff',
	pad: [ '28px', '24px', '28px', '24px' ],
};
const CARD_RADIUS_DEFAULT = '12px';
/* `.is-highlight`'s shipped box-shadow, as 8-digit hex so a nudge in the shadow
 * workspace round-trips the same value (safecss strips rgba() inline). */
const CARD_FEATURED_SHADOW = '0 12px 32px #00000014';

/* Anatomy-as-declaration. "Cards" is the §25.4 parent-default home:
 * every row here sets a `--ab-pt-card-*` var on the wrapper that each plan card
 * reads through `var(--plan-card-x, var(--ab-pt-card-x, <shipped default>))`, so
 * a plan's own value always wins and an unset plan inherits. The `featured`
 * state is a CONTENT axis, not an interaction one — `isHighlight` picks it — so
 * the base tab is relabelled `Default`. Only the capabilities TargetSection
 * treats as stateful (background + shadow) carry a Featured variant; the
 * featured border stays driven by Accent, exactly as the shipped
 * `.is-highlight` rule does today. Dynamic (`save: InnerBlocks.Content` →
 * render.php) so no saved markup changes.
 *
 * Built per render because the featured border advertises the accent color,
 * which is itself a row. Those advertised values are display-only: the
 * attributes stay empty, so Reset still lands back on the shipped card instead
 * of freezing a copy of it. */
const designFor = ( attributes ) => ( {
	block: 'pt',
	targets: [
		{
			noun: __( 'Cards', 'axiom-blocks' ),
			states: [ 'featured' ],
			normalLabel: __( 'Default', 'axiom-blocks' ),
			// No card-level Text row: every text component (Plan name, Price,
			// Period, Description, Features, Button) carries its own, so a base
			// color here would just be a second way to say the same thing.
			background: {
				bind: 'cardBg',
				fallback: CARD_LOOK.bg,
				stateFallback: { featured: '#ffffff' },
			},
			// Border is opt-in stateful — without the state keys the Featured tab
			// silently edits the Default attrs.
			border: {
				widthKeys: CARD_BW,
				styleKey: 'cardBorderStyle',
				colorKey: 'cardBorderColor',
				max: 8,
				widthDefault: CARD_LOOK.bw,
				colorDefault: CARD_LOOK.bc,
				stateWidthKeys: { featured: CARD_BW_F },
				stateStyleKey: { featured: 'cardBorderStyleFeatured' },
				stateBind: { featured: 'cardBorderColorFeatured' },
				stateDefaults: {
					featured: {
						width: CARD_LOOK.bw,
						color: attributes.accentColor || '#7C3AED',
					},
				},
			},
			radius: {
				keys: CARD_RADIUS,
				max: 40,
				defaults: CARD_RADIUS_DEFAULT,
			},
			shadow: {
				bind: 'cardShadow',
				stateDefaults: { featured: { value: CARD_FEATURED_SHADOW } },
			},
			padding: {
				type: 'cardPadding',
				responsive: true,
				defaults: CARD_LOOK.pad,
			},
			size: {
				bind: 'cardMinHeight',
				label: __( 'Min height', 'axiom-blocks' ),
				responsive: true,
			},
			ranges: [
				{
					bind: 'cardGap',
					label: __( 'Content gap', 'axiom-blocks' ),
					help: __(
						'Vertical spacing between the name, price, description, features and button.',
						'axiom-blocks'
					),
					min: 0,
					max: 48,
					default: 14,
					responsive: true,
				},
			],
		},
		{
			noun: __( 'Heading', 'axiom-blocks' ),
			colors: [
				{ label: __( 'Text', 'axiom-blocks' ), bind: 'headingColor' },
			],
			typography: 'heading',
			ranges: [
				{
					bind: 'headingGap',
					label: __( 'Space below', 'axiom-blocks' ),
					min: 0,
					max: 80,
					default: 24,
				},
			],
		},
		{
			noun: __( 'Accent', 'axiom-blocks' ),
			colors: [
				{
					label: __( 'Color', 'axiom-blocks' ),
					bind: 'accentColor',
					fallback: '#7C3AED',
				},
			],
		},
		{
			noun: __( 'Badge', 'axiom-blocks' ),
			background: { bind: 'badgeBg', insertAfter: -1 },
			colors: [
				{
					label: __( 'Text', 'axiom-blocks' ),
					bind: 'badgeColor',
					fallback: '#ffffff',
				},
			],
			typography: 'badge',
			border: {
				widthKeys: BADGE_BW,
				styleKey: 'badgeBorderStyle',
				colorKey: 'badgeBorderColor',
				max: 8,
			},
			radius: { keys: BADGE_RADIUS, max: 99 },
			padding: { type: 'badgePadding' },
		},
		{
			noun: __( 'Plan name', 'axiom-blocks' ),
			colors: [
				{ label: __( 'Text', 'axiom-blocks' ), bind: 'nameColor' },
			],
			typography: 'name',
		},
		{
			noun: __( 'Price', 'axiom-blocks' ),
			colors: [
				{ label: __( 'Text', 'axiom-blocks' ), bind: 'priceColor' },
				{
					label: __( 'Currency', 'axiom-blocks' ),
					bind: 'currencyColor',
				},
			],
			ranges: [
				{
					bind: 'priceGap',
					label: __( 'Gap', 'axiom-blocks' ),
					help: __(
						'Spacing between the currency, amount and period.',
						'axiom-blocks'
					),
					min: 0,
					max: 24,
					default: 2,
				},
			],
			// The currency symbol has its own shipped scale, so it gets its own
			// popover rather than a part of its own for a single glyph.
			typography: [
				{ prefix: 'price', label: __( 'Typography', 'axiom-blocks' ) },
				{
					prefix: 'currency',
					label: __( 'Currency', 'axiom-blocks' ),
				},
			],
		},
		{
			noun: __( 'Period', 'axiom-blocks' ),
			colors: [
				{ label: __( 'Text', 'axiom-blocks' ), bind: 'periodColor' },
			],
			typography: 'period',
		},
		{
			noun: __( 'Description', 'axiom-blocks' ),
			colors: [
				{ label: __( 'Text', 'axiom-blocks' ), bind: 'descColor' },
			],
			typography: 'desc',
		},
		{
			noun: __( 'Features', 'axiom-blocks' ),
			colors: [
				{ label: __( 'Text', 'axiom-blocks' ), bind: 'featureColor' },
				{
					label: __( 'Icon (included)', 'axiom-blocks' ),
					bind: 'featIconColor',
					fallback: '#7C3AED',
				},
				{
					label: __( 'Icon (excluded)', 'axiom-blocks' ),
					bind: 'featIconExcludedColor',
					fallback: '#9ca3af',
				},
			],
			typography: 'feature',
			ranges: [
				{
					bind: 'featureGap',
					label: __( 'Row gap', 'axiom-blocks' ),
					min: 0,
					max: 40,
					default: 10,
					responsive: true,
				},
				{
					bind: 'featIconSize',
					label: __( 'Icon size', 'axiom-blocks' ),
					min: 10,
					max: 40,
					default: 18,
					responsive: true,
				},
				{
					bind: 'featIconGap',
					label: __( 'Icon gap', 'axiom-blocks' ),
					min: 0,
					max: 32,
					default: 10,
				},
				{
					bind: 'featExcludedOpacity',
					label: __( 'Excluded opacity', 'axiom-blocks' ),
					min: 10,
					max: 100,
					default: 55,
					// Single-entry `units` pins the row to % (no picker), so it
					// stores `55%` rather than the px a bare range would write.
					units: [ '%' ],
					unit: '%',
				},
			],
		},
		{
			noun: __( 'Button', 'axiom-blocks' ),
			states: [ 'hover' ],
			colors: [
				{ label: __( 'Text', 'axiom-blocks' ), bind: 'ctaColor' },
			],
			background: { bind: 'ctaBg' },
			typography: 'cta',
			border: {
				widthKeys: CTA_BW,
				styleKey: 'ctaBorderStyle',
				colorKey: 'ctaBorderColor',
				max: 8,
			},
			radius: { keys: CTA_RADIUS, max: 40 },
			shadow: { bind: 'ctaShadow' },
			padding: { type: 'ctaPadding', responsive: true },
		},
	],
} );

/* Plan-component typography lives on the TABLE and styles that component in
 * every plan (user 2026-08-03) — a price size is a table-wide decision, not a
 * per-plan one. Emitted as vars on the wrapper; a plan's own shipped typography
 * is still written inline by pricing-plan/render.php and so keeps winning, which
 * is what preserves individually-styled live content. */
const TYPO_SHORT = {
	name: 'name',
	price: 'price',
	currency: 'currency',
	period: 'period',
	badge: 'badge',
	desc: 'desc',
	feature: 'feat',
	cta: 'cta',
};

const TYPO_PROPS = [
	[ 'ff', 'FontFamily' ],
	[ 'fw', 'FontWeight' ],
	[ 'fs', 'FontSize' ],
	[ 'lh', 'LineHeight' ],
	[ 'ls', 'LetterSpacing' ],
	[ 'tt', 'TextTransform' ],
	[ 'td', 'TextDecoration' ],
	[ 'ta', 'TextAlign' ],
];

/* CSS vars for the wrapper — consumed by style.scss in both the editor and the
 * front end. Unset rows emit nothing, so style.scss's shipped fallbacks paint. */
export function getPricingTableVars( attributes, device = 'Desktop' ) {
	const {
		cardBg,
		cardBorderStyle,
		cardBorderColor,
		cardShadow,
		cardBgFeatured,
		cardShadowFeatured,
		headingColor,
	} = attributes;

	const anyBw = CARD_BW.some( ( k ) => attributes[ k ] );
	const anyCtaBw = CTA_BW.some( ( k ) => attributes[ k ] );
	const anyBadgeBw = BADGE_BW.some( ( k ) => attributes[ k ] );
	const anyBwF = CARD_BW_F.some( ( k ) => attributes[ k ] );

	const typo = {};
	Object.entries( TYPO_SHORT ).forEach( ( [ prefix, short ] ) => {
		TYPO_PROPS.forEach( ( [ css, suffix ] ) => {
			const val = attributes[ `${ prefix }${ suffix }` ];
			if ( val ) {
				typo[ `--ab-pt-${ short }-${ css }` ] = val;
			}
		} );
	} );

	return {
		...typo,
		'--ab-pt-cta-color': attributes.ctaColor || undefined,
		'--ab-pt-cta-bg': attributes.ctaBg || undefined,
		'--ab-pt-cta-color-h': attributes.ctaColorHover || undefined,
		'--ab-pt-cta-bg-h': attributes.ctaBgHover || undefined,
		// The featured CTA dims to .9 on hover (shipped). An explicit hover
		// background is the author's final say, so don't tint it.
		'--ab-pt-cta-hover-op': attributes.ctaBgHover ? '1' : undefined,
		'--ab-pt-name-color': attributes.nameColor || undefined,
		'--ab-pt-price-color': attributes.priceColor || undefined,
		'--ab-pt-period-color': attributes.periodColor || undefined,
		// The shipped .75 / .65 dimming would tint any color set on these two,
		// so a chosen color clears it and renders true.
		'--ab-pt-desc-op': attributes.descColor ? '1' : undefined,
		'--ab-pt-period-op': attributes.periodColor ? '1' : undefined,
		'--ab-pt-card-pt': attributes.cardPaddingTop || undefined,
		'--ab-pt-card-pr': attributes.cardPaddingRight || undefined,
		'--ab-pt-card-pb': attributes.cardPaddingBottom || undefined,
		'--ab-pt-card-pl': attributes.cardPaddingLeft || undefined,
		'--ab-pt-card-gap': responsiveVarValue( attributes, 'cardGap', device ),
		'--ab-pt-cta-pt': attributes.ctaPaddingTop || undefined,
		'--ab-pt-cta-pr': attributes.ctaPaddingRight || undefined,
		'--ab-pt-cta-pb': attributes.ctaPaddingBottom || undefined,
		'--ab-pt-cta-pl': attributes.ctaPaddingLeft || undefined,
		'--ab-pt-cta-radius-tl': attributes.ctaRadiusTopLeft || undefined,
		'--ab-pt-cta-radius-tr': attributes.ctaRadiusTopRight || undefined,
		'--ab-pt-cta-radius-br': attributes.ctaRadiusBottomRight || undefined,
		'--ab-pt-cta-radius-bl': attributes.ctaRadiusBottomLeft || undefined,
		'--ab-pt-cta-bw-top': attributes.ctaBorderTopWidth || undefined,
		'--ab-pt-cta-bw-right': attributes.ctaBorderRightWidth || undefined,
		'--ab-pt-cta-bw-bottom': attributes.ctaBorderBottomWidth || undefined,
		'--ab-pt-cta-bw-left': attributes.ctaBorderLeftWidth || undefined,
		'--ab-pt-cta-bc': attributes.ctaBorderColor || undefined,
		'--ab-pt-cta-bs': anyCtaBw
			? attributes.ctaBorderStyle || 'solid'
			: attributes.ctaBorderStyle || undefined,
		'--ab-pt-feat-gap': responsiveVarValue(
			attributes,
			'featureGap',
			device
		),
		'--ab-pt-feat-icon-size': responsiveVarValue(
			attributes,
			'featIconSize',
			device
		),
		'--ab-pt-currency-color': attributes.currencyColor || undefined,
		'--ab-pt-price-gap': attributes.priceGap || undefined,
		'--ab-pt-heading-gap': attributes.headingGap || undefined,
		'--ab-pt-feat-icon-gap': attributes.featIconGap || undefined,
		'--ab-pt-cta-shadow': attributes.ctaShadow || undefined,
		'--ab-pt-cta-shadow-h': attributes.ctaShadowHover || undefined,
		'--ab-pt-badge-pt': attributes.badgePaddingTop || undefined,
		'--ab-pt-badge-pr': attributes.badgePaddingRight || undefined,
		'--ab-pt-badge-pb': attributes.badgePaddingBottom || undefined,
		'--ab-pt-badge-pl': attributes.badgePaddingLeft || undefined,
		'--ab-pt-badge-radius-tl': attributes.badgeRadiusTopLeft || undefined,
		'--ab-pt-badge-radius-tr': attributes.badgeRadiusTopRight || undefined,
		'--ab-pt-badge-radius-br':
			attributes.badgeRadiusBottomRight || undefined,
		'--ab-pt-badge-radius-bl':
			attributes.badgeRadiusBottomLeft || undefined,
		'--ab-pt-badge-bw-top': attributes.badgeBorderTopWidth || undefined,
		'--ab-pt-badge-bw-right': attributes.badgeBorderRightWidth || undefined,
		'--ab-pt-badge-bw-bottom':
			attributes.badgeBorderBottomWidth || undefined,
		'--ab-pt-badge-bw-left': attributes.badgeBorderLeftWidth || undefined,
		'--ab-pt-badge-bc': attributes.badgeBorderColor || undefined,
		'--ab-pt-badge-bs': anyBadgeBw
			? attributes.badgeBorderStyle || 'solid'
			: attributes.badgeBorderStyle || undefined,
		'--ab-pt-feat-ex-op': attributes.featExcludedOpacity || undefined,
		'--ab-pt-feat-ex-td':
			attributes.featStrikeExcluded === false ? 'none' : undefined,
		'--ab-pt-desc-color': attributes.descColor || undefined,
		'--ab-pt-feat-color': attributes.featureColor || undefined,
		'--ab-pt-feat-icon': attributes.featIconColor || undefined,
		'--ab-pt-feat-icon-ex': attributes.featIconExcludedColor || undefined,
		'--ab-pt-badge-bg': attributes.badgeBg || undefined,
		'--ab-pt-badge-color': attributes.badgeColor || undefined,
		'--ab-pt-cardf-bw-top':
			attributes.cardBorderTopWidthFeatured || undefined,
		'--ab-pt-cardf-bw-right':
			attributes.cardBorderRightWidthFeatured || undefined,
		'--ab-pt-cardf-bw-bottom':
			attributes.cardBorderBottomWidthFeatured || undefined,
		'--ab-pt-cardf-bw-left':
			attributes.cardBorderLeftWidthFeatured || undefined,
		'--ab-pt-cardf-bc': attributes.cardBorderColorFeatured || undefined,
		'--ab-pt-cardf-bs': anyBwF
			? attributes.cardBorderStyleFeatured || 'solid'
			: attributes.cardBorderStyleFeatured || undefined,
		'--ab-pt-heading-color': headingColor || undefined,
		'--ab-pt-card-bg': cardBg || undefined,
		'--ab-pt-card-bc': cardBorderColor || undefined,
		'--ab-pt-card-bs': anyBw
			? cardBorderStyle || 'solid'
			: cardBorderStyle || undefined,
		'--ab-pt-card-bw-top': attributes.cardBorderTopWidth || undefined,
		'--ab-pt-card-bw-right': attributes.cardBorderRightWidth || undefined,
		'--ab-pt-card-bw-bottom': attributes.cardBorderBottomWidth || undefined,
		'--ab-pt-card-bw-left': attributes.cardBorderLeftWidth || undefined,
		'--ab-pt-card-radius-tl': attributes.cardRadiusTopLeft || undefined,
		'--ab-pt-card-radius-tr': attributes.cardRadiusTopRight || undefined,
		'--ab-pt-card-radius-br': attributes.cardRadiusBottomRight || undefined,
		'--ab-pt-card-radius-bl': attributes.cardRadiusBottomLeft || undefined,
		'--ab-pt-card-shadow': cardShadow || undefined,
		'--ab-pt-card-minh': responsiveVarValue(
			attributes,
			'cardMinHeight',
			device
		),
		'--ab-pt-cardf-bg': cardBgFeatured || undefined,
		'--ab-pt-cardf-shadow': cardShadowFeatured || undefined,
	};
}

/* ── Default plans inserted when the block is first added ──────────────── */
const DEFAULT_PLANS = [
	[
		'axiom-blocks/pricing-plan',
		{
			name: __( 'Starter', 'axiom-blocks' ),
			currency: '$',
			price: '9',
			period: __( '/month', 'axiom-blocks' ),
			description: __(
				'For individuals just getting started.',
				'axiom-blocks'
			),
			features: [
				{
					id: 'f-s-1',
					text: __( 'Up to 5 projects', 'axiom-blocks' ),
					included: true,
				},
				{
					id: 'f-s-2',
					text: __( 'Community support', 'axiom-blocks' ),
					included: true,
				},
				{
					id: 'f-s-3',
					text: __( 'Priority support', 'axiom-blocks' ),
					included: false,
				},
				{
					id: 'f-s-4',
					text: __( 'Advanced analytics', 'axiom-blocks' ),
					included: false,
				},
			],
			ctaLabel: __( 'Get started', 'axiom-blocks' ),
		},
	],
	[
		'axiom-blocks/pricing-plan',
		{
			name: __( 'Pro', 'axiom-blocks' ),
			badge: __( 'Most Popular', 'axiom-blocks' ),
			currency: '$',
			price: '29',
			period: __( '/month', 'axiom-blocks' ),
			description: __( 'Everything you need to grow.', 'axiom-blocks' ),
			isHighlight: true,
			features: [
				{
					id: 'f-p-1',
					text: __( 'Unlimited projects', 'axiom-blocks' ),
					included: true,
				},
				{
					id: 'f-p-2',
					text: __( 'Priority support', 'axiom-blocks' ),
					included: true,
				},
				{
					id: 'f-p-3',
					text: __( 'Advanced analytics', 'axiom-blocks' ),
					included: true,
				},
				{
					id: 'f-p-4',
					text: __( 'Custom integrations', 'axiom-blocks' ),
					included: false,
				},
			],
			ctaLabel: __( 'Start free trial', 'axiom-blocks' ),
		},
	],
	[
		'axiom-blocks/pricing-plan',
		{
			name: __( 'Business', 'axiom-blocks' ),
			currency: '$',
			price: '79',
			period: __( '/month', 'axiom-blocks' ),
			description: __(
				'For teams that need more power.',
				'axiom-blocks'
			),
			features: [
				{
					id: 'f-b-1',
					text: __( 'Unlimited everything', 'axiom-blocks' ),
					included: true,
				},
				{
					id: 'f-b-2',
					text: __( 'Dedicated support', 'axiom-blocks' ),
					included: true,
				},
				{
					id: 'f-b-3',
					text: __( 'Custom integrations', 'axiom-blocks' ),
					included: true,
				},
				{
					id: 'f-b-4',
					text: __( 'SSO & advanced security', 'axiom-blocks' ),
					included: true,
				},
			],
			ctaLabel: __( 'Contact sales', 'axiom-blocks' ),
		},
	],
];

function PricingTableEdit( { attributes, setAttributes } ) {
	if ( ! isBlockEnabled( 'pricing-table' ) ) {
		return <DisabledBlockMessage blockName="Pricing Table" />;
	}
	const {
		accentColor,
		featureIconStyle,
		headingShow,
		headingText,
		headingAlign,
	} = attributes;

	const device = useDeviceType();
	const resolved = resolveResponsiveAttrs(
		attributes,
		[ 'columns' ],
		device
	);
	const blockProps = useBlockProps( {
		className: [
			'axiom-blocks-pricing-table',
			`is-feat-${ featureIconStyle }`,
		]
			.filter( Boolean )
			.join( ' ' ),
		style: {
			'--ab-pt-columns': Math.max(
				1,
				Math.min( 4, resolved.columns || 3 )
			),
			'--ab-pt-gap': responsiveVarValue(
				attributes,
				'gap',
				device,
				'px'
			),
			'--ab-pt-accent': accentColor || '#7C3AED',
			...getPricingTableVars(
				resolveTypographyAttrs(
					attributes,
					Object.keys( TYPO_SHORT ),
					device
				),
				device
			),
			...useSpacingStyle( attributes ),
		},
	} );

	const headingStyle = {
		// Legacy fallback — typography spread overrides if headingTextAlign is set.
		textAlign: headingAlign || undefined,
		...useTypographyStyle( attributes, 'heading' ),
	};

	const innerBlocksProps = useInnerBlocksProps(
		{
			className: 'axiom-blocks-pricing-table__grid',
			style: {
				gridTemplateColumns: responsiveGridColumns(
					attributes,
					'columns',
					device
				),
			},
		},
		{
			allowedBlocks: [ 'axiom-blocks/pricing-plan' ],
			template: DEFAULT_PLANS,
			templateLock: false,
			renderAppender: InnerBlocks.ButtonBlockAppender,
			orientation: 'horizontal',
		}
	);

	const leading = (
		<>
			{ /* ── Layout ────────────────────────────────────────────── */ }
			<PanelBody
				title={ __( 'Layout', 'axiom-blocks' ) }
				initialOpen={ true }
			>
				<ABResponsive
					attributes={ attributes }
					setAttributes={ setAttributes }
					attrKey="columns"
				>
					{ ( { value, setValue, inherited } ) => (
						<ABRangeControl
							label={ __( 'Columns', 'axiom-blocks' ) }
							value={
								value !== '' && value != null
									? value
									: inherited ?? 3
							}
							onChange={ ( v ) =>
								setValue( Math.max( 1, Math.min( 4, v || 1 ) ) )
							}
							min={ 1 }
							max={ 4 }
							step={ 1 }
							unit=""
						/>
					) }
				</ABResponsive>
				<ABResponsive
					attributes={ attributes }
					setAttributes={ setAttributes }
					attrKey="gap"
				>
					{ ( { value, setValue, inherited } ) => (
						<ABRangeControl
							label={ __( 'Gap', 'axiom-blocks' ) }
							value={
								value !== '' && value != null
									? value
									: inherited ?? 0
							}
							onChange={ ( v ) => setValue( v ?? 0 ) }
							min={ 0 }
							max={ 64 }
							step={ 1 }
							unit="px"
						/>
					) }
				</ABResponsive>
			</PanelBody>

			{ /* ── Heading ───────────────────────────────────────────── */ }
			<PanelBody
				title={ __( 'Heading', 'axiom-blocks' ) }
				initialOpen={ false }
			>
				<ABToggleControl
					label={ __( 'Show heading', 'axiom-blocks' ) }
					checked={ headingShow }
					onChange={ ( v ) => setAttributes( { headingShow: v } ) }
				/>
				{ headingShow && (
					<>
						<ABTextControl
							label={ __( 'Heading text', 'axiom-blocks' ) }
							value={ headingText }
							onChange={ ( v ) =>
								setAttributes( { headingText: v } )
							}
						/>
						<ABSelectControl
							label={ __( 'Heading alignment', 'axiom-blocks' ) }
							value={
								attributes.headingTextAlign ||
								headingAlign ||
								''
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
							onChange={ ( v ) =>
								setAttributes( { headingTextAlign: v } )
							}
						/>
					</>
				) }
			</PanelBody>

			{ /* ── Price display ─────────────────────────────────────── */ }
			<PanelBody
				title={ __( 'Price display', 'axiom-blocks' ) }
				initialOpen={ false }
			>
				<ABToggleControl
					label={ __( 'Show currency', 'axiom-blocks' ) }
					help={ __(
						'Applies to every plan in this table.',
						'axiom-blocks'
					) }
					checked={ attributes.showCurrency !== false }
					onChange={ ( v ) => setAttributes( { showCurrency: v } ) }
				/>
				<ABToggleControl
					label={ __( 'Show period', 'axiom-blocks' ) }
					checked={ attributes.showPeriod !== false }
					onChange={ ( v ) => setAttributes( { showPeriod: v } ) }
				/>
			</PanelBody>

			{ /* ── Features ──────────────────────────────────────────── */ }
			<PanelBody
				title={ __( 'Features', 'axiom-blocks' ) }
				initialOpen={ false }
			>
				<ABSelectControl
					label={ __( 'Feature icon style', 'axiom-blocks' ) }
					value={ featureIconStyle }
					options={ [
						{
							label: __( 'Check / cross', 'axiom-blocks' ),
							value: 'check',
						},
						{
							label: __( 'Dot', 'axiom-blocks' ),
							value: 'dot',
						},
					] }
					onChange={ ( v ) =>
						setAttributes( { featureIconStyle: v } )
					}
				/>
				<ABToggleControl
					label={ __( 'Strike out excluded', 'axiom-blocks' ) }
					checked={ attributes.featStrikeExcluded !== false }
					onChange={ ( v ) =>
						setAttributes( { featStrikeExcluded: v } )
					}
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
				{ headingShow && headingText && (
					<div
						className="axiom-blocks-pricing-table__heading"
						style={ headingStyle }
					>
						{ headingText }
					</div>
				) }
				<div { ...innerBlocksProps } />
			</div>
		</>
	);
}

export const PricingTable = {
	name: 'axiom-blocks/pricing-table',
	settings: {
		title: __( 'Pricing Table', 'axiom-blocks' ),
		description: __(
			'Pricing plans with feature lists, CTAs, and a highlighted recommendation.',
			'axiom-blocks'
		),
		icon: <BlockIcon slug="pricing-table" />,
		edit: PricingTableEdit,
		save: () => <InnerBlocks.Content />,
	},
};
