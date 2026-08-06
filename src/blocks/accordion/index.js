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
import { getBackgroundVars } from '../../components/BackgroundControl';
import { ABInspectorGroups } from '../../components/ABInspectorGroups';
import { useDeviceType } from '../../components/responsive';

import { resolveTypographyAttrs } from '../../components/typographyTargets';
import { responsiveVarValue } from '../../components/responsiveProps';
import { IconControl } from '../../components/IconControl';
import { BlockIcon } from '../../blockIcons';
import {
	DisabledBlockMessage,
	isBlockEnabled,
} from '../../components/DisabledBlockMessage';

const ALLOWED = [ 'axiom-blocks/accordion-item' ];
const TEMPLATE = [
	[ 'axiom-blocks/accordion-item', { title: 'Accordion item one' } ],
];

const ITEM_BW_KEYS = [
	'borderTopWidth',
	'borderRightWidth',
	'borderBottomWidth',
	'borderLeftWidth',
];
const ITEM_RADIUS_KEYS = [
	'radiusTopLeft',
	'radiusTopRight',
	'radiusBottomRight',
	'radiusBottomLeft',
];
const CONT_BW_KEYS = [
	'containerBorderTopWidth',
	'containerBorderRightWidth',
	'containerBorderBottomWidth',
	'containerBorderLeftWidth',
];
const CONT_RADIUS_KEYS = [
	'containerRadiusTopLeft',
	'containerRadiusTopRight',
	'containerRadiusBottomRight',
	'containerRadiusBottomLeft',
];

/* Anatomy-as-declaration — the part-first (Option C) Styles UI is rendered from
 * this config by ABInspectorGroups/TargetSection. Every binding maps to an
 * EXISTING shipped attribute, so re-homing the inspector changes zero data. */
const DESIGN = {
	block: 'acc',
	targets: [
		{
			noun: __( 'Container', 'axiom-blocks' ),
			border: {
				prefix: 'container',
				widthKeys: CONT_BW_KEYS,
				legacyWidth: 'containerBorderWidth',
				max: 20,
			},
			radius: {
				prefix: 'container',
				keys: CONT_RADIUS_KEYS,
				legacyRadius: 'containerBorderRadius',
				max: 64,
			},
			shadow: { bind: 'containerShadow' },
			ranges: [
				{
					bind: 'itemGap',
					label: __( 'Gap between items', 'axiom-blocks' ),
					min: 0,
					max: 32,
					default: 8,
					responsive: true,
				},
			],
		},
		{
			noun: __( 'Item', 'axiom-blocks' ),
			states: [ 'hover' ],
			background: {
				full: true,
				prefix: 'item',
				colorKey: 'itemBg',
				statePrefix: { hover: 'itemHover' },
				stateColorKey: { hover: 'itemBgHover' },
			},
			border: {
				widthKeys: ITEM_BW_KEYS,
				legacyWidth: 'borderWidth',
				colorDefault: '#e3e3e6',
				max: 20,
			},
			radius: {
				keys: ITEM_RADIUS_KEYS,
				legacyRadius: 'borderRadius',
				max: 64,
			},
			shadow: { bind: 'itemShadow' },
		},
		{
			noun: __( 'Header', 'axiom-blocks' ),
			states: [ 'hover', 'active' ],
			colors: [
				{
					label: __( 'Text', 'axiom-blocks' ),
					bind: 'headerColor',
					stateBind: {
						hover: 'headerColorHover',
						active: 'activeHeaderColor',
					},
				},
			],
			background: {
				full: true,
				prefix: 'header',
				colorKey: 'headerBg',
				statePrefix: { hover: 'headerHover', active: 'headerActive' },
				stateColorKey: {
					hover: 'headerBgHover',
					active: 'activeHeaderBg',
				},
			},
			typography: 'header',
			padding: { type: 'headerPadding', responsive: true },
		},
		{
			noun: __( 'Body', 'axiom-blocks' ),
			// Body hosts InnerBlocks — box capabilities only; inner blocks own
			// their text (wrapper rule). Legacy `bodyColor` attr + render kept for
			// back-compat, but no text-color control here.
			background: {
				full: true,
				prefix: 'body',
				colorKey: 'bodyBg',
			},
			border: { prefix: 'body', colorDefault: '#e3e3e6', max: 20 },
			radius: { prefix: 'body', max: 64 },
			padding: { type: 'bodyPadding', responsive: true },
			size: {
				bind: 'bodyMaxWidth',
				label: __( 'Max width', 'axiom-blocks' ),
				responsive: true,
			},
		},
		{
			noun: __( 'Icon', 'axiom-blocks' ),
			states: [ 'active' ],
			colors: [
				{ label: __( 'Color', 'axiom-blocks' ), bind: 'iconColor' },
			],
			ranges: [
				{
					bind: 'iconSize',
					label: __( 'Icon size', 'axiom-blocks' ),
					min: 10,
					max: 48,
					default: 20,
					responsive: true,
				},
			],
		},
	],
};

