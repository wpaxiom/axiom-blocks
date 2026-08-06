import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import {
	ABToggleControl,
	ABRangeControl,
	ABTextControl,
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
	responsiveAlignValue,
	responsiveVarValue,
	ALIGN_FLEX_MAP,
} from '../../components/responsiveProps';
import { IconControl } from '../../components/IconControl';
import { ICON_LIBRARY } from '../../components/iconLibrary';
import { useIconNode } from '../../components/useCustomIcons';
import { BlockIcon } from '../../blockIcons';
import {
	DisabledBlockMessage,
	isBlockEnabled,
} from '../../components/DisabledBlockMessage';

const ICON_BW = [
	'borderTopWidth',
	'borderRightWidth',
	'borderBottomWidth',
	'borderLeftWidth',
];
const SHAPE_RADIUS = [
	'shapeRadiusTopLeft',
	'shapeRadiusTopRight',
	'shapeRadiusBottomRight',
	'shapeRadiusBottomLeft',
];

/* Anatomy-as-declaration — the part-first (Option C) Styles UI is rendered from
 * this config by ABInspectorGroups/TargetSection. The block ships iconHoverColor
 * + bgHoverColor, so both parts are hover-ready (state pills), not P2. Every
 * binding maps to a shipped or additive attribute; save() is dynamic (render.php)
 * so no markup changes. */
const DESIGN = {
	block: 'icon',
	targets: [
		{
			noun: __( 'Icon', 'axiom-blocks' ),
			states: [ 'hover' ],
			align: {
				bind: 'iconAlign',
				label: __( 'Alignment', 'axiom-blocks' ),
				responsive: true,
			},
			colors: [
				{
					label: __( 'Color', 'axiom-blocks' ),
					bind: 'iconColor',
					stateBind: { hover: 'iconHoverColor' },
				},
			],
			ranges: [
				{
					bind: 'iconSize',
					label: __( 'Size', 'axiom-blocks' ),
					min: 12,
					max: 240,
					default: 48,
					responsive: true,
				},
			],
		},
		{
			noun: __( 'Shape', 'axiom-blocks' ),
			states: [ 'hover' ],
			background: {
				full: true,
				prefix: 'shapeBg',
				colorKey: 'bgColor',
				statePrefix: { hover: 'bgHover' },
				stateColorKey: { hover: 'bgHoverColor' },
			},
			border: {
				widthKeys: ICON_BW,
				legacyWidth: 'borderWidth',
				styleKey: 'borderStyle',
				colorKey: 'borderColor',
				max: 10,
			},
			radius: { keys: SHAPE_RADIUS, legacyRadius: 'shapeRadius', max: 60 },
			shadow: { bind: 'shapeShadow' },
			padding: { type: 'shapePadding' },
		},
	],
};

/* CSS vars for the wrapper — consumed by style.scss (loaded in editor AND
 * frontend) so the preview matches the render exactly. Flat background color
 * (legacy `bgColor`/`bgHoverColor`, bgType empty) is emitted first so the editor
 * matches the frontend's Background::value() fallback; gradient/image (bgType
 * set) override it via getBackgroundVars below. Per-side border widths and
 * per-corner radii fall back to the legacy single `borderWidth`/`shapeRadius` so
 * old blocks preview the same as the frontend's render.php fallback. */
export function getIconVars( attributes ) {
	const {
		iconSize,
		iconColor,
		iconHoverColor,
		rotation,
		bgColor,
		bgHoverColor,
		shapePadding,
		shapePaddingTop,
		shapePaddingRight,
		shapePaddingBottom,
		shapePaddingLeft,
		shapeRadius,
		shapeRadiusTopLeft,
		shapeRadiusTopRight,
		shapeRadiusBottomRight,
		shapeRadiusBottomLeft,
		borderColor,
		borderWidth,
		borderStyle,
		borderTopWidth,
		borderRightWidth,
		borderBottomWidth,
		borderLeftWidth,
		shapeShadow,
	} = attributes;
	const anyBw =
		borderTopWidth ||
		borderRightWidth ||
		borderBottomWidth ||
		borderLeftWidth ||
		borderWidth;
	return {
		'--ab-icon-size': iconSize || undefined,
		'--ab-icon-color': iconColor || undefined,
		'--ab-icon-color-h': iconHoverColor || undefined,
		'--ab-icon-rotate': rotation ? `${ rotation }deg` : undefined,
		// Shape padding — per-side (Styles ▸ Shape) with the legacy single-value
		// `shapePadding` kept for old blocks (style.scss falls back per side).
		'--ab-icon-pad': shapePadding || undefined,
		'--ab-icon-pad-top': shapePaddingTop || undefined,
		'--ab-icon-pad-right': shapePaddingRight || undefined,
		'--ab-icon-pad-bottom': shapePaddingBottom || undefined,
		'--ab-icon-pad-left': shapePaddingLeft || undefined,
		// Shape background — flat color fallback, then gradient/image override.
		'--ab-icon-bg': bgColor || undefined,
		'--ab-icon-bg-h': bgHoverColor || undefined,
		...getBackgroundVars( attributes, {
			prefix: 'shapeBg',
			varPrefix: '--ab-icon',
			colorKey: 'bgColor',
		} ),
		...getBackgroundVars( attributes, {
			prefix: 'bgHover',
			varPrefix: '--ab-icon-h',
			varName: '--ab-icon-bg-h',
			colorKey: 'bgHoverColor',
		} ),
		// Border — per-side widths fall back to the legacy single `borderWidth`.
		'--ab-icon-bc': borderColor || undefined,
		'--ab-icon-bs': anyBw ? borderStyle || 'solid' : borderStyle || undefined,
		'--ab-icon-bw-top': borderTopWidth || borderWidth || undefined,
		'--ab-icon-bw-right': borderRightWidth || borderWidth || undefined,
		'--ab-icon-bw-bottom': borderBottomWidth || borderWidth || undefined,
		'--ab-icon-bw-left': borderLeftWidth || borderWidth || undefined,
		// Radius — per-corner falls back to the legacy single `shapeRadius`.
		'--ab-icon-radius-tl': shapeRadiusTopLeft || shapeRadius || undefined,
		'--ab-icon-radius-tr': shapeRadiusTopRight || shapeRadius || undefined,
		'--ab-icon-radius-br': shapeRadiusBottomRight || shapeRadius || undefined,
		'--ab-icon-radius-bl': shapeRadiusBottomLeft || shapeRadius || undefined,
		'--ab-icon-radius': shapeRadius || undefined,
		'--ab-icon-shadow': shapeShadow || undefined,
	};
}

