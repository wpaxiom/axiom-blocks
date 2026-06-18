/**
 * Accordion — frontend behaviour.
 *
 * Progressive enhancement over native <details>/<summary>: with JS off, each
 * panel still toggles natively. JS adds a smooth height animation, "close
 * others" single-open behaviour, a configurable speed, an optional expand/
 * collapse-all control, deep-linking (open the item matching the URL hash), and
 * collapse-on-mobile. Honours prefers-reduced-motion.
 */
( function () {
	'use strict';

	function prefersReducedMotion() {
		return (
			window.matchMedia &&
			window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches
		);
	}

	function bodyOf( item ) {
		return item.querySelector( ':scope > .ab-accordion__body' );
	}

	function expand( item, body, duration ) {
		item.open = true;
		if ( prefersReducedMotion() || duration <= 0 || ! body.animate ) {
			return;
		}
		const height = body.offsetHeight;
		// Pin to 0 first so the just-opened panel can't paint at full height
		// for a frame before the animation's first keyframe lands.
		body.style.height = '0px';
		const anim = body.animate(
			[ { height: '0px' }, { height: height + 'px' } ],
			{ duration: duration, easing: 'ease' }
		);
		anim.onfinish = function () {
			body.style.height = '';
		};
	}

	function collapse( item, body, duration ) {
		if ( prefersReducedMotion() || duration <= 0 || ! body.animate ) {
			item.open = false;
			return;
		}
		const height = body.offsetHeight;
		const anim = body.animate(
			[ { height: height + 'px' }, { height: '0px' } ],
			{ duration: Math.round( duration * 0.85 ), easing: 'ease' }
		);
		anim.onfinish = function () {
			item.open = false;
			body.style.height = '';
		};
	}

	function updateHash( id ) {
		if ( window.history && window.history.replaceState ) {
			window.history.replaceState( null, '', '#' + id );
		} else {
			window.location.hash = id;
		}
	}

	function initAccordion( root ) {
		if ( root.dataset.abAccReady === '1' ) {
			return;
		}
		root.dataset.abAccReady = '1';

		const closeOthers = root.dataset.closeOthers === '1';
		const deeplink = root.dataset.deeplink === '1';
		const collapseMobile = root.dataset.collapseMobile === '1';
		const parsed = parseInt( root.dataset.duration, 10 );
		const duration = isNaN( parsed ) ? 300 : parsed;

		const items = Array.prototype.slice.call(
			root.querySelectorAll( ':scope > .ab-accordion__item' )
		);

		// Collapse-on-mobile: start every panel closed on small screens, and
		// re-close if the viewport later crosses into the mobile range.
		const mobileMq = window.matchMedia
			? window.matchMedia( '(max-width: 600px)' )
			: null;
		function applyCollapseMobile() {
			if ( ! collapseMobile ) {
				return;
			}
			const isMobile = mobileMq
				? mobileMq.matches
				: window.innerWidth <= 600;
			if ( isMobile ) {
				items.forEach( function ( item ) {
					item.open = false;
				} );
			}
		}
		applyCollapseMobile();
		if ( collapseMobile && mobileMq ) {
			if ( mobileMq.addEventListener ) {
				mobileMq.addEventListener( 'change', applyCollapseMobile );
			} else if ( mobileMq.addListener ) {
				mobileMq.addListener( applyCollapseMobile );
			}
		}

		// Collapse an item, and if it's the one currently named in the URL hash,
		// drop the hash so re-clicking its link fires `hashchange` again.
		function closeItem( item ) {
			if (
				deeplink &&
				item.id &&
				decodeURIComponent( window.location.hash.slice( 1 ) ) ===
					item.id &&
				window.history &&
				window.history.replaceState
			) {
				window.history.replaceState(
					null,
					'',
					window.location.pathname + window.location.search
				);
			}
			collapse( item, bodyOf( item ), duration );
		}

		items.forEach( function ( item ) {
			const summary = item.querySelector(
				':scope > .ab-accordion__header'
			);
			const body = bodyOf( item );
			if ( ! summary || ! body ) {
				return;
			}

			summary.addEventListener( 'click', function ( e ) {
				e.preventDefault();

				if ( item.open ) {
					closeItem( item );
					return;
				}

				if ( closeOthers ) {
					items.forEach( function ( other ) {
						if ( other !== item && other.open ) {
							closeItem( other );
						}
					} );
				}

				expand( item, body, duration );

				if ( deeplink && item.id ) {
					updateHash( item.id );
				}
			} );
		} );

		// Expand / collapse all.
		const toggleAll = root.querySelector(
			':scope > .ab-accordion__toggle-all'
		);
		if ( toggleAll ) {
			toggleAll.addEventListener( 'click', function () {
				const anyClosed = items.some( function ( i ) {
					return ! i.open;
				} );
				items.forEach( function ( item ) {
					const body = bodyOf( item );
					if ( anyClosed && ! item.open ) {
						expand( item, body, duration );
					} else if ( ! anyClosed && item.open ) {
						closeItem( item );
					}
				} );
				toggleAll.textContent = anyClosed
					? toggleAll.dataset.collapse || 'Collapse all'
					: toggleAll.dataset.expand || 'Expand all';
				toggleAll.setAttribute(
					'aria-expanded',
					anyClosed ? 'true' : 'false'
				);
			} );
		}

		// Deep-link: open the item whose id matches the URL hash — on load and
		// whenever the hash changes (e.g. clicking an in-page #anchor link).
		function openFromHash() {
			if ( ! deeplink || window.location.hash.length <= 1 ) {
				return;
			}
			const id = decodeURIComponent( window.location.hash.slice( 1 ) );
			const target = items.filter( function ( i ) {
				return i.id === id;
			} )[ 0 ];
			if ( ! target ) {
				return;
			}
			if ( closeOthers ) {
				items.forEach( function ( other ) {
					if ( other !== target && other.open ) {
						closeItem( other );
					}
				} );
			}
			if ( ! target.open ) {
				expand( target, bodyOf( target ), duration );
			}
			window.requestAnimationFrame( function () {
				target.scrollIntoView( { block: 'start' } );
			} );
		}

		if ( deeplink ) {
			openFromHash();
			window.addEventListener( 'hashchange', openFromHash );
		}
	}

	function initAll() {
		document.querySelectorAll( '.ab-accordion' ).forEach( initAccordion );
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', initAll );
	} else {
		initAll();
	}

	window.axiomBlocksInitAccordion = initAll;
} )();
