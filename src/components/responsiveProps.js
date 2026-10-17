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

/** Per-device span + order shared by every Contact Form field, group and button. */
const CONTACT_FORM_PLACEMENT = [
	{ key: 'span', type: 'number' },
	{ key: 'order', type: 'number' },
];

export const RESPONSIVE_PROPS = {
	'axiom-blocks/advanced-section': [
		{ key: 'gridColumns', type: 'number' },
		{ key: 'layoutGap', type: 'string' },
	],
	'axiom-blocks/counter-group': [
		{ key: 'columns', type: 'number' },
		{ key: 'gap', type: 'string' },
		{ key: 'iconSize', type: 'string' },
		{ key: 'cardMinHeight', type: 'string' },
	],
	'axiom-blocks/pricing-table': [
		{ key: 'columns', type: 'number' },
		{ key: 'gap', type: 'number' },
		{ key: 'cardMinHeight', type: 'string' },
		{ key: 'cardGap', type: 'string' },
		{ key: 'featureGap', type: 'string' },
		{ key: 'featIconSize', type: 'string' },
	],
	'axiom-blocks/shape-divider': [ { key: 'height', type: 'string' } ],
	'axiom-blocks/testimonials': [
		{ key: 'columns', type: 'number' },
		{ key: 'gap', type: 'string' },
		{ key: 'cardGap', type: 'string' },
		{ key: 'avatarSize', type: 'string' },
		{ key: 'cardMinHeight', type: 'string' },
	],
	'axiom-blocks/trust-badges': [
		{ key: 'columns', type: 'number' },
		{ key: 'gap', type: 'number' },
		{ key: 'alignment', type: 'string' },
		{ key: 'headingAlign', type: 'string' },
		{ key: 'cardPaddingTop', type: 'string' },
		{ key: 'cardPaddingRight', type: 'string' },
		{ key: 'cardPaddingBottom', type: 'string' },
		{ key: 'cardPaddingLeft', type: 'string' },
		{ key: 'cardGap', type: 'string' },
	],
	'axiom-blocks/accordion': [
		{ key: 'itemGap', type: 'string' },
		{ key: 'iconSize', type: 'string' },
		{ key: 'containerMaxWidth', type: 'string' },
		{ key: 'bodyMaxWidth', type: 'string' },
	],
	'axiom-blocks/icon-list': [
		{ key: 'gap', type: 'string' },
		{ key: 'rowGap', type: 'string' },
		{ key: 'iconSize', type: 'string' },
	],
	'axiom-blocks/info-box': [
		{ key: 'gap', type: 'string' },
		{ key: 'contentAlign', type: 'string' },
		{ key: 'cardWidth', type: 'string' },
		{ key: 'cardMaxWidth', type: 'string' },
		{ key: 'cardMinHeight', type: 'string' },
	],
	'axiom-blocks/button-group': [
		{ key: 'gap', type: 'number' },
		{ key: 'justify', type: 'string' },
	],
	'axiom-blocks/tabs': [
		{ key: 'contentGap', type: 'number' },
		{ key: 'tabAlignment', type: 'string' },
		{ key: 'tabGap', type: 'string' },
		{ key: 'tabIconGap', type: 'string' },
		{ key: 'barPaddingTop', type: 'string' },
		{ key: 'barPaddingRight', type: 'string' },
		{ key: 'barPaddingBottom', type: 'string' },
		{ key: 'barPaddingLeft', type: 'string' },
		{ key: 'panelPaddingTop', type: 'string' },
		{ key: 'panelPaddingRight', type: 'string' },
		{ key: 'panelPaddingBottom', type: 'string' },
		{ key: 'panelPaddingLeft', type: 'string' },
	],
	'axiom-blocks/countdown-timer': [
		{ key: 'gap', type: 'string' },
		{ key: 'alignment', type: 'string' },
		{ key: 'digitMinWidth', type: 'string' },
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
	'axiom-blocks/notice': [
		{ key: 'iconSize', type: 'string' },
		{ key: 'maxWidth', type: 'string' },
	],
	'axiom-blocks/advanced-button': [ { key: 'iconSize', type: 'string' } ],
	'axiom-blocks/advanced-heading': [
		{ key: 'accentAlign', type: 'string' },
		{ key: 'accentWidth', type: 'string' },
		{ key: 'accentThickness', type: 'string' },
		{ key: 'headingSubGap', type: 'string' },
		{ key: 'headingMaxWidth', type: 'string' },
	],
	'axiom-blocks/before-after-slider': [ { key: 'maxWidth', type: 'string' } ],
	'axiom-blocks/content-slider': [ { key: 'maxWidth', type: 'string' } ],
	'axiom-blocks/free-shipping-progress': [
		{ key: 'barHeight', type: 'string' },
		{ key: 'maxWidth', type: 'string' },
	],
	'axiom-blocks/table-of-contents': [ { key: 'maxWidth', type: 'string' } ],
	'axiom-blocks/post-grid': [
		{ key: 'columns', type: 'number' },
		{ key: 'contentAlign', type: 'string' },
		{ key: 'columnGap', type: 'string' },
		{ key: 'rowGap', type: 'string' },
	],
	'axiom-blocks/css-grid': [
		{ key: 'columnTemplate', type: 'string' },
		{ key: 'rowTemplate', type: 'string' },
		{ key: 'autoColumns', type: 'string' },
		{ key: 'autoRows', type: 'string' },
		{ key: 'autoFlow', type: 'string' },
		{ key: 'justifyItems', type: 'string' },
		{ key: 'alignItems', type: 'string' },
		{ key: 'justifyContent', type: 'string' },
		{ key: 'alignContent', type: 'string' },
		{ key: 'columnGap', type: 'string' },
		{ key: 'rowGap', type: 'string' },
	],
	'axiom-blocks/grid-item': [
		{ key: 'columnStart', type: 'number' },
		{ key: 'columnSpan', type: 'number' },
		{ key: 'rowStart', type: 'number' },
		{ key: 'rowSpan', type: 'number' },
		{ key: 'itemOrder', type: 'number' },
		{ key: 'justifySelf', type: 'string' },
		{ key: 'alignSelf', type: 'string' },
		{ key: 'minHeight', type: 'string' },
	],
	'axiom-blocks/post-card': [
		{ key: 'cardMinHeight', type: 'string' },
		{ key: 'cardGap', type: 'string' },
	],
	'axiom-blocks/post-image': [ { key: 'height', type: 'string' } ],
	'axiom-blocks/post-meta': [ { key: 'iconSize', type: 'string' } ],
	'axiom-blocks/post-filter': [
		{ key: 'barPaddingTop', type: 'string' },
		{ key: 'barPaddingRight', type: 'string' },
		{ key: 'barPaddingBottom', type: 'string' },
		{ key: 'barPaddingLeft', type: 'string' },
		{ key: 'direction', type: 'string' },
		{ key: 'fieldGap', type: 'string' },
		{ key: 'fieldRowGap', type: 'string' },
	],
	'axiom-blocks/post-filter-search': [
		{ key: 'widthCustom', type: 'string' },
	],
	'axiom-blocks/post-filter-taxonomy': [
		{ key: 'widthCustom', type: 'string' },
	],
	'axiom-blocks/post-filter-sort': [ { key: 'widthCustom', type: 'string' } ],
	'axiom-blocks/post-filter-reset': [
		{ key: 'widthCustom', type: 'string' },
	],
	'axiom-blocks/contact-form': [
		{ key: 'columns', type: 'number' },
		{ key: 'tracks', type: 'string' },
		{ key: 'rowAlign', type: 'string' },
		{ key: 'labelPosition', type: 'string' },
		{ key: 'labelWidth', type: 'string' },
		{ key: 'rowGap', type: 'string' },
		{ key: 'columnGap', type: 'string' },
		{ key: 'formPaddingTop', type: 'string' },
		{ key: 'formPaddingRight', type: 'string' },
		{ key: 'formPaddingBottom', type: 'string' },
		{ key: 'formPaddingLeft', type: 'string' },
		{ key: 'formMaxWidth', type: 'string' },
	],
	'axiom-blocks/contact-form-group': [
		...CONTACT_FORM_PLACEMENT,
		{ key: 'columns', type: 'number' },
		{ key: 'tracks', type: 'string' },
	],
	'axiom-blocks/contact-form-submit': [
		...CONTACT_FORM_PLACEMENT,
		{ key: 'buttonWidth', type: 'string' },
		{ key: 'buttonWidthCustom', type: 'string' },
		{ key: 'btnAlign', type: 'string' },
		{ key: 'btnPaddingTop', type: 'string' },
		{ key: 'btnPaddingRight', type: 'string' },
		{ key: 'btnPaddingBottom', type: 'string' },
		{ key: 'btnPaddingLeft', type: 'string' },
	],
	'axiom-blocks/social-share': [
		{ key: 'direction', type: 'string' },
		{ key: 'justify', type: 'string' },
		{ key: 'gap', type: 'string' },
		{ key: 'btnSize', type: 'string' },
		{ key: 'iconSize', type: 'string' },
	],
	'axiom-blocks/contact-form-text': CONTACT_FORM_PLACEMENT,
	'axiom-blocks/contact-form-email': CONTACT_FORM_PLACEMENT,
	'axiom-blocks/contact-form-phone': CONTACT_FORM_PLACEMENT,
	'axiom-blocks/contact-form-textarea': CONTACT_FORM_PLACEMENT,
	'axiom-blocks/contact-form-select': CONTACT_FORM_PLACEMENT,
	'axiom-blocks/contact-form-choices': CONTACT_FORM_PLACEMENT,
	'axiom-blocks/contact-form-consent': CONTACT_FORM_PLACEMENT,
	'axiom-blocks/contact-form-date': CONTACT_FORM_PLACEMENT,
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
