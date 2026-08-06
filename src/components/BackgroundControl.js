/**
 * BackgroundControl — shared design-layer background control: Color / Gradient
 * (N-stop) / Image + overlay. Self-contained — renders its own ABEditPopover
 * trigger (summary row) and popover body, so a part just drops it in.
 *
 * Attribute keys derive from an element `prefix` ('' → bgType…, 'card' →
 * cardBgType…). The block emits one `background` shorthand into a CSS var
 * (`${varPrefix}-bg`) consumed by style.scss; an unset type produces zero
 * output. Overlay + gradient colors must be hex (8-digit for alpha) —
 * safecss_filter_attr strips rgba()/hsl() from inline values.
 *
 * Advanced Section keeps its own bespoke background attrs; this is the shared
 * control every other block adopts (additive, back-compat).
 */

import { __ } from '@wordpress/i18n';
import { MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import { FocalPointPicker } from '@wordpress/components';
import {
	ABRangeControl,
	ABSelectControl,
	ABColorControl,
	ABToggleControl,
} from './ABControls';
import { ABEditPopover } from './ABEditPopover';
import { StateTabs } from './StateTabs';

const cap = ( s ) => s[ 0 ].toUpperCase() + s.slice( 1 );
const camel = ( prefix, key ) =>
	prefix ? `${ prefix }${ cap( key ) }` : key;

const TYPE_OPTIONS = [
	{ label: __( 'Color', 'axiom-blocks' ), value: 'color' },
	{ label: __( 'Gradient', 'axiom-blocks' ), value: 'gradient' },
	{ label: __( 'Image', 'axiom-blocks' ), value: 'image' },
];
const GRAD_TYPE_OPTIONS = [
	{ label: __( 'Linear', 'axiom-blocks' ), value: 'linear' },
	{ label: __( 'Radial', 'axiom-blocks' ), value: 'radial' },
];
const POSITION_OPTIONS = [
	{ label: __( 'Center', 'axiom-blocks' ), value: 'center center' },
	{ label: __( 'Top', 'axiom-blocks' ), value: 'center top' },
	{ label: __( 'Bottom', 'axiom-blocks' ), value: 'center bottom' },
	{ label: __( 'Left', 'axiom-blocks' ), value: 'left center' },
	{ label: __( 'Right', 'axiom-blocks' ), value: 'right center' },
	{ label: __( 'Top left', 'axiom-blocks' ), value: 'left top' },
	{ label: __( 'Top right', 'axiom-blocks' ), value: 'right top' },
	{ label: __( 'Bottom left', 'axiom-blocks' ), value: 'left bottom' },
	{ label: __( 'Bottom right', 'axiom-blocks' ), value: 'right bottom' },
];
const SIZE_OPTIONS = [
	{ label: __( 'Cover', 'axiom-blocks' ), value: 'cover' },
	{ label: __( 'Contain', 'axiom-blocks' ), value: 'contain' },
	{ label: __( 'Auto', 'axiom-blocks' ), value: 'auto' },
];
const REPEAT_OPTIONS = [
	{ label: __( 'No repeat', 'axiom-blocks' ), value: 'no-repeat' },
	{ label: __( 'Repeat', 'axiom-blocks' ), value: 'repeat' },
	{ label: __( 'Repeat X', 'axiom-blocks' ), value: 'repeat-x' },
	{ label: __( 'Repeat Y', 'axiom-blocks' ), value: 'repeat-y' },
];
const ATTACHMENT_OPTIONS = [
	{ label: __( 'Scroll', 'axiom-blocks' ), value: 'scroll' },
	{ label: __( 'Fixed', 'axiom-blocks' ), value: 'fixed' },
];
const OVERLAY_TYPE_OPTIONS = [
	{ label: __( 'Color', 'axiom-blocks' ), value: 'color' },
	{ label: __( 'Gradient', 'axiom-blocks' ), value: 'gradient' },
];
const BLEND_MODES = [
	{ label: __( 'Normal', 'axiom-blocks' ), value: 'normal' },
	{ label: __( 'Multiply', 'axiom-blocks' ), value: 'multiply' },
	{ label: __( 'Screen', 'axiom-blocks' ), value: 'screen' },
	{ label: __( 'Overlay', 'axiom-blocks' ), value: 'overlay' },
	{ label: __( 'Darken', 'axiom-blocks' ), value: 'darken' },
	{ label: __( 'Lighten', 'axiom-blocks' ), value: 'lighten' },
];

/* ── Background position ↔ focal point (ported from advanced-section) ────────
 * The focal picker writes a "X% Y%" string into the SAME `bgImagePosition`
 * attr the preset select reads. Any non-preset value (e.g. "37.5% 62%") makes
 * the preset select fall back to "— Custom —"; picking a preset writes the
 * preset string back. One attribute, two-way. */
const POS_KEYWORDS = { left: 0, center: 0.5, right: 1, top: 0, bottom: 1 };

function positionToFocalPoint( pos ) {
	if ( ! pos ) {
		return { x: 0.5, y: 0.5 };
	}
	const parts = String( pos ).trim().split( /\s+/ );
	const [ a, b ] = parts.length === 2 ? parts : [ 'center', 'center' ];
	const toFraction = ( v ) => {
		if ( typeof v === 'string' && v.endsWith( '%' ) ) {
			return Math.max( 0, Math.min( 1, parseFloat( v ) / 100 ) );
		}
		return POS_KEYWORDS[ v ] ?? 0.5;
	};
	return { x: toFraction( a ), y: toFraction( b ) };
}

function focalPointToPosition( { x, y } ) {
	const px = ( Math.max( 0, Math.min( 1, x ) ) * 100 ).toFixed( 1 );
	const py = ( Math.max( 0, Math.min( 1, y ) ) * 100 ).toFixed( 1 );
	return `${ px }% ${ py }%`;
}

/* Overlay background string (color or gradient), mirroring advanced-section.
 * `get` is a value-getter: get( 'bgOverlayType' ) → the attr value. */
function buildOverlayBackground( get ) {
	if ( ( get( 'bgOverlayType' ) || 'color' ) === 'gradient' ) {
		const from = get( 'bgOverlayGradFrom' ) || '#000000';
		const to = get( 'bgOverlayGradTo' ) || 'rgba(0,0,0,0)';
		const stops = `${ from } 0%, ${ to } 100%`;
		return ( get( 'bgOverlayGradType' ) || 'linear' ) === 'radial'
			? `radial-gradient(circle, ${ stops })`
			: `linear-gradient(${ get( 'bgOverlayGradAngle' ) ?? 180 }deg, ${ stops })`;
	}
	return get( 'bgOverlay' ) || '';
}

const DEFAULT_STOPS = [
	{ color: '#7c3aed', position: 0 },
	{ color: '#f5b4ff', position: 100 },
];

const BackgroundIcon = () => (
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.6"
		strokeLinecap="round"
		strokeLinejoin="round"
		style={ { width: 20, height: 20, minWidth: 20, flexShrink: 0 } }
	>
		<path d="M19 11l-7 7-4-4 7-7z" />
		<path d="M14 6l4 4" />
		<path d="M5 21c-1-1-1-3 0-4" />
	</svg>
);

/* Shared attribute definitions — spread into a block's attributes object. */
export function backgroundAttrs( prefix = '' ) {
	const k = ( key ) => camel( prefix, key );
	return {
		[ k( 'bgType' ) ]: { type: 'string', default: '' },
		[ k( 'bgColor' ) ]: { type: 'string', default: '' },
		[ k( 'bgGradType' ) ]: { type: 'string', default: 'linear' },
		[ k( 'bgGradAngle' ) ]: { type: 'number', default: 90 },
		[ k( 'bgGradStops' ) ]: { type: 'array', default: [] },
		[ k( 'bgImage' ) ]: { type: 'object', default: null },
		[ k( 'bgImageSize' ) ]: { type: 'string', default: 'cover' },
		[ k( 'bgImagePosition' ) ]: {
			type: 'string',
			default: 'center center',
		},
		[ k( 'bgImageRepeat' ) ]: { type: 'string', default: 'no-repeat' },
		[ k( 'bgImageAttachment' ) ]: { type: 'string', default: 'scroll' },
		[ k( 'bgParallax' ) ]: { type: 'boolean', default: false },
		[ k( 'bgParallaxSpeed' ) ]: { type: 'number', default: 30 },
		// Overlay — a separate layer (color or gradient) with opacity + blend.
		// `bgOverlay` stays the color attr (back-compat with the flat overlay);
		// the rest are additive and ignored unless a block opts into the layer.
		[ k( 'bgOverlay' ) ]: { type: 'string', default: '' },
		[ k( 'bgOverlayType' ) ]: { type: 'string', default: 'color' },
		[ k( 'bgOverlayGradType' ) ]: { type: 'string', default: 'linear' },
		[ k( 'bgOverlayGradAngle' ) ]: { type: 'number', default: 180 },
		[ k( 'bgOverlayGradFrom' ) ]: { type: 'string', default: '#000000' },
		[ k( 'bgOverlayGradTo' ) ]: { type: 'string', default: 'rgba(0,0,0,0)' },
		[ k( 'bgOverlayOpacity' ) ]: { type: 'number', default: 0 },
		[ k( 'bgOverlayBlend' ) ]: { type: 'string', default: 'normal' },
	};
}

function buildGradient( type, angle, stops ) {
	const list = ( stops || [] ).filter( ( s ) => s && s.color );
	if ( list.length < 2 ) {
		return '';
	}
	const body = list
		.map( ( s ) => `${ s.color } ${ s.position ?? 0 }%` )
		.join( ', ' );
	return type === 'radial'
		? `radial-gradient(circle, ${ body })`
		: `linear-gradient(${ angle ?? 90 }deg, ${ body })`;
}

/* CSS-var object for the block wrapper. Unset type ⇒ no var ⇒ zero output.
 * `colorKey` overrides the color attribute (default `${prefix}bgColor`) so a
 * block can point the color at a legacy attr; `varName` overrides the emitted
 * var name (default `${varPrefix}-bg`). */
export function getBackgroundVars( attrs, { prefix = '', varPrefix, varName, colorKey } ) {
	const g = ( key ) => attrs[ camel( prefix, key ) ];
	const type = g( 'bgType' );
	const ck = colorKey || camel( prefix, 'bgColor' );
	// Overlay decision: the rich layer (separate ::after) is active when a block
	// sets an opacity or a gradient overlay; otherwise a flat color overlay
	// stays baked into the shorthand (back-compat with accordion / advanced-button).
	const overlayType = g( 'bgOverlayType' ) || 'color';
	const overlayOpacity = g( 'bgOverlayOpacity' ) ?? 0;
	const useLayer = overlayOpacity > 0 || overlayType === 'gradient';
	let bg;

	if ( type === 'color' ) {
		bg = attrs[ ck ] || undefined;
	} else if ( type === 'gradient' ) {
		bg =
			buildGradient(
				g( 'bgGradType' ),
				g( 'bgGradAngle' ),
				g( 'bgGradStops' )
			) || undefined;
	} else if ( type === 'image' && g( 'bgImage' )?.url ) {
		const layer = `url('${ g( 'bgImage' ).url }') ${
			g( 'bgImagePosition' ) || 'center center'
		} / ${ g( 'bgImageSize' ) || 'cover' } ${
			g( 'bgImageRepeat' ) || 'no-repeat'
		}`;
		// Back-compat: a flat color overlay stays baked into the shorthand
		// (how accordion / advanced-button render it today) unless the richer
		// layer below (gradient / opacity / blend) is active.
		const overlay = g( 'bgOverlay' );
		bg = overlay && ! useLayer
			? `linear-gradient(${ overlay }, ${ overlay }), ${ layer }`
			: layer;
	}

	const vars = bg ? { [ varName || `${ varPrefix }-bg` ]: bg } : {};

	// ── Additive image options (only for image backgrounds) ──
	if ( type === 'image' && g( 'bgImage' )?.url ) {
		const attachment = g( 'bgImageAttachment' );
		if ( attachment && attachment !== 'scroll' ) {
			vars[ `${ varPrefix }-attach` ] = attachment;
		}
		if ( g( 'bgParallax' ) ) {
			vars[ `${ varPrefix }-parallax` ] = '1';
			vars[ `${ varPrefix }-parallax-speed` ] = String(
				Math.max( 0, Math.min( 100, g( 'bgParallaxSpeed' ) ?? 30 ) ) / 100
			);
		}
	}

	// ── Additive overlay layer (separate ::after, any background type) ──
	// Emitted only when a block opts in (opacity > 0 or a gradient overlay).
	// The flat color overlay baked into the shorthand above stays untouched.
	if ( useLayer ) {
		const overlayBg = buildOverlayBackground( g );
		if ( overlayBg ) {
			vars[ `${ varPrefix }-overlay-bg` ] = overlayBg;
			vars[ `${ varPrefix }-overlay-opacity` ] = String(
				overlayOpacity / 100
			);
			const blend = g( 'bgOverlayBlend' );
			if ( blend && blend !== 'normal' ) {
				vars[ `${ varPrefix }-overlay-blend` ] = blend;
			}
		}
	}

	return vars;
}

function summarize( type, attrs, k, colorAttr ) {
	if ( type === 'color' ) {
		return attrs[ colorAttr ] || __( 'Color', 'axiom-blocks' );
	}
	if ( type === 'gradient' ) {
		const n = ( attrs[ k( 'bgGradStops' ) ] || [] ).length;
		return `${ __( 'Gradient', 'axiom-blocks' ) } · ${ n } ${ __(
			'stops',
			'axiom-blocks'
		) }`;
	}
	if ( type === 'image' ) {
		return attrs[ k( 'bgImage' ) ]?.url
			? __( 'Image', 'axiom-blocks' )
			: __( 'Image (none)', 'axiom-blocks' );
	}
	return '';
}

export function BackgroundControl( {
	label = __( 'Background', 'axiom-blocks' ),
	attrs,
	onChange,
	prefix = '',
	overlay = true,
	image = true,
	colorKey,
} ) {
	const k = ( key ) => camel( prefix, key );
	const colorAttr = colorKey || k( 'bgColor' );
	const set = ( key, value ) => onChange( { [ k( key ) ]: value } );
	const type = attrs[ k( 'bgType' ) ];
	const stops = attrs[ k( 'bgGradStops' ) ] || [];
	const gradType = attrs[ k( 'bgGradType' ) ] || 'linear';

	// `image: false` trims the type tabs to Color/Gradient (e.g. a progress-bar
	// fill, where an image background is meaningless).
	const typeOptions = image
		? TYPE_OPTIONS
		: TYPE_OPTIONS.filter( ( o ) => o.value !== 'image' );

	const changeType = ( next ) => {
		const update = { [ k( 'bgType' ) ]: next };
		if ( next === 'gradient' && stops.length < 2 ) {
			update[ k( 'bgGradStops' ) ] = DEFAULT_STOPS;
		}
		onChange( update );
	};

	const setStop = ( index, patch ) => {
		const next = stops.map( ( s, i ) =>
			i === index ? { ...s, ...patch } : s
		);
		set( 'bgGradStops', next );
	};
	const addStop = () =>
		set( 'bgGradStops', [ ...stops, { color: '#000000', position: 50 } ] );
	const removeStop = ( index ) =>
		set(
			'bgGradStops',
			stops.filter( ( _, i ) => i !== index )
		);

	const reset = () =>
		onChange( {
			[ k( 'bgType' ) ]: '',
			[ colorAttr ]: '',
			[ k( 'bgGradStops' ) ]: [],
			[ k( 'bgImage' ) ]: null,
			[ k( 'bgOverlay' ) ]: '',
			[ k( 'bgOverlayType' ) ]: 'color',
			[ k( 'bgOverlayOpacity' ) ]: 0,
			[ k( 'bgOverlayBlend' ) ]: 'normal',
		} );

	const previewGradient = buildGradient(
		gradType,
		attrs[ k( 'bgGradAngle' ) ],
		stops
	);

	return (
		<ABEditPopover
			label={ label }
			title={ label }
			glyph={ <BackgroundIcon /> }
			summary={ summarize( type, attrs, k, colorAttr ) }
			isDefault={ ! type }
			onReset={ type ? reset : undefined }
		>
			<StateTabs
				options={ typeOptions }
				value={ type || 'color' }
				onChange={ changeType }
			/>

			{ ( ! type || type === 'color' ) && (
				<ABColorControl
					label={ __( 'Color', 'axiom-blocks' ) }
					color={ attrs[ colorAttr ] || '' }
					onChange={ ( v ) => onChange( { [ colorAttr ]: v || '' } ) }
				/>
			) }

			{ type === 'gradient' && (
				<>
					{ previewGradient && (
						<div
							className="ab-bg-preview"
							style={ { background: previewGradient } }
						/>
					) }
					<ABSelectControl
						label={ __( 'Type', 'axiom-blocks' ) }
						value={ gradType }
						onChange={ ( v ) => set( 'bgGradType', v ) }
						options={ GRAD_TYPE_OPTIONS }
					/>
					{ gradType === 'linear' && (
						<ABRangeControl
							label={ __( 'Angle', 'axiom-blocks' ) }
							value={ attrs[ k( 'bgGradAngle' ) ] ?? 90 }
							onChange={ ( v ) => set( 'bgGradAngle', v ) }
							min={ 0 }
							max={ 360 }
							unit="deg"
						/>
					) }
					{ stops.map( ( stop, i ) => (
						<div className="ab-bg-stop" key={ i }>
							<ABColorControl
								label={ `${ __( 'Stop', 'axiom-blocks' ) } ${
									i + 1
								}` }
								color={ stop.color || '' }
								onChange={ ( v ) =>
									setStop( i, { color: v || '' } )
								}
							/>
							<ABRangeControl
								label={ __( 'Position', 'axiom-blocks' ) }
								value={ stop.position ?? 0 }
								onChange={ ( v ) =>
									setStop( i, { position: v } )
								}
								min={ 0 }
								max={ 100 }
								unit="%"
							/>
							{ stops.length > 2 && (
								<div className="ab-btn-row">
									<button
										type="button"
										className="ab-btn ab-btn--danger"
										onClick={ () => removeStop( i ) }
									>
										{ __( 'Remove stop', 'axiom-blocks' ) }
									</button>
								</div>
							) }
						</div>
					) ) }
					<button
						type="button"
						className="ab-btn ab-btn--secondary"
						onClick={ addStop }
					>
						{ __( '+ Add stop', 'axiom-blocks' ) }
					</button>
				</>
			) }

			{ image && type === 'image' && (
				<>
					<MediaUploadCheck>
						<MediaUpload
							allowedTypes={ [ 'image' ] }
							value={ attrs[ k( 'bgImage' ) ]?.id }
							onSelect={ ( media ) =>
								set( 'bgImage', {
									id: media.id,
									url: media.url,
								} )
							}
							render={ ( { open } ) => (
								<div className="ab-btn-row">
									<button
										type="button"
										className="ab-btn ab-btn--secondary"
										onClick={ open }
									>
										{ attrs[ k( 'bgImage' ) ]?.url
											? __(
													'Replace image',
													'axiom-blocks'
											  )
											: __(
													'Select image',
													'axiom-blocks'
											  ) }
									</button>
									{ attrs[ k( 'bgImage' ) ]?.url && (
										<button
											type="button"
											className="ab-btn ab-btn--danger"
											onClick={ () =>
												set( 'bgImage', null )
											}
										>
											{ __( 'Remove', 'axiom-blocks' ) }
										</button>
									) }
								</div>
							) }
						/>
					</MediaUploadCheck>
					{ attrs[ k( 'bgImage' ) ]?.url && (
						<>
							<ABSelectControl
								label={ __( 'Size', 'axiom-blocks' ) }
								value={ attrs[ k( 'bgImageSize' ) ] || 'cover' }
								onChange={ ( v ) => set( 'bgImageSize', v ) }
								options={ SIZE_OPTIONS }
							/>
							<div className="ab-ctrl ab-bg-focal">
								<div className="ab-bg-focal__pick">
									<div className="ab-ctrl__label">
										{ __( 'Focal point', 'axiom-blocks' ) }
									</div>
									<FocalPointPicker
										url={ attrs[ k( 'bgImage' ) ].url }
										value={ positionToFocalPoint(
											attrs[ k( 'bgImagePosition' ) ]
										) }
										onChange={ ( fp ) =>
											set(
												'bgImagePosition',
												focalPointToPosition( fp )
											)
										}
										__nextHasNoMarginBottom
									/>
								</div>
								<ABRangeControl
									label={ __( 'Left', 'axiom-blocks' ) }
									value={ Math.round(
										positionToFocalPoint(
											attrs[ k( 'bgImagePosition' ) ]
										).x * 100
									) }
									onChange={ ( v ) => {
										const cur = positionToFocalPoint(
											attrs[ k( 'bgImagePosition' ) ]
										);
										set(
											'bgImagePosition',
											focalPointToPosition( {
												x: ( v ?? 50 ) / 100,
												y: cur.y,
											} )
										);
									} }
									min={ 0 }
									max={ 100 }
									step={ 1 }
									unit="%"
								/>
								<ABRangeControl
									label={ __( 'Top', 'axiom-blocks' ) }
									value={ Math.round(
										positionToFocalPoint(
											attrs[ k( 'bgImagePosition' ) ]
										).y * 100
									) }
									onChange={ ( v ) => {
										const cur = positionToFocalPoint(
											attrs[ k( 'bgImagePosition' ) ]
										);
										set(
											'bgImagePosition',
											focalPointToPosition( {
												x: cur.x,
												y: ( v ?? 50 ) / 100,
											} )
										);
									} }
									min={ 0 }
									max={ 100 }
									step={ 1 }
									unit="%"
								/>
								<ABSelectControl
									label={ __(
										'Or use a preset',
										'axiom-blocks'
									) }
									value={
										POSITION_OPTIONS.find(
											( p ) =>
												p.value ===
												attrs[ k( 'bgImagePosition' ) ]
										)
											? attrs[ k( 'bgImagePosition' ) ]
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
										...POSITION_OPTIONS,
									] }
									onChange={ ( v ) =>
										v && set( 'bgImagePosition', v )
									}
								/>
							</div>
							<ABSelectControl
								label={ __( 'Repeat', 'axiom-blocks' ) }
								value={
									attrs[ k( 'bgImageRepeat' ) ] || 'no-repeat'
								}
								onChange={ ( v ) => set( 'bgImageRepeat', v ) }
								options={ REPEAT_OPTIONS }
							/>
							{ ! attrs[ k( 'bgParallax' ) ] && (
								<ABSelectControl
									label={ __( 'Attachment', 'axiom-blocks' ) }
									value={
										attrs[ k( 'bgImageAttachment' ) ] ||
										'scroll'
									}
									onChange={ ( v ) =>
										set( 'bgImageAttachment', v )
									}
									options={ ATTACHMENT_OPTIONS }
								/>
							) }
							<ABToggleControl
								label={ __( 'Parallax', 'axiom-blocks' ) }
								checked={ !! attrs[ k( 'bgParallax' ) ] }
								onChange={ ( v ) => set( 'bgParallax', v ) }
								help={ __(
									'Smooth scroll-based parallax (frontend only).',
									'axiom-blocks'
								) }
							/>
							{ attrs[ k( 'bgParallax' ) ] && (
								<ABRangeControl
									label={ __(
										'Parallax speed',
										'axiom-blocks'
									) }
									value={ attrs[ k( 'bgParallaxSpeed' ) ] ?? 30 }
									onChange={ ( v ) =>
										set(
											'bgParallaxSpeed',
											Math.max(
												0,
												Math.min( 100, v ?? 0 )
											)
										)
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

			{ overlay && (
				<>
					<ABSelectControl
						label={ __( 'Overlay type', 'axiom-blocks' ) }
						value={ attrs[ k( 'bgOverlayType' ) ] || 'color' }
						onChange={ ( v ) => set( 'bgOverlayType', v ) }
						options={ OVERLAY_TYPE_OPTIONS }
					/>
					{ ( attrs[ k( 'bgOverlayType' ) ] || 'color' ) ===
						'color' && (
						<ABColorControl
							label={ __( 'Overlay color', 'axiom-blocks' ) }
							color={ attrs[ k( 'bgOverlay' ) ] || '' }
							onChange={ ( v ) => set( 'bgOverlay', v || '' ) }
						/>
					) }
					{ attrs[ k( 'bgOverlayType' ) ] === 'gradient' && (
						<>
							<ABSelectControl
								label={ __( 'Gradient type', 'axiom-blocks' ) }
								value={
									attrs[ k( 'bgOverlayGradType' ) ] || 'linear'
								}
								onChange={ ( v ) =>
									set( 'bgOverlayGradType', v )
								}
								options={ GRAD_TYPE_OPTIONS }
							/>
							{ ( attrs[ k( 'bgOverlayGradType' ) ] ||
								'linear' ) === 'linear' && (
								<ABRangeControl
									label={ __( 'Angle', 'axiom-blocks' ) }
									value={
										attrs[ k( 'bgOverlayGradAngle' ) ] ?? 180
									}
									onChange={ ( v ) =>
										set( 'bgOverlayGradAngle', v ?? 0 )
									}
									min={ 0 }
									max={ 360 }
									step={ 1 }
									unit="°"
								/>
							) }
							<ABColorControl
								label={ __( 'From', 'axiom-blocks' ) }
								color={
									attrs[ k( 'bgOverlayGradFrom' ) ] || '#000000'
								}
								onChange={ ( v ) =>
									set( 'bgOverlayGradFrom', v || '' )
								}
							/>
							<ABColorControl
								label={ __( 'To', 'axiom-blocks' ) }
								color={
									attrs[ k( 'bgOverlayGradTo' ) ] ||
									'rgba(0,0,0,0)'
								}
								onChange={ ( v ) =>
									set( 'bgOverlayGradTo', v || '' )
								}
							/>
						</>
					) }
					<ABRangeControl
						label={ __( 'Overlay opacity', 'axiom-blocks' ) }
						value={ attrs[ k( 'bgOverlayOpacity' ) ] ?? 0 }
						onChange={ ( v ) => set( 'bgOverlayOpacity', v ?? 0 ) }
						min={ 0 }
						max={ 100 }
						step={ 1 }
						unit="%"
					/>
					<ABSelectControl
						label={ __( 'Blend mode', 'axiom-blocks' ) }
						value={ attrs[ k( 'bgOverlayBlend' ) ] || 'normal' }
						onChange={ ( v ) => set( 'bgOverlayBlend', v ) }
						options={ BLEND_MODES }
					/>
				</>
			) }
		</ABEditPopover>
	);
}
