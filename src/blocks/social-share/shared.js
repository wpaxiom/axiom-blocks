/**
 * Social Share: the editor's half of the styling pipeline and catalog.
 *
 * Builds the same CSS custom properties as AxiomBlocks\Blocks\SocialShare,
 * from the same vars.json, and reads the same networks.json, so the canvas and
 * the page paint the same buttons.
 */

import { getBackgroundVars } from '../../components/BackgroundControl';
import { resolveResponsiveAttrs } from '../../components/responsive';
import { RESPONSIVE_PROPS } from '../../components/responsiveProps';
import { TYPOGRAPHY_TARGETS } from '../../components/typographyTargets';
import NETWORKS from './networks.json';
import VARS from './vars.json';

export { NETWORKS };

export const NAME = 'axiom-blocks/social-share';

const isSet = ( v ) => v !== '' && v !== null && v !== undefined;

/**
 * Overlay the active device's values for every responsive key the block
 * registers (props and typography), so the var builder previews that device.
 *
 * @param {Object} attrs  Block attributes.
 * @param {string} device Active device.
 * @return {Object} Resolved attributes.
 */
export function resolveForDevice( attrs, device ) {
	const keys = ( RESPONSIVE_PROPS[ NAME ] || [] ).map( ( s ) => s.key );
	( TYPOGRAPHY_TARGETS[ NAME ] || [] ).forEach( ( prefix ) => {
		Object.keys( VARS.typographySuffixes ).forEach( ( suffix ) => {
			keys.push( prefix + suffix );
		} );
	} );
	return resolveResponsiveAttrs( attrs, keys, device );
}

/**
 * CSS custom properties for the wrapper, from vars.json.
 *
 * @param {Object} attrs Block attributes (device-resolved).
 * @return {Object} Style object.
 */
export function ssVars( attrs ) {
	const spec = VARS.block;
	const out = {};

	Object.entries( spec.vars ).forEach( ( [ cssVar, attr ] ) => {
		if ( isSet( attrs[ attr ] ) ) {
			out[ cssVar ] = String( attrs[ attr ] );
		}
	} );

	spec.borders.forEach( ( [ styleVar, styleAttr, widthAttrs ] ) => {
		if ( isSet( attrs[ styleAttr ] ) ) {
			out[ styleVar ] = attrs[ styleAttr ];
		} else if ( widthAttrs.some( ( w ) => isSet( attrs[ w ] ) ) ) {
			// BorderControl shows "Solid" for an empty style; a width alone
			// paints a solid border, as on the front end.
			out[ styleVar ] = 'solid';
		}
	} );

	Object.entries( spec.typography ).forEach( ( [ prefix, varPrefix ] ) => {
		Object.entries( VARS.typographySuffixes ).forEach(
			( [ suffix, css ] ) => {
				const value = attrs[ prefix + suffix ];
				if ( isSet( value ) ) {
					out[ `${ varPrefix }-${ css }` ] = String( value );
				}
			}
		);
	} );

	spec.backgrounds.forEach( ( [ prefix, colorKey, varName ] ) => {
		Object.assign(
			out,
			getBackgroundVars( attrs, {
				prefix,
				colorKey,
				varName,
				varPrefix: varName,
			} )
		);
	} );

	return out;
}

/**
 * Wrapper classes, the same list render.php builds.
 *
 * @param {Object} attrs Block attributes.
 * @return {string} Class names.
 */
export function ssClasses( attrs ) {
	const classes = [
		'ab-ss',
		`ab-ss--${ attrs.display || 'icon' }`,
		`ab-ss--shape-${ attrs.shape || 'rounded' }`,
		`ab-ss--${ attrs.variant || 'filled' }`,
	];
	if ( attrs.brandColors !== false ) {
		classes.push( 'ab-ss--brand' );
	}
	if ( [ 'lift', 'grow' ].includes( attrs.hoverEffect ) ) {
		classes.push( `ab-ss--fx-${ attrs.hoverEffect }` );
	}
	if ( attrs.wrap === false ) {
		classes.push( 'ab-ss--nowrap' );
	}
	if ( attrs.equalWidth ) {
		classes.push( 'ab-ss--equal' );
	}
	return classes.join( ' ' );
}
