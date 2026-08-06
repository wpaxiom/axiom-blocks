import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	InnerBlocks,
} from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import {
	ABSelectControl,
	ABRangeControl,
} from '../../components/ABControls';
import { useSpacingStyle } from '../../components/SpacingPanel';
import { ABInspectorGroups } from '../../components/ABInspectorGroups';
import { getBackgroundVars } from '../../components/BackgroundControl';
import {
	useDeviceType,
	resolveResponsiveAttrs,
} from '../../components/responsive';
import { ABResponsive } from '../../components/ABResponsive';
import {
	responsiveVarValue,
	responsiveAlignValue,
	ALIGN_FLEX_MAP,
} from '../../components/responsiveProps';
import { BlockIcon } from '../../blockIcons';
import {
	DisabledBlockMessage,
	isBlockEnabled,
} from '../../components/DisabledBlockMessage';

const toPx = ( v ) => ( v === '' || v == null ? '' : `${ v }px` );
const fromPx = ( v, fallback ) =>
	v === '' || v == null ? fallback : parseInt( v, 10 ) || 0;

/* Default contents — built from our own blocks plus a core paragraph. */
const TEMPLATE = [
	[ 'axiom-blocks/icon', {} ],
	[
		'axiom-blocks/advanced-heading',
		{ headingText: __( 'Feature title', 'axiom-blocks' ), tagName: 'h3' },
	],
	[
		'core/paragraph',
		{ placeholder: __( 'Describe this feature…', 'axiom-blocks' ) },
	],
	[
		'axiom-blocks/advanced-button',
		{ text: __( 'Learn more', 'axiom-blocks' ) },
	],
];

/* Inserter hover preview. */
const EXAMPLE = {
	attributes: { direction: 'column', contentAlign: 'center' },
	innerBlocks: [
		{ name: 'axiom-blocks/icon', attributes: { iconSlug: 'star' } },
		{
			name: 'axiom-blocks/advanced-heading',
			attributes: {
				headingText: __( 'Fast & reliable', 'axiom-blocks' ),
				tagName: 'h3',
			},
		},
		{
			name: 'core/paragraph',
			attributes: {
				content: __(
					'Everything you need, nothing you don’t.',
					'axiom-blocks'
				),
			},
		},
		{
			name: 'axiom-blocks/advanced-button',
			attributes: { text: __( 'Learn more', 'axiom-blocks' ) },
		},
	],
};

const IBOX_BW = [
	'borderTopWidth',
	'borderRightWidth',
	'borderBottomWidth',
	'borderLeftWidth',
];
const IBOX_RADIUS = [
	'radiusTopLeft',
	'radiusTopRight',
	'radiusBottomRight',
	'radiusBottomLeft',
];

/* Anatomy-as-declaration — the part-first (Option C) Styles UI is rendered from
 * this config by ABInspectorGroups/TargetSection. Info Box is a wrapper block
 * (hosts InnerBlocks: icon + heading + text + button) ⇒ the Card part is a box
 * ONLY, no typography (inner blocks own their text). Card hover (background +
 * shadow + lift) is the Sable hover gap, built as P1 from new additive attrs —
 * the block shipped no hover attrs of its own. save() is dynamic (render.php)
 * so nothing changes in saved markup. */
const DESIGN = {
	block: 'ibox',
	targets: [
		{
			noun: __( 'Card', 'axiom-blocks' ),
			states: [ 'hover' ],
			background: {
				full: true,
				prefix: 'card',
				colorKey: 'bgColor',
				overlay: true,
				statePrefix: { hover: 'cardHover' },
				stateColorKey: { hover: 'bgColorHover' },
			},
			border: {
				widthKeys: IBOX_BW,
				legacyWidth: 'borderWidth',
				styleKey: 'borderStyle',
				colorKey: 'borderColor',
				max: 12,
			},
			radius: { keys: IBOX_RADIUS, legacyRadius: 'borderRadius', max: 48 },
			shadow: { bind: 'boxShadowCustom' },
			size: { panel: true, prefix: 'card', label: __( 'Size', 'axiom-blocks' ) },
			ranges: [
				{
					bind: 'hoverLift',
					label: __( 'Hover lift', 'axiom-blocks' ),
					min: 0,
					max: 24,
					default: 0,
				},
			],
		},
	],
};

/* CSS vars for the wrapper — consumed by style.scss (loaded in editor AND
 * frontend) so the preview matches the render exactly. Flat background color
 * (legacy `bgColor`/`bgColorHover`, bgType empty) is emitted first so the editor
 * matches the frontend's Background::value() fallback; gradient/image (bgType
 * set) override it via getBackgroundVars. Per-side border widths and per-corner
 * radii fall back to the legacy single `borderWidth`/`borderRadius` so old
 * blocks preview the same as the frontend's render.php fallback. */