function IconEdit( { attributes, setAttributes } ) {
	if ( ! isBlockEnabled( 'icon' ) ) {
		return <DisabledBlockMessage blockName="Icon" />;
	}

	const {
		iconSlug,
		iconLabel,
		rotation,
		shape,
		url,
		opensInNewTab,
		relNoFollow,
		relSponsored,
	} = attributes;

	const device = useDeviceType();
	const resolved = resolveResponsiveAttrs(
		attributes,
		[ 'iconAlign' ],
		device
	);
	const resolveIcon = useIconNode();
	const blockProps = useBlockProps( {
		className: `ab-icon ab-icon--align-${ resolved.iconAlign }`,
		style: {
			...getIconVars( attributes ),
			...useSpacingStyle( attributes ),
			'--ab-icon-size': responsiveVarValue(
				attributes,
				'iconSize',
				device
			),
			justifyContent: responsiveAlignValue(
				attributes,
				'iconAlign',
				device,
				ALIGN_FLEX_MAP
			),
		},
	} );

	const glyph = (
		<span className="ab-icon__glyph">
			{ resolveIcon( iconSlug ) || ICON_LIBRARY.star }
		</span>
	);

	const leading = (
		<>
			<PanelBody
				title={ __( 'Icon', 'axiom-blocks' ) }
				initialOpen={ true }
			>
				<IconControl
					label={ __( 'Icon', 'axiom-blocks' ) }
					value={ iconSlug }
					onChange={ ( v ) => setAttributes( { iconSlug: v } ) }
					fallback="star"
				/>
				<ABTextControl
					label={ __( 'Accessible label', 'axiom-blocks' ) }
					value={ iconLabel }
					onChange={ ( v ) => setAttributes( { iconLabel: v } ) }
					help={ __(
						'Describes the icon for screen readers. Leave empty for a purely decorative icon.',
						'axiom-blocks'
					) }
				/>
				<ABRangeControl
					label={ __( 'Rotation', 'axiom-blocks' ) }
					value={ rotation || 0 }
					onChange={ ( v ) => setAttributes( { rotation: v } ) }
					min={ 0 }
					max={ 360 }
					step={ 1 }
					unit="°"
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Link', 'axiom-blocks' ) }
				initialOpen={ false }
			>
				<ABTextControl
					label={ __( 'URL', 'axiom-blocks' ) }
					value={ url }
					onChange={ ( v ) => setAttributes( { url: v } ) }
					placeholder="https://"
					type="url"
				/>
				{ url && (
					<>
						<ABToggleControl
							label={ __(
								'Open in new tab',
								'axiom-blocks'
							) }
							checked={ !! opensInNewTab }
							onChange={ ( v ) =>
								setAttributes( { opensInNewTab: v } )
							}
						/>
						<ABToggleControl
							label={ __( 'No-follow', 'axiom-blocks' ) }
							checked={ !! relNoFollow }
							onChange={ ( v ) =>
								setAttributes( { relNoFollow: v } )
							}
						/>
						<ABToggleControl
							label={ __( 'Sponsored', 'axiom-blocks' ) }
							checked={ !! relSponsored }
							onChange={ ( v ) =>
								setAttributes( { relSponsored: v } )
							}
						/>
					</>
				) }
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

			<div { ...blockProps }>
				<span className={ `ab-icon__box ab-icon--${ shape }` }>
					{ glyph }
				</span>
			</div>
		</>
	);
}

export const Icon = {
	name: 'axiom-blocks/icon',
	settings: {
		title: __( 'Icon', 'axiom-blocks' ),
		description: __(
			'Pick an icon from the library, then style its size, color, shape, and link.',
			'axiom-blocks'
		),
		icon: <BlockIcon slug="icon" />,
		edit: IconEdit,
		save: () => null,
	},
};
