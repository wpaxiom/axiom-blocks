import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	InnerBlocks,
} from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import {
	ABSelectControl,
	ABToggleControl,
	ABRangeControl,
} from '../../components/ABControls';
import { useSpacingStyle } from '../../components/SpacingPanel';
import { ABInspectorGroups } from '../../components/ABInspectorGroups';
import { getBackgroundVars } from '../../components/BackgroundControl';
import { useDeviceType } from '../../components/responsive';

import { resolveTypographyAttrs } from '../../components/typographyTargets';
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

const ALLOWED = [ 'axiom-blocks/counter' ];
const TEMPLATE = [
	[
		'axiom-blocks/counter',
		{
			endValue: '250',
			suffix: '+',
			label: 'Happy clients',
			iconSlug: 'heart',
		},
	],
	[
		'axiom-blocks/counter',
		{
			endValue: '99',
			suffix: '%',
			label: 'Satisfaction',
			iconSlug: 'star',
		},
	],
	[
		'axiom-blocks/counter',
		{ endValue: '12', label: 'Years in business', iconSlug: 'award' },
	],
];

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

const DESIGN = {
	block: 'counter',
	targets: [
		{
			noun: __( 'Card', 'axiom-blocks' ),
			states: [ 'hover' ],
			colors: [
				{
					label: __( 'Divider Color', 'axiom-blocks' ),
					bind: 'dividerColor',
					static: true,
					fallback: '#e5e7eb',
				},
			],
			background: {
				full: true,
				prefix: 'card',
				colorKey: 'cardBackground',
				statePrefix: { hover: 'cardHover' },
				stateColorKey: { hover: 'cardBackgroundHover' },
			},
			border: {
				widthKeys: CARD_BW,
				legacyWidth: 'cardBorderWidth',
				styleKey: 'borderStyle',
				colorKey: 'cardBorderColor',
				max: 10,
			},
			radius: { keys: CARD_RADIUS, legacyRadius: 'cardBorderRadius', max: 60 },
			shadow: { bind: 'cardShadowCustom' },
			size: {
				bind: 'cardMinHeight',
				label: __( 'Min height', 'axiom-blocks' ),
				responsive: true,
			},
			padding: { type: 'cardPadding', responsive: true },
			ranges: [
				{
					bind: 'gap',
					label: __( 'Gap between items', 'axiom-blocks' ),
					min: 0,
					max: 80,
					default: 24,
					responsive: true,
				},
			],
		},
		{
			noun: __( 'Icon', 'axiom-blocks' ),
			states: [ 'hover' ],
			colors: [
				{
					label: __( 'Color', 'axiom-blocks' ),
					bind: 'iconColor',
					stateBind: { hover: 'iconHoverColor' },
					fallback: '#7c3aed',
				},
			],
			background: {
				full: true,
				prefix: 'iconChip',
				colorKey: 'iconChipColor',
				statePrefix: { hover: 'iconChipHover' },
				stateColorKey: { hover: 'iconChipColorHover' },
			},
			border: {
				widthKeys: [
					'iconChipBorderTopWidth',
					'iconChipBorderRightWidth',
					'iconChipBorderBottomWidth',
					'iconChipBorderLeftWidth',
				],
				styleKey: 'iconChipBorderStyle',
				colorKey: 'iconChipBorderColor',
				stateBind: { hover: 'iconChipBorderColorHover' },
				stateWidthKeys: {
					hover: [
						'iconChipBorderTopWidthHover',
						'iconChipBorderRightWidthHover',
						'iconChipBorderBottomWidthHover',
						'iconChipBorderLeftWidthHover',
					],
				},
				max: 10,
			},
			radius: {
				keys: [
					'iconChipRadiusTopLeft',
					'iconChipRadiusTopRight',
					'iconChipRadiusBottomRight',
					'iconChipRadiusBottomLeft',
				],
				max: 60,
			},
			padding: { type: 'iconChipPadding', responsive: true },
			ranges: [
				{
					bind: 'iconSize',
					label: __( 'Size', 'axiom-blocks' ),
					min: 16,
					max: 80,
					default: 32,
					responsive: true,
				},
			],
		},
		{
			noun: __( 'Number', 'axiom-blocks' ),
			states: [ 'hover' ],
			colors: [
				{
					label: __( 'Color', 'axiom-blocks' ),
					bind: 'numberColor',
					stateBind: { hover: 'numberHoverColor' },
				},
			],
			typography: 'number',
		},
		{
			noun: __( 'Label', 'axiom-blocks' ),
			states: [ 'hover' ],
			colors: [
				{
					label: __( 'Color', 'axiom-blocks' ),
					bind: 'labelColor',
					stateBind: { hover: 'labelHoverColor' },
				},
			],
			typography: 'label',
		},
	],
};

