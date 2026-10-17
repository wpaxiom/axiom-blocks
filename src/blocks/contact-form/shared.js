/**
 * Contact Form: the editor's half of the styling pipeline.
 *
 * Builds the same CSS custom properties as AxiomBlocks\Forms\ContactFormRender,
 * from the same vars.json, so the canvas and the page paint from one map. The
 * maps below mirror the PHP constants of the same names.
 */

import { getBackgroundVars } from '../../components/BackgroundControl';
import { resolveResponsiveAttrs } from '../../components/responsive';
import { RESPONSIVE_PROPS } from '../../components/responsiveProps';
import { TYPOGRAPHY_TARGETS } from '../../components/typographyTargets';
import { safeTrackList } from '../css-grid/tracks';
import VARS from './vars.json';

export const LABEL_POSITION_VARS = {
	'--ab-cf-fcols': {
		above: 'minmax(0, 1fr)',
		beside: 'var(--ab-cf-lw, 30%) minmax(0, 1fr)',
		hidden: 'minmax(0, 1fr)',
	},
	'--ab-cf-ccol': { above: 'auto', beside: '2', hidden: 'auto' },
	'--ab-cf-lpos': { above: 'static', beside: 'static', hidden: 'absolute' },
	'--ab-cf-lsize': { above: 'auto', beside: 'auto', hidden: '1px' },
	'--ab-cf-lof': { above: 'visible', beside: 'visible', hidden: 'hidden' },
	'--ab-cf-lclip': { above: 'none', beside: 'none', hidden: 'inset(50%)' },
	'--ab-cf-lws': { above: 'normal', beside: 'normal', hidden: 'nowrap' },
	'--ab-cf-lpt': {
		above: '0',
		beside: 'calc(var(--ab-cf-in-pt, 10px) + var(--ab-cf-in-bw-t, 1px))',
		hidden: '0',
	},
};

export const BUTTON_WIDTH_MAP = {
	auto: 'auto',
	full: '100%',
	custom: 'var(--ab-cfb-wc, auto)',
};

export const ALIGN_MAP = {
	left: 'flex-start',
	center: 'center',
	right: 'flex-end',
	full: 'stretch',
};

const ROW_ALIGN = [ 'start', 'center', 'end', 'stretch' ];

const isSet = ( v ) => v !== '' && v !== null && v !== undefined;

/**
 * Overlay the active device's values for every responsive key a block
 * registers (props and typography), so the var builders preview that device.
 *
 * @param {string} name   Block name.
 * @param {Object} attrs  Block attributes.
 * @param {string} device Active device.
 * @return {Object} Resolved attributes.
 */
export function resolveForDevice( name, attrs, device ) {
	const keys = ( RESPONSIVE_PROPS[ name ] || [] ).map( ( s ) => s.key );
	( TYPOGRAPHY_TARGETS[ name ] || [] ).forEach( ( prefix ) => {
		Object.keys( VARS.typographySuffixes ).forEach( ( suffix ) => {
			keys.push(
				prefix
					? prefix + suffix
					: suffix[ 0 ].toLowerCase() + suffix.slice( 1 )
			);
		} );
	} );
	return resolveResponsiveAttrs( attrs, keys, device );
}

/**
 * CSS custom properties for one part, from vars.json.
 *
 * @param {string} part  form | submit | field.
 * @param {Object} attrs Block attributes (device-resolved).
 * @return {Object} Style object.
 */
