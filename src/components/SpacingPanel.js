/**
 * SpacingPanel — Gutenberg InspectorControls panel for padding & margin.
 * Matches the design from the Axiom Blocks Design System handoff.
 */

import { __ } from '@wordpress/i18n';
import { PanelBody } from '@wordpress/components';
import { useState } from '@wordpress/element';

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
 * Uses CSS custom properties so the stylesheet (which uses --ab-padding-*) works. */
export function getSpacingStyle( attrs ) {
	return {
		'--ab-padding-top': attrs.paddingTop || undefined,
		'--ab-padding-right': attrs.paddingRight || undefined,
		'--ab-padding-bottom': attrs.paddingBottom || undefined,
		'--ab-padding-left': attrs.paddingLeft || undefined,
		'--ab-margin-top': attrs.marginTop || undefined,
		'--ab-margin-right': attrs.marginRight || undefined,
		'--ab-margin-bottom': attrs.marginBottom || undefined,
		'--ab-margin-left': attrs.marginLeft || undefined,
		paddingTop: attrs.paddingTop || undefined,
		paddingRight: attrs.paddingRight || undefined,
		paddingBottom: attrs.paddingBottom || undefined,
		paddingLeft: attrs.paddingLeft || undefined,
		marginTop: attrs.marginTop || undefined,
		marginRight: attrs.marginRight || undefined,
		marginBottom: attrs.marginBottom || undefined,
		marginLeft: attrs.marginLeft || undefined,
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
		{ type === 'padding' ? (
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
function SpacingControl( { label, type, attrs, onChange } ) {
	const attrKeys = SIDES.map(
		( s ) => `${ type }${ s.key[ 0 ].toUpperCase() }${ s.key.slice( 1 ) }`
	);
	// null when a side is not applied, number when it is.
	const vals = attrKeys.map( ( k ) => parseNum( attrs[ k ] ) );

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
					<button
						type="button"
						className="ab-sp-reset"
						onClick={ reset }
						disabled={ ! hasAny }
					>
						{ __( 'Reset', 'axiom-blocks' ) }
					</button>
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
							placeholder="—"
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
										placeholder="—"
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
export function SpacingPanel( { attributes, setAttributes } ) {
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
			/>
			<div className="ab-sp-sep" />
			<SpacingControl
				label="MARGIN"
				type="margin"
				attrs={ attributes }
				onChange={ ( update ) => setAttributes( update ) }
			/>
		</PanelBody>
	);
}
