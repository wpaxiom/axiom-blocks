/**
 * Counter — frontend behaviour.
 *
 * Counts each statistic up from its start value to its end value when the group
 * scrolls into view (once). With JS off, the final number is already rendered
 * server-side, so nothing is lost. Honours prefers-reduced-motion: the final
 * value is set immediately with no animation.
 */
( function () {
	'use strict';

	function prefersReducedMotion() {
		return (
			window.matchMedia &&
			window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches
		);
	}

	const EASING = {
		linear( t ) {
			return t;
		},
		'ease-out'( t ) {
			return 1 - Math.pow( 1 - t, 3 );
		},
		'ease-in-out'( t ) {
			return t < 0.5 ? 4 * t * t * t : 1 - Math.pow( -2 * t + 2, 3 ) / 2;
		},
		ease( t ) {
			return t < 0.5 ? 2 * t * t : 1 - Math.pow( -2 * t + 2, 2 ) / 2;
		},
	};

	function formatNumber( value, decimals, thousandsSep, decimalSep ) {
		const parts = value.toFixed( decimals ).split( '.' );
		if ( thousandsSep ) {
			parts[ 0 ] = parts[ 0 ].replace(
				/\B(?=(\d{3})+(?!\d))/g,
				thousandsSep
			);
		}
		return parts.length > 1
			? parts[ 0 ] + decimalSep + parts[ 1 ]
			: parts[ 0 ];
	}

	function animateNumber( el, duration, easing, thousandsSep, decimalSep ) {
		const start = parseFloat( el.getAttribute( 'data-start' ) ) || 0;
		const end = parseFloat( el.getAttribute( 'data-end' ) ) || 0;
		const decimals =
			parseInt( el.getAttribute( 'data-decimals' ), 10 ) || 0;
		const prefix = el.getAttribute( 'data-prefix' ) || '';
		const suffix = el.getAttribute( 'data-suffix' ) || '';
		const ease = EASING[ easing ] || EASING[ 'ease-out' ];

		function paint( value ) {
			el.textContent =
				prefix +
				formatNumber( value, decimals, thousandsSep, decimalSep ) +
				suffix;
		}

		if (
			prefersReducedMotion() ||
			duration <= 0 ||
			! window.requestAnimationFrame
		) {
			paint( end );
			return;
		}

		let startTime = null;
		function step( now ) {
			if ( startTime === null ) {
				startTime = now;
			}
			const elapsed = now - startTime;
			const t = Math.min( 1, elapsed / duration );
			paint( start + ( end - start ) * ease( t ) );
			if ( t < 1 ) {
				window.requestAnimationFrame( step );
			}
		}
		window.requestAnimationFrame( step );
	}

	function runGroup( group ) {
		let duration = parseInt( group.getAttribute( 'data-duration' ), 10 );
		if ( isNaN( duration ) ) {
			duration = 2000;
		}
		const easing = group.getAttribute( 'data-easing' ) || 'ease-out';
		const thousandsSep = group.getAttribute( 'data-thousands-sep' ) || '';
		const decimalSep = group.getAttribute( 'data-decimal-sep' ) || '.';
		const numbers = group.querySelectorAll( '.ab-counter__number' );
		Array.prototype.forEach.call( numbers, function ( el ) {
			animateNumber( el, duration, easing, thousandsSep, decimalSep );
		} );
	}

	function initGroup( group ) {
		if ( group.dataset.abCounterReady === '1' ) {
			return;
		}
		group.dataset.abCounterReady = '1';

		if ( ! window.IntersectionObserver ) {
			runGroup( group );
			return;
		}

		var observer = new IntersectionObserver(
			function ( entries ) {
				entries.forEach( function ( entry ) {
					if ( entry.isIntersecting ) {
						runGroup( entry.target );
						observer.unobserve( entry.target );
					}
				} );
			},
			{ threshold: 0.35 }
		);
		observer.observe( group );
	}

	function initAll() {
		document.querySelectorAll( '.ab-counter-group' ).forEach( initGroup );
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', initAll );
	} else {
		initAll();
	}

	window.axiomBlocksInitCounter = initAll;
} )();