export function getInfoBoxVars( attributes ) {
	const {
		gap,
		bgColor,
		bgColorHover,
		borderColor,
		borderWidth,
		borderStyle,
		borderRadius,
		borderTopWidth,
		borderRightWidth,
		borderBottomWidth,
		borderLeftWidth,
		radiusTopLeft,
		radiusTopRight,
		radiusBottomRight,
		radiusBottomLeft,
		boxShadowCustom,
		boxShadowCustomHover,
		hoverLift,
	} = attributes;
	const anyBw =
		borderTopWidth ||
		borderRightWidth ||
		borderBottomWidth ||
		borderLeftWidth ||
		borderWidth;
	const lift = parseInt( hoverLift, 10 ) || 0;
	return {
		'--ab-ibox-gap': gap || undefined,
		// Card background — flat color fallback, then gradient/image override.
		'--ab-ibox-bg': bgColor || undefined,
		'--ab-ibox-bg-h': bgColorHover || undefined,
		...getBackgroundVars( attributes, {
			prefix: 'card',
			varPrefix: '--ab-ibox',
			colorKey: 'bgColor',
		} ),
		...getBackgroundVars( attributes, {
			prefix: 'cardHover',
			varPrefix: '--ab-ibox-h',
			varName: '--ab-ibox-bg-h',
			colorKey: 'bgColorHover',
		} ),
		// Border — per-side widths fall back to the legacy single `borderWidth`.
		'--ab-ibox-bc': borderColor || undefined,
		'--ab-ibox-bs': anyBw ? borderStyle || 'solid' : borderStyle || undefined,
		'--ab-ibox-bw-top': borderTopWidth || borderWidth || undefined,
		'--ab-ibox-bw-right': borderRightWidth || borderWidth || undefined,
		'--ab-ibox-bw-bottom': borderBottomWidth || borderWidth || undefined,
		'--ab-ibox-bw-left': borderLeftWidth || borderWidth || undefined,
		// Radius — per-corner falls back to the legacy single `borderRadius`.
		'--ab-ibox-radius-tl': radiusTopLeft || borderRadius || undefined,
		'--ab-ibox-radius-tr': radiusTopRight || borderRadius || undefined,
		'--ab-ibox-radius-br': radiusBottomRight || borderRadius || undefined,
		'--ab-ibox-radius-bl': radiusBottomLeft || borderRadius || undefined,
		'--ab-ibox-radius': borderRadius || undefined,
		// Shadow (L4) — custom wins over the preset classes (the presets set the
		// same var at class level, so the inline value always beats them).
		'--ab-ibox-shadow': boxShadowCustom || undefined,
		'--ab-ibox-shadow-h': boxShadowCustomHover || undefined,
		// Hover lift — stored negative (upward); unset ⇒ no transform.
		'--ab-ibox-lift': lift > 0 ? `-${ lift }px` : undefined,
	};
}

function InfoBoxEdit( { attributes, setAttributes } ) {
	if ( ! isBlockEnabled( 'info-box' ) ) {
		return <DisabledBlockMessage blockName="Info Box" />;
	}

	const { direction, boxShadow } = attributes;

	const device = useDeviceType();
	const resolved = resolveResponsiveAttrs(
		attributes,
		[ 'contentAlign' ],
		device
	);
	const blockProps = useBlockProps( {
		className: [
			'ab-ibox',
			`ab-ibox--${ direction }`,
			`ab-ibox--align-${ resolved.contentAlign }`,
			`has-shadow-${ boxShadow }`,
		].join( ' ' ),
		style: {
			...getInfoBoxVars( attributes ),
			...useSpacingStyle( attributes ),
			'--ab-ibox-gap': responsiveVarValue( attributes, 'gap', device ),
			// Size (L5) — width/min-height as vars; max-width inline-only so an
			// unset value inherits the layout width (core's constrained-width
			// rule), not a static `none`. ResponsiveProps adds the media rules.
			'--ab-ibox-w': responsiveVarValue( attributes, 'cardWidth', device ),
			maxWidth:
				responsiveVarValue( attributes, 'cardMaxWidth', device ) ||
				undefined,
			'--ab-ibox-mh': responsiveVarValue(
				attributes,
				'cardMinHeight',
				device
			),
			alignItems: responsiveAlignValue(
				attributes,
				'contentAlign',
				device,
				ALIGN_FLEX_MAP
			),
			textAlign: responsiveAlignValue(
				attributes,
				'contentAlign',
				device
			),
		},
	} );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		template: TEMPLATE,
		templateLock: false,
	} );

	const leading = (
		<PanelBody title={ __( 'Layout', 'axiom-blocks' ) } initialOpen={ true }>
			<ABSelectControl
				label={ __( 'Direction', 'axiom-blocks' ) }
				value={ direction }
				options={ [
					{
						label: __( 'Stack (vertical)', 'axiom-blocks' ),
						value: 'column',
					},
					{
						label: __( 'Row (horizontal)', 'axiom-blocks' ),
						value: 'row',
					},
				] }
				onChange={ ( v ) => setAttributes( { direction: v } ) }
			/>
			<ABResponsive
				attributes={ attributes }
				setAttributes={ setAttributes }
				attrKey="gap"
			>
				{ ( { value, setValue, inherited } ) => (
					<ABRangeControl
						label={ __( 'Gap between items', 'axiom-blocks' ) }
						value={ fromPx(
							value !== '' && value != null ? value : inherited,
							16
						) }
						onChange={ ( v ) => setValue( toPx( v ) ) }
						min={ 0 }
						max={ 80 }
						step={ 1 }
						unit="px"
						help={ __(
							'Space between the icon, heading, text, and button.',
							'axiom-blocks'
						) }
					/>
				) }
			</ABResponsive>
			<ABResponsive
				attributes={ attributes }
				setAttributes={ setAttributes }
				attrKey="contentAlign"
			>
				{ ( { value, setValue, inherited } ) => (
					<ABSelectControl
						label={ __( 'Alignment', 'axiom-blocks' ) }
						value={
							value !== '' && value != null
								? value
								: inherited ?? 'center'
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
		</PanelBody>
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

export const InfoBox = {
	name: 'axiom-blocks/info-box',
	settings: {
		title: __( 'Info Box', 'axiom-blocks' ),
		description: __(
			'A styled box holding an icon, heading, text, and button as editable blocks — with full control over spacing between them.',
			'axiom-blocks'
		),
		icon: <BlockIcon slug="info-box" />,
		example: EXAMPLE,
		edit: InfoBoxEdit,
		save: () => <InnerBlocks.Content />,
	},
};
