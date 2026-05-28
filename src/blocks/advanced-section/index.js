import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
	InnerBlocks,
	MediaUpload,
	MediaUploadCheck,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { PanelBody, FocalPointPicker } from '@wordpress/components';
import {
	BSRangeControl,
	BSSelectControl,
	BSColorControl,
	BSToggleControl,
} from '../BSControls';
import { SpacingPanel, getSpacingStyle } from '../SpacingPanel';
import { BlockIcon } from '../../blockIcons';
import {
	DisabledBlockMessage,
	isBlockEnabled,
} from '../../components/DisabledBlockMessage';

const BACKGROUND_TYPES = [
	{ label: 'Color', value: 'color' },
	{ label: 'Gradient', value: 'gradient' },
	{ label: 'Image', value: 'image' },
];

const POSITIONS = [
	{ label: 'Top left', value: 'left top' },
	{ label: 'Top center', value: 'center top' },
	{ label: 'Top right', value: 'right top' },
	{ label: 'Center left', value: 'left center' },
	{ label: 'Center', value: 'center center' },
	{ label: 'Center right', value: 'right center' },
	{ label: 'Bottom left', value: 'left bottom' },
	{ label: 'Bottom center', value: 'center bottom' },
	{ label: 'Bottom right', value: 'right bottom' },
];

const BLEND_MODES = [
	{ label: 'Normal', value: 'normal' },
	{ label: 'Multiply', value: 'multiply' },
	{ label: 'Screen', value: 'screen' },
	{ label: 'Overlay', value: 'overlay' },
	{ label: 'Darken', value: 'darken' },
	{ label: 'Lighten', value: 'lighten' },
];

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

/* ── Background gradient builder (supports optional 3rd stop) ────────────── */
function buildGradientString( a ) {
	const stops = a.gradientUseMidStop
		? `${ a.gradientFromColor } ${ a.gradientFromStop ?? 0 }%, ${
				a.gradientMidColor
		  } ${ a.gradientMidStop ?? 50 }%, ${ a.gradientToColor } ${
				a.gradientToStop ?? 100
		  }%`
		: `${ a.gradientFromColor } ${ a.gradientFromStop ?? 0 }%, ${
				a.gradientToColor
		  } ${ a.gradientToStop ?? 100 }%`;
	return a.gradientType === 'radial'
		? `radial-gradient(circle, ${ stops })`
		: `linear-gradient(${ a.gradientAngle }deg, ${ stops })`;
}

function buildBackgroundStyle( a ) {
	switch ( a.backgroundType ) {
		case 'gradient':
			return { background: buildGradientString( a ) };
		case 'image':
			if ( ! a.backgroundImage?.url ) return {};
			return {
				backgroundImage: `url('${ a.backgroundImage.url }')`,
				backgroundSize: a.backgroundSize,
				backgroundPosition: a.backgroundPosition,
				backgroundRepeat: a.backgroundRepeat,
				backgroundAttachment: a.backgroundAttachment,
			};
		case 'color':
		default:
			return a.backgroundColor
				? { backgroundColor: a.backgroundColor }
				: {};
	}
}

function hasBackground( a ) {
	if ( a.backgroundType === 'gradient' ) {
		return true;
	}
	if ( a.backgroundType === 'image' && a.backgroundImage?.url ) {
		return true;
	}
	if ( a.backgroundType === 'color' && a.backgroundColor ) {
		return true;
	}
	return false;
}

/* ── Overlay background (color or gradient) ──────────────────────────────── */
function buildOverlayBackground( a ) {
	if ( a.overlayType === 'gradient' ) {
		const stops = `${ a.overlayGradientFromColor } 0%, ${ a.overlayGradientToColor } 100%`;
		return a.overlayGradientType === 'radial'
			? `radial-gradient(circle, ${ stops })`
			: `linear-gradient(${ a.overlayGradientAngle }deg, ${ stops })`;
	}
	return a.overlayColor || 'transparent';
}

/* ── Background position ↔ focal point ───────────────────────────────────── */
const POS_KEYWORDS = { left: 0, center: 0.5, right: 1, top: 0, bottom: 1 };

