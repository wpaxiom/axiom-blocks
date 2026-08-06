/**
 * Notice / Alert — frontend behaviour.
 *
 * Wires the dismiss button on notices marked data-dismissible. With JS off the
 * notice simply stays put. Honours prefers-reduced-motion: the fade is skipped
 * and the notice is removed immediately.
 */
( function () {
	'use strict';

	function prefersReducedMotion() {
		return (
			window.matchMedia &&
			window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches
		);
	}

	function dismiss( notice ) {
		if ( prefersReducedMotion() ) {
			notice.remove();
			return;
		}
		notice.classList.add( 'is-dismissing' );
		notice.addEventListener(
			'transitionend',
			function () {
				notice.remove();
			},
			{ once: true }
		);
	}

	function initNotice( notice ) {
		if ( notice.dataset.abNoticeReady === '1' ) {
			return;
		}
		notice.dataset.abNoticeReady = '1';

		const button = notice.querySelector( ':scope > .ab-notice__dismiss' );
		if ( ! button ) {
			return;
		}
		button.addEventListener( 'click', function () {
			dismiss( notice );
		} );
	}

	function initAll() {
		document
			.querySelectorAll( '.ab-notice[data-dismissible="1"]' )
			.forEach( initNotice );
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', initAll );
	} else {
		initAll();
	}

	window.axiomBlocksInitNotice = initAll;
} )();