export function getAccordionVars( attributes ) {
	const {
		headerBg,
		headerColor,
		headerBgHover,
		headerColorHover,
		activeHeaderBg,
		activeHeaderColor,
		headerPaddingTop,
		headerPaddingRight,
		headerPaddingBottom,
		headerPaddingLeft,
		bodyBg,
		bodyColor,
		bodyPaddingTop,
		bodyPaddingRight,
		bodyPaddingBottom,
		bodyPaddingLeft,
		bodyBorderStyle,
		bodyBorderColor,
		bodyBorderTopWidth,
		bodyBorderRightWidth,
		bodyBorderBottomWidth,
		bodyBorderLeftWidth,
		bodyRadiusTopLeft,
		bodyRadiusTopRight,
		bodyRadiusBottomRight,
		bodyRadiusBottomLeft,
		borderColor,
		borderWidth,
		borderRadius,
		borderStyle,
		borderTopWidth,
		borderRightWidth,
		borderBottomWidth,
		borderLeftWidth,
		radiusTopLeft,
		radiusTopRight,
		radiusBottomRight,
		radiusBottomLeft,
		itemGap,
		containerBorderColor,
		containerBorderWidth,
		containerBorderRadius,
		containerBorderStyle,
		containerBorderTopWidth,
		containerBorderRightWidth,
		containerBorderBottomWidth,
		containerBorderLeftWidth,
		containerRadiusTopLeft,
		containerRadiusTopRight,
		containerRadiusBottomRight,
		containerRadiusBottomLeft,
		containerShadow,
		containerMaxWidth,
		itemBg,
		itemShadow,
		itemBgHover,
		itemShadowHover,
		bodyMaxWidth,
		iconColor,
		iconColorActive,
		iconSize,
		headerFontFamily,
		headerFontWeight,
		headerFontSize,
		headerLineHeight,
		headerLetterSpacing,
		headerTextTransform,
		headerTextDecoration,
		headerTextAlign,
	} = attributes;
	return {
		'--ab-acc-header-bg': headerBg || undefined,
		'--ab-acc-header-color': headerColor || undefined,
		'--ab-acc-header-bg-hover': headerBgHover || undefined,
		'--ab-acc-header-color-hover': headerColorHover || undefined,
		'--ab-acc-active-header-bg': activeHeaderBg || undefined,
		'--ab-acc-active-header-color': activeHeaderColor || undefined,
		'--ab-acc-header-pt': headerPaddingTop || undefined,
		'--ab-acc-header-pr': headerPaddingRight || undefined,
		'--ab-acc-header-pb': headerPaddingBottom || undefined,
		'--ab-acc-header-pl': headerPaddingLeft || undefined,
		'--ab-acc-body-bg': bodyBg || undefined,
		'--ab-acc-body-color': bodyColor || undefined,
		'--ab-acc-body-pt': bodyPaddingTop || undefined,
		'--ab-acc-body-pr': bodyPaddingRight || undefined,
		'--ab-acc-body-pb': bodyPaddingBottom || undefined,
		'--ab-acc-body-pl': bodyPaddingLeft || undefined,
		'--ab-acc-body-bs': bodyBorderStyle || undefined,
		'--ab-acc-body-bc': bodyBorderColor || undefined,
		'--ab-acc-body-bw-top': bodyBorderTopWidth || undefined,
		'--ab-acc-body-bw-right': bodyBorderRightWidth || undefined,
		'--ab-acc-body-bw-bottom': bodyBorderBottomWidth || undefined,
		'--ab-acc-body-bw-left': bodyBorderLeftWidth || undefined,
		'--ab-acc-body-radius-tl': bodyRadiusTopLeft || undefined,
		'--ab-acc-body-radius-tr': bodyRadiusTopRight || undefined,
		'--ab-acc-body-radius-br': bodyRadiusBottomRight || undefined,
		'--ab-acc-body-radius-bl': bodyRadiusBottomLeft || undefined,
		'--ab-acc-border-color': borderColor || undefined,
		'--ab-acc-border-width': borderWidth || undefined,
		'--ab-acc-radius': borderRadius || undefined,
		'--ab-acc-bs': borderStyle || undefined,
		'--ab-acc-bw-top': borderTopWidth || undefined,
		'--ab-acc-bw-right': borderRightWidth || undefined,
		'--ab-acc-bw-bottom': borderBottomWidth || undefined,
		'--ab-acc-bw-left': borderLeftWidth || undefined,
		'--ab-acc-radius-tl': radiusTopLeft || undefined,
		'--ab-acc-radius-tr': radiusTopRight || undefined,
		'--ab-acc-radius-br': radiusBottomRight || undefined,
		'--ab-acc-radius-bl': radiusBottomLeft || undefined,
		'--ab-acc-gap': itemGap || undefined,
		'--ab-acc-cont-bc': containerBorderColor || undefined,
		'--ab-acc-cont-bw': containerBorderWidth || undefined,
		'--ab-acc-cont-radius': containerBorderRadius || undefined,
		'--ab-acc-cont-bs': containerBorderStyle || undefined,
		'--ab-acc-cont-bw-top': containerBorderTopWidth || undefined,
		'--ab-acc-cont-bw-right': containerBorderRightWidth || undefined,
		'--ab-acc-cont-bw-bottom': containerBorderBottomWidth || undefined,
		'--ab-acc-cont-bw-left': containerBorderLeftWidth || undefined,
		'--ab-acc-cont-radius-tl': containerRadiusTopLeft || undefined,
		'--ab-acc-cont-radius-tr': containerRadiusTopRight || undefined,
		'--ab-acc-cont-radius-br': containerRadiusBottomRight || undefined,
		'--ab-acc-cont-radius-bl': containerRadiusBottomLeft || undefined,
		'--ab-acc-cont-shadow': containerShadow || undefined,
		'--ab-acc-cont-maxw': containerMaxWidth || undefined,
		'--ab-acc-item-bg': itemBg || undefined,
		'--ab-acc-item-shadow': itemShadow || undefined,
		'--ab-acc-item-bg-hover': itemBgHover || undefined,
		'--ab-acc-item-shadow-hover': itemShadowHover || undefined,
		'--ab-acc-body-maxw': bodyMaxWidth || undefined,
		'--ab-acc-icon-color': iconColor || undefined,
		'--ab-acc-icon-color-active': iconColorActive || undefined,
		'--ab-acc-icon-size': iconSize || undefined,
		'--ab-acc-title-ff': headerFontFamily || undefined,
		'--ab-acc-title-fw': headerFontWeight || undefined,
		'--ab-acc-title-fs': headerFontSize || undefined,
		'--ab-acc-title-lh': headerLineHeight || undefined,
		'--ab-acc-title-ls': headerLetterSpacing || undefined,
		'--ab-acc-title-tt': headerTextTransform || undefined,
		'--ab-acc-title-td': headerTextDecoration || undefined,
		'--ab-acc-title-ta': headerTextAlign || undefined,
		...getBackgroundVars( attributes, {
			prefix: 'item',
			varName: '--ab-acc-item-bg',
			colorKey: 'itemBg',
		} ),
		...getBackgroundVars( attributes, {
			prefix: 'itemHover',
			varName: '--ab-acc-item-bg-hover',
			colorKey: 'itemBgHover',
		} ),
		...getBackgroundVars( attributes, {
			prefix: 'header',
			varName: '--ab-acc-header-bg',
			colorKey: 'headerBg',
		} ),
		...getBackgroundVars( attributes, {
			prefix: 'headerHover',
			varName: '--ab-acc-header-bg-hover',
			colorKey: 'headerBgHover',
		} ),
		...getBackgroundVars( attributes, {
			prefix: 'headerActive',
			varName: '--ab-acc-active-header-bg',
			colorKey: 'activeHeaderBg',
		} ),
		...getBackgroundVars( attributes, {
			prefix: 'body',
			varName: '--ab-acc-body-bg',
			colorKey: 'bodyBg',
		} ),
	};
}

