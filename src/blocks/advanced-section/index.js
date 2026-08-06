import { __ } from '@wordpress/i18n';
import { useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import {
	useBlockProps,
	useInnerBlocksProps,
	InnerBlocks,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { ABRangeControl, ABSelectControl } from '../../components/ABControls';
import { useSpacingStyle } from '../../components/SpacingPanel';
import { ABResponsive } from '../../components/ABResponsive';
import { useDeviceType, resolveResponsive } from '../../components/responsive';
import { ABInspectorGroups } from '../../components/ABInspectorGroups';
import { getBackgroundVars } from '../../components/BackgroundControl';
import { responsiveVarValue } from '../../components/responsiveProps';
import { BlockIcon } from '../../blockIcons';
import {
	DisabledBlockMessage,
	isBlockEnabled,
} from '../../components/DisabledBlockMessage';

const SEC_BW_KEYS = [
	'borderTopWidth',
	'borderRightWidth',
	'borderBottomWidth',
	'borderLeftWidth',
];
const SEC_RADIUS_KEYS = [
	'radiusTopLeft',
	'radiusTopRight',
	'radiusBottomRight',
	'radiusBottomLeft',
];

const DESIGN = {
	block: 'sec',
	targets: [
		{
			// Wrapper part — hosts InnerBlocks; no typography (wrapper rule).
			noun: __( 'Container', 'axiom-blocks' ),
			background: { full: true },
			border: {
				widthKeys: SEC_BW_KEYS,
				legacyWidth: 'borderWidth',
				styleKey: 'borderStyle',
				colorKey: 'borderColor',
				max: 20,
			},
			radius: {
				keys: SEC_RADIUS_KEYS,
				legacyRadius: 'borderRadius',
				max: 64,
			},
			shadow: { bind: 'sectionShadow' },
			size: {
				panel: true,
				label: __( 'Size', 'axiom-blocks' ),
			},
		},
	],
};

/* ── Layout engine (L6) — additive; 'constrained' = the shipped behaviour ──── */
const LAYOUT_TYPES = [
	{ label: 'Constrained', value: 'constrained' },
	{ label: 'Flex', value: 'flex' },
	{ label: 'Grid', value: 'grid' },
];
const FLEX_DIRECTIONS = [
	{ label: 'Row', value: 'row' },
	{ label: 'Column', value: 'column' },
];
const FLEX_WRAPS = [
	{ label: 'Wrap', value: 'wrap' },
	{ label: 'No wrap', value: 'nowrap' },
];
const JUSTIFY_OPTIONS = [
	{ label: 'Start', value: 'flex-start' },
	{ label: 'Center', value: 'center' },
	{ label: 'End', value: 'flex-end' },
	{ label: 'Space between', value: 'space-between' },
	{ label: 'Space around', value: 'space-around' },
];
const ALIGN_OPTIONS = [
	{ label: 'Start', value: 'flex-start' },
	{ label: 'Center', value: 'center' },
	{ label: 'End', value: 'flex-end' },
	{ label: 'Stretch', value: 'stretch' },
];

function layoutClass( a ) {
	if ( a.layoutType === 'flex' ) {
		return 'axiom-blocks-section--layout-flex';
	}
	if ( a.layoutType === 'grid' ) {
		return 'axiom-blocks-section--layout-grid';
	}
	return '';
}

function buildLayoutStyle( a, device ) {
	// Resolve gap/columns for the active preview device (responsive 2-up).
	const gap = resolveResponsive( a, 'layoutGap', device ) || '0';
	if ( a.layoutType === 'flex' ) {
		return {
			'--ab-sec-fd': a.flexDirection || 'row',
			'--ab-sec-fw': a.flexWrap || 'wrap',
			'--ab-sec-jc': a.flexJustify || 'center',
			'--ab-sec-ai': a.flexAlign || 'center',
			'--ab-sec-gap': gap,
		};
	}
	if ( a.layoutType === 'grid' ) {
		const cols =
			resolveResponsive( a, 'gridColumns', device ) || a.gridColumns || 3;
		return {
			'--ab-sec-cols': cols,
			'--ab-sec-ai': a.flexAlign || 'stretch',
			'--ab-sec-gap': gap,
		};
	}
	return {};
}

/* ── Length helpers (number + unit) ─────────────────────────────────────── */
const LENGTH_UNITS = [
	{ label: 'px', value: 'px', max: 1200 },
	{ label: 'vh', value: 'vh', max: 100 },
	{ label: 'rem', value: 'rem', max: 60 },
];
const LENGTH_UNIT_BY_VALUE = Object.fromEntries(
	LENGTH_UNITS.map( ( u ) => [ u.value, u ] )
);

function parseLength( str ) {
	if ( ! str ) return { num: 0, unit: 'px' };
	const m = String( str )
		.trim()
		.match( /^(-?[\d.]+)\s*(px|vh|rem|em|%)?$/ );
	if ( ! m ) return { num: 0, unit: 'px' };
	return { num: parseFloat( m[ 1 ] ) || 0, unit: m[ 2 ] || 'px' };
}

const V_ALIGN_MAP = { top: 'flex-start', center: 'center', bottom: 'flex-end' };
const H_ALIGN_MAP = { left: 'flex-start', center: 'center', right: 'flex-end' };

/* ── CSS custom properties (editor) ──────────────────────────────────────── */
export function getSectionVars( attributes ) {
	const { borderStyle, borderWidth, borderColor, borderRadius, sectionShadow } =
		attributes;

	const vars = {};

	if ( borderStyle && borderStyle !== 'none' ) {
		vars[ '--ab-sec-bs' ] = borderStyle;
	}
	if ( borderColor ) {
		vars[ '--ab-sec-bc' ] = borderColor;
	}
	if ( borderWidth > 0 ) {
		vars[ '--ab-sec-bw' ] = `${ borderWidth }px`;
	}
	if ( borderRadius > 0 ) {
		vars[ '--ab-sec-radius' ] = `${ borderRadius }px`;
	}

	const bwFallback = borderWidth > 0 ? `${ borderWidth }px` : undefined;
	[ 'top', 'right', 'bottom', 'left' ].forEach( ( side ) => {
		const key =
			'border' + side.charAt( 0 ).toUpperCase() + side.slice( 1 ) + 'Width';
		const val = attributes[ key ] || bwFallback;
		if ( val ) {
			vars[ `--ab-sec-bw-${ side }` ] = val;
		}
	} );

	const rFallback = borderRadius > 0 ? `${ borderRadius }px` : undefined;
	[
		[ 'tl', 'radiusTopLeft' ],
		[ 'tr', 'radiusTopRight' ],
		[ 'br', 'radiusBottomRight' ],
		[ 'bl', 'radiusBottomLeft' ],
	].forEach( ( [ corner, key ] ) => {
		const val = attributes[ key ] || rFallback;
		if ( val ) {
			vars[ `--ab-sec-radius-${ corner }` ] = val;
		}
	} );

	if ( sectionShadow ) {
		vars[ '--ab-sec-shadow' ] = sectionShadow;
	}

	return vars;
}

/* ── Inline length control: range + unit segment ─────────────────────────── */
function LengthControl( { label, value, onChange, help, min = 0 } ) {
	const { num, unit } = parseLength( value );
	const cfg = LENGTH_UNIT_BY_VALUE[ unit ] || LENGTH_UNIT_BY_VALUE.px;
	const setNum = ( n ) => onChange( `${ n ?? 0 }${ unit }` );
	const setUnit = ( u ) => onChange( `${ num }${ u }` );
	return (
		<div className="ab-ctrl">
			{ label && <div className="ab-ctrl__label">{ label }</div> }
			<ABRangeControl
				value={ num }
				onChange={ setNum }
				min={ min }
				max={ cfg.max }
				step={ 1 }
				unit={ unit }
				units={ LENGTH_UNITS }
				onUnitChange={ setUnit }
			/>
			{ help && <p className="ab-ctrl__help">{ help }</p> }
		</div>
	);
}

function AdvancedSectionEdit( { attributes, setAttributes, clientId } ) {
	if ( ! isBlockEnabled( 'advanced-section' ) ) {
		return <DisabledBlockMessage blockName="Advanced Section" />;
	}

	const {
		minHeight,
		minHeightTablet,
		mobileMinHeight,
		verticalAlign,
		horizontalAlign,
		contentAlign,
		layoutType,
		flexDirection,
		flexWrap,
		flexJustify,
		flexAlign,
		gridColumns,
		layoutGap,
		layoutStackAt,
		bgType,
		bgImage,
		bgParallax,
		bgParallaxSpeed,
	} = attributes;

	// One-time migration: dynamic blocks never trigger `deprecated` (the saved
	// inner-blocks content always matches), so old bespoke background attrs are
	// converted here on mount. Gate on a real legacy value (not the 'color'
	// default that every new block carries) so new blocks aren't touched; runs
	// once per instance and clears the legacy attrs so it doesn't repeat.
	useEffect( () => {
		const hasLegacy =
			!! attributes.backgroundColor ||
			!! attributes.backgroundImage?.url ||
			( attributes.backgroundType === 'gradient' &&
				!! attributes.gradientFromColor ) ||
			!! attributes.overlayColor ||
			attributes.overlayType === 'gradient' ||
			!! attributes.enableParallax;
		if ( attributes.bgType || ! hasLegacy ) {
			return;
		}
		setAttributes( {
			...migrateLegacyBackground( attributes ),
			backgroundType: '',
			backgroundColor: '',
			backgroundImage: null,
			enableParallax: false,
			overlayColor: '',
			overlayType: 'color',
			overlayGradientFromColor: '#000000',
			overlayGradientToColor: 'rgba(0,0,0,0)',
			overlayBlendMode: 'normal',
		} );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	const hasInnerBlocks = useSelect(
		( select ) => {
			const { getBlock } = select( blockEditorStore );
			const block = getBlock( clientId );
			return block?.innerBlocks?.length > 0;
		},
		[ clientId ]
	);

	// Preview the active device's min-height (legacy mobileMinHeight folds in as
	// the Tablet override, mirroring the frontend cascade).
	const device = useDeviceType();

	// Vertical alignment is justify-content, which distributes leftover height.
	// With no min-height the section is exactly as tall as its content, so the
	// control silently does nothing — say so rather than let it look broken.
	const hasRoomToAlignVertically =
		!! minHeight && 'auto' !== minHeight && '0' !== parseFloat( minHeight );

	const resolvedMinHeight =
		resolveResponsive(
			mobileMinHeight && ! minHeightTablet
				? { ...attributes, minHeightTablet: mobileMinHeight }
				: attributes,
			'minHeight',
			device
		) || '400px';

	const isParallax = !! bgParallax && bgType === 'image' && bgImage?.url;

	// When parallax is on, the bg-image moves to a ::before pseudo (so it can
	// be transformed without disturbing inner blocks). Surface size/position/
	// repeat as CSS vars; the wrapper's own background-image is suppressed.
	const parallaxStyle = isParallax
		? {
				'--ab-bg-image': `url('${ bgImage.url }')`,
				'--ab-bg-size': attributes.bgImageSize || 'cover',
				'--ab-bg-position': attributes.bgImagePosition || 'center center',
				'--ab-bg-repeat': attributes.bgImageRepeat || 'no-repeat',
		  }
		: {};

	const blockProps = useBlockProps( {
		className: [
			'axiom-blocks-section',
			`axiom-blocks-section--${ bgType || 'none' }`,
			`is-h-${ horizontalAlign }`,
			`is-v-${ verticalAlign }`,
			layoutClass( attributes ),
			isParallax ? 'has-parallax' : '',
		]
			.filter( Boolean )
			.join( ' ' ),
		...( isParallax
			? {
					'data-parallax-speed': (
						( bgParallaxSpeed || 0 ) / 100
					).toFixed( 2 ),
			  }
			: {} ),
		style: {
			...getBackgroundVars( attributes, { varPrefix: '--ab-sec' } ),
			...parallaxStyle,
			...getSectionVars( attributes ),
			// Device-resolved so the canvas reflects the active preview device.
			'--axiom-blocks-section-min-h': resolvedMinHeight,
			minHeight: 'var(--axiom-blocks-section-min-h, 400px)',
			'--axiom-blocks-section-justify':
				V_ALIGN_MAP[ verticalAlign ] || 'center',
			'--axiom-blocks-section-align':
				H_ALIGN_MAP[ horizontalAlign ] || 'center',
			// align-items can only move a child narrower than the section, so
			// full-width children ignore it. contentAlign carries the same
			// choice through as text-align, which descendants inherit. Empty on
			// blocks saved before this shipped, so their rendering is unchanged.
			...( contentAlign ? { '--ab-sec-ta': contentAlign } : {} ),
			...buildLayoutStyle( attributes, device ),
			...useSpacingStyle( attributes ),
			'--ab-sec-w': responsiveVarValue( attributes, 'width', device ),
			'--ab-sec-mw': responsiveVarValue( attributes, 'maxWidth', device ),
		},
	} );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {} );
	const { children: innerBlocksChildren, ...wrapperProps } = innerBlocksProps;

	return (
		<>
			<ABInspectorGroups
				attributes={ attributes }
				setAttributes={ setAttributes }
				design={ DESIGN }
				leading={
					<PanelBody
						title={ __( 'Layout', 'axiom-blocks' ) }
						initialOpen={ true }
					>
						<ABSelectControl
							label={ __( 'Layout', 'axiom-blocks' ) }
							value={ layoutType || 'constrained' }
							options={ LAYOUT_TYPES }
							onChange={ ( v ) =>
								setAttributes( { layoutType: v } )
							}
							help={ __(
								'Constrained = content width (default). Flex / Grid arrange direct children.',
								'axiom-blocks'
							) }
						/>
						<ABResponsive
							attributes={ attributes }
							setAttributes={ setAttributes }
							attrKey="minHeight"
						>
							{ ( { value, setValue, inherited } ) => (
								<LengthControl
									label={ __( 'Min height', 'axiom-blocks' ) }
									value={ value === '' ? inherited : value }
									onChange={ setValue }
								/>
							) }
						</ABResponsive>

						{ ( layoutType || 'constrained' ) === 'constrained' && (
							<>
								<ABSelectControl
									help={
										hasRoomToAlignVertically
											? undefined
											: __(
													'Set a min height — with none, the section is exactly as tall as its content and there is no space to move it in.',
													'axiom-blocks'
											  )
									}
									label={ __( 'Vertical', 'axiom-blocks' ) }
									value={ verticalAlign }
									options={ [
										{
											label: __( 'Top', 'axiom-blocks' ),
											value: 'top',
										},
										{
											label: __( 'Center', 'axiom-blocks' ),
											value: 'center',
										},
										{
											label: __( 'Bottom', 'axiom-blocks' ),
											value: 'bottom',
										},
									] }
									onChange={ ( v ) =>
										setAttributes( { verticalAlign: v } )
									}
								/>
								<ABSelectControl
									label={ __( 'Horizontal', 'axiom-blocks' ) }
									value={ horizontalAlign }
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
										setAttributes( {
											horizontalAlign: v,
											contentAlign: v,
										} )
									}
								/>
							</>
						) }

						{ layoutType === 'flex' && (
							<>
								<ABSelectControl
									label={ __( 'Direction', 'axiom-blocks' ) }
									value={ flexDirection || 'row' }
									options={ FLEX_DIRECTIONS }
									onChange={ ( v ) =>
										setAttributes( { flexDirection: v } )
									}
								/>
								<ABSelectControl
									label={ __( 'Wrap', 'axiom-blocks' ) }
									value={ flexWrap || 'wrap' }
									options={ FLEX_WRAPS }
									onChange={ ( v ) =>
										setAttributes( { flexWrap: v } )
									}
								/>
								<ABSelectControl
									label={ __( 'Justify', 'axiom-blocks' ) }
									value={ flexJustify || 'center' }
									options={ JUSTIFY_OPTIONS }
									onChange={ ( v ) =>
										setAttributes( { flexJustify: v } )
									}
								/>
								<ABSelectControl
									label={ __( 'Align', 'axiom-blocks' ) }
									value={ flexAlign || 'center' }
									options={ ALIGN_OPTIONS }
									onChange={ ( v ) =>
										setAttributes( { flexAlign: v } )
									}
								/>
								<ABResponsive
									attributes={ attributes }
									setAttributes={ setAttributes }
									attrKey="layoutGap"
								>
									{ ( { value, setValue, inherited } ) => (
										<LengthControl
											label={ __( 'Gap', 'axiom-blocks' ) }
											value={
												value === '' ? inherited : value
											}
											onChange={ setValue }
										/>
									) }
								</ABResponsive>
							</>
						) }

						{ layoutType === 'grid' && (
							<>
								<ABResponsive
									attributes={ attributes }
									setAttributes={ setAttributes }
									attrKey="gridColumns"
								>
									{ ( { value, setValue, inherited } ) => (
										<ABRangeControl
											label={ __( 'Columns', 'axiom-blocks' ) }
											value={
												value === '' || value == null
													? inherited || 3
													: value
											}
											onChange={ ( v ) => setValue( v ?? 1 ) }
											min={ 1 }
											max={ 6 }
											step={ 1 }
											unit=""
										/>
									) }
								</ABResponsive>
								<ABSelectControl
									label={ __( 'Align items', 'axiom-blocks' ) }
									value={ flexAlign || 'stretch' }
									options={ ALIGN_OPTIONS }
									onChange={ ( v ) =>
										setAttributes( { flexAlign: v } )
									}
								/>
								<ABResponsive
									attributes={ attributes }
									setAttributes={ setAttributes }
									attrKey="layoutGap"
								>
									{ ( { value, setValue, inherited } ) => (
										<LengthControl
											label={ __( 'Gap', 'axiom-blocks' ) }
											value={
												value === '' ? inherited : value
											}
											onChange={ setValue }
										/>
									) }
								</ABResponsive>
							</>
						) }

						{ ( layoutType === 'flex' ||
							layoutType === 'grid' ) && (
							<ABRangeControl
								label={ __( 'Stack below', 'axiom-blocks' ) }
								help={ __(
									'Collapse to a single stacked column below this screen width. 0 = never.',
									'axiom-blocks'
								) }
								value={ layoutStackAt ?? 0 }
								onChange={ ( v ) =>
									setAttributes( { layoutStackAt: v ?? 0 } )
								}
								min={ 0 }
								max={ 1200 }
								step={ 10 }
								unit="px"
							/>
						) }
					</PanelBody>
				}
			/>

			<div { ...wrapperProps }>
				{ ! hasInnerBlocks && ! bgType && (
					<div className="axiom-blocks-section__placeholder">
						<p>
							{ __(
								'Click to start adding content to this section.',
								'axiom-blocks'
							) }
						</p>
					</div>
				) }
				{ innerBlocksChildren }
			</div>
		</>
	);
}

/* ── Legacy background migration (v1 bespoke attrs → BackgroundControl) ──────
 * Old posts stored backgroundType, backgroundColor, gradient*, overlay*, etc.
 * Maps them onto the shared bgType/bgColor/bgGradStops/bgOverlay* schema. Used
 * by the mount-time useEffect (dynamic blocks never trigger `deprecated`). */
function migrateLegacyBackground( a ) {
	const stops = [];
	if ( a.backgroundType === 'gradient' ) {
		stops.push( {
			color: a.gradientFromColor,
			position: a.gradientFromStop ?? 0,
		} );
		if ( a.gradientUseMidStop ) {
			stops.push( {
				color: a.gradientMidColor,
				position: a.gradientMidStop ?? 50,
			} );
		}
		stops.push( {
			color: a.gradientToColor,
			position: a.gradientToStop ?? 100,
		} );
	}

	return {
		bgType: a.backgroundType || '',
		bgColor: a.backgroundColor || '',
		bgGradType: a.gradientType || 'linear',
		bgGradAngle: a.gradientAngle ?? 90,
		bgGradStops: stops,
		bgImage: a.backgroundImage || null,
		bgImageSize: a.backgroundSize || 'cover',
		bgImagePosition: a.backgroundPosition || 'center center',
		bgImageRepeat: a.backgroundRepeat || 'no-repeat',
		bgImageAttachment: a.backgroundAttachment || 'scroll',
		bgParallax: !! a.enableParallax,
		bgParallaxSpeed: a.parallaxSpeed ?? 30,
		bgOverlay: a.overlayColor || '',
		bgOverlayType: a.overlayType || 'color',
		bgOverlayGradType: a.overlayGradientType || 'linear',
		bgOverlayGradAngle: a.overlayGradientAngle ?? 180,
		bgOverlayGradFrom: a.overlayGradientFromColor || '#000000',
		bgOverlayGradTo: a.overlayGradientToColor || 'rgba(0,0,0,0)',
		bgOverlayOpacity: a.overlayOpacity ?? 0,
		bgOverlayBlend: a.overlayBlendMode || 'normal',
	};
}

export const AdvancedSection = {
	name: 'axiom-blocks/advanced-section',
	settings: {
		title: __( 'Advanced Section', 'axiom-blocks' ),
		description: __(
			'Full-width container with rich backgrounds and layout.',
			'axiom-blocks'
		),
		icon: <BlockIcon slug="advanced-section" />,
		edit: AdvancedSectionEdit,
		save: () => <InnerBlocks.Content />,
	},
};