function positionToFocalPoint( pos ) {
	if ( ! pos ) return { x: 0.5, y: 0.5 };
	const parts = String( pos ).trim().split( /\s+/ );
	const [ a, b ] = parts.length === 2 ? parts : [ 'center', 'center' ];
	const toFraction = ( v ) => {
		if ( typeof v === 'string' && v.endsWith( '%' ) )
			return Math.max( 0, Math.min( 1, parseFloat( v ) / 100 ) );
		return POS_KEYWORDS[ v ] ?? 0.5;
	};
	return { x: toFraction( a ), y: toFraction( b ) };
}

function focalPointToPosition( { x, y } ) {
	const px = ( Math.max( 0, Math.min( 1, x ) ) * 100 ).toFixed( 1 );
	const py = ( Math.max( 0, Math.min( 1, y ) ) * 100 ).toFixed( 1 );
	return `${ px }% ${ py }%`;
}

const V_ALIGN_MAP = { top: 'flex-start', center: 'center', bottom: 'flex-end' };
const H_ALIGN_MAP = { left: 'flex-start', center: 'center', right: 'flex-end' };

/* ── Inline length control: range + unit segment ─────────────────────────── */
function LengthControl( { label, value, onChange, help, min = 0 } ) {
	const { num, unit } = parseLength( value );
	const cfg = LENGTH_UNIT_BY_VALUE[ unit ] || LENGTH_UNIT_BY_VALUE.px;
	const setNum = ( n ) => onChange( `${ n ?? 0 }${ unit }` );
	const setUnit = ( u ) => onChange( `${ num }${ u }` );
	return (
		<div className="ab-ctrl">
			{ label && <div className="ab-ctrl__label">{ label }</div> }
			<BSRangeControl
				value={ num }
				onChange={ setNum }
				min={ min }
				max={ cfg.max }
				step={ 1 }
				unit={ unit }
			/>
			<div
				className="ab-len-units"
				role="radiogroup"
				aria-label={ __( 'Unit', 'axiom-blocks' ) }
			>
				{ LENGTH_UNITS.map( ( u ) => (
					<button
						key={ u.value }
						type="button"
						role="radio"
						aria-checked={ u.value === unit }
						className={ `ab-len-units__btn${
							u.value === unit ? ' is-active' : ''
						}` }
						onClick={ () => setUnit( u.value ) }
					>
						{ u.label }
					</button>
				) ) }
			</div>
			{ help && <p className="ab-ctrl__help">{ help }</p> }
		</div>
	);
}

