/**
 * Axiom Blocks Animations
 * Handles scroll-triggered animations for the Advanced Section block
 */
( function () {
	'use strict';

	// Check if IntersectionObserver is supported
	if ( ! ( 'IntersectionObserver' in window ) ) {
		// Fallback: make all elements visible immediately
		document
			.querySelectorAll( '[class*="axiom-blocks-animate-"]' )
			.forEach( function ( el ) {
				el.style.opacity = '1';
			} );
		return;
	}

	// Animation observer options
	const observerOptions = {
		root: null,
		rootMargin: '0px 0px -50px 0px',
		threshold: 0.1,
	};

	// Create the observer
	const animationObserver = new IntersectionObserver( function ( entries ) {
		entries.forEach( function ( entry ) {
			if ( entry.isIntersecting ) {
				const element = entry.target;

				// Add the animate-in class to trigger the animation
				element.classList.add( 'axiom-blocks-is-animating' );

				// Optional: unobserve after animation triggers (for one-time animation)
				// animationObserver.unobserve(element);
			}
		} );
	}, observerOptions );

	// Observe all animated elements
	function initAnimations() {
		const animatedElements = document.querySelectorAll(
			'.axiom-blocks-animate-fade-in, ' +
				'.axiom-blocks-animate-fade-in-up, ' +
				'.axiom-blocks-animate-fade-in-down, ' +
				'.axiom-blocks-animate-fade-in-left, ' +
				'.axiom-blocks-animate-fade-in-right, ' +
				'.axiom-blocks-animate-zoom-in, ' +
				'.axiom-blocks-animate-slide-in-up, ' +
				'.axiom-blocks-animate-bounce-in'
		);

		animatedElements.forEach( function ( element ) {
			animationObserver.observe( element );
		} );
	}

	// Initialize when DOM is ready
	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', initAnimations );
	} else {
		initAnimations();
	}

	// Re-init on dynamic content load (for AJAX loaded content)
	window.addEventListener( 'axiom-blocks-content-loaded', initAnimations );
} )();
