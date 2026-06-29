/**
 * SpacingPanel — Gutenberg InspectorControls panel for padding & margin.
 * Matches the design from the Axiom Blocks Design System handoff.
 */

import { __ } from '@wordpress/i18n';
import { PanelBody } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { useDeviceType, resolveResponsive } from './responsive';
import { DeviceSwitcher } from './DeviceSwitcher';

/* Shared attribute definitions — spread into each block's attributes object */
export const SPACING_ATTRS = {
	paddingTop: { type: 'string', default: '' },
	paddingRight: { type: 'string', default: '' },
	paddingBottom: { type: 'string', default: '' },
	paddingLeft: { type: 'string', default: '' },
	marginTop: { type: 'string', default: '' },
	marginRight: { type: 'string', default: '' },
	marginBottom: { type: 'string', default: '' },
	marginLeft: { type: 'string', default: '' },
};

/* Build a style object from block attributes for use in useBlockProps.
 * Uses CSS custom properties so the stylesheet (which uses --ab-padding-*) works.
 *
 * `device` resolves the value for the active WP preview device (cascade
 * Mobile → Tablet → Desktop). Defaults to Desktop, so existing callers that pass
 * only `attrs` are unchanged. */
/* Hook form: resolves spacing for the active WP preview device. Blocks spread
 * this into useBlockProps so the editor canvas previews the device's values. */
export function useSpacingStyle( attrs ) {
	const device = useDeviceType();
	return getSpacingStyle( attrs, device );
}

export function getSpacingStyle( attrs, device = 'Desktop' ) {
	const v = ( key ) => resolveResponsive( attrs, key, device ) || undefined;
	return {
		'--ab-padding-top': v( 'paddingTop' ),
		'--ab-padding-right': v( 'paddingRight' ),
		'--ab-padding-bottom': v( 'paddingBottom' ),
		'--ab-padding-left': v( 'paddingLeft' ),
		'--ab-margin-top': v( 'marginTop' ),
		'--ab-margin-right': v( 'marginRight' ),
		'--ab-margin-bottom': v( 'marginBottom' ),
		'--ab-margin-left': v( 'marginLeft' ),
		paddingTop: v( 'paddingTop' ),
		paddingRight: v( 'paddingRight' ),
		paddingBottom: v( 'paddingBottom' ),
		paddingLeft: v( 'paddingLeft' ),
		marginTop: v( 'marginTop' ),
		marginRight: v( 'marginRight' ),
		marginBottom: v( 'marginBottom' ),
		marginLeft: v( 'marginLeft' ),
	};
}

/* ── Internal helpers ───────────────────────────────────────────────────── */
/**
 * Returns null when the attribute is unset, a number otherwise. We can't
 * collapse "not applied" into 0 — users need to be able to *explicitly* apply
 * 0px (e.g. to override a theme's root padding) and still see in the UI which
 * sides they've actually touched.
 * @param v
 */
const parseNum = ( v ) =>
	v === '' || v == null ? null : parseInt( v, 10 ) || 0;

/* Stringify an attribute value: '' for "not applied", '<n>px' for an applied number. */
const toAttrValue = ( v ) =>
	v === '' || v == null ? '' : `${ parseInt( v, 10 ) || 0 }px`;

const SIDES = [
	{ key: 'top', label: 'TOP' },
	{ key: 'right', label: 'RIGHT' },
	{ key: 'bottom', label: 'BOTTOM' },
	{ key: 'left', label: 'LEFT' },
];

/* Stable ref callback — sets !important so WP admin CSS cannot override the size */
const applySvgSize = ( el ) => {
	if ( ! el ) return;
	el.style.setProperty( 'width', '20px', 'important' );
	el.style.setProperty( 'height', '20px', 'important' );
	el.style.setProperty( 'min-width', '20px', 'important' );
	el.style.setProperty( 'flex-shrink', '0', 'important' );
};

const BoxIcon = ( { type } ) => (
	<svg
		ref={ applySvgSize }
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.5"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		{ /padding/i.test( type ) ? (
			<>
				<rect
					x="3"
					y="3"
					width="18"
					height="18"
					rx="1.5"
					strokeDasharray="3 2"
				/>
				<rect x="8" y="8" width="8" height="8" rx="1" />
			</>
		) : (
			<>
				<rect
					x="1"
					y="1"
					width="22"
					height="22"
					rx="1.5"
					strokeDasharray="3 2"
				/>
				<rect x="5" y="5" width="14" height="14" rx="1" />
			</>
		) }
	</svg>
);

const LinkSvg = () => (
	<svg
		width="12"
		height="12"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2.2"
		strokeLinecap="round"
	>
		<path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
		<path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
	</svg>
);

const UnlinkSvg = () => (
	<svg
		width="12"
		height="12"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2.2"
		strokeLinecap="round"
	>
		<path d="M18.84 12.25l1.72-1.71a5 5 0 00-7.07-7.07l-1.72 1.71" />
		<path d="M5.17 11.75l-1.72 1.71a5 5 0 007.07 7.07l1.71-1.71" />
		<line x1="2" y1="2" x2="22" y2="22" />
	</svg>
);