export function getAccordionClasses( attributes ) {
	const { showIcon, iconPosition, rotateIcon } = attributes;
	return [
		'ab-accordion',
		showIcon ? 'has-icon' : 'no-icon',
		`ab-accordion--icon-${ iconPosition || 'right' }`,
		rotateIcon ? 'ab-accordion--rotate' : '',
	].filter( Boolean );
}

function AccordionEdit( { attributes, setAttributes } ) {
	if ( ! isBlockEnabled( 'accordion' ) ) {
		return <DisabledBlockMessage blockName="Accordion" />;
	}

	const {
		closeOthers,
		firstItemOpen,
		headingLevel,
		faqSchema,
		transitionDuration,
		showExpandAll,
		deepLink,
		collapseOnMobile,
		showIcon,
		iconSlug,
		iconPosition,
		rotateIcon,
	} = attributes;

	const device = useDeviceType();
	const blockProps = useBlockProps( {
		className: getAccordionClasses( attributes ).join( ' ' ),
		style: {
			...getAccordionVars(
				resolveTypographyAttrs( attributes, [ 'header' ], device )
			),
			...useSpacingStyle( attributes ),
			'--ab-acc-gap': responsiveVarValue( attributes, 'itemGap', device ),
			'--ab-acc-icon-size': responsiveVarValue(
				attributes,
				'iconSize',
				device
			),
			'--ab-acc-cont-maxw': responsiveVarValue(
				attributes,
				'containerMaxWidth',
				device
			),
			'--ab-acc-body-maxw': responsiveVarValue(
				attributes,
				'bodyMaxWidth',
				device
			),
		},
	} );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		allowedBlocks: ALLOWED,
		template: TEMPLATE,
		templateLock: false,
		orientation: 'vertical',
		renderAppender: InnerBlocks.ButtonBlockAppender,
	} );

	const behaviorPanel = (
		<PanelBody
			title={ __( 'Behavior', 'axiom-blocks' ) }
			initialOpen={ true }
		>
			<ABToggleControl
				label={ __( 'Close others when opening', 'axiom-blocks' ) }
				help={ __( 'Only one panel open at a time.', 'axiom-blocks' ) }
				checked={ !! closeOthers }
				onChange={ ( v ) => setAttributes( { closeOthers: v } ) }
			/>
			<ABToggleControl
				label={ __( 'Open first item by default', 'axiom-blocks' ) }
				checked={ !! firstItemOpen }
				onChange={ ( v ) => setAttributes( { firstItemOpen: v } ) }
			/>
			<ABSelectControl
				label={ __( 'Heading level', 'axiom-blocks' ) }
				help={ __(
					'HTML tag for each item title (for accessibility and document outline).',
					'axiom-blocks'
				) }
				value={ headingLevel || 'h3' }
				options={ [
					{ label: 'H2', value: 'h2' },
					{ label: 'H3', value: 'h3' },
					{ label: 'H4', value: 'h4' },
					{ label: 'H5', value: 'h5' },
					{ label: 'H6', value: 'h6' },
				] }
				onChange={ ( v ) => setAttributes( { headingLevel: v } ) }
			/>
			<ABToggleControl
				label={ __( 'Output FAQ schema', 'axiom-blocks' ) }
				help={ __(
					'Add schema.org FAQPage structured data (item titles = questions, panel content = answers). Use only for genuine question-and-answer content.',
					'axiom-blocks'
				) }
				checked={ !! faqSchema }
				onChange={ ( v ) => setAttributes( { faqSchema: v } ) }
			/>
			<ABRangeControl
				label={ __( 'Animation speed', 'axiom-blocks' ) }
				help={ __( '0 = instant (no animation).', 'axiom-blocks' ) }
				value={ transitionDuration ?? 300 }
				onChange={ ( v ) =>
					setAttributes( { transitionDuration: v ?? 0 } )
				}
				min={ 0 }
				max={ 1000 }
				step={ 50 }
				unit="ms"
			/>
			<ABToggleControl
				label={ __( 'Expand / collapse all button', 'axiom-blocks' ) }
				checked={ !! showExpandAll }
				onChange={ ( v ) => setAttributes( { showExpandAll: v } ) }
			/>
			<ABToggleControl
				label={ __(
					'Deep-link to items (URL anchor)',
					'axiom-blocks'
				) }
				help={ __(
					'Open and scroll to the item whose HTML Anchor (set per item in the Advanced panel) matches the page URL, e.g. #shipping. The URL updates as items open. This is not a clickable link on the item.',
					'axiom-blocks'
				) }
				checked={ !! deepLink }
				onChange={ ( v ) => setAttributes( { deepLink: v } ) }
			/>
			<ABToggleControl
				label={ __( 'Collapse on mobile', 'axiom-blocks' ) }
				help={ __(
					'Start every panel closed on small screens.',
					'axiom-blocks'
				) }
				checked={ !! collapseOnMobile }
				onChange={ ( v ) => setAttributes( { collapseOnMobile: v } ) }
			/>
		</PanelBody>
	);

	const iconContent = (
		<>
			<ABToggleControl
				label={ __( 'Show icon', 'axiom-blocks' ) }
				checked={ !! showIcon }
				onChange={ ( v ) => setAttributes( { showIcon: v } ) }
			/>
			{ showIcon && (
				<>
					<IconControl
						value={ iconSlug }
						onChange={ ( v ) => setAttributes( { iconSlug: v } ) }
						fallback="chevron-down"
					/>
					<ABSelectControl
						label={ __( 'Icon position', 'axiom-blocks' ) }
						value={ iconPosition }
						options={ [
							{
								label: __( 'Left', 'axiom-blocks' ),
								value: 'left',
							},
							{
								label: __( 'Right', 'axiom-blocks' ),
								value: 'right',
							},
						] }
						onChange={ ( v ) =>
							setAttributes( { iconPosition: v } )
						}
					/>
					<ABToggleControl
						label={ __( 'Rotate icon when open', 'axiom-blocks' ) }
						checked={ !! rotateIcon }
						onChange={ ( v ) => setAttributes( { rotateIcon: v } ) }
					/>
				</>
			) }
		</>
	);

	return (
		<>
			<ABInspectorGroups
				attributes={ attributes }
				setAttributes={ setAttributes }
				design={ DESIGN }
				leading={
					<>
						{ behaviorPanel }
						<PanelBody
							title={ __( 'Icon', 'axiom-blocks' ) }
							initialOpen={ false }
						>
							{ iconContent }
						</PanelBody>
					</>
				}
			/>
			<div { ...innerBlocksProps } />
		</>
	);
}

export const Accordion = {
	name: 'axiom-blocks/accordion',
	settings: {
		title: __( 'Accordion', 'axiom-blocks' ),
		description: __(
			'Collapsible panels for FAQs and disclosures, built on native details/summary.',
			'axiom-blocks'
		),
		icon: <BlockIcon slug="accordion" />,
		edit: AccordionEdit,
		save: () => <InnerBlocks.Content />,
	},
};
