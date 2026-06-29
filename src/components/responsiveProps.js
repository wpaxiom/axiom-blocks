/**
 * Responsive per-block props registry (editor side).
 *
 * Block name => list of single-value controls that are per-device, with the
 * attribute type to inject for the *Tablet / *Mobile variants. Mirrors the PHP
 * registry in inc/Blocks/ResponsiveProps.php (which also holds the CSS selector +
 * value format used on the frontend). Used to inject the responsive attributes
 * client-side so the editor can edit and save per-device values.
 */

import { resolveResponsive } from './responsive';

const isSet = ( v ) => v !== '' && v != null;

/**
 * Editor preview for a responsive grid-columns control. Returns a
 * `grid-template-columns` string for the active device ONLY when that device has
 * an explicit override in its cascade — so unset devices fall through to the
 * block's own default (and its auto-collapse media rules), matching the frontend.
 * Apply to the grid element's inline style.
 *
 * @param {Object} attrs  Block attributes.
 * @param {string} key    Base attribute key (e.g. 'columns').
 * @param {string} device Active device.
 * @return {string|undefined} The track list, or undefined to defer to the default.
 */
export function responsiveGridColumns( attrs, key, device ) {
	if ( device === 'Desktop' ) {
		return undefined;
	}
	const hasOverride =
		device === 'Mobile'
			? isSet( attrs[ `${ key }Mobile` ] ) ||
			  isSet( attrs[ `${ key }Tablet` ] )
			: isSet( attrs[ `${ key }Tablet` ] );
	if ( ! hasOverride ) {
		return undefined;
	}
	const n = resolveResponsive( attrs, key, device );
	return n ? `repeat(${ n }, minmax(0, 1fr))` : undefined;
}

/**
 * Editor preview value for a responsive CSS-var control (gap, …). Returns the
 * active device's resolved value (cascade), formatted with an optional unit, or
 * undefined when empty. Assign to the block's wrapper var in blockProps style so
 * the var reflects the active device (custom props inherit to consumers).
 *
 * @param {Object} attrs  Block attributes.
 * @param {string} key    Base attribute key (e.g. 'gap').
 * @param {string} device Active device.
 * @param {string} unit   Unit to append for numeric stores (e.g. 'px'), or ''.
 * @return {string|undefined}
 */
export function responsiveVarValue( attrs, key, device, unit = '' ) {
	const v = resolveResponsive( attrs, key, device );
	if ( v === '' || v == null ) {
		return undefined;
	}
	return unit ? `${ v }${ unit }` : `${ v }`;
}

/**
 * Editor preview for a responsive alignment control. Returns the CSS value for
 * the active device ONLY when that device has an explicit override in its cascade
 * (so unset devices defer to the desktop class/inline + the block's defaults,
 * matching the frontend). Pass a value-map (e.g. { left: 'flex-start' }) for
 * justify/flex props; omit it for pass-through props like text-align.
 *
 * @param {Object} attrs  Block attributes.
 * @param {string} key    Base attribute key (e.g. 'alignment').
 * @param {string} device Active device.
 * @param {Object} [map]  Optional value => CSS map.
 * @return {string|undefined} The CSS value, or undefined to defer to the default.
 */
export function responsiveAlignValue( attrs, key, device, map ) {
	if ( device === 'Desktop' ) {
		return undefined;
	}
	const hasOverride =
		device === 'Mobile'
			? isSet( attrs[ `${ key }Mobile` ] ) ||
			  isSet( attrs[ `${ key }Tablet` ] )
			: isSet( attrs[ `${ key }Tablet` ] );
	if ( ! hasOverride ) {
		return undefined;
	}
	const v = resolveResponsive( attrs, key, device );
	if ( v === '' || v == null ) {
		return undefined;
	}
	return map ? map[ v ] ?? undefined : v;
}

/** Standard justify/flex value-map for left/center/right alignment. */
export const ALIGN_FLEX_MAP = {
	left: 'flex-start',
	center: 'center',
	right: 'flex-end',
};

export const RESPONSIVE_PROPS = {
	'axiom-blocks/counter-group': [
		{ key: 'columns', type: 'number' },
		{ key: 'gap', type: 'string' },
		{ key: 'iconSize', type: 'string' },
	],
	'axiom-blocks/pricing-table': [
		{ key: 'columns', type: 'number' },
		{ key: 'gap', type: 'number' },
	],
	'axiom-blocks/testimonials': [
		{ key: 'columns', type: 'number' },
		{ key: 'gap', type: 'string' },
	],
	'axiom-blocks/trust-badges': [
		{ key: 'columns', type: 'number' },
		{ key: 'gap', type: 'number' },
		{ key: 'alignment', type: 'string' },
		{ key: 'headingAlign', type: 'string' },
	],
	'axiom-blocks/accordion': [
		{ key: 'itemGap', type: 'string' },
		{ key: 'iconSize', type: 'string' },
	],
	'axiom-blocks/icon-list': [
		{ key: 'gap', type: 'string' },
		{ key: 'rowGap', type: 'string' },
		{ key: 'iconSize', type: 'string' },
	],
	'axiom-blocks/info-box': [
		{ key: 'gap', type: 'string' },
		{ key: 'contentAlign', type: 'string' },
	],
	'axiom-blocks/button-group': [
		{ key: 'gap', type: 'number' },
		{ key: 'justify', type: 'string' },
	],
	'axiom-blocks/tabs': [
		{ key: 'contentGap', type: 'number' },
		{ key: 'tabAlignment', type: 'string' },
	],
	'axiom-blocks/countdown-timer': [
		{ key: 'gap', type: 'string' },
		{ key: 'alignment', type: 'string' },
	],
	'axiom-blocks/star-rating': [
		{ key: 'alignment', type: 'string' },
		{ key: 'starSize', type: 'string' },
	],
	'axiom-blocks/icon': [
		{ key: 'iconAlign', type: 'string' },
		{ key: 'iconSize', type: 'string' },
	],
	'axiom-blocks/copy-to-clipboard': [ { key: 'alignment', type: 'string' } ],
	'axiom-blocks/notice': [ { key: 'iconSize', type: 'string' } ],
	'axiom-blocks/advanced-button': [ { key: 'iconSize', type: 'string' } ],
	'axiom-blocks/advanced-heading': [
		{ key: 'accentAlign', type: 'string' },
		{ key: 'accentWidth', type: 'string' },
		{ key: 'accentThickness', type: 'string' },
	],
};

/**
 * Build the `{ key: { type } }` map of *Tablet / *Mobile attributes for a
 * registered block, skipping any it already declares.
 *
 * @param {string} name  Block name.
 * @param {Object} attrs The block's current attributes.
 * @return {Object} Extra attributes to merge, or {} when none apply.
 */
export function responsivePropsAttrs( name, attrs ) {
	const props = RESPONSIVE_PROPS[ name ];
	if ( ! props ) {
		return {};
	}
	const extra = {};
	props.forEach( ( { key, type } ) => {
		[ 'Tablet', 'Mobile' ].forEach( ( device ) => {
			const k = key + device;
			if ( ! attrs || ! attrs[ k ] ) {
				extra[ k ] = { type: type || 'string' };
			}
		} );
	} );
	return extra;
}
