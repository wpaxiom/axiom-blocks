/**
 * Free Shipping Progress — frontend live updates.
 *
 * Strategy:
 *   - First paint comes from PHP (always correct, no flicker).
 *   - When WC fires a cart-changed event, ask the REST endpoint for a fresh
 *     snapshot using THIS block's attributes (read off data-* on the wrapper)
 *     and surgically swap message + fill width.
 *   - Multiple instances on the same page each refresh independently.
 */

( function () {
	'use strict';

	const SELECTOR = '[data-ab-fsp]';
	const REST_BASE =
		window.axiomBlocksApi && window.axiomBlocksApi.root
			? window.axiomBlocksApi.root.replace( /\/+$/, '' ) +
			  '/axiom-blocks/v1/free-shipping-progress'
			: '/wp-json/axiom-blocks/v1/free-shipping-progress';

	function buildQuery( el ) {
		const ds = el.dataset;
		const params = new URLSearchParams( {
			thresholdMode: ds.thresholdMode || 'auto',
			customThreshold: ds.customThreshold || '0',
			messageBefore: ds.messageBefore || '',
			messageQualified: ds.messageQualified || '',
			hideWhenEmpty: ds.hideEmpty === '1' ? 'true' : 'false',
			hideWhenQualified: ds.hideQualified === '1' ? 'true' : 'false',
		} );
		return params.toString();
	}

	function applySnapshot( el, data ) {
		if ( ! data ) return;

		if ( data.should_render === false ) {
			el.style.display = 'none';
			return;
		}
		el.style.removeProperty( 'display' );

		el.classList.toggle( 'is-qualified', !! data.qualified );

		const fill = el.querySelector( '[data-ab-fsp-fill]' );
		if ( fill ) {
			const pct = Math.max(
				0,
				Math.min( 100, Number( data.percent ) || 0 )
			);
			fill.style.width = pct.toFixed( 2 ) + '%';
		}

		const msg = el.querySelector( '[data-ab-fsp-msg]' );
		if ( msg && typeof data.message_html === 'string' ) {
			msg.innerHTML = data.message_html;
		}
	}

	function refresh( el ) {
		const url = REST_BASE + '?' + buildQuery( el );
		fetch( url, {
			credentials: 'same-origin',
			headers: { Accept: 'application/json' },
		} )
			.then( ( r ) => ( r.ok ? r.json() : null ) )
			.then( ( data ) => applySnapshot( el, data ) )
			.catch( () => {
				/* silent — keep last good state */
			} );
	}

	function refreshAll() {
		document.querySelectorAll( SELECTOR ).forEach( refresh );
	}

	// Subscribe to all the WC cart events that could change the subtotal.
	// jQuery is a hard dep of WC core front end; safe to assume on storefronts.
	function bindWooEvents() {
		if ( ! window.jQuery ) return;
		const $ = window.jQuery;
		const events = [
			'updated_wc_div', // Cart page after AJAX update
			'wc_fragments_refreshed', // Mini-cart fragments refreshed
			'wc_fragments_loaded',
			'added_to_cart',
			'removed_from_cart',
			'updated_cart_totals',
		].join( ' ' );
		$( document.body ).on( events, refreshAll );
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', bindWooEvents );
	} else {
		bindWooEvents();
	}
} )();
