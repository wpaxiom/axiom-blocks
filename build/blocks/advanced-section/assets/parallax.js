/**
 * Advanced Section — frontend parallax.
 *
 * Reads `data-parallax-speed` (0–1) from each `.has-parallax` section and
 * writes a `--ab-parallax-y` CSS variable that the `::before` background
 * layer translates by. Updates are gated by IntersectionObserver so we only
 * touch the DOM while the section is on screen, and rAF-coalesced so
 * scroll handlers don't pile up.
 */
( function () {
	'use strict';

	const sections = document.querySelectorAll(
		'.axiom-blocks-section.has-parallax'
	);
	if ( ! sections.length || typeof IntersectionObserver === 'undefined' ) {
		return;
	}

	const visible = new Set();

	const update = () => {
		const vh = window.innerHeight || document.documentElement.clientHeight;
		visible.forEach( ( el ) => {
			const rect = el.getBoundingClientRect();
			const speed = parseFloat( el.dataset.parallaxSpeed ) || 0;
			// Distance from viewport center → section center.
			// Multiplied by speed (negative so the bg moves "with" the scroll
			// at a slower rate, the classic parallax feel).
			const centerOffset = rect.top + rect.height / 2 - vh / 2;
			const y = -( centerOffset * speed );
			el.style.setProperty( '--ab-parallax-y', y.toFixed( 2 ) + 'px' );
		} );
	};

	const io = new IntersectionObserver(
		( entries ) => {
			entries.forEach( ( e ) => {
				if ( e.isIntersecting ) {
					visible.add( e.target );
				} else {
					visible.delete( e.target );
					// Reset transform when leaving so it doesn't snap on re-entry.
					e.target.style.setProperty( '--ab-parallax-y', '0px' );
				}
			} );
			update();
		},
		{ threshold: 0, rootMargin: '20% 0px' }
	);

	sections.forEach( ( el ) => io.observe( el ) );

	let raf = 0;
	const onScroll = () => {
		if ( raf ) return;
		raf = requestAnimationFrame( () => {
			raf = 0;
			update();
		} );
	};

	window.addEventListener( 'scroll', onScroll, { passive: true } );
	window.addEventListener( 'resize', onScroll, { passive: true } );
	update();
} )();
