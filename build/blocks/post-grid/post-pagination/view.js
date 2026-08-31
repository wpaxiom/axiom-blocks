/**
 * Post Grid — load more.
 *
 * Progressive enhancement only. The button is a real link to the next page, so
 * with JS off (or if this fails) it still navigates there and the numbered
 * markup renders server-side. All this does is fetch the next page and append
 * it in place.
 */
( function () {
	'use strict';

	const ROOT = '/wp-json/axiom-blocks/v1/post-grid';

	function endpoint() {
		if ( window.axiomBlocksApi && window.axiomBlocksApi.root ) {
			return window.axiomBlocksApi.root + 'axiom-blocks/v1/post-grid';
		}
		return ROOT;
	}

	function announce( grid, message ) {
		let live = grid.querySelector( '.ab-pg__live' );
		if ( ! live ) {
			live = document.createElement( 'p' );
			live.className = 'ab-pg__live screen-reader-text';
			live.setAttribute( 'aria-live', 'polite' );
			grid.appendChild( live );
		}
		live.textContent = message;
	}

	function bind( button ) {
		const grid = button.closest( '.ab-pg' );
		if ( ! grid ) {
			return;
		}
		const list = grid.querySelector( '.ab-pg__list' );
		if ( ! list ) {
			return;
		}

		button.addEventListener( 'click', function ( event ) {
			// Modified clicks keep their normal browser behaviour.
			if (
				event.defaultPrevented ||
				event.metaKey ||
				event.ctrlKey ||
				event.shiftKey ||
				button.getAttribute( 'aria-busy' ) === 'true'
			) {
				return;
			}
			event.preventDefault();

			const key = button.getAttribute( 'data-ab-pg-key' ) || '';
			const next = parseInt(
				button.getAttribute( 'data-ab-pg-next' ),
				10
			);
			if ( ! key || ! next ) {
				return;
			}
			const total = parseInt(
				button.getAttribute( 'data-ab-pg-total' ),
				10
			);

			button.setAttribute( 'aria-busy', 'true' );
			button.classList.add( 'is-loading' );

			const url =
				endpoint() +
				'?key=' +
				encodeURIComponent( key ) +
				'&page=' +
				encodeURIComponent( next );

			window
				.fetch( url, { credentials: 'same-origin' } )
				.then( function ( response ) {
					if ( ! response.ok ) {
						throw new Error( 'Request failed' );
					}
					return response.json();
				} )
				.then( function ( data ) {
					if ( ! data || ! data.html ) {
						throw new Error( 'Empty response' );
					}

					const holder = document.createElement( 'div' );
					holder.innerHTML = data.html;

					const added = holder.children.length;
					while ( holder.firstElementChild ) {
						list.appendChild( holder.firstElementChild );
					}

					button.setAttribute(
						'data-ab-pg-next',
						String( next + 1 )
					);
					button.href = button.href.replace(
						/([?&]ab_pg_page=)\d+/,
						'$1' + ( next + 1 )
					);

					announce(
						grid,
						added + ' more posts loaded. Page ' + next + '.'
					);

					if ( ! data.hasMore || next >= total ) {
						button.parentNode.removeChild( button );
					}
				} )
				.catch( function () {
					// Fall back to a normal navigation rather than dead-ending.
					window.location.href = button.href;
				} )
				.then( function () {
					button.removeAttribute( 'aria-busy' );
					button.classList.remove( 'is-loading' );
				} );
		} );
	}

	function init() {
		const buttons = document.querySelectorAll( '.ab-pg__loadmore' );
		Array.prototype.forEach.call( buttons, bind );
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', init );
	} else {
		init();
	}
} )();
