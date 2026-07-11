/**
 * Table of Contents — frontend behaviour (progressive enhancement).
 *
 * The list markup + heading ids are rendered server-side. This script layers on
 * smooth scroll, active-section highlight, a sliding reading-progress rail,
 * copy-link, collapse, mobile dock (bottom sheet), and back-to-top. Honours
 * reduced-motion.
 */
( function () {
	'use strict';

	const reduced =
		window.matchMedia &&
		window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;

	const COPY_SVG =
		'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';
	const CHECK_SVG =
		'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
	const UP_SVG =
		'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>';

	/* Scroll the window so `target` sits `offset` px below the top, then keep it
	 * anchored while the layout settles. The first jump after load routinely
	 * mis-lands because content above the target shifts *after* we measured it —
	 * lazy-loaded images, a web-font swap, or the panel's own collapse. We
	 * re-measure a few times and correct, but bail the instant the visitor
	 * scrolls so we never yank them back. */
	function scrollToTarget( target, offset, smooth ) {
		const wanted = function () {
			return Math.max(
				0,
				target.getBoundingClientRect().top + window.pageYOffset - offset
			);
		};
		window.scrollTo( {
			top: wanted(),
			behavior: smooth ? 'smooth' : 'auto',
		} );

		let ticks = 0;
		let aborted = false;
		const abort = function () {
			aborted = true;
		};
		window.addEventListener( 'wheel', abort, {
			passive: true,
			once: true,
		} );
		window.addEventListener( 'touchmove', abort, {
			passive: true,
			once: true,
		} );
		window.addEventListener( 'keydown', abort, { once: true } );
		const cleanup = function () {
			window.removeEventListener( 'wheel', abort );
			window.removeEventListener( 'touchmove', abort );
			window.removeEventListener( 'keydown', abort );
		};
		const settle = function () {
			if ( aborted ) {
				cleanup();
				return;
			}
			const goal = wanted();
			const delta = Math.abs( goal - window.pageYOffset );
			// Correct small-to-moderate drift (reflow); leave deliberate scroll.
			if ( delta > 2 && delta < 600 ) {
				window.scrollTo( { top: goal, behavior: 'auto' } );
			}
			if ( ++ticks < 6 ) {
				window.setTimeout( settle, 130 );
			} else {
				cleanup();
			}
		};
		window.setTimeout( settle, smooth ? 450 : 80 );
	}

	function initToc( root ) {
		const links = [].slice.call(
			root.querySelectorAll( '.ab-toc__link[href^="#"]' )
		);

		const isDock = root.getAttribute( 'data-dock' ) === '1';
		const isSticky = root.getAttribute( 'data-sticky' ) === '1';
		const collapsible = root.getAttribute( 'data-collapsible' ) === '1';
		const toggle = root.querySelector( '[data-ab-toc-toggle]' );

		function setCollapsed( collapsed ) {
			root.classList.toggle( 'is-collapsed', collapsed );
			if ( toggle ) {
				toggle.setAttribute(
					'aria-expanded',
					collapsed ? 'false' : 'true'
				);
			}
		}
		function openSheet() {
			root.classList.add( 'is-open' );
		}
		function closeSheet() {
			root.classList.remove( 'is-open' );
		}

		/* ── Mobile dock: open / close ─────────────────────────────────── */
		const bar = root.querySelector( '[data-ab-toc-open]' );
		if ( bar ) {
			bar.addEventListener( 'click', openSheet );
		}
		const scrim = root.querySelector( '[data-ab-toc-close]' );
		if ( scrim ) {
			scrim.addEventListener( 'click', closeSheet );
		}

		/* ── Collapse / close toggle ───────────────────────────────────── */
		if ( toggle ) {
			toggle.addEventListener( 'click', function () {
				if ( isDock && root.classList.contains( 'is-open' ) ) {
					closeSheet();
					return;
				}
				setCollapsed( ! root.classList.contains( 'is-collapsed' ) );
			} );
		}

		/* ── Footer back-to-top ────────────────────────────────────────── */
		const footTop = root.querySelector( '[data-ab-toc-top]' );
		if ( footTop ) {
			footTop.addEventListener( 'click', function () {
				window.scrollTo( {
					top: 0,
					behavior: reduced ? 'auto' : 'smooth',
				} );
			} );
		}

		if ( ! links.length ) {
			if ( root.getAttribute( 'data-back-to-top' ) === '1' ) {
				setupBackToTop();
			}
			return;
		}

		const offset = parseInt( root.getAttribute( 'data-offset' ), 10 ) || 0;
		const smooth = root.getAttribute( 'data-smooth' ) === '1' && ! reduced;
		const spy = root.getAttribute( 'data-spy' ) === '1';
		const progress = root.getAttribute( 'data-section-progress' ) === '1';
		const list = root.querySelector( '.ab-toc__list' );
		const copy = list && list.getAttribute( 'data-ab-toc-copy' ) === '1';

		const sections = links
			.map( function ( link ) {
				const id = decodeURIComponent(
					link.getAttribute( 'href' ).slice( 1 )
				);
				return {
					link,
					item: link.closest( '.ab-toc__item' ),
					target: document.getElementById( id ),
					id,
				};
			} )
			.filter( function ( s ) {
				return s.target;
			} );

		if ( ! sections.length ) {
			if ( root.getAttribute( 'data-back-to-top' ) === '1' ) {
				setupBackToTop();
			}
			return;
		}

		/* Sliding reading-progress rail (single element). */
		const ul = root.querySelector( '.ab-toc__list-ul' );
		let progressEl = null;
		if ( progress && ul ) {
			progressEl = document.createElement( 'span' );
			progressEl.className = 'ab-toc__progress';
			progressEl.setAttribute( 'aria-hidden', 'true' );
			ul.insertBefore( progressEl, ul.firstChild );
		}

		/* ── Smooth scroll + affordances ───────────────────────────────── */
		sections.forEach( function ( s ) {
			s.link.addEventListener( 'click', function ( e ) {
				e.preventDefault();
				scrollToTarget( s.target, offset, smooth );
				if ( history.replaceState ) {
					history.replaceState( null, '', '#' + s.id );
				}
				s.target.setAttribute( 'tabindex', '-1' );
				s.target.focus( { preventScroll: true } );

				/* Get out of the way of the content just jumped to. */
				if ( isDock && root.classList.contains( 'is-open' ) ) {
					window.setTimeout( closeSheet, reduced ? 0 : 280 );
				} else if ( isSticky && collapsible ) {
					window.setTimeout(
						function () {
							setCollapsed( true );
						},
						reduced ? 0 : 380
					);
				}
			} );

			if ( copy ) {
				addCopyButton( s );
			}
		} );

		/* ── Scroll spy + progress ─────────────────────────────────────── */
		if ( spy || progress ) {
			let ticking = false;
			const onScroll = function () {
				if ( ticking ) {
					return;
				}
				ticking = true;
				window.requestAnimationFrame( function () {
					updateActive(
						sections,
						offset,
						spy,
						progress,
						progressEl,
						ul
					);
					ticking = false;
				} );
			};
			window.addEventListener( 'scroll', onScroll, { passive: true } );
			window.addEventListener( 'resize', onScroll, { passive: true } );
			updateActive( sections, offset, spy, progress, progressEl, ul );
		}

		if ( root.getAttribute( 'data-back-to-top' ) === '1' ) {
			setupBackToTop();
		}
	}

	function updateActive( sections, offset, spy, progress, progressEl, ul ) {
		const scrollY = window.pageYOffset + offset + 1;
		let activeIndex = -1;

		for ( let i = 0; i < sections.length; i++ ) {
			const top =
				sections[ i ].target.getBoundingClientRect().top +
				window.pageYOffset;
			if ( top <= scrollY ) {
				activeIndex = i;
			}
		}

		if ( spy ) {
			sections.forEach( function ( s, idx ) {
				if ( s.item ) {
					s.item.classList.toggle( 'is-active', idx === activeIndex );
				}
			} );
		}

		if ( progress && progressEl && ul ) {
			const s = sections[ activeIndex ] || sections[ 0 ];
			if ( s && s.link ) {
				const ulTop = ul.getBoundingClientRect().top;
				const top = s.link.getBoundingClientRect().top - ulTop + 4;
				progressEl.style.top = top + 'px';
				progressEl.style.height =
					Math.max( 0, s.link.offsetHeight - 8 ) + 'px';
			}
		}
	}

	function addCopyButton( s ) {
		const btn = document.createElement( 'button' );
		btn.type = 'button';
		btn.className = 'ab-toc__copy';
		btn.innerHTML = COPY_SVG;
		btn.setAttribute( 'aria-label', 'Copy link to section' );
		btn.addEventListener( 'click', function ( e ) {
			e.preventDefault();
			e.stopPropagation();
			const url =
				window.location.origin +
				window.location.pathname +
				window.location.search +
				'#' +
				s.id;
			const done = function () {
				btn.classList.add( 'is-copied' );
				btn.innerHTML = CHECK_SVG;
				window.setTimeout( function () {
					btn.classList.remove( 'is-copied' );
					btn.innerHTML = COPY_SVG;
				}, 1400 );
			};
			if ( navigator.clipboard && navigator.clipboard.writeText ) {
				navigator.clipboard
					.writeText( url )
					.then( done, function () {} );
			} else {
				const ta = document.createElement( 'textarea' );
				ta.value = url;
				document.body.appendChild( ta );
				ta.select();
				try {
					document.execCommand( 'copy' );
					done();
				} catch ( err ) {}
				document.body.removeChild( ta );
			}
		} );
		s.link.appendChild( btn );
	}

	let backToTopBtn = null;
	function setupBackToTop() {
		if ( backToTopBtn ) {
			return;
		}
		backToTopBtn = document.createElement( 'button' );
		backToTopBtn.type = 'button';
		backToTopBtn.className = 'ab-toc-back-to-top';
		backToTopBtn.innerHTML = UP_SVG;
		backToTopBtn.setAttribute( 'aria-label', 'Back to top' );
		backToTopBtn.addEventListener( 'click', function () {
			window.scrollTo( {
				top: 0,
				behavior: reduced ? 'auto' : 'smooth',
			} );
		} );
		document.body.appendChild( backToTopBtn );

		let ticking = false;
		const onScroll = function () {
			if ( ticking ) {
				return;
			}
			ticking = true;
			window.requestAnimationFrame( function () {
				if ( window.pageYOffset > 400 ) {
					backToTopBtn.classList.add( 'is-visible' );
				} else {
					backToTopBtn.classList.remove( 'is-visible' );
				}
				ticking = false;
			} );
		};
		window.addEventListener( 'scroll', onScroll, { passive: true } );
		onScroll();
	}

	function init() {
		[].slice
			.call( document.querySelectorAll( '.ab-toc[data-ab-toc]' ) )
			.forEach( initToc );
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', init );
	} else {
		init();
	}
} )();