export function getCounterGroupVars( attributes, device = 'Desktop' ) {
	const {
		columns,
		gap,
		dividerColor,
		numberColor,
		numberFontFamily,
		numberFontWeight,
		numberFontSize,
		numberLineHeight,
		numberLetterSpacing,
		numberTextTransform,
		numberTextDecoration,
		numberTextAlign,
		labelColor,
		labelFontFamily,
		labelFontWeight,
		labelFontSize,
		labelLineHeight,
		labelLetterSpacing,
		labelTextTransform,
		labelTextDecoration,
		labelTextAlign,
		iconColor,
		iconSize,
		numberHoverColor,
		labelHoverColor,
		iconHoverColor,
		cardBackground,
		cardBorderColor,
		borderStyle,
		cardBorderWidth,
		cardBorderTopWidth,
		cardBorderRightWidth,
		cardBorderBottomWidth,
		cardBorderLeftWidth,
		cardBorderRadius,
		cardRadiusTopLeft,
		cardRadiusTopRight,
		cardRadiusBottomRight,
		cardRadiusBottomLeft,
		cardShadowCustom,
		cardPaddingTop,
		cardPaddingRight,
		cardPaddingBottom,
		cardPaddingLeft,
		iconChipColor,
		iconChipColorHover,
		iconChipBorderColor,
		iconChipBorderColorHover,
		iconChipBorderStyle,
		iconChipBorderTopWidth,
		iconChipBorderRightWidth,
		iconChipBorderBottomWidth,
		iconChipBorderLeftWidth,
		iconChipBorderTopWidthHover,
		iconChipBorderRightWidthHover,
		iconChipBorderBottomWidthHover,
		iconChipBorderLeftWidthHover,
		iconChipRadiusTopLeft,
		iconChipRadiusTopRight,
		iconChipRadiusBottomRight,
		iconChipRadiusBottomLeft,
		iconChipPaddingTop,
		iconChipPaddingRight,
		iconChipPaddingBottom,
		iconChipPaddingLeft,
	} = attributes;
	const anyBw =
		cardBorderTopWidth ||
		cardBorderRightWidth ||
		cardBorderBottomWidth ||
		cardBorderLeftWidth ||
		cardBorderWidth;
	const anyIconChipBw =
		iconChipBorderTopWidth ||
		iconChipBorderRightWidth ||
		iconChipBorderBottomWidth ||
		iconChipBorderLeftWidth;
	const anyIconChipBwHover =
		iconChipBorderTopWidthHover ||
		iconChipBorderRightWidthHover ||
		iconChipBorderBottomWidthHover ||
		iconChipBorderLeftWidthHover;
	return {
		'--ab-counter-cols': columns || undefined,
		'--ab-counter-gap': gap || undefined,
		'--ab-counter-divider': dividerColor || undefined,
		'--ab-counter-num-color': numberColor || undefined,
		'--ab-counter-num-ff': numberFontFamily || undefined,
		'--ab-counter-num-fw': numberFontWeight || undefined,
		'--ab-counter-num-fs': numberFontSize || undefined,
		'--ab-counter-num-lh': numberLineHeight || undefined,
		'--ab-counter-num-ls': numberLetterSpacing || undefined,
		'--ab-counter-num-tt': numberTextTransform || undefined,
		'--ab-counter-num-td': numberTextDecoration || undefined,
		'--ab-counter-num-ta': numberTextAlign || undefined,
		'--ab-counter-label-color': labelColor || undefined,
		'--ab-counter-label-ff': labelFontFamily || undefined,
		'--ab-counter-label-fw': labelFontWeight || undefined,
		'--ab-counter-label-fs': labelFontSize || undefined,
		'--ab-counter-label-lh': labelLineHeight || undefined,
		'--ab-counter-label-ls': labelLetterSpacing || undefined,
		'--ab-counter-label-tt': labelTextTransform || undefined,
		'--ab-counter-label-td': labelTextDecoration || undefined,
		'--ab-counter-label-ta': labelTextAlign || undefined,
		'--ab-counter-icon-color': iconColor || undefined,
		'--ab-counter-icon-size': iconSize || undefined,
		'--ab-counter-num-hover': numberHoverColor || undefined,
		'--ab-counter-label-hover': labelHoverColor || undefined,
		'--ab-counter-icon-hover': iconHoverColor || undefined,
		// Icon chip. Flat color (legacy `iconChipColor`, iconChipBgType empty) is
		// emitted first so the editor matches the frontend's Background::value()
		// fallback; gradient/image (iconChipBgType set) override it below. The
		// hover chip color likewise falls back to `iconChipColorHover`.
		'--ab-counter-icon-chip-bg': iconChipColor || undefined,
		'--ab-counter-icon-chip-bg-hover': iconChipColorHover || undefined,
		...getBackgroundVars( attributes, {
			prefix: 'iconChip',
			varPrefix: '--ab-counter-icon-chip',
			colorKey: 'iconChipColor',
		} ),
		...getBackgroundVars( attributes, {
			prefix: 'iconChipHover',
			varPrefix: '--ab-counter-icon-chip-h',
			varName: '--ab-counter-icon-chip-bg-hover',
			colorKey: 'iconChipColorHover',
		} ),
		'--ab-counter-icon-chip-bc': iconChipBorderColor || undefined,
		'--ab-counter-icon-chip-h-bc': iconChipBorderColorHover || undefined,
		'--ab-counter-icon-chip-bs': anyIconChipBw
			? iconChipBorderStyle || 'solid'
			: iconChipBorderStyle || undefined,
		'--ab-counter-icon-chip-h-bs': anyIconChipBwHover
			? iconChipBorderStyle || 'solid'
			: undefined,
		'--ab-counter-icon-chip-bw-top': iconChipBorderTopWidth || undefined,
		'--ab-counter-icon-chip-bw-right': iconChipBorderRightWidth || undefined,
		'--ab-counter-icon-chip-bw-bottom': iconChipBorderBottomWidth || undefined,
		'--ab-counter-icon-chip-bw-left': iconChipBorderLeftWidth || undefined,
		'--ab-counter-icon-chip-h-bw-top': iconChipBorderTopWidthHover || undefined,
		'--ab-counter-icon-chip-h-bw-right': iconChipBorderRightWidthHover || undefined,
		'--ab-counter-icon-chip-h-bw-bottom': iconChipBorderBottomWidthHover || undefined,
		'--ab-counter-icon-chip-h-bw-left': iconChipBorderLeftWidthHover || undefined,
		'--ab-counter-icon-chip-radius-tl': iconChipRadiusTopLeft || undefined,
		'--ab-counter-icon-chip-radius-tr': iconChipRadiusTopRight || undefined,
		'--ab-counter-icon-chip-radius-br': iconChipRadiusBottomRight || undefined,
		'--ab-counter-icon-chip-radius-bl': iconChipRadiusBottomLeft || undefined,
		'--ab-counter-icon-chip-pt': iconChipPaddingTop || undefined,
		'--ab-counter-icon-chip-pr': iconChipPaddingRight || undefined,
		'--ab-counter-icon-chip-pb': iconChipPaddingBottom || undefined,
		'--ab-counter-icon-chip-pl': iconChipPaddingLeft || undefined,
		// Card box. Flat color (legacy `cardBackground`, cardBgType empty) is
		// emitted first so the editor matches the frontend's Background::value()
		// fallback; gradient/image (cardBgType set) override it below. The hover
		// background likewise falls back to `cardBackgroundHover`.
		'--ab-counter-card-bg': cardBackground || undefined,
		'--ab-counter-card-bg-hover': cardBackgroundHover( attributes ),
		...getBackgroundVars( attributes, {
			prefix: 'card',
			varPrefix: '--ab-counter-card',
			colorKey: 'cardBackground',
		} ),
		...getBackgroundVars( attributes, {
			prefix: 'cardHover',
			varPrefix: '--ab-counter-card-h',
			varName: '--ab-counter-card-bg-hover',
			colorKey: 'cardBackgroundHover',
		} ),
		'--ab-counter-card-bd-color': cardBorderColor || undefined,
		'--ab-counter-card-bs': anyBw
			? borderStyle || 'solid'
			: borderStyle || undefined,
		// Per-side/corner fall back to the legacy single value so old blocks
		// (which only set cardBorderWidth / cardBorderRadius) preview the same
		// as the frontend's render.php fallback.
		'--ab-counter-card-bw-top': cardBorderTopWidth || cardBorderWidth || undefined,
		'--ab-counter-card-bw-right': cardBorderRightWidth || cardBorderWidth || undefined,
		'--ab-counter-card-bw-bottom': cardBorderBottomWidth || cardBorderWidth || undefined,
		'--ab-counter-card-bw-left': cardBorderLeftWidth || cardBorderWidth || undefined,
		'--ab-counter-card-radius-tl': cardRadiusTopLeft || cardBorderRadius || undefined,
		'--ab-counter-card-radius-tr': cardRadiusTopRight || cardBorderRadius || undefined,
		'--ab-counter-card-radius-br': cardRadiusBottomRight || cardBorderRadius || undefined,
		'--ab-counter-card-radius-bl': cardRadiusBottomLeft || cardBorderRadius || undefined,
		'--ab-counter-card-radius': cardBorderRadius || undefined,
		'--ab-counter-card-shadow': cardShadowCustom || undefined,
		'--ab-counter-card-minh': responsiveVarValue(
			attributes,
			'cardMinHeight',
			device
		),
		'--ab-counter-card-pt': cardPaddingTop || undefined,
		'--ab-counter-card-pr': cardPaddingRight || undefined,
		'--ab-counter-card-pb': cardPaddingBottom || undefined,
		'--ab-counter-card-pl': cardPaddingLeft || undefined,
	};
}

