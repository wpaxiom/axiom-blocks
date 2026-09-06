/**
 * Post Filter - no-reload upgrade.
 *
 * Progressive enhancement only. The bar is a real GET form, so with JS off it
 * still navigates and the targeted Post Grid renders the filtered results
 * server-side. When JS is on, this intercepts the submit, asks the load-more
 * route for the filtered cards, and swaps them into the grid in place.
 *
 * The security surface is unchanged: the route only ever accepts a grid key
 * plus a set of whitelisted filter tokens. Nothing here sends raw markup or
 * post queries to the server.
 *
 * Every visible string comes from the form's data attributes, which render.php
 * fills through __(), so nothing user-facing is hardcoded in English here.
 */
( function () {
	'use strict';

	const FILTER_PARAMS = [ 'ab_f_s', 'ab_f_sort', 'ab_f_reset' ];

	function endpoint() {
		if ( window.axiomBlocksApi && window.axiomBlocksApi.root ) {
			return window.axiomBlocksApi.root + 'axiom-blocks/v1/post-grid';
		}
		return '/wp-json/axiom-blocks/v1/post-grid';
	}

	function gridFor( form ) {
		const target = form.getAttribute( 'data-ab-pf-target' ) || '';
		return target ? document.getElementById( target ) : null;
	}

	function gridListFor( form ) {
		const grid = gridFor( form );
		return grid ? grid.querySelector( '.ab-pg__list' ) : null;
	}

	/**
	 * The grid's BASE key, never its current one.
	 *
	 * On an already-filtered page the grid renders under its variant key, and
	 * sending that would filter the filtered result instead of re-filtering the
	 * author's query. `data-ab-pg-base` is the base in both states, so it is the
	 * first choice; the hidden field and the URL are fallbacks for a grid that
	 * has not been re-rendered since this markup shipped.
	 * @param form
	 */
	function baseKeyFor( form ) {
		const list = gridListFor( form );
		const fromDom = list
			? list.getAttribute( 'data-ab-pg-base' ) || ''
			: '';
		const hidden = form.querySelector( '.ab-pf__base' );
		const fromField = hidden ? hidden.value : '';

		const params = new URLSearchParams( window.location.search );
		const fromUrl = params.has( 'ab_f_base' )
			? params.get( 'ab_f_base' )
			: '';

		const key = fromDom || fromField || fromUrl;
		if ( hidden ) {
			hidden.value = key;
		}
		return key;
	}

	function targetFor( form ) {
		const field = form.querySelector( '.ab-pf__target' );
		return (
			( field && field.value ) ||
			form.getAttribute( 'data-ab-pf-target' ) ||
			''
		);
	}

	function isReset( submitter ) {
		return !! submitter && submitter.name === 'ab_f_reset';
	}

	/**
	 * Read the bar's live state. A reset clears everything, so it is the whole
	 * state rather than one more token alongside the others.
	 * @param form
	 * @param submitter
	 */
	function readState( form, submitter ) {
		const state = { reset: isReset( submitter ), s: '', sort: '', tax: {} };
		if ( state.reset ) {
			return state;
		}

		const search = form.querySelector( '[name="ab_f_s"]' );
		if ( search && search.value ) {
			state.s = search.value;
		}

		const sort = form.querySelector( '[name="ab_f_sort"]' );
		if ( sort && sort.value ) {
			state.sort = sort.value;
		}

		const taxFields = form.querySelectorAll( '[name^="ab_f_tax_"]' );
		Array.prototype.forEach.call( taxFields, function ( field ) {
			if ( field.value ) {
				state.tax[ field.name ] = field.value;
			}
		} );

		return state;
	}

	function tokensFrom( state ) {
		const tokens = {};
		if ( state.reset ) {
			tokens.reset = true;
			return tokens;
		}
		if ( state.s ) {
			tokens.s = state.s;
		}
		if ( state.sort ) {
			tokens.sort = state.sort;
		}
		Object.keys( state.tax ).forEach( function ( name ) {
			const ids = state.tax[ name ]
				.split( ',' )
				.map( function ( part ) {
					return parseInt( part, 10 ) || 0;
				} )
				.filter( function ( id ) {
					return id > 0;
				} );
			if ( ids.length ) {
				tokens[ 'tax_' + name.substring( 'ab_f_tax_'.length ) ] = ids;
			}
		} );
		return tokens;
	}

	/**
	 * The URL that represents this state, so a filtered view can be copied,
	 * bookmarked and reloaded into the same result set. `ab_f_target` is the
	 * durable half: it survives an author editing the grid, which changes the
	 * base key.
	 * @param form
	 * @param state
	 */
	function urlFor( form, state ) {
		const params = new URLSearchParams( window.location.search );

		FILTER_PARAMS.forEach( function ( name ) {
			params.delete( name );
		} );
		Array.prototype.forEach.call(
			form.querySelectorAll( '[name^="ab_f_tax_"]' ),
			function ( field ) {
				params.delete( field.name );
			}
		);

		const target = targetFor( form );
		if ( target ) {
			params.set( 'ab_f_target', target );
		}
		const base = baseKeyFor( form );
		if ( base ) {
			params.set( 'ab_f_base', base );
		}

		if ( ! state.reset ) {
			if ( state.s ) {
				params.set( 'ab_f_s', state.s );
			}
			if ( state.sort ) {
				params.set( 'ab_f_sort', state.sort );
			}
			Object.keys( state.tax ).forEach( function ( name ) {
				params.set( name, state.tax[ name ] );
			} );
		}

		const qs = params.toString();
		return window.location.pathname + ( qs ? '?' + qs : '' );
	}

	function template( form, name, fallback ) {
		return form.getAttribute( 'data-ab-pf-' + name ) || fallback;
	}

	function fill( text, count ) {
		return text.replace( '%s', String( count ) );
	}

	/**
	 * Announce the new result count to assistive tech. Skipped when the bar
	 * shows a visible count, because that element is already a live region and
	 * two of them would speak the same change twice.
	 * @param form
	 * @param found
	 */
	function announce( form, found ) {
		if ( form.querySelector( '.ab-pf__count' ) ) {
			return;
		}
		let live = form.querySelector( '.ab-pf__live' );
		if ( ! live ) {
			live = document.createElement( 'p' );
			live.className = 'ab-pf__live screen-reader-text';
			live.setAttribute( 'role', 'status' );
			live.setAttribute( 'aria-live', 'polite' );
			form.appendChild( live );
		}
		live.textContent = fill(
			template( form, 'live', '%s results.' ),
			found
		);
	}

	function showCount( form, found ) {
		const el = form.querySelector( '.ab-pf__count' );
		if ( ! el ) {
			return;
		}
		const key = 1 === found ? 'one' : 'many';
		el.textContent = fill(
			template(
				form,
				'count-' + key,
				1 === found ? '%s post' : '%s posts'
			),
			found
		);
	}

	function hasNumberedPagination( form ) {
		const grid = gridFor( form );
		if ( ! grid ) {
			return false;
		}
		const nav = grid.querySelector( '.ab-pg__pagination' );
		return (
			!! nav && ! nav.classList.contains( 'ab-pg__pagination--loadmore' )
		);
	}

	/**
	 * Point the grid's load-more control at the result set now on screen. The
	 * response names the key the server answered under, which is the variant key
	 * on a filtered request, so paging on from here continues the filtered query
	 * instead of the author's unfiltered one.
	 * @param form
	 * @param data
	 */
	function repointPagination( form, data ) {
		const key = data.key || '';
		if ( ! key ) {
			return;
		}

		const list = gridListFor( form );
		if ( list ) {
			list.setAttribute( 'data-ab-pg-key', key );
		}

		const grid = gridFor( form );
		const more = grid ? grid.querySelector( '.ab-pg__loadmore' ) : null;
		if ( ! more ) {
			return;
		}

		more.setAttribute( 'data-ab-pg-key', key );
		more.setAttribute( 'data-ab-pg-next', '2' );
		more.setAttribute( 'data-ab-pg-total', String( data.total || 1 ) );
		more.href = more.href
			.replace(
				/([?&]ab_pg_key=)[^&]*/,
				'$1' + encodeURIComponent( key )
			)
			.replace( /([?&]ab_pg_page=)\d+/, '$12' );

		// Inline, because the stylesheet sets display on this control and would
		// otherwise win over the hidden attribute.
		more.style.display = data.hasMore ? '' : 'none';
	}

	function clearFields( form ) {
		Array.prototype.forEach.call(
			form.querySelectorAll(
				'input[name^="ab_f_"], select[name^="ab_f_"]'
			),
			function ( field ) {
				if ( field.type !== 'hidden' ) {
					field.value = '';
				}
			}
		);
	}

	function bind( form ) {
		// event.submitter is not available everywhere; remember the last button
		// pressed so a reset is never confused with a plain filter submit.
		let lastSubmitter = null;
		form.addEventListener(
			'click',
			function ( event ) {
				const button = event.target.closest
					? event.target.closest( 'button, input[type="submit"]' )
					: null;
				if ( button && form.contains( button ) ) {
					lastSubmitter = button;
				}
			},
			true
		);

		form.addEventListener( 'submit', function ( event ) {
			if (
				event.defaultPrevented ||
				form.getAttribute( 'aria-busy' ) === 'true'
			) {
				return;
			}

			const submitter = event.submitter || lastSubmitter;
			lastSubmitter = null;

			const base = baseKeyFor( form );
			if ( ! base ) {
				// No resolvable grid; let the normal GET submit happen, which the
				// server can still answer through the bar's ab_f_target field.
				return;
			}

			const state = readState( form, submitter );
			const url = urlFor( form, state );

			// Numbered pagination bakes the grid's key into every link's href, and
			// only the server can rebuild those for a new result set. Rather than
			// leave the page showing filtered cards under stale page links, hand
			// this case to a real navigation: the URL carries the same state.
			if ( hasNumberedPagination( form ) ) {
				window.location.assign( url );
				return;
			}

			event.preventDefault();
			form.setAttribute( 'aria-busy', 'true' );
			form.classList.add( 'is-loading' );

			const list = gridListFor( form );

			window
				.fetch(
					endpoint() +
						'?key=' +
						encodeURIComponent( base ) +
						'&page=1&filter=' +
						encodeURIComponent(
							JSON.stringify( tokensFrom( state ) )
						),
					{ credentials: 'same-origin' }
				)
				.then( function ( response ) {
					if ( ! response.ok ) {
						throw new Error( 'Request failed' );
					}
					return response.json();
				} )
				.then( function ( data ) {
					if ( ! data || typeof data.html !== 'string' ) {
						throw new Error( 'Empty response' );
					}

					const found = parseInt( data.found, 10 ) || 0;
					if ( list ) {
						list.innerHTML = data.html;
					}
					repointPagination( form, data );
					if ( state.reset ) {
						clearFields( form );
					}
					showCount( form, found );
					announce( form, found );

					try {
						window.history.replaceState( null, '', url );
					} catch ( e ) {
						// The URL is cosmetic; a failure here changes nothing.
					}
				} )
				.catch( function () {
					// Fall back to a real navigation rather than dead-ending, using
					// the same URL the no-reload path would have produced so the
					// server sees exactly this state, reset included.
					window.location.assign( url );
				} )
				.then( function () {
					form.removeAttribute( 'aria-busy' );
					form.classList.remove( 'is-loading' );
				} );
		} );
	}

	function init() {
		Array.prototype.forEach.call(
			document.querySelectorAll( '.ab-pf' ),
			bind
		);
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', init );
	} else {
		init();
	}
} )();
