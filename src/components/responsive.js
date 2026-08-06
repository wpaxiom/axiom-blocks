/**
 * Responsive controls — shared wiring.
 *
 * We do NOT build a device switch: we subscribe to WordPress's NATIVE device
 * preview (top-bar Desktop / Tablet / Mobile). It resizes the canvas to Tablet
 * 780px / Mobile 360px (core `use-resize-canvas`). Our controls read that device
 * and edit the matching attribute; the frontend applies it via media queries at
 * those exact widths (see inc/Blocks/Responsive.php).
 *
 * Attribute convention per responsive property `X`:
 *   X (Desktop, the existing attr) · XTablet · XMobile   — empty = inherit larger.
 */

import { useSelect, useDispatch } from '@wordpress/data';

export const DEVICES = [ 'Desktop', 'Tablet', 'Mobile' ];

const isSet = ( v ) => v !== '' && v != null;

/**
 * Attribute key for a base key on a given device ('' suffix for Desktop).
 * @param baseKey
 * @param device
 */
export function deviceKey( baseKey, device ) {
	return device === 'Desktop' ? baseKey : `${ baseKey }${ device }`;
}

/**
 * The active WordPress preview device (the native top-bar switcher).
 * Handles the stabilized (`core/editor` getDeviceType, WP 6.5+) and the legacy
 * (`core/edit-post` __experimentalGetPreviewDeviceType) APIs.
 *
 * @return {string} 'Desktop' | 'Tablet' | 'Mobile'
 */
export function useDeviceType() {
	return useSelect( ( select ) => {
		const editor = select( 'core/editor' );
		if ( editor && editor.getDeviceType ) {
			return editor.getDeviceType() || 'Desktop';
		}
		const editPost = select( 'core/edit-post' );
		if ( editPost && editPost.__experimentalGetPreviewDeviceType ) {
			return editPost.__experimentalGetPreviewDeviceType() || 'Desktop';
		}
		return 'Desktop';
	}, [] );
}

/**
 * Setter for the WordPress-native preview device. Same store our reader uses, so
 * our switch button drives the canvas + top bar + every control at once — not a
 * separate device state. Handles stabilized and legacy action names.
 *
 * @return {Function} setDevice( 'Desktop' | 'Tablet' | 'Mobile' )
 */
export function useSetDeviceType() {
	const editor = useDispatch( 'core/editor' );
	const editPost = useDispatch( 'core/edit-post' );
	return ( device ) => {
		if ( editor && editor.setDeviceType ) {
			editor.setDeviceType( device );
		} else if ( editPost && editPost.__experimentalSetPreviewDeviceType ) {
			editPost.__experimentalSetPreviewDeviceType( device );
		}
	};
}

/**
 * Resolve a property's value for a device via the cascade Mobile → Tablet →
 * Desktop. Empty = inherit. Used for the editor preview and the "inherited value"
 * placeholder.
 *
 * @param {Object} attrs   Block attributes.
 * @param {string} baseKey Base attribute key (the Desktop key).
 * @param {string} device  Active device.
 * @return {*} The effective value for that device.
 */
export function resolveResponsive( attrs, baseKey, device ) {
	const desktop = attrs[ baseKey ];
	if ( device === 'Desktop' ) {
		return desktop;
	}
	const tablet = attrs[ `${ baseKey }Tablet` ];
	if ( device === 'Tablet' ) {
		return isSet( tablet ) ? tablet : desktop;
	}
	const mobile = attrs[ `${ baseKey }Mobile` ];
	if ( isSet( mobile ) ) {
		return mobile;
	}
	return isSet( tablet ) ? tablet : desktop;
}

/**
 * Overlay device-resolved values onto the given base attribute keys, so a block's
 * existing var/style builder (which reads `attributes[key]`) previews the active
 * device without being rewritten. Returns the attributes unchanged on Desktop.
 *
 * @param {Object}   attrs    Block attributes.
 * @param {string[]} baseKeys Base attribute keys to resolve (e.g. [ 'columns' ]).
 * @param {string}   device   Active device.
 * @return {Object} A shallow copy with resolved keys, or `attrs` on Desktop.
 */
export function resolveResponsiveAttrs( attrs, baseKeys, device ) {
	if ( device === 'Desktop' ) {
		return attrs;
	}
	const out = { ...attrs };
	baseKeys.forEach( ( key ) => {
		out[ key ] = resolveResponsive( attrs, key, device );
	} );
	return out;
}