function AdvancedSectionEdit( { attributes, setAttributes, clientId } ) {
	// Check if this block is enabled
	// Show disabled message if block is not enabled
	if ( ! isBlockEnabled( 'advanced-section' ) ) {
		return <DisabledBlockMessage blockName="Advanced Section" />;
	}

	const {
		backgroundType,
		backgroundColor,
		gradientType,
		gradientAngle,
		gradientFromColor,
		gradientToColor,
		gradientUseMidStop,
		gradientMidColor,
		gradientFromStop,
		gradientMidStop,
		gradientToStop,
		backgroundImage,
		backgroundSize,
		backgroundPosition,
		backgroundRepeat,
		backgroundAttachment,
		enableParallax,
		parallaxSpeed,
		overlayType,
		overlayColor,
		overlayGradientType,
		overlayGradientAngle,
		overlayGradientFromColor,
		overlayGradientToColor,
		overlayOpacity,
		overlayBlendMode,
		minHeight,
		mobileMinHeight,
		verticalAlign,
		horizontalAlign,
		borderStyle,
		borderWidth,
		borderColor,
		borderRadius,
	} = attributes;

	const hasInnerBlocks = useSelect(
		( select ) => {
			const { getBlock } = select( blockEditorStore );
			const block = getBlock( clientId );
			return block?.innerBlocks?.length > 0;
		},
		[ clientId ]
	);

	const bgStyle = buildBackgroundStyle( attributes );
	const overlayBg = buildOverlayBackground( attributes );

	const borderInline =
		borderStyle && borderStyle !== 'none' && borderWidth > 0
			? {
					borderStyle,
					borderWidth: `${ borderWidth }px`,
					borderColor: borderColor || '#000000',
			  }
			: {};

	const isParallax =
		!! enableParallax && backgroundType === 'image' && backgroundImage?.url;

	// When parallax is on, the bg-image moves to a ::before pseudo (so it can
	// be transformed without disturbing inner blocks). Surface size/position/
	// repeat as CSS vars; the wrapper's own background-image is suppressed.
	const parallaxStyle = isParallax
		? {
				'--ab-bg-image': `url('${ backgroundImage.url }')`,
				'--ab-bg-size': backgroundSize || 'cover',
				'--ab-bg-position': backgroundPosition || 'center center',
				'--ab-bg-repeat': backgroundRepeat || 'no-repeat',
		  }
		: {};

	const blockProps = useBlockProps( {
		className: [
			'axiom-blocks-section',
			`axiom-blocks-section--${ backgroundType }`,
			`is-h-${ horizontalAlign }`,
			`is-v-${ verticalAlign }`,
			mobileMinHeight ? 'has-mobile-min-h' : '',
			isParallax ? 'has-parallax' : '',
		]
			.filter( Boolean )
			.join( ' ' ),
		...( isParallax
			? {
					'data-parallax-speed': (
						( parallaxSpeed || 0 ) / 100
					).toFixed( 2 ),
			  }
			: {} ),
		style: {
			...bgStyle,
			...parallaxStyle,
			...borderInline,
			borderRadius: borderRadius ? `${ borderRadius }px` : undefined,
			// Use a CSS variable so a media query can swap in the mobile value.
			'--axiom-blocks-section-min-h': minHeight || '400px',
			'--axiom-blocks-section-min-h-mobile':
				mobileMinHeight || minHeight || '400px',
			minHeight: 'var(--axiom-blocks-section-min-h, 400px)',
			'--axiom-blocks-section-justify':
				V_ALIGN_MAP[ verticalAlign ] || 'center',
			'--axiom-blocks-section-align':
				H_ALIGN_MAP[ horizontalAlign ] || 'center',
			'--axiom-blocks-section-overlay-bg': overlayBg,
			'--axiom-blocks-section-overlay-opacity':
				( overlayOpacity || 0 ) / 100,
			'--axiom-blocks-section-overlay-blend': overlayBlendMode,
			...getSpacingStyle( attributes ),
		},
	} );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {} );
	const { children: innerBlocksChildren, ...wrapperProps } = innerBlocksProps;

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Background', 'axiom-blocks' ) }
					initialOpen={ true }
				>
					<BSSelectControl
						label={ __( 'Type', 'axiom-blocks' ) }
						value={ backgroundType }
						options={ BACKGROUND_TYPES }
						onChange={ ( v ) =>
							setAttributes( { backgroundType: v } )
						}
					/>

					{ backgroundType === 'color' && (
						<BSColorControl
							label={ __( 'Color', 'axiom-blocks' ) }
							color={ backgroundColor || '#ffffff' }
							onChange={ ( c ) =>
								setAttributes( { backgroundColor: c } )
							}
						/>
					) }

					{ backgroundType === 'gradient' && (
						<>
							<BSSelectControl
								label={ __( 'Gradient type', 'axiom-blocks' ) }
								value={ gradientType }
								options={ [
									{
										label: __( 'Linear', 'axiom-blocks' ),
										value: 'linear',
									},
									{
										label: __( 'Radial', 'axiom-blocks' ),
										value: 'radial',
									},
								] }
								onChange={ ( v ) =>
									setAttributes( { gradientType: v } )
								}
							/>
							{ gradientType === 'linear' && (
								<BSRangeControl
									label={ __( 'Angle', 'axiom-blocks' ) }
									value={ gradientAngle }
									onChange={ ( v ) =>
										setAttributes( {
											gradientAngle: v ?? 0,
										} )
									}
									min={ 0 }
									max={ 360 }
									step={ 1 }
									unit="°"
								/>
							) }
							<BSColorControl
								label={ __( 'From', 'axiom-blocks' ) }
								color={ gradientFromColor }
								onChange={ ( c ) =>
									setAttributes( { gradientFromColor: c } )
								}
							/>
							<BSRangeControl
								label={ __( 'From stop', 'axiom-blocks' ) }
								value={ gradientFromStop ?? 0 }
								onChange={ ( v ) =>
									setAttributes( {
										gradientFromStop: v ?? 0,
									} )
								}
								min={ 0 }
								max={ 100 }
								step={ 1 }
								unit="%"
							/>
							<BSToggleControl
								label={ __( 'Use mid color', 'axiom-blocks' ) }
								checked={ !! gradientUseMidStop }
								onChange={ ( v ) =>
									setAttributes( { gradientUseMidStop: v } )
								}
							/>
							{ gradientUseMidStop && (
								<>
									<BSColorControl
										label={ __( 'Mid', 'axiom-blocks' ) }
										color={ gradientMidColor }
										onChange={ ( c ) =>
											setAttributes( {
												gradientMidColor: c,
											} )
										}
									/>
									<BSRangeControl
										label={ __(
											'Mid stop',
											'axiom-blocks'
										) }
										value={ gradientMidStop ?? 50 }
										onChange={ ( v ) =>
											setAttributes( {
												gradientMidStop: v ?? 50,
											} )
										}
										min={ 0 }
										max={ 100 }
										step={ 1 }
										unit="%"
									/>
								</>
							) }
							<BSColorControl
								label={ __( 'To', 'axiom-blocks' ) }
								color={ gradientToColor }
								onChange={ ( c ) =>
									setAttributes( { gradientToColor: c } )
								}
							/>
							<BSRangeControl
								label={ __( 'To stop', 'axiom-blocks' ) }
								value={ gradientToStop ?? 100 }
								onChange={ ( v ) =>
									setAttributes( {
										gradientToStop: v ?? 100,
									} )
								}
								min={ 0 }
								max={ 100 }
								step={ 1 }
								unit="%"
							/>
						</>
					) }

					{ backgroundType === 'image' && (
						<>
							<MediaUploadCheck>
								<MediaUpload
									onSelect={ ( media ) =>
										setAttributes( {
											backgroundImage: {
												id: media.id,
												url: media.url,
											},
										} )
									}
									allowedTypes={ [ 'image' ] }
									value={ backgroundImage?.id }
									render={ ( { open } ) => (
										<div className="axiom-blocks-media-control">
											{ backgroundImage?.url && (
												<img
													src={ backgroundImage.url }
													alt=""
													className="axiom-blocks-media-control__preview"
												/>
											) }
											<div className="ab-btn-row axiom-blocks-media-control__buttons">
												<button
													type="button"
													className="ab-btn ab-btn--secondary"
													onClick={ open }
												>
													{ backgroundImage
														? __(
																'Replace',
																'axiom-blocks'
														  )
														: __(
																'Select image',
																'axiom-blocks'
														  ) }
												</button>
												{ backgroundImage && (
													<button
														type="button"
														className="ab-btn ab-btn--danger"
														onClick={ () =>
															setAttributes( {
																backgroundImage:
																	null,
															} )
														}
													>
														{ __(
															'Remove',
															'axiom-blocks'
														) }
													</button>
												) }
											</div>
										</div>
									) }
								/>
							</MediaUploadCheck>
							{ backgroundImage && (
								<>
									<BSSelectControl
										label={ __( 'Size', 'axiom-blocks' ) }
										value={ backgroundSize }
										options={ [
											{
												label: __(
													'Cover',
													'axiom-blocks'
												),
												value: 'cover',
											},
											{
												label: __(
													'Contain',
													'axiom-blocks'
												),
												value: 'contain',
											},
											{
												label: __(
													'Auto',
													'axiom-blocks'
												),
												value: 'auto',
											},
										] }
										onChange={ ( v ) =>
											setAttributes( {
												backgroundSize: v,
											} )
										}
									/>
									<div className="ab-ctrl">
										<div className="ab-ctrl__label">
											{ __(
												'Focal point',
												'axiom-blocks'
											) }
										</div>
										<FocalPointPicker
											url={ backgroundImage.url }
											value={ positionToFocalPoint(
												backgroundPosition
											) }
											onChange={ ( fp ) =>
												setAttributes( {
													backgroundPosition:
														focalPointToPosition(
															fp
														),
												} )
											}
											__nextHasNoMarginBottom
										/>
										<BSSelectControl
											label={ __(
												'Or use a preset',
												'axiom-blocks'
											) }
											value={
												POSITIONS.find(
													( p ) =>
														p.value ===
														backgroundPosition
												)
													? backgroundPosition
													: ''
											}
											options={ [
												{
													label: __(
														'— Custom —',
														'axiom-blocks'
													),
													value: '',
												},
												...POSITIONS,
											] }
											onChange={ ( v ) =>
												v &&
												setAttributes( {
													backgroundPosition: v,
												} )
											}
										/>
									</div>
									<BSSelectControl
										label={ __( 'Repeat', 'axiom-blocks' ) }
										value={ backgroundRepeat }
										options={ [
											{
												label: __(
													'No repeat',
													'axiom-blocks'
												),
												value: 'no-repeat',
											},
											{
												label: __(
													'Repeat',
													'axiom-blocks'
												),
												value: 'repeat',
											},
											{
												label: __(
													'Repeat X',
													'axiom-blocks'
												),
												value: 'repeat-x',
											},
											{
												label: __(
													'Repeat Y',
													'axiom-blocks'
												),
												value: 'repeat-y',
											},
										] }
										onChange={ ( v ) =>
											setAttributes( {
												backgroundRepeat: v,
											} )
										}
									/>
									{ ! enableParallax && (
										<BSSelectControl
											label={ __(
												'Attachment',
												'axiom-blocks'
											) }
											value={ backgroundAttachment }
											options={ [
												{
													label: __(
														'Scroll',
														'axiom-blocks'
													),
													value: 'scroll',
												},
												{
													label: __(
														'Fixed',
														'axiom-blocks'
													),
													value: 'fixed',
												},
											] }
											onChange={ ( v ) =>
												setAttributes( {
													backgroundAttachment: v,
												} )
											}
										/>
									) }
									<BSToggleControl
										label={ __(
											'Parallax',
											'axiom-blocks'
										) }
										checked={ !! enableParallax }
										onChange={ ( v ) =>
											setAttributes( {
												enableParallax: v,
											} )
										}
										help={ __(
											'Smooth scroll-based parallax (frontend only).',
											'axiom-blocks'
										) }
									/>
									{ enableParallax && (
										<BSRangeControl
											label={ __(
												'Parallax speed',
												'axiom-blocks'
											) }
											value={ parallaxSpeed }
											onChange={ ( v ) =>
												setAttributes( {
													parallaxSpeed: Math.max(
														0,
														Math.min( 100, v ?? 0 )
													),
												} )
											}
											min={ 0 }
											max={ 100 }
											step={ 1 }
											unit="%"
										/>
									) }
								</>
							) }
						</>
					) }
				</PanelBody>

				<PanelBody
					title={ __( 'Overlay', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<BSSelectControl
						label={ __( 'Type', 'axiom-blocks' ) }
						value={ overlayType }
						options={ [
							{
								label: __( 'Color', 'axiom-blocks' ),
								value: 'color',
							},
							{
								label: __( 'Gradient', 'axiom-blocks' ),
								value: 'gradient',
							},
						] }
						onChange={ ( v ) =>
							setAttributes( { overlayType: v } )
						}
					/>

					{ overlayType === 'color' && (
						<BSColorControl
							label={ __( 'Color', 'axiom-blocks' ) }
							color={ overlayColor || '#000000' }
							onChange={ ( c ) =>
								setAttributes( { overlayColor: c } )
							}
						/>
					) }

					{ overlayType === 'gradient' && (
						<>
							<BSSelectControl
								label={ __( 'Gradient type', 'axiom-blocks' ) }
								value={ overlayGradientType }
								options={ [
									{
										label: __( 'Linear', 'axiom-blocks' ),
										value: 'linear',
									},
									{
										label: __( 'Radial', 'axiom-blocks' ),
										value: 'radial',
									},
								] }
								onChange={ ( v ) =>
									setAttributes( { overlayGradientType: v } )
								}
							/>
							{ overlayGradientType === 'linear' && (
								<BSRangeControl
									label={ __( 'Angle', 'axiom-blocks' ) }
									value={ overlayGradientAngle }
									onChange={ ( v ) =>
										setAttributes( {
											overlayGradientAngle: v ?? 0,
										} )
									}
									min={ 0 }
									max={ 360 }
									step={ 1 }
									unit="°"
								/>
							) }
							<BSColorControl
								label={ __( 'From', 'axiom-blocks' ) }
								color={ overlayGradientFromColor }
								onChange={ ( c ) =>
									setAttributes( {
										overlayGradientFromColor: c,
									} )
								}
							/>
							<BSColorControl
								label={ __( 'To', 'axiom-blocks' ) }
								color={ overlayGradientToColor }
								onChange={ ( c ) =>
									setAttributes( {
										overlayGradientToColor: c,
									} )
								}
							/>
						</>
					) }

					{ ( overlayOpacity > 0 ||
						overlayColor ||
						overlayType === 'gradient' ) && (
						<button
							type="button"
							className="ab-btn ab-btn--danger axiom-blocks-remove-overlay-btn"
							onClick={ () =>
								setAttributes( {
									overlayType: 'color',
									overlayColor: '',
									overlayOpacity: 0,
								} )
							}
						>
							{ __( 'Remove overlay', 'axiom-blocks' ) }
						</button>
					) }
					<BSRangeControl
						label={ __( 'Opacity', 'axiom-blocks' ) }
						value={ overlayOpacity }
						onChange={ ( v ) =>
							setAttributes( { overlayOpacity: v ?? 0 } )
						}
						min={ 0 }
						max={ 100 }
						step={ 1 }
						unit="%"
					/>
					<BSSelectControl
						label={ __( 'Blend mode', 'axiom-blocks' ) }
						value={ overlayBlendMode }
						options={ BLEND_MODES }
						onChange={ ( v ) =>
							setAttributes( { overlayBlendMode: v } )
						}
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Border', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<BSSelectControl
						label={ __( 'Style', 'axiom-blocks' ) }
						value={ borderStyle }
						options={ [
							{
								label: __( 'None', 'axiom-blocks' ),
								value: 'none',
							},
							{
								label: __( 'Solid', 'axiom-blocks' ),
								value: 'solid',
							},
							{
								label: __( 'Dashed', 'axiom-blocks' ),
								value: 'dashed',
							},
							{
								label: __( 'Dotted', 'axiom-blocks' ),
								value: 'dotted',
							},
							{
								label: __( 'Double', 'axiom-blocks' ),
								value: 'double',
							},
						] }
						onChange={ ( v ) =>
							setAttributes( { borderStyle: v } )
						}
					/>
					{ borderStyle && borderStyle !== 'none' && (
						<>
							<BSRangeControl
								label={ __( 'Width', 'axiom-blocks' ) }
								value={ borderWidth }
								onChange={ ( v ) =>
									setAttributes( { borderWidth: v ?? 0 } )
								}
								min={ 0 }
								max={ 20 }
								step={ 1 }
								unit="px"
							/>
							<BSColorControl
								label={ __( 'Color', 'axiom-blocks' ) }
								color={ borderColor || '#000000' }
								onChange={ ( c ) =>
									setAttributes( { borderColor: c } )
								}
							/>
						</>
					) }
					<BSRangeControl
						label={ __( 'Border radius', 'axiom-blocks' ) }
						value={ borderRadius }
						onChange={ ( v ) =>
							setAttributes( { borderRadius: v ?? 0 } )
						}
						min={ 0 }
						max={ 64 }
						step={ 1 }
						unit="px"
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Layout', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<LengthControl
						label={ __( 'Min height', 'axiom-blocks' ) }
						value={ minHeight }
						onChange={ ( v ) => setAttributes( { minHeight: v } ) }
					/>
					<LengthControl
						label={ __( 'Min height (mobile)', 'axiom-blocks' ) }
						value={ mobileMinHeight }
						onChange={ ( v ) =>
							setAttributes( { mobileMinHeight: v } )
						}
						help={ __(
							'Optional override below 768px.',
							'axiom-blocks'
						) }
					/>
					<BSSelectControl
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
					<BSSelectControl
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
							setAttributes( { horizontalAlign: v } )
						}
					/>
				</PanelBody>

				<SpacingPanel
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>
			</InspectorControls>

			<div { ...wrapperProps }>
				{ ! hasInnerBlocks && ! hasBackground( attributes ) && (
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