/* Hover background flat color — only when no hover bgType is set (gradient/
 * image override via getBackgroundVars above). */
function cardBackgroundHover( attributes ) {
	if ( attributes.cardHoverBgType ) {
		return undefined;
	}
	return attributes.cardBackgroundHover || undefined;
}

export function getCounterGroupClasses( attributes ) {
	const {
		iconPosition,
		labelPosition,
		stackOnMobile,
		showDivider,
		cardShadow,
		cardShadowCustom,
	} = attributes;
	return [
		'ab-counter-group',
		`ab-counter-group--icon-${ iconPosition || 'top' }`,
		`ab-counter-group--label-${ labelPosition || 'below' }`,
		stackOnMobile ? 'is-stack-mobile' : '',
		showDivider ? 'has-divider' : '',
		// The custom shadow var wins over the preset class (audit rule).
		cardShadow && ! cardShadowCustom
			? `ab-counter-group--shadow-${ cardShadow }`
			: '',
	].filter( Boolean );
}

function CounterGroupEdit( { attributes, setAttributes } ) {
	if ( ! isBlockEnabled( 'counter-group' ) ) {
		return <DisabledBlockMessage blockName="Counter" />;
	}

	const {
		columns,
		stackOnMobile,
		showDivider,
		duration,
		thousandsSeparator,
		thousandsSeparatorChar,
		decimalSeparatorChar,
		easing,
		iconPosition,
		labelPosition,
	} = attributes;

	const device = useDeviceType();
	const blockProps = useBlockProps( {
		className: getCounterGroupClasses( attributes ).join( ' ' ),
		style: {
			...getCounterGroupVars(
				resolveTypographyAttrs(
					attributes,
					[ 'number', 'label' ],
					device
				),
				device
			),
			...useSpacingStyle( attributes ),
			gridTemplateColumns: responsiveGridColumns(
				attributes,
				'columns',
				device
			),
			'--ab-counter-gap': responsiveVarValue( attributes, 'gap', device ),
			'--ab-counter-icon-size': responsiveVarValue(
				attributes,
				'iconSize',
				device
			),
		},
	} );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		allowedBlocks: ALLOWED,
		template: TEMPLATE,
		templateLock: false,
		orientation: 'horizontal',
		renderAppender: InnerBlocks.ButtonBlockAppender,
	} );

	const leading = (
		<>
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
							onChange={ ( v ) => setValue( v ?? 1 ) }
							min={ 1 }
							max={ 6 }
							step={ 1 }
							unit=""
						/>
					) }
				</ABResponsive>
				<ABToggleControl
					label={ __( 'Stack on mobile', 'axiom-blocks' ) }
					checked={ !! stackOnMobile }
					onChange={ ( v ) =>
						setAttributes( { stackOnMobile: v } )
					}
				/>
				<ABToggleControl
					label={ __( 'Dividers between stats', 'axiom-blocks' ) }
					checked={ !! showDivider }
					onChange={ ( v ) =>
						setAttributes( { showDivider: v } )
					}
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Animation', 'axiom-blocks' ) }
				initialOpen={ false }
			>
				<ABRangeControl
					label={ __( 'Duration', 'axiom-blocks' ) }
					value={ duration ?? 2000 }
					onChange={ ( v ) =>
						setAttributes( { duration: v ?? 0 } )
					}
					min={ 0 }
					max={ 6000 }
					step={ 100 }
					unit="ms"
				/>
				<ABSelectControl
					label={ __( 'Easing', 'axiom-blocks' ) }
					value={ easing || 'ease-out' }
					options={ [
						{
							label: __( 'Ease out', 'axiom-blocks' ),
							value: 'ease-out',
						},
						{
							label: __( 'Ease', 'axiom-blocks' ),
							value: 'ease',
						},
						{
							label: __( 'Linear', 'axiom-blocks' ),
							value: 'linear',
						},
						{
							label: __( 'Ease in-out', 'axiom-blocks' ),
							value: 'ease-in-out',
						},
					] }
					onChange={ ( v ) => setAttributes( { easing: v } ) }
				/>
				<ABToggleControl
					label={ __( 'Thousands separator', 'axiom-blocks' ) }
					help={ __(
						'Group digits, e.g. 1,250.',
						'axiom-blocks'
					) }
					checked={ !! thousandsSeparator }
					onChange={ ( v ) =>
						setAttributes( { thousandsSeparator: v } )
					}
				/>
				{ thousandsSeparator && (
					<ABSelectControl
						label={ __( 'Group separator', 'axiom-blocks' ) }
						value={ thousandsSeparatorChar || ',' }
						options={ [
							{
								label: __( 'Comma (1,250)', 'axiom-blocks' ),
								value: ',',
							},
							{
								label: __( 'Period (1.250)', 'axiom-blocks' ),
								value: '.',
							},
							{
								label: __( 'Space (1 250)', 'axiom-blocks' ),
								value: ' ',
							},
							{
								label: __(
									'Apostrophe (1’250)',
									'axiom-blocks'
								),
								value: '’',
							},
						] }
						onChange={ ( v ) =>
							setAttributes( { thousandsSeparatorChar: v } )
						}
					/>
				) }
				<ABSelectControl
					label={ __( 'Decimal separator', 'axiom-blocks' ) }
					value={ decimalSeparatorChar || '.' }
					options={ [
						{
							label: __( 'Period (1.5)', 'axiom-blocks' ),
							value: '.',
						},
						{
							label: __( 'Comma (1,5)', 'axiom-blocks' ),
							value: ',',
						},
					] }
					onChange={ ( v ) =>
						setAttributes( { decimalSeparatorChar: v } )
					}
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Icon', 'axiom-blocks' ) }
				initialOpen={ false }
			>
				<ABSelectControl
					label={ __( 'Position', 'axiom-blocks' ) }
					value={ iconPosition || 'top' }
					options={ [
						{ label: __( 'Top', 'axiom-blocks' ), value: 'top' },
						{ label: __( 'Left', 'axiom-blocks' ), value: 'left' },
					] }
					onChange={ ( v ) =>
						setAttributes( { iconPosition: v } )
					}
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Label', 'axiom-blocks' ) }
				initialOpen={ false }
			>
				<ABSelectControl
					label={ __( 'Position', 'axiom-blocks' ) }
					value={ labelPosition || 'below' }
					options={ [
						{
							label: __( 'Below number', 'axiom-blocks' ),
							value: 'below',
						},
						{
							label: __( 'Above number', 'axiom-blocks' ),
							value: 'above',
						},
						{
							label: __( 'Left of number', 'axiom-blocks' ),
							value: 'left',
						},
						{
							label: __( 'Right of number', 'axiom-blocks' ),
							value: 'right',
						},
					] }
					onChange={ ( v ) =>
						setAttributes( { labelPosition: v } )
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
				design={ DESIGN }
				leading={ leading }
			/>

			<div { ...innerBlocksProps } />
		</>
	);
}

export const CounterGroup = {
	name: 'axiom-blocks/counter-group',
	settings: {
		title: __( 'Counter', 'axiom-blocks' ),
		description: __(
			'Animated count-up statistics with optional icons and labels.',
			'axiom-blocks'
		),
		icon: <BlockIcon slug="counter-group" />,
		edit: CounterGroupEdit,
		save: () => <InnerBlocks.Content />,
	},
};