/* ── Single axis control (Padding or Margin) ────────────────────────────── */
export function SpacingControl( {
	label,
	type,
	attrs,
	onChange,
	responsive = false,
	device = 'Desktop',
	showDeviceSwitcher = false,
} ) {
	const baseKeys = SIDES.map(
		( s ) => `${ type }${ s.key[ 0 ].toUpperCase() }${ s.key.slice( 1 ) }`
	);
	// Edit the device-specific keys when on Tablet/Mobile; base keys otherwise.
	const perDevice = responsive && device !== 'Desktop';
	const attrKeys = baseKeys.map( ( k ) =>
		perDevice ? `${ k }${ device }` : k
	);
	// null when a side is not applied (on this device), number when it is.
	const vals = attrKeys.map( ( k ) => parseNum( attrs[ k ] ) );
	// Value inherited from the larger device — shown as placeholder when empty.
	const parentDevice = device === 'Mobile' ? 'Tablet' : 'Desktop';
	const inherited = baseKeys.map( ( bk ) =>
		perDevice
			? parseNum( resolveResponsive( attrs, bk, parentDevice ) )
			: null
	);
	const placeholderFor = ( i ) =>
		perDevice && inherited[ i ] !== null ? String( inherited[ i ] ) : '—';

	const allSame = vals.every( ( v ) => v === vals[ 0 ] );
	const hasAny = vals.some( ( v ) => v !== null );
	const [ linked, setLinked ] = useState( allSame );

	const linkedVal = vals[ 0 ];

	const setAll = ( v ) => {
		const stored = toAttrValue( v );
		const update = {};
		attrKeys.forEach( ( k ) => {
			update[ k ] = stored;
		} );
		onChange( update );
	};

	const setSide = ( i, v ) => {
		onChange( { [ attrKeys[ i ] ]: toAttrValue( v ) } );
	};

	const reset = () => {
		const update = {};
		attrKeys.forEach( ( k ) => {
			update[ k ] = '';
		} );
		onChange( update );
	};

	return (
		<div className="ab-sp-control">
			{ /* Label row */ }
			<div className="ab-sp-label-row">
				<span className="ab-sp-label">{ label }</span>
				<div className="ab-sp-actions">
					{ hasAny && (
						<button
							type="button"
							className="ab-sp-reset is-visible"
							onClick={ reset }
						>
							{ __( 'Reset', 'axiom-blocks' ) }
						</button>
					) }
					{ responsive && showDeviceSwitcher && (
						<DeviceSwitcher compact />
					) }
					<button
						type="button"
						className={ `ab-sp-link${
							linked ? ' is-linked' : ''
						}` }
						onClick={ () => setLinked( ( l ) => ! l ) }
						title={
							linked
								? __( 'Unlink sides', 'axiom-blocks' )
								: __( 'Link all sides', 'axiom-blocks' )
						}
					>
						{ linked ? <LinkSvg /> : <UnlinkSvg /> }
					</button>
				</div>
			</div>

			{ linked ? (
				<div className="ab-sp-input-row">
					<BoxIcon type={ type } />
					<div
						className={ `ab-sp-px-wrap${
							linkedVal !== null ? ' is-applied' : ''
						}` }
					>
						<input
							type="number"
							className="ab-sp-px-input"
							value={ linkedVal === null ? '' : linkedVal }
							onChange={ ( e ) => setAll( e.target.value ) }
							min={ 0 }
							max={ 200 }
							placeholder={ placeholderFor( 0 ) }
						/>
						<span className="ab-sp-unit">PX</span>
					</div>
					<input
						type="range"
						className="ab-sp-slider"
						min={ 0 }
						max={ 200 }
						value={ linkedVal === null ? 0 : linkedVal }
						onChange={ ( e ) => setAll( e.target.value ) }
						style={ {
							'--sp-pct': `${
								( linkedVal === null ? 0 : linkedVal ) / 2
							}%`,
						} }
					/>
				</div>
			) : (
				<>
					<div className="ab-sp-input-row ab-sp-input-row--head">
						<BoxIcon type={ type } />
						<span className="ab-sp-sides-hint">
							{ __( 'Per side', 'axiom-blocks' ) }
						</span>
					</div>
					<div className="ab-sp-sides-grid">
						{ SIDES.map( ( side, i ) => (
							<div key={ side.key } className="ab-sp-side">
								<div className="ab-sp-side-label">
									{ side.label }
								</div>
								<div
									className={ `ab-sp-px-wrap${
										vals[ i ] !== null ? ' is-applied' : ''
									}` }
								>
									<input
										type="number"
										className="ab-sp-px-input"
										value={
											vals[ i ] === null ? '' : vals[ i ]
										}
										onChange={ ( e ) =>
											setSide( i, e.target.value )
										}
										min={ 0 }
										max={ 200 }
										placeholder={ placeholderFor( i ) }
									/>
									<span className="ab-sp-unit">PX</span>
								</div>
							</div>
						) ) }
					</div>
				</>
			) }
		</div>
	);
}

/* ── Public panel component ─────────────────────────────────────────────── */
export function SpacingPanel( { attributes, setAttributes, responsive = true } ) {
	// Always read the device (hook must run unconditionally); only used when
	// `responsive` is on. Driven by WordPress's native top-bar device switcher.
	const device = useDeviceType();
	return (
		<PanelBody
			title={ __( 'Spacing', 'axiom-blocks' ) }
			initialOpen={ false }
		>
			<SpacingControl
				label="PADDING"
				type="padding"
				attrs={ attributes }
				onChange={ ( update ) => setAttributes( update ) }
				responsive={ responsive }
				device={ device }
				showDeviceSwitcher={ true }
			/>
			<div className="ab-sp-sep" />
			<SpacingControl
				label="MARGIN"
				type="margin"
				attrs={ attributes }
				onChange={ ( update ) => setAttributes( update ) }
				responsive={ responsive }
				device={ device }
				showDeviceSwitcher={ true }
			/>
		</PanelBody>
	);
}
