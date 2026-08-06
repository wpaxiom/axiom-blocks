/**
 * RadiusControl — shared design-layer per-corner border-radius control,
 * linked/unlinked via LinkedBoxControl (same engine as spacing sides).
 *
 * Attribute keys derive from an element `prefix` ('' → radiusTopLeft…,
 * 'card' → cardRadiusTopLeft…) or can be passed explicitly.
 */

import { __ } from '@wordpress/i18n';
import { resolveResponsive } from './responsive';
import { LinkedBoxControl } from './LinkedBoxControl';

const cap = ( s ) => s[ 0 ].toUpperCase() + s.slice( 1 );
const camel = ( prefix, key ) =>
	prefix ? `${ prefix }${ cap( key ) }` : key;

const CORNERS = [ 'TopLeft', 'TopRight', 'BottomRight', 'BottomLeft' ];
const CORNER_LABELS = [ 'TOP L', 'TOP R', 'BOT R', 'BOT L' ];
const CORNER_VARS = [ 'tl', 'tr', 'br', 'bl' ];

const radiusKeysFor = ( prefix ) =>
	CORNERS.map( ( c ) => camel( prefix, `radius${ c }` ) );

/* Shared attribute definitions — spread into a block's attributes object. */
export function radiusAttrs( prefix = '' ) {
	const attrs = {};
	radiusKeysFor( prefix ).forEach( ( k ) => {
		attrs[ k ] = { type: 'string', default: '' };
	} );
	return attrs;
}

/* CSS-var object for the block wrapper / scoped styles. Unset values emit
 * nothing, so blocks that never touch the control produce zero output. */
export function getRadiusVars(
	attrs,
	{ prefix = '', varPrefix, device = 'Desktop' }
) {
	const vars = {};
	CORNERS.forEach( ( c, i ) => {
		vars[ `${ varPrefix }-radius-${ CORNER_VARS[ i ] }` ] =
			resolveResponsive(
				attrs,
				camel( prefix, `radius${ c }` ),
				device
			) || undefined;
	} );
	return vars;
}

const RadiusIcon = () => (
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.5"
		strokeLinecap="round"
		strokeLinejoin="round"
		style={ { width: 20, height: 20, minWidth: 20, flexShrink: 0 } }
	>
		<path d="M21 11a8 8 0 0 0-8-8" />
		<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
	</svg>
);

export function RadiusControl( {
	label = 'RADIUS',
	attrs,
	onChange,
	prefix = '',
	radiusKeys,
	defaults,
	min = 0,
	max = 100,
	responsive = false,
	device = 'Desktop',
	showDeviceSwitcher = false,
} ) {
	return (
		<LinkedBoxControl
			label={ label }
			keys={ radiusKeys || radiusKeysFor( prefix ) }
			valueLabels={ CORNER_LABELS }
			icon={ <RadiusIcon /> }
			hint={ __( 'Per corner', 'axiom-blocks' ) }
			attrs={ attrs }
			onChange={ onChange }
			defaults={ defaults }
			min={ min }
			max={ max }
			responsive={ responsive }
			device={ device }
			showDeviceSwitcher={ showDeviceSwitcher }
		/>
	);
}