export function partVars( part, attrs ) {
	const spec = VARS[ part ] || {};
	const out = {};

	Object.entries( spec.vars || {} ).forEach( ( [ cssVar, attr ] ) => {
		if ( isSet( attrs[ attr ] ) ) {
			out[ cssVar ] = String( attrs[ attr ] );
		}
	} );

	( spec.borders || [] ).forEach( ( [ styleVar, styleAttr, widthAttrs ] ) => {
		if ( isSet( attrs[ styleAttr ] ) ) {
			return;
		}
		if ( widthAttrs.some( ( w ) => isSet( attrs[ w ] ) ) ) {
			// BorderControl shows "Solid" for an empty style; a width alone
			// paints a solid border, as on the front end.
			out[ styleVar ] = 'solid';
		}
	} );

	Object.entries( spec.typography || {} ).forEach(
		( [ prefix, varPrefix ] ) => {
			Object.entries( VARS.typographySuffixes ).forEach(
				( [ suffix, css ] ) => {
					const attr = prefix
						? prefix + suffix
						: suffix[ 0 ].toLowerCase() + suffix.slice( 1 );
					if ( isSet( attrs[ attr ] ) ) {
						out[ `${ varPrefix }-${ css }` ] = String(
							attrs[ attr ]
						);
					}
				}
			);
		}
	);

	( spec.backgrounds || [] ).forEach( ( [ prefix, colorKey, varName ] ) => {
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
 * Columns template for one device: valid custom tracks, else equal columns.
 *
 * @param {*}      columns Column count.
 * @param {string} tracks  Custom tracks.
 * @return {string} grid-template-columns value.
 */
export function gridTemplate( columns, tracks ) {
	const safe = safeTrackList( tracks );
	if ( safe ) {
		return safe;
	}
	const n = Math.max( 1, Math.min( 12, Number( columns ) || 1 ) );
	return `repeat(${ n }, minmax(0, 1fr))`;
}

/**
 * Number of columns a template creates.
 *
 * @param {string} template Template.
 * @return {number} Column count.
 */
export function columnCount( template ) {
	const m = /^repeat\((\d+),/i.exec( template );
	if ( m ) {
		return Number( m[ 1 ] );
	}
	return template ? template.trim().split( /\s+/ ).length : 0;
}

/**
 * Wrapper vars for the form itself (device-resolved attributes).
 *
 * @param {Object} attrs Resolved attributes.
 * @return {Object} Style object.
 */
export function formVars( attrs ) {
	const out = partVars( 'form', attrs );
	const pos = [ 'above', 'beside', 'hidden' ].includes( attrs.labelPosition )
		? attrs.labelPosition
		: 'above';
	Object.entries( LABEL_POSITION_VARS ).forEach( ( [ cssVar, map ] ) => {
		out[ cssVar ] = map[ pos ];
	} );
	out[ '--ab-cf-cols' ] = gridTemplate( attrs.columns, attrs.tracks );
	if ( ROW_ALIGN.includes( attrs.rowAlign ) ) {
		out[ '--ab-cf-ralign' ] = attrs.rowAlign;
	}
	if ( isSet( attrs.labelWidth ) ) {
		out[ '--ab-cf-lw' ] = attrs.labelWidth;
	}
	return out;
}

/**
 * Span + order vars every grid item carries (device-resolved attributes).
 *
 * @param {Object} attrs Resolved attributes.
 * @return {Object} Style object.
 */
export function placementVars( attrs ) {
	const span = Math.max( 0, Math.min( 12, Number( attrs.span ) || 0 ) );
	return {
		'--ab-cf-span': span === 0 ? '1 / -1' : `span ${ span }`,
		'--ab-cf-ord': String( Number( attrs.order ) || 0 ),
	};
}

/**
 * Key a field asks for, before de-duplication (mirrors ContactFormSchema).
 *
 * @param {string} text Field key or label.
 * @return {string} Slug.
 */
export function slugKey( text ) {
	return String( text || '' )
		.normalize( 'NFD' )
		.replace( /[̀-ͯ]/g, '' )
		.replace( /<[^>]*>/g, '' )
		.toLowerCase()
		.replace( /[^a-z0-9]+/g, '_' )
		.replace( /^_+|_+$/g, '' )
		.slice( 0, 40 );
}

/**
 * A short random id for a new form.
 *
 * @return {string} 12 lowercase hex characters.
 */
export function newFormId() {
	const bytes = new Uint8Array( 6 );
	( window.crypto || window.msCrypto ).getRandomValues( bytes );
	return Array.from( bytes, ( b ) =>
		b.toString( 16 ).padStart( 2, '0' )
	).join( '' );
}
