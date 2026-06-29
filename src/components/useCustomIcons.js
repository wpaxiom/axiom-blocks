/**
 * useCustomIcons — shared access to the site-wide custom icon library.
 *
 * Fetches the custom icon set once and keeps every mounted picker in sync after
 * an add/delete via a tiny module-level pub-sub (so the cache is shared across
 * all blocks, not refetched per IconControl). Icons are `{ id, label, svg }`
 * where `id` is the `custom:<…>` reference saved by blocks.
 */

import apiFetch from '@wordpress/api-fetch';
import { useState, useEffect } from '@wordpress/element';
import { ICON_LIBRARY } from './iconLibrary';

const PATH = '/axiom-blocks/v1/custom-icons';

let cache = null;
let inflight = null;
const subscribers = new Set();

function broadcast() {
	subscribers.forEach( ( fn ) => fn( cache ) );
}

function load() {
	if ( cache ) {
		return Promise.resolve( cache );
	}
	if ( ! inflight ) {
		inflight = apiFetch( { path: PATH } )
			.then( ( data ) => {
				cache = Array.isArray( data ) ? data : [];
				inflight = null;
				broadcast();
				return cache;
			} )
			.catch( () => {
				cache = [];
				inflight = null;
				broadcast();
				return cache;
			} );
	}
	return inflight;
}

export function useCustomIcons() {
	const [ icons, setIcons ] = useState( cache || [] );

	useEffect( () => {
		const onChange = ( data ) => setIcons( data ? [ ...data ] : [] );
		subscribers.add( onChange );
		load().then( onChange );
		return () => {
			subscribers.delete( onChange );
		};
	}, [] );

	const add = ( label, svg ) =>
		apiFetch( {
			path: PATH,
			method: 'POST',
			data: { label, svg },
		} ).then( ( icon ) => {
			cache = [ ...( cache || [] ), icon ];
			broadcast();
			return icon;
		} );

	const remove = ( id ) =>
		apiFetch( {
			path: PATH,
			method: 'DELETE',
			data: { id },
		} ).then( ( result ) => {
			cache = ( cache || [] ).filter( ( i ) => i.id !== id );
			broadcast();
			return result;
		} );

	return { icons, add, remove };
}

/**
 * Returns a resolver `( slug ) => node` for editor-canvas previews that handles
 * both built-in slugs and `custom:<id>` references. Returns null for unknown
 * slugs so callers can apply their own per-block fallback.
 */
export function useIconNode() {
	const { icons } = useCustomIcons();
	return ( slug ) => {
		if ( typeof slug === 'string' && slug.startsWith( 'custom:' ) ) {
			const found = icons.find( ( i ) => i.id === slug );
			return found ? (
				// eslint-disable-next-line react/no-danger
				<span dangerouslySetInnerHTML={ { __html: found.svg } } />
			) : null;
		}
		return ICON_LIBRARY[ slug ] || null;
	};
}
