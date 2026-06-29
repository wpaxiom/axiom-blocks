/**
 * Responsive-typography registry (editor side).
 *
 * Block name => list of typography group prefixes that block exposes. Mirrors the
 * PHP registry in inc/Blocks/ResponsiveTypography.php (which also holds the CSS
 * selectors used on the frontend). Used to inject *Tablet / *Mobile typography
 * attributes client-side so the editor can edit and save per-device values.
 *
 * The empty string is the block's unprefixed typography group.
 */

import { resolveResponsive } from './responsive';

export const TYPOGRAPHY_TARGETS = {
	'axiom-blocks/advanced-heading': [ 'heading', 'sub' ],
	'axiom-blocks/advanced-button': [ '' ],
	'axiom-blocks/copy-to-clipboard': [ '' ],
	'axiom-blocks/icon-list': [ '' ],
	'axiom-blocks/pricing-table': [ 'heading' ],
	'axiom-blocks/pricing-plan': [ 'name', 'price', 'desc', 'feature', 'cta' ],
	'axiom-blocks/trust-badges': [ 'heading', 'label' ],
	'axiom-blocks/countdown-timer': [ 'digit', 'label' ],
	'axiom-blocks/notice': [ 'title', 'content' ],
	'axiom-blocks/tabs': [ 'label' ],
	'axiom-blocks/star-rating': [ 'meta' ],
	'axiom-blocks/accordion': [ 'header' ],
	'axiom-blocks/counter-group': [ 'number', 'label' ],
	'axiom-blocks/testimonials': [ 'name', 'role', 'company', 'quote' ],
};

/** Typography base attribute suffixes — mirrors KEYS in TypographyPanel.js. */
const TYPOGRAPHY_SUFFIXES = [
	'fontFamily',
	'fontWeight',
	'fontSize',
	'lineHeight',
	'letterSpacing',
	'textTransform',
	'textDecoration',
	'textAlign',
];

const prefixed = ( prefix, suffix ) =>
	prefix ? `${ prefix }${ suffix[ 0 ].toUpperCase() }${ suffix.slice( 1 ) }` : suffix;

/**
 * Build the `{ key: { type, default } }` map of *Tablet / *Mobile typography
 * attributes for a registered block, skipping any the block already declares.
 *
 * @param {string} name  Block name.
 * @param {Object} attrs The block's current attributes.
 * @return {Object} Extra attributes to merge, or {} when none apply.
 */
export function responsiveTypographyAttrs( name, attrs ) {
	const prefixes = TYPOGRAPHY_TARGETS[ name ];
	if ( ! prefixes ) {
		return {};
	}
	const extra = {};
	prefixes.forEach( ( prefix ) => {
		TYPOGRAPHY_SUFFIXES.forEach( ( suffix ) => {
			const base = prefixed( prefix, suffix );
			[ 'Tablet', 'Mobile' ].forEach( ( device ) => {
				const key = base + device;
				if ( ! attrs || ! attrs[ key ] ) {
					extra[ key ] = { type: 'string', default: '' };
				}
			} );
		} );
	} );
	return extra;
}

/**
 * Overlay device-resolved typography values onto the base attribute keys, so a
 * var-based block's existing var builder (which reads `attributes.xFontSize`)
 * previews the active device without being rewritten. Returns the attributes
 * unchanged on Desktop.
 *
 * @param {Object}   attrs    Block attributes.
 * @param {string[]} prefixes Typography group prefixes ('' for none).
 * @param {string}   device   Active device.
 * @return {Object} A shallow copy with resolved typography keys, or `attrs`.
 */
export function resolveTypographyAttrs( attrs, prefixes, device ) {
	if ( device === 'Desktop' ) {
		return attrs;
	}
	const out = { ...attrs };
	prefixes.forEach( ( prefix ) => {
		TYPOGRAPHY_SUFFIXES.forEach( ( suffix ) => {
			const base = prefixed( prefix, suffix );
			out[ base ] = resolveResponsive( attrs, base, device );
		} );
	} );
	return out;
}
