/**
 * LinkedBoxControl — generic linked/unlinked 4-value control (the engine
 * extracted from SpacingControl). Drives any per-side or per-corner CSS
 * length group: padding/margin sides, border widths, radius corners.
 * Reuses the ab-sp-* editor styles.
 *
 * `defaults` carries the value the stylesheet already paints when the attribute
 * is unset (a single value or one per key). It only ever renders — as the input
 * placeholder and the slider's resting position — so the attribute stays empty
 * and Reset keeps returning to the shipped look. Without it an unset side reads
 * "—" while the block visibly has, say, a 1px border.
 */

import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { resolveResponsive } from './responsive';
import { DeviceSwitcher } from './DeviceSwitcher';

/**
 * Returns null when the attribute is unset, a number otherwise. We can't
 * collapse "not applied" into 0 — users need to be able to *explicitly* apply
 * 0px (e.g. to override a theme's root padding) and still see in the UI which
 * values they've actually touched.
 * @param v
 */
export const parseNum = ( v ) =>
	v === '' || v == null ? null : parseInt( v, 10 ) || 0;

/* Stringify an attribute value: '' for "not applied", '<n>px' for an applied number. */
export const toAttrValue = ( v ) =>
	v === '' || v == null ? '' : `${ parseInt( v, 10 ) || 0 }px`;

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

export function LinkedBoxControl( {
	label,
	keys,
	valueLabels,
	icon,
	hint = __( 'Per side', 'axiom-blocks' ),
	attrs,
	onChange,
	defaults,
	responsive = false,
	device = 'Desktop',
	showDeviceSwitcher = false,
	min = 0,
	max = 200,
} ) {
	// Edit the device-specific keys when on Tablet/Mobile; base keys otherwise.
	const perDevice = responsive && device !== 'Desktop';
	const attrKeys = keys.map( ( k ) =>
		perDevice ? `${ k }${ device }` : k
	);
	// null when a value is not applied (on this device), number when it is.
	const vals = attrKeys.map( ( k ) => parseNum( attrs[ k ] ) );
	// Value inherited from the larger device — shown as placeholder when empty.
	const parentDevice = device === 'Mobile' ? 'Tablet' : 'Desktop';
	const inherited = keys.map( ( bk ) =>
		perDevice
			? parseNum( resolveResponsive( attrs, bk, parentDevice ) )
			: null
	);
	// Stylesheet default per key — shown when nothing is applied.
	const defaultAt = ( i ) =>
		parseNum( Array.isArray( defaults ) ? defaults[ i ] : defaults );
	const placeholderFor = ( i ) => {
		if ( perDevice && inherited[ i ] !== null ) {
			return String( inherited[ i ] );
		}
		const d = defaultAt( i );
		return d !== null ? String( d ) : '—';
	};

	const allSame = vals.every( ( v ) => v === vals[ 0 ] );
	const hasAny = vals.some( ( v ) => v !== null );
	const [ linked, setLinked ] = useState( allSame );

	const linkedVal = vals[ 0 ];
	// The slider has no empty state, so an unapplied value rests on whatever the
	// stylesheet is actually painting (inherited device value, else the default).
	const sliderVal =
		linkedVal !== null
			? linkedVal
			: ( perDevice ? inherited[ 0 ] : null ) ?? defaultAt( 0 ) ?? 0;

	const setAll = ( v ) => {
		const stored = toAttrValue( v );
		const update = {};
		attrKeys.forEach( ( k ) => {
			update[ k ] = stored;
		} );
		onChange( update );
	};

	const setOne = ( i, v ) => {
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
								? __( 'Unlink values', 'axiom-blocks' )
								: __( 'Link all values', 'axiom-blocks' )
						}
					>
						{ linked ? <LinkSvg /> : <UnlinkSvg /> }
					</button>
				</div>
			</div>

			{ linked ? (
				<div className="ab-sp-input-row">
					{ icon }
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
							min={ min }
							max={ max }
							placeholder={ placeholderFor( 0 ) }
						/>
						<span className="ab-sp-unit">PX</span>
					</div>
					<input
						type="range"
						className="ab-sp-slider"
						min={ min }
						max={ max }
						value={ sliderVal }
						onChange={ ( e ) => setAll( e.target.value ) }
						style={ {
							'--sp-pct': `${
								( sliderVal / ( max - min ) ) * 100
							}%`,
						} }
					/>
				</div>
			) : (
				<>
					<div className="ab-sp-input-row ab-sp-input-row--head">
						{ icon }
						<span className="ab-sp-sides-hint">{ hint }</span>
					</div>
					<div className="ab-sp-sides-grid">
						{ keys.map( ( key, i ) => (
							<div key={ key } className="ab-sp-side">
								<div className="ab-sp-side-label">
									{ valueLabels[ i ] }
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
											setOne( i, e.target.value )
										}
										min={ min }
										max={ max }
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
